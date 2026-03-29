-- Clean up existing data
TRUNCATE public.product_images CASCADE;
TRUNCATE public.products CASCADE;

-- Insert 20 products (5 per category)
-- Categories used: Necklaces (c1), Earrings (c2), Rings (c3), Bracelets (c4)

-- 1. Necklaces
INSERT INTO public.products (id, name, description, price, stock, category_id, category) VALUES
('p101', 'Royal Kundan Choker', 'A majestic kundan choker set with matching earrings.', 4500.00, 10, 'c1000000-0000-0000-0000-000000000000', 'Necklaces'),
('p102', 'Pearl Grace Necklace', 'Elegant multi-layered pearl necklace for formal events.', 3200.00, 15, 'c1000000-0000-0000-0000-000000000000', 'Necklaces'),
('p103', 'Golden Lotus Pendant', 'Intricately designed lotus pendant with a gold-plated chain.', 1800.00, 20, 'c1000000-0000-0000-0000-000000000000', 'Necklaces'),
('p104', 'Emerald Queen Set', 'Deep green emerald-style necklace set with premium stones.', 5500.00, 5, 'c1000000-0000-0000-0000-000000000000', 'Necklaces'),
('p105', 'Minimalist Gold Chain', 'Simple yet sophisticated 24k gold-plated daily wear chain.', 1200.00, 30, 'c1000000-0000-0000-0000-000000000000', 'Necklaces');

-- 2. Earrings
INSERT INTO public.products (id, name, description, price, stock, category_id, category) VALUES
('p201', 'Bridal Jhumkas', 'Traditional heavy gold-plated jhumkas with pearl drops.', 2500.00, 12, 'c2000000-0000-0000-0000-000000000000', 'Earrings'),
('p202', 'Diamond Sparkle Studs', 'High-quality zircon studs that look like real diamonds.', 1500.00, 25, 'c2000000-0000-0000-0000-000000000000', 'Earrings'),
('p203', 'Chandbali Hoops', 'Modern fusion of chandbali design and hoop earrings.', 1900.00, 18, 'c2000000-0000-0000-0000-000000000000', 'Earrings'),
('p204', 'Ruby Drop Earrings', 'Stunning ruby red drops with silver plating.', 2200.00, 8, 'c2000000-0000-0000-0000-000000000000', 'Earrings'),
('p205', 'Floral Meenakari Tops', 'Colorful hand-painted meenakari floral earrings.', 900.00, 40, 'c2000000-0000-0000-0000-000000000000', 'Earrings');

-- 3. Rings
INSERT INTO public.products (id, name, description, price, stock, category_id, category) VALUES
('p300', 'Solitaire Promise Ring', 'Classic zircon solitaire ring with a sleek band.', 1100.00, 50, 'c3000000-0000-0000-0000-000000000000', 'Rings'),
('p301', 'Vintage Rose Ring', 'Antique finished rose design ring with adjustable band.', 850.00, 35, 'c3000000-0000-0000-0000-000000000000', 'Rings'),
('p302', 'Adjustable Kundan Ring', 'Broad kundan ring perfect for celebratory wear.', 1400.00, 20, 'c3000000-0000-0000-0000-000000000000', 'Rings'),
('p303', 'Blue Sapphire Band', 'Elegant band featuring deep blue synthetic sapphires.', 1600.00, 15, 'c3000000-0000-0000-0000-000000000000', 'Rings'),
('p304', 'Infinity Love Ring', 'Modern infinity symbol ring studded with fine zircons.', 950.00, 45, 'c3000000-0000-0000-0000-000000000000', 'Rings');

-- 4. Bracelets
INSERT INTO public.products (id, name, description, price, stock, category_id, category) VALUES
('p401', 'Golden Cuff Bracelet', 'Bold and beautiful gold-plated textured cuff.', 1700.00, 15, 'c4000000-0000-0000-0000-000000000000', 'Bracelets'),
('p402', 'Pearl String Bracelet', 'Delicate single-strand pearl bracelet with gold clasp.', 1300.00, 20, 'c4000000-0000-0000-0000-000000000000', 'Bracelets'),
('p403', 'Zircon Link Bracelet', 'Sparkling link bracelet perfect for stacking.', 2100.00, 10, 'c4000000-0000-0000-0000-000000000000', 'Bracelets'),
('p404', 'Antique Bangle Pair', 'Set of two antique-finish bangles with intricate carvings.', 2800.00, 8, 'c4000000-0000-0000-0000-000000000000', 'Bracelets'),
('p405', 'Evil Eye Charm Bracelet', 'Enamel evil eye charm on a dainty golden chain.', 1100.00, 25, 'c4000000-0000-0000-0000-000000000000', 'Bracelets');

-- Insert Images (Placeholders)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM public.products WHERE category_id = 'c1000000-0000-0000-0000-000000000000';

INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/ring-01.jpg', true, 0 FROM public.products WHERE category_id = 'c2000000-0000-0000-0000-000000000000';

INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/ring-02.jpg', true, 0 FROM public.products WHERE category_id = 'c3000000-0000-0000-0000-000000000000';

INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/kangan-01.jpg', true, 0 FROM public.products WHERE category_id = 'c4000000-0000-0000-0000-000000000000';
