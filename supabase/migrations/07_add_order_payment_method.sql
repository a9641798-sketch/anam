-- Add payment_method column to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'online'; -- 'online' or 'cod'
