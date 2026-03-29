-- 1. Add order address columns
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS house_no TEXT,
ADD COLUMN IF NOT EXISTS street_address TEXT,
ADD COLUMN IF NOT EXISTS landmark TEXT,
ADD COLUMN IF NOT EXISTS pincode TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India';

-- 2. Fix RLS policies for orders (Enable INSERT for public/anon)
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.orders;
CREATE POLICY "Enable insert for everyone" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- 3. Fix RLS policies for order_items (Enable INSERT for public/anon)
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.order_items;
CREATE POLICY "Enable insert for everyone" 
ON public.order_items FOR INSERT 
WITH CHECK (true);

-- 4. Enable SELECT for public if needed (optional, for order tracking)
DROP POLICY IF EXISTS "Allow public read order by id" ON public.orders;
CREATE POLICY "Allow public read order by id" 
ON public.orders FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow public read order items by order_id" ON public.order_items;
CREATE POLICY "Allow public read order items by order_id" 
ON public.order_items FOR SELECT 
USING (true);
