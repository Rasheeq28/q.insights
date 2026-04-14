-- Optimized View for DSEX Historical Price Preview
-- This correctly aliases columns to match the frontend expectations
-- Frontend expects: trading_code, sector, date, openp, high, low, closep, volume

CREATE OR REPLACE VIEW v_dsex_flat AS
SELECT 
    m.trading_code,
    m.sector,
    p.date,
    p.ltp as openp, -- Aliasing LTP to Open Price for preview purposes if openp isn't in DB
    p.high,
    p.low,
    p.closep,
    p.volume
FROM public.dsex_prices p
LEFT JOIN public.dsex_mapper m ON p.mapper_id = m.id
ORDER BY p.date DESC;

-- Note: Ensure the slug 'dsex-prices-historical' is configured to use this view in the insights/datasets config.
