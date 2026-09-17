-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create product_images table
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create banners table
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    title TEXT,
    link TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id), -- Nullable if guest checkout
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, shipped, delivered, cancelled
    stripe_session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create order items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add updated_at trigger for products
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policies for public access (Read-only)
CREATE POLICY "Public profiles are viewable by everyone." ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Public product images viewable by everyone." ON public.product_images
    FOR SELECT USING (true);

CREATE POLICY "Public banners viewable by everyone." ON public.banners
    FOR SELECT USING (is_active = true);

-- Policies for Admin (We will use a simple auth check: if the user is logged in, they are admin for now, or check for specific email/role)
-- Assuming any authenticated user can manage products in this simple setup. 
-- For a real production app, we would add an `admin_users` table or check JWT role.
CREATE POLICY "Enable insert for authenticated users only" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON public.products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON public.products FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.product_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON public.product_images FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON public.product_images FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.banners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON public.banners FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON public.banners FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable select for authenticated users only" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable update for authenticated users only" ON public.orders FOR UPDATE TO authenticated USING (true);

-- Storage buckets
-- Note: creating buckets usually needs to be done via UI or superuser. 
-- INSERT INTO storage.buckets (id, name, public) VALUES ('jewelry_images', 'jewelry_images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);

-- Storage policies
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('jewelry_images', 'banners'));
-- CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('jewelry_images', 'banners'));
-- CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('jewelry_images', 'banners'));
-- CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('jewelry_images', 'banners'));
