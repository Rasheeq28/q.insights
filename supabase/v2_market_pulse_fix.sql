-- Q.Labs V2 — Insight Views & Seeds Fix
-- This script fixes the v_dsex_market_summary and v_dsex_top_volume views
-- to ensure correct calculations and full trading code visibility.

-- ── 1. DROP EXISTING VIEWS ──────────────────────────────────────────────────
DROP VIEW IF EXISTS public.v_dsex_top_volume;
DROP VIEW IF EXISTS public.v_dsex_market_summary;

-- ── 2. CREATE MARKET SUMMARY VIEW (Aggregate Stat Card) ──────────────────────
-- Calculates: Total Volume, Total Value, Pct Change vs prev day
CREATE VIEW public.v_dsex_market_summary AS
WITH dates AS (
    SELECT DISTINCT date FROM public.dsex_prices ORDER BY date DESC LIMIT 2
),
today_date AS (SELECT MAX(date) AS d FROM dates),
prev_date  AS (SELECT MIN(date) AS d FROM dates),
today_stats AS (
    SELECT
        SUM(p.volume)             AS total_volume,
        SUM(p.value_mn)           AS total_value_mn,
        COUNT(DISTINCT p.mapper_id) AS total_instruments
    FROM public.dsex_prices p
    WHERE p.date = (SELECT d FROM today_date)
),
prev_stats AS (
    SELECT
        SUM(p.volume)   AS total_volume,
        SUM(p.value_mn) AS total_value_mn
    FROM public.dsex_prices p
    WHERE p.date = (SELECT d FROM prev_date)
)
SELECT
    t.total_instruments,
    ROUND(t.total_volume::numeric, 0)                                                               AS total_volume,
    ROUND(t.total_value_mn::numeric, 2)                                                             AS total_value_mn,
    ROUND(((t.total_volume  - p.total_volume)  / NULLIF(p.total_volume,  0) * 100)::numeric, 2)    AS volume_change_pct,
    ROUND(((t.total_value_mn - p.total_value_mn) / NULLIF(p.total_value_mn, 0) * 100)::numeric, 2) AS value_change_pct,
    (SELECT d FROM today_date)                                                                      AS last_updated
FROM today_stats t, prev_stats p;

-- ── 3. CREATE TOP 5 VOLUME VIEW (Table Card) ────────────────────────────────
-- Ensures 5 rows if available and handles potential join misses
CREATE VIEW public.v_dsex_top_volume AS
WITH LatestDate AS (
    SELECT MAX(date) AS max_date FROM public.dsex_prices
)
SELECT
    COALESCE(m.trading_code, 'Unknown')                                     AS trading_code,
    COALESCE(m.sector, 'Other')                                             AS sector,
    ROUND(p.ltp::numeric, 2)                                                AS last_price,
    ROUND(p.closep::numeric, 2)                                             AS close_price,
    ROUND(((p.ltp - p.ycp) / NULLIF(p.ycp, 0) * 100)::numeric, 2)         AS change_pct,
    p.volume,
    ROUND(p.value_mn::numeric, 2)                                           AS value_mn,
    p.date
FROM public.dsex_prices p
LEFT JOIN public.dsex_mapper m ON p.mapper_id = m.id
WHERE p.date = (SELECT max_date FROM LatestDate)
ORDER BY p.volume DESC
LIMIT 5;

-- ── 4. RE-SEED INSIGHT CARDS ─────────────────────────────────────────────────
INSERT INTO public.insight_cards (dataset_slug, slug, title, description, type, config)
VALUES 
(
    'dsex-prices-historical', 
    'dsex-market-pulse', 
    'DSEX Market Pulse', 
    'Total trading volume, value, and % change versus the prev day across DSEX.', 
    'stat', 
    '{"view": "v_dsex_market_summary", "metrics": ["total_volume", "total_value_mn", "volume_change_pct", "value_change_pct", "total_instruments"]}'
),
(
    'dsex-prices-historical', 
    'dsex-top-volume', 
    'Top 5 by Trading Volume', 
    'The 5 most actively traded instruments on the DSEX today, ranked by volume.', 
    'table', 
    '{"view": "v_dsex_top_volume", "columns": ["trading_code", "last_price", "change_pct", "volume", "value_mn"]}'
)
ON CONFLICT (slug) DO UPDATE SET
    config = EXCLUDED.config,
    description = EXCLUDED.description,
    title = EXCLUDED.title;
