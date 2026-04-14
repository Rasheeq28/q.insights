-- Mock Data Seed for Internal Tables + Relationships
-- Run this directly in the Supabase SQL Editor AFTER schema_updates.sql and seed_mock_data.sql

-- 1. Create underlying tables for the dynamically mapped sets
CREATE TABLE IF NOT EXISTS public.dsex_prices (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    date date NOT NULL,
    trading_code text,
    sector text,
    openp numeric,
    high numeric,
    low numeric,
    closep numeric,
    volume numeric,
    CONSTRAINT dsex_prices_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.dsex_mapper (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    trading_code text UNIQUE,
    sector text,
    category text,
    CONSTRAINT dsex_mapper_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.global_equity_insights (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    date date NOT NULL,
    ticker text,
    market text,
    sentiment_score numeric,
    daily_volume numeric,
    avg_price numeric,
    trend text,
    CONSTRAINT global_equity_insights_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.defi_liquidity_flow (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    pool text,
    chain text,
    tvl_usd numeric,
    volume_24h numeric,
    fee_tier text,
    apy text,
    CONSTRAINT defi_liquidity_flow_pkey PRIMARY KEY (id)
);

-- Force tables to be Public Readable to allow our frontend / API to hit them organically
ALTER TABLE public.dsex_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public dsex reads" ON public.dsex_prices FOR SELECT USING (true);

ALTER TABLE public.dsex_mapper ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public mapper reads" ON public.dsex_mapper FOR SELECT USING (true);

ALTER TABLE public.global_equity_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public equity reads" ON public.global_equity_insights FOR SELECT USING (true);

ALTER TABLE public.defi_liquidity_flow ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public liquidity reads" ON public.defi_liquidity_flow FOR SELECT USING (true);

-- Clear old records to prevent overpopulation
DELETE FROM public.dsex_prices;
DELETE FROM public.dsex_mapper;
DELETE FROM public.global_equity_insights;
DELETE FROM public.defi_liquidity_flow;

-- 2. Populate tables with distinct expanded mock data matrices
INSERT INTO public.dsex_mapper (trading_code, sector, category) VALUES
('GP', 'Telecommunication', 'A'),
('BATBC', 'Food & Allied', 'A'),
('SQURPHARMA', 'Pharmaceuticals', 'A');

INSERT INTO public.dsex_prices (date, trading_code, sector, openp, high, low, closep, volume) VALUES
('2023-10-01', 'GP', 'Telecommunication', 286.60, 286.60, 286.60, 286.60, 1500),
('2023-10-02', 'GP', 'Telecommunication', 286.60, 287.00, 285.00, 286.50, 3500),
('2023-10-03', 'GP', 'Telecommunication', 286.50, 288.60, 286.60, 288.00, 4200),
('2023-10-01', 'BATBC', 'Food & Allied', 518.70, 518.70, 518.70, 518.70, 4200),
('2023-10-02', 'BATBC', 'Food & Allied', 518.70, 519.00, 518.00, 518.50, 3100),
('2023-10-03', 'BATBC', 'Food & Allied', 518.50, 520.00, 518.50, 520.00, 6000),
('2023-10-01', 'SQURPHARMA', 'Pharmaceuticals', 210.50, 211.00, 209.00, 210.00, 8500),
('2023-10-02', 'SQURPHARMA', 'Pharmaceuticals', 210.00, 212.00, 210.00, 211.50, 9200),
('2023-10-03', 'SQURPHARMA', 'Pharmaceuticals', 211.50, 213.00, 210.50, 212.00, 12000),
('2023-10-04', 'SQURPHARMA', 'Pharmaceuticals', 212.00, 215.00, 211.00, 214.50, 18500);

INSERT INTO public.global_equity_insights (date, ticker, market, sentiment_score, daily_volume, avg_price, trend) VALUES
('2023-10-01', 'AAPL', 'NASDAQ', 0.85, 55000000, 175.50, 'Bullish'),
('2023-10-02', 'AAPL', 'NASDAQ', 0.88, 62000000, 177.20, 'Bullish'),
('2023-10-03', 'AAPL', 'NASDAQ', 0.82, 51000000, 176.80, 'Neutral'),
('2023-10-01', 'TSLA', 'NASDAQ', 0.65, 120000000, 240.20, 'Neutral'),
('2023-10-02', 'TSLA', 'NASDAQ', 0.60, 140000000, 235.50, 'Bearish'),
('2023-10-03', 'TSLA', 'NASDAQ', 0.55, 160000000, 230.10, 'Bearish'),
('2023-10-01', 'NVDA', 'NASDAQ', 0.92, 80000000, 450.00, 'Bullish'),
('2023-10-02', 'NVDA', 'NASDAQ', 0.95, 95000000, 465.20, 'Bullish'),
('2023-10-03', 'NVDA', 'NASDAQ', 0.89, 78000000, 460.00, 'Bullish'),
('2023-10-04', 'NVDA', 'NASDAQ', 0.91, 85000000, 462.50, 'Bullish');

INSERT INTO public.defi_liquidity_flow (pool, chain, tvl_usd, volume_24h, fee_tier, apy) VALUES
('USDC/ETH', 'Arbitrum', 45000000, 12000000, '0.05%', '4.5%'),
('usdt/ETH', 'Arbitrum', 28000000, 8000000, '0.05%', '4.2%'),
('LINK/ETH', 'Arbitrum', 15000000, 3000000, '0.3%', '7.5%'),
('WBTC/ETH', 'Arbitrum', 65000000, 18000000, '0.05%', '3.8%'),
('WBTC/ETH', 'Optimism', 22000000, 5000000, '0.3%', '8.2%'),
('USDC/ETH', 'Optimism', 18000000, 4000000, '0.05%', '4.8%'),
('OP/ETH', 'Optimism', 35000000, 11000000, '0.3%', '6.5%'),
('USDC/ETH', 'Base', 8500000, 2000000, '0.05%', '5.5%'),
('cbETH/ETH', 'Base', 12000000, 4000000, '0.1%', '3.5%'),
('BAL/ETH', 'Ethereum', 4200000, 800000, '1.0%', '12.5%');

-- 3. Populate mock dataset requests as requested
INSERT INTO public.dataset_requests (url, description, status) VALUES
('https://amazon.com/best-sellers', 'Scraping top 500 items daily with price drop mapping.', 'pending'),
('https://coinmarketcap.com/new', 'Live 10-minute snapshot interval mapping volume arrays.', 'approved'),
('https://zillow.com/nyc', 'Condo values per square foot filtered out sequentially.', 'pending');
