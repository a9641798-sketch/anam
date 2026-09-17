-- Seed script for 40 products

WITH new_product_1 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Royal Maang Tikka 1', 'A beautiful earrings perfect for all occasions. Handcrafted with premium artificial materials.', 4461.00, 45, 'Earrings')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/ring-01.jpg', true, 0 FROM new_product_1 UNION ALL
SELECT id, '/tem/necklace-01.jpg', false, 1 FROM new_product_1;

WITH new_product_2 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Classic Kangan 2', 'A beautiful bridal sets perfect for all occasions. Handcrafted with premium artificial materials.', 3225.00, 30, 'Bridal Sets')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM new_product_2 UNION ALL
SELECT id, '/tem/kangan-01.jpg', false, 1 FROM new_product_2 UNION ALL
SELECT id, '/tem/ring-01.jpg', false, 2 FROM new_product_2;

WITH new_product_3 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Royal Earrings 3', 'A beautiful rings perfect for all occasions. Handcrafted with premium artificial materials.', 1384.00, 9, 'Rings')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/ring-01.jpg', true, 0 FROM new_product_3 UNION ALL
SELECT id, '/tem/ring-02.jpg', false, 1 FROM new_product_3 UNION ALL
SELECT id, '/tem/ring-03.webp', false, 2 FROM new_product_3 UNION ALL
SELECT id, '/tem/ring-04.jpg', false, 3 FROM new_product_3;

WITH new_product_4 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Premium Choker 4', 'A beautiful rings perfect for all occasions. Handcrafted with premium artificial materials.', 3961.00, 36, 'Rings')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/ring-01.jpg', true, 0 FROM new_product_4 UNION ALL
SELECT id, '/tem/ring-02.jpg', false, 1 FROM new_product_4 UNION ALL
SELECT id, '/tem/ring-03.webp', false, 2 FROM new_product_4 UNION ALL
SELECT id, '/tem/ring-04.jpg', false, 3 FROM new_product_4;

WITH new_product_5 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Classic Bangle Set 5', 'A beautiful bangles perfect for all occasions. Handcrafted with premium artificial materials.', 646.00, 17, 'Bangles')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/kangan-01.jpg', true, 0 FROM new_product_5 UNION ALL
SELECT id, '/tem/kangan-02.jpg', false, 1 FROM new_product_5 UNION ALL
SELECT id, '/tem/kangan-03.jpg', false, 2 FROM new_product_5;

WITH new_product_6 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Diamond Pendant 6', 'A beautiful earrings perfect for all occasions. Handcrafted with premium artificial materials.', 784.00, 3, 'Earrings')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/ring-01.jpg', true, 0 FROM new_product_6 UNION ALL
SELECT id, '/tem/necklace-01.jpg', false, 1 FROM new_product_6;

WITH new_product_7 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Royal Ring 7', 'A beautiful bridal sets perfect for all occasions. Handcrafted with premium artificial materials.', 4074.00, 47, 'Bridal Sets')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM new_product_7 UNION ALL
SELECT id, '/tem/kangan-01.jpg', false, 1 FROM new_product_7 UNION ALL
SELECT id, '/tem/ring-01.jpg', false, 2 FROM new_product_7;

WITH new_product_8 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Premium Choker 8', 'A beautiful earrings perfect for all occasions. Handcrafted with premium artificial materials.', 886.00, 1, 'Earrings')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/ring-01.jpg', true, 0 FROM new_product_8 UNION ALL
SELECT id, '/tem/necklace-01.jpg', false, 1 FROM new_product_8;

WITH new_product_9 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Royal Necklace 9', 'A beautiful rings perfect for all occasions. Handcrafted with premium artificial materials.', 3864.00, 28, 'Rings')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/ring-01.jpg', true, 0 FROM new_product_9 UNION ALL
SELECT id, '/tem/ring-02.jpg', false, 1 FROM new_product_9 UNION ALL
SELECT id, '/tem/ring-03.webp', false, 2 FROM new_product_9 UNION ALL
SELECT id, '/tem/ring-04.jpg', false, 3 FROM new_product_9;

WITH new_product_10 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Royal Earrings 10', 'A beautiful necklaces perfect for all occasions. Handcrafted with premium artificial materials.', 2633.00, 12, 'Necklaces')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM new_product_10 UNION ALL
SELECT id, '/tem/necklace-02.jpg', false, 1 FROM new_product_10;

WITH new_product_11 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Antique Maang Tikka 11', 'A beautiful bangles perfect for all occasions. Handcrafted with premium artificial materials.', 3713.00, 8, 'Bangles')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/kangan-01.jpg', true, 0 FROM new_product_11 UNION ALL
SELECT id, '/tem/kangan-02.jpg', false, 1 FROM new_product_11 UNION ALL
SELECT id, '/tem/kangan-03.jpg', false, 2 FROM new_product_11;

WITH new_product_12 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Diamond Maang Tikka 12', 'A beautiful bridal sets perfect for all occasions. Handcrafted with premium artificial materials.', 3451.00, 31, 'Bridal Sets')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM new_product_12 UNION ALL
SELECT id, '/tem/kangan-01.jpg', false, 1 FROM new_product_12 UNION ALL
SELECT id, '/tem/ring-01.jpg', false, 2 FROM new_product_12;

WITH new_product_13 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Pearl Ring 13', 'A beautiful bridal sets perfect for all occasions. Handcrafted with premium artificial materials.', 2076.00, 11, 'Bridal Sets')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM new_product_13 UNION ALL
SELECT id, '/tem/kangan-01.jpg', false, 1 FROM new_product_13 UNION ALL
SELECT id, '/tem/ring-01.jpg', false, 2 FROM new_product_13;

WITH new_product_14 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Diamond Ring 14', 'A beautiful bangles perfect for all occasions. Handcrafted with premium artificial materials.', 3186.00, 28, 'Bangles')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/kangan-01.jpg', true, 0 FROM new_product_14 UNION ALL
SELECT id, '/tem/kangan-02.jpg', false, 1 FROM new_product_14 UNION ALL
SELECT id, '/tem/kangan-03.jpg', false, 2 FROM new_product_14;

WITH new_product_15 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Royal Maang Tikka 15', 'A beautiful rings perfect for all occasions. Handcrafted with premium artificial materials.', 5391.00, 23, 'Rings')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/ring-01.jpg', true, 0 FROM new_product_15 UNION ALL
SELECT id, '/tem/ring-02.jpg', false, 1 FROM new_product_15 UNION ALL
SELECT id, '/tem/ring-03.webp', false, 2 FROM new_product_15 UNION ALL
SELECT id, '/tem/ring-04.jpg', false, 3 FROM new_product_15;

WITH new_product_16 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Premium Maang Tikka 16', 'A beautiful earrings perfect for all occasions. Handcrafted with premium artificial materials.', 968.00, 17, 'Earrings')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/ring-01.jpg', true, 0 FROM new_product_16 UNION ALL
SELECT id, '/tem/necklace-01.jpg', false, 1 FROM new_product_16;

WITH new_product_17 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Kundan Necklace 17', 'A beautiful necklaces perfect for all occasions. Handcrafted with premium artificial materials.', 1911.00, 25, 'Necklaces')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM new_product_17 UNION ALL
SELECT id, '/tem/necklace-02.jpg', false, 1 FROM new_product_17;

WITH new_product_18 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Classic Nath 18', 'A beautiful bangles perfect for all occasions. Handcrafted with premium artificial materials.', 4854.00, 44, 'Bangles')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/kangan-01.jpg', true, 0 FROM new_product_18 UNION ALL
SELECT id, '/tem/kangan-02.jpg', false, 1 FROM new_product_18 UNION ALL
SELECT id, '/tem/kangan-03.jpg', false, 2 FROM new_product_18;

WITH new_product_19 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Pearl Bangle Set 19', 'A beautiful bangles perfect for all occasions. Handcrafted with premium artificial materials.', 3744.00, 15, 'Bangles')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/kangan-01.jpg', true, 0 FROM new_product_19 UNION ALL
SELECT id, '/tem/kangan-02.jpg', false, 1 FROM new_product_19 UNION ALL
SELECT id, '/tem/kangan-03.jpg', false, 2 FROM new_product_19;

WITH new_product_20 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Elegant Necklace 20', 'A beautiful necklaces perfect for all occasions. Handcrafted with premium artificial materials.', 1547.00, 26, 'Necklaces')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM new_product_20 UNION ALL
SELECT id, '/tem/necklace-02.jpg', false, 1 FROM new_product_20;

WITH new_product_21 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Kundan Necklace 21', 'A beautiful necklaces perfect for all occasions. Handcrafted with premium artificial materials.', 3909.00, 18, 'Necklaces')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM new_product_21 UNION ALL
SELECT id, '/tem/necklace-02.jpg', false, 1 FROM new_product_21;

WITH new_product_22 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Premium Choker 22', 'A beautiful bangles perfect for all occasions. Handcrafted with premium artificial materials.', 3016.00, 36, 'Bangles')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/kangan-01.jpg', true, 0 FROM new_product_22 UNION ALL
SELECT id, '/tem/kangan-02.jpg', false, 1 FROM new_product_22 UNION ALL
SELECT id, '/tem/kangan-03.jpg', false, 2 FROM new_product_22;

WITH new_product_23 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Classic Earrings 23', 'A beautiful bangles perfect for all occasions. Handcrafted with premium artificial materials.', 5407.00, 14, 'Bangles')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/kangan-01.jpg', true, 0 FROM new_product_23 UNION ALL
SELECT id, '/tem/kangan-02.jpg', false, 1 FROM new_product_23 UNION ALL
SELECT id, '/tem/kangan-03.jpg', false, 2 FROM new_product_23;

WITH new_product_24 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Antique Earrings 24', 'A beautiful bridal sets perfect for all occasions. Handcrafted with premium artificial materials.', 4560.00, 19, 'Bridal Sets')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM new_product_24 UNION ALL
SELECT id, '/tem/kangan-01.jpg', false, 1 FROM new_product_24 UNION ALL
SELECT id, '/tem/ring-01.jpg', false, 2 FROM new_product_24;

WITH new_product_25 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Pearl Bangle Set 25', 'A beautiful earrings perfect for all occasions. Handcrafted with premium artificial materials.', 3249.00, 39, 'Earrings')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/ring-01.jpg', true, 0 FROM new_product_25 UNION ALL
SELECT id, '/tem/necklace-01.jpg', false, 1 FROM new_product_25;

WITH new_product_26 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Modern Bangle Set 26', 'A beautiful bangles perfect for all occasions. Handcrafted with premium artificial materials.', 1297.00, 30, 'Bangles')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/kangan-01.jpg', true, 0 FROM new_product_26 UNION ALL
SELECT id, '/tem/kangan-02.jpg', false, 1 FROM new_product_26 UNION ALL
SELECT id, '/tem/kangan-03.jpg', false, 2 FROM new_product_26;

WITH new_product_27 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Elegant Kangan 27', 'A beautiful bangles perfect for all occasions. Handcrafted with premium artificial materials.', 3104.00, 41, 'Bangles')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/kangan-01.jpg', true, 0 FROM new_product_27 UNION ALL
SELECT id, '/tem/kangan-02.jpg', false, 1 FROM new_product_27 UNION ALL
SELECT id, '/tem/kangan-03.jpg', false, 2 FROM new_product_27;

WITH new_product_28 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Classic Pendant 28', 'A beautiful necklaces perfect for all occasions. Handcrafted with premium artificial materials.', 4659.00, 6, 'Necklaces')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM new_product_28 UNION ALL
SELECT id, '/tem/necklace-02.jpg', false, 1 FROM new_product_28;

WITH new_product_29 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Modern Ring 29', 'A beautiful bridal sets perfect for all occasions. Handcrafted with premium artificial materials.', 2682.00, 39, 'Bridal Sets')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM new_product_29 UNION ALL
SELECT id, '/tem/kangan-01.jpg', false, 1 FROM new_product_29 UNION ALL
SELECT id, '/tem/ring-01.jpg', false, 2 FROM new_product_29;

WITH new_product_30 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Pearl Necklace 30', 'A beautiful bridal sets perfect for all occasions. Handcrafted with premium artificial materials.', 4483.00, 42, 'Bridal Sets')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM new_product_30 UNION ALL
SELECT id, '/tem/kangan-01.jpg', false, 1 FROM new_product_30 UNION ALL
SELECT id, '/tem/ring-01.jpg', false, 2 FROM new_product_30;

WITH new_product_31 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Gold-Plated Choker 31', 'A beautiful rings perfect for all occasions. Handcrafted with premium artificial materials.', 1497.00, 14, 'Rings')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/ring-01.jpg', true, 0 FROM new_product_31 UNION ALL
SELECT id, '/tem/ring-02.jpg', false, 1 FROM new_product_31 UNION ALL
SELECT id, '/tem/ring-03.webp', false, 2 FROM new_product_31 UNION ALL
SELECT id, '/tem/ring-04.jpg', false, 3 FROM new_product_31;

WITH new_product_32 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Elegant Kangan 32', 'A beautiful rings perfect for all occasions. Handcrafted with premium artificial materials.', 5473.00, 17, 'Rings')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/ring-01.jpg', true, 0 FROM new_product_32 UNION ALL
SELECT id, '/tem/ring-02.jpg', false, 1 FROM new_product_32 UNION ALL
SELECT id, '/tem/ring-03.webp', false, 2 FROM new_product_32 UNION ALL
SELECT id, '/tem/ring-04.jpg', false, 3 FROM new_product_32;

WITH new_product_33 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Modern Earrings 33', 'A beautiful necklaces perfect for all occasions. Handcrafted with premium artificial materials.', 2291.00, 36, 'Necklaces')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM new_product_33 UNION ALL
SELECT id, '/tem/necklace-02.jpg', false, 1 FROM new_product_33;

WITH new_product_34 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Antique Pendant 34', 'A beautiful bridal sets perfect for all occasions. Handcrafted with premium artificial materials.', 1479.00, 40, 'Bridal Sets')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM new_product_34 UNION ALL
SELECT id, '/tem/kangan-01.jpg', false, 1 FROM new_product_34 UNION ALL
SELECT id, '/tem/ring-01.jpg', false, 2 FROM new_product_34;

WITH new_product_35 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Classic Kangan 35', 'A beautiful necklaces perfect for all occasions. Handcrafted with premium artificial materials.', 893.00, 41, 'Necklaces')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM new_product_35 UNION ALL
SELECT id, '/tem/necklace-02.jpg', false, 1 FROM new_product_35;

WITH new_product_36 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Diamond Kangan 36', 'A beautiful bangles perfect for all occasions. Handcrafted with premium artificial materials.', 4494.00, 33, 'Bangles')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/kangan-01.jpg', true, 0 FROM new_product_36 UNION ALL
SELECT id, '/tem/kangan-02.jpg', false, 1 FROM new_product_36 UNION ALL
SELECT id, '/tem/kangan-03.jpg', false, 2 FROM new_product_36;

WITH new_product_37 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Elegant Pendant 37', 'A beautiful earrings perfect for all occasions. Handcrafted with premium artificial materials.', 524.00, 7, 'Earrings')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/ring-01.jpg', true, 0 FROM new_product_37 UNION ALL
SELECT id, '/tem/necklace-01.jpg', false, 1 FROM new_product_37;

WITH new_product_38 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Kundan Choker 38', 'A beautiful necklaces perfect for all occasions. Handcrafted with premium artificial materials.', 711.00, 44, 'Necklaces')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM new_product_38 UNION ALL
SELECT id, '/tem/necklace-02.jpg', false, 1 FROM new_product_38;

WITH new_product_39 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Elegant Maang Tikka 39', 'A beautiful bridal sets perfect for all occasions. Handcrafted with premium artificial materials.', 4921.00, 38, 'Bridal Sets')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/necklace-01.jpg', true, 0 FROM new_product_39 UNION ALL
SELECT id, '/tem/kangan-01.jpg', false, 1 FROM new_product_39 UNION ALL
SELECT id, '/tem/ring-01.jpg', false, 2 FROM new_product_39;

WITH new_product_40 AS (
  INSERT INTO public.products (name, description, price, stock, category)
  VALUES ('Diamond Ring 40', 'A beautiful bangles perfect for all occasions. Handcrafted with premium artificial materials.', 1809.00, 24, 'Bangles')
  RETURNING id
)
INSERT INTO public.product_images (product_id, image_url, is_cover, display_order)
SELECT id, '/tem/kangan-01.jpg', true, 0 FROM new_product_40 UNION ALL
SELECT id, '/tem/kangan-02.jpg', false, 1 FROM new_product_40 UNION ALL
SELECT id, '/tem/kangan-03.jpg', false, 2 FROM new_product_40;

