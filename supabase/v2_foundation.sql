-- Q.Labs V2 Foundation Migration
-- Phase 1: Core Data Layer

-- 1. Create Insight Cards Registry
CREATE TABLE IF NOT EXISTS public.insight_cards (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    dataset_slug text NOT NULL,
    slug text NOT NULL UNIQUE,
    title text NOT NULL,
    description text,
    type text NOT NULL CHECK (type IN ('stat', 'table', 'chart')),
    config jsonb DEFAULT '{}'::jsonb, -- configuration for the card (e.g., { "view": "v_dsex_top_gainers", "primary_metric": "change_p" })
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT insight_cards_pkey PRIMARY KEY (id),
    CONSTRAINT insight_cards_dataset_slug_fkey FOREIGN KEY (dataset_slug) REFERENCES public.datasets (slug) ON DELETE CASCADE
);

ALTER TABLE public.insight_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Insight cards are viewable by everyone" ON public.insight_cards;
CREATE POLICY "Insight cards are viewable by everyone" ON public.insight_cards FOR SELECT USING (is_active = true);


-- 2. Create API Usage Tracker
CREATE TABLE IF NOT EXISTS public.api_usage (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    dataset_slug text NOT NULL,
    request_count integer DEFAULT 1,
    last_request_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT api_usage_pkey PRIMARY KEY (id),
    CONSTRAINT api_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
    CONSTRAINT api_usage_dataset_slug_fkey FOREIGN KEY (dataset_slug) REFERENCES public.datasets (slug) ON DELETE CASCADE,
    UNIQUE(user_id, dataset_slug)
);

ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own usage" ON public.api_usage;
CREATE POLICY "Users can view their own usage" ON public.api_usage FOR SELECT USING (auth.uid() = user_id);


-- 3. SQL Views for DSEX Insights
-- dsex_prices joins to dsex_mapper via: p.mapper_id = m.id
-- Real columns: ltp, ycp, openp, closep, high, low, volume, value_mn, trade

-- View: Market Summary — per stock for latest date (includes trading_code)
DROP VIEW IF EXISTS public.v_dsex_market_summary;
CREATE VIEW public.v_dsex_market_summary AS
WITH LatestDate AS (
    SELECT MAX(date) AS max_date FROM public.dsex_prices
)
SELECT
    m.trading_code,
    m.sector,
    ROUND(p.openp::numeric, 2)                                              AS open_price,
    ROUND(p.ltp::numeric, 2)                                                AS last_price,
    ROUND(p.closep::numeric, 2)                                             AS close_price,
    ROUND(p.ycp::numeric, 2)                                                AS prev_close,
    ROUND(((p.ltp - p.ycp) / NULLIF(p.ycp, 0) * 100)::numeric, 2)         AS change_pct,
    p.volume,
    ROUND(p.value_mn::numeric, 2)                                           AS value_mn,
    p.date
FROM public.dsex_prices p
INNER JOIN public.dsex_mapper m ON p.mapper_id = m.id
WHERE p.date = (SELECT max_date FROM LatestDate)
ORDER BY p.volume DESC;


-- View: Top 5 by Volume for Latest Date (includes trading_code)
DROP VIEW IF EXISTS public.v_dsex_top_volume;
CREATE VIEW public.v_dsex_top_volume AS
WITH LatestDate AS (
    SELECT MAX(date) AS max_date FROM public.dsex_prices
)
SELECT
    m.trading_code,
    m.sector,
    ROUND(p.ltp::numeric, 2)                                                AS last_price,
    ROUND(p.closep::numeric, 2)                                             AS close_price,
    ROUND(((p.ltp - p.ycp) / NULLIF(p.ycp, 0) * 100)::numeric, 2)         AS change_pct,
    p.volume,
    ROUND(p.value_mn::numeric, 2)                                           AS value_mn,
    p.date
FROM public.dsex_prices p
INNER JOIN public.dsex_mapper m ON p.mapper_id = m.id
WHERE p.date = (SELECT max_date FROM LatestDate)
ORDER BY p.volume DESC
LIMIT 5;


-- 4. Seed Initial Insight Cards
INSERT INTO public.insight_cards (dataset_slug, slug, title, description, type, config)
VALUES 
(
    'dsex-prices-historical', 
    'dsex-market-pulse', 
    'DSEX Market Snapshot', 
    'Latest day prices, volume, and % change for all instruments on the Dhaka Stock Exchange.', 
    'table', 
    '{"view": "v_dsex_market_summary", "columns": ["trading_code", "sector", "last_price", "change_pct", "volume"]}'
),
(
    'dsex-prices-historical', 
    'dsex-top-volume', 
    'Top 5 by Trading Volume', 
    'The 5 most actively traded instruments on the DSEX today, ranked by volume.', 
    'table', 
    '{"view": "v_dsex_top_volume", "columns": ["trading_code", "last_price", "change_pct", "volume", "value_mn"]}'
)
ON CONFLICT (slug) DO NOTHING;
