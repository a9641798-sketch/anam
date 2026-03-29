-- Migration 08: Add payment_status and site_settings

-- 1. Add payment_status column to orders if it doesn't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';

-- 2. Create site_settings table for dynamic configurations
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Insert initial COD configuration (extra_charge: 50)
INSERT INTO public.site_settings (id, value)
VALUES ('cod_config', '{"extra_charge": 50}')
ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 5. Policies for site_settings
DROP POLICY IF EXISTS "Allow public read for site_settings" ON public.site_settings;
CREATE POLICY "Allow public read for site_settings" 
ON public.site_settings FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.site_settings;
CREATE POLICY "Enable all for authenticated users" 
ON public.site_settings FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
