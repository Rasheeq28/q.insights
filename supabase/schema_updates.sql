-- Q.Labs MVP V2 Schema Updates
-- Run this in your Supabase SQL Editor

-- 1. Datasets Table
CREATE TABLE IF NOT EXISTS public.datasets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  source text,
  price numeric NOT NULL DEFAULT 49,
  tags jsonb DEFAULT '[]'::jsonb,
  fields jsonb DEFAULT '[]'::jsonb,
  preview_data jsonb DEFAULT '[]'::jsonb,
  table_name text, -- e.g., 'dsex_historical_prices'
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT datasets_pkey PRIMARY KEY (id)
);

ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
-- Everyone can view active datasets
CREATE POLICY "Datasets are viewable by everyone" ON public.datasets FOR SELECT USING (is_active = true);


-- 2. User Purchases Table
CREATE TABLE IF NOT EXISTS public.user_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dataset_slug text NOT NULL,
  status text DEFAULT 'active'::text CHECK (status IN ('active', 'revoked')),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_purchases_pkey PRIMARY KEY (id),
  CONSTRAINT user_purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE,
  CONSTRAINT user_purchases_dataset_slug_fkey FOREIGN KEY (dataset_slug) REFERENCES public.datasets (slug) ON DELETE CASCADE
);

ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;
-- Users can view their own purchases
CREATE POLICY "Users can view their own purchases" ON public.user_purchases FOR SELECT USING (auth.uid() = user_id);


-- 3. Dataset Requests Table
CREATE TABLE IF NOT EXISTS public.dataset_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid, -- optional, NULL if submitting randomly without account
  email text,
  url text NOT NULL,
  description text,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT dataset_requests_pkey PRIMARY KEY (id),
  CONSTRAINT dataset_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE SET NULL
);

ALTER TABLE public.dataset_requests ENABLE ROW LEVEL SECURITY;
-- Anyone can insert a request (anonymous or authenticated)
CREATE POLICY "Anyone can insert requests" ON public.dataset_requests FOR INSERT WITH CHECK (true);
-- Users can view their own requests
CREATE POLICY "Users can view their own requests" ON public.dataset_requests FOR SELECT USING (auth.uid() = user_id);
