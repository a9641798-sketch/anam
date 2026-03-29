-- Seed script to populate initial products using local assets

-- 1. Royal Kundan Kangan
WITH new_product AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES (
    'Royal Kundan Kangan', 
    'A stunning pair of traditional Kundan Kangans perfect for weddings and festive occasions.',
    1500.00,
    10,
    'Bangles'
  )
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/kangan-01.jpg', true, 0 FROM new_product UNION ALL
SELECT id, '/tem/kangan-02.jpg', false, 1 FROM new_product UNION ALL
SELECT id, '/tem/kangan-03.jpg', false, 2 FROM new_product;

-- 2. Diamond Embedded Necklace
WITH new_product AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES (
    'Diamond Embedded Necklace', 
    'An elegant designer necklace featuring premium artificial diamonds to elevate your evening look.',
    3500.00,
    5,
    'Necklaces'
  )
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM new_product UNION ALL
SELECT id, '/tem/necklace-02.jpg', false, 1 FROM new_product;

-- 3. Elegant Pearl & Diamond Rings
WITH new_product AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES (
    'Elegant Masterpiece Rings', 
    'A collection of exquisitely crafted artificial rings designed to capture attention.',
    500.00,
    20,
    'Rings'
  )
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/ring-01.jpg', true, 0 FROM new_product UNION ALL
SELECT id, '/tem/ring-02.jpg', false, 1 FROM new_product UNION ALL
SELECT id, '/tem/ring-03.webp', false, 2 FROM new_product UNION ALL
SELECT id, '/tem/ring-04.jpg', false, 3 FROM new_product;
