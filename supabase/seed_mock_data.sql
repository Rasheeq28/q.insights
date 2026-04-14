-- Mock Data Seed for Q.Labs MVP V2
-- Please run this directly in the Supabase SQL Editor AFTER running schema_updates.sql

-- Clear old datasets for fresh seed if needed
-- DELETE FROM public.datasets;

INSERT INTO public.datasets (slug, title, description, source, price, tags, fields, preview_data)
VALUES 
(
  'dsex-prices-historical',
  'DSEX Historical Stock Prices',
  'Daily historical stock prices for all companies listed on the Dhaka Stock Exchange (DSEX). Includes open, high, low, close, and volume data. Connected to live Supabase database.',
  'Dhaka Stock Exchange',
  49,
  '["Finance", "Stock Market", "Trending", "Popular"]'::jsonb,
  '["trading_code", "sector", "date", "openp", "high", "low", "closep", "volume"]'::jsonb,
  '[
    {"trading_code":"GP","sector":"Telecommunication","date":"2023-10-01","openp":"286.60","high":"286.60","low":"286.60","closep":"286.60","volume":"150"},
    {"trading_code":"BATBC","sector":"Food & Allied","date":"2023-10-01","openp":"518.70","high":"518.70","low":"518.70","closep":"518.70","volume":"420"},
    {"trading_code":"SQURPHARMA","sector":"Pharmaceuticals","date":"2023-10-01","openp":"210.50","high":"211.00","low":"209.00","closep":"210.00","volume":"850"}
  ]'::jsonb
),
(
  'global-equity-insights',
  'Global Equity Insights',
  'Aggregated metrics across 50+ global markets. Updated daily with sentiment analysis and volume spikes across major indices.',
  'Multiple Exchanges',
  99,
  '["Global", "Finance", "Popular"]'::jsonb,
  '["ticker", "market", "sentiment_score", "daily_volume", "avg_price", "trend", "date"]'::jsonb,
  '[
    {"ticker":"AAPL","market":"NASDAQ","sentiment_score":"0.85","daily_volume":"55000000","avg_price":"175.50","trend":"Bullish","date":"2023-10-01"},
    {"ticker":"TSLA","market":"NASDAQ","sentiment_score":"0.65","daily_volume":"120000000","avg_price":"240.20","trend":"Neutral","date":"2023-10-01"},
    {"ticker":"NVDA","market":"NASDAQ","sentiment_score":"0.92","daily_volume":"80000000","avg_price":"450.00","trend":"Bullish","date":"2023-10-01"}
  ]'::jsonb
),
(
  'defi-liquidity-flow',
  'DeFi Liquidity Flow',
  'Live tracking of liquidity pools across Ethereum L2s (Arbitrum, Optimism, Base). Tracks TVL, volume, and impermanent loss metrics.',
  'On-chain RPCs',
  79,
  '["Crypto", "DeFi", "New"]'::jsonb,
  '["pool", "chain", "tvl_usd", "volume_24h", "fee_tier", "apy"]'::jsonb,
  '[
    {"pool":"USDC/ETH","chain":"Arbitrum","tvl_usd":"45000000","volume_24h":"12000000","fee_tier":"0.05%","apy":"4.5%"},
    {"pool":"WBTC/ETH","chain":"Optimism","tvl_usd":"22000000","volume_24h":"5000000","fee_tier":"0.3%","apy":"8.2%"}
  ]'::jsonb
),
(
  'adsense-competitor-map',
  'AdSense Competitor Map',
  'Extensive CPC and search volume mappings for 12 high-intent niches. Ideal for programmatic SEO and marketing strategy.',
  'Google Trends & AdSense',
  29,
  '["Marketing", "SEO", "Popular"]'::jsonb,
  '["keyword", "niche", "search_volume", "cpc", "competition_index"]'::jsonb,
  '[
    {"keyword":"best life insurance","niche":"Finance","search_volume":"135000","cpc":"$15.50","competition_index":"High"},
    {"keyword":"mesothelioma lawyer","niche":"Legal","search_volume":"45000","cpc":"$120.00","competition_index":"Extreme"},
    {"keyword":"cheap car rental","niche":"Travel","search_volume":"550000","cpc":"$4.20","competition_index":"Medium"}
  ]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Inject Mock Data specific to Rasheeq's Demo Email
DO $$
DECLARE
    uid uuid;
BEGIN
    -- Find the account created by rasheeqferdous28@gmail.com
    SELECT id INTO uid FROM auth.users WHERE email = 'rasheeqferdous28@gmail.com' LIMIT 1;
    
    IF uid IS NOT NULL THEN
        -- 1. Insert CSV purchase record
        INSERT INTO public.user_purchases (user_id, dataset_slug, status) 
        VALUES (uid, 'dsex-prices-historical', 'active');
        
        -- 2. Insert Active API Token
        INSERT INTO public.api_tokens (user_id, dataset_slug, token_string, status) 
        VALUES (uid, 'dsex-prices-historical', 'qlabs_live_mock_token_rasheeq123', 'active');
        
        RAISE NOTICE 'Mock data successfully injected for rasheeqferdous28@gmail.com';
    ELSE
        RAISE NOTICE 'Skipped injecting rasheeqferdous28@gmail.com mock records because the email was not found in auth.users. Please sign up first!';
    END IF;
END $$;
