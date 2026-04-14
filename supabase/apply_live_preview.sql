-- Q.Labs MVP V2: Live Preview Security Updates
-- Run this in your Supabase SQL Editor to enable public previews of real data

-- 1. Real_estate Table RLS
ALTER TABLE public."Real_estate" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Access Real_estate only via purchase" ON public."Real_estate";
DROP POLICY IF EXISTS "Public read for Real_estate preview" ON public."Real_estate";
CREATE POLICY "Public read for Real_estate preview" ON public."Real_estate" FOR SELECT USING (true);

-- 2. DSEX Prices RLS (Ensure it's public for preview)
ALTER TABLE public.dsex_prices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public dsex reads" ON public.dsex_prices;
CREATE POLICY "Public dsex reads" ON public.dsex_prices FOR SELECT USING (true);

-- 2b. DSEX Mapper RLS
ALTER TABLE public.dsex_mapper ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public mapper reads" ON public.dsex_mapper;
CREATE POLICY "Public mapper reads" ON public.dsex_mapper FOR SELECT USING (true);

-- 3. Global Equity Insights RLS
ALTER TABLE public.global_equity_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public equity reads" ON public.global_equity_insights;
CREATE POLICY "Public equity reads" ON public.global_equity_insights FOR SELECT USING (true);

-- 4. DeFi Liquidity Flow RLS
ALTER TABLE public.defi_liquidity_flow ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public liquidity reads" ON public.defi_liquidity_flow;
CREATE POLICY "Public liquidity reads" ON public.defi_liquidity_flow FOR SELECT USING (true);

-- 5. Clear preview_data from Real_estate metadata to force live fetch (optional, but forces our new logic)
UPDATE public.datasets SET preview_data = '[]'::jsonb WHERE slug = 'real-estate';
