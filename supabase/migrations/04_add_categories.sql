-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add category_id to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- 3. Insert initial categories
INSERT INTO public.categories (id, name, slug, description) VALUES 
('c1000000-0000-0000-0000-000000000000', 'Necklaces', 'necklaces', 'Elegant necklaces for every occasion'),
('c2000000-0000-0000-0000-000000000000', 'Earrings', 'earrings', 'Stunning earrings matching your style'),
('c3000000-0000-0000-0000-000000000000', 'Rings', 'rings', 'Premium rings crafted to perfection'),
('c4000000-0000-0000-0000-000000000000', 'Bracelets', 'bracelets', 'Beautiful bracelets and bangles')
ON CONFLICT (name) DO NOTHING;

-- 4. Automatically assign existing products to a default category (e.g. Necklaces) if they don't have one
-- This ensures the DB isn't broken for existing products. The Admin can change them later.
UPDATE public.products 
SET category_id = 'c1000000-0000-0000-0000-000000000000' 
WHERE category_id IS NULL;

-- 5. RLS Policies for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories
CREATE POLICY "Categories are viewable by everyone." 
ON public.categories FOR SELECT USING (true);

-- Allow authenticated admins to insert/update/delete categories (assuming service_role for updates)
-- We will rely on service_role for admin mutations as per previous patterns.
