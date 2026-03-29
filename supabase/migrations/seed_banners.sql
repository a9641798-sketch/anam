-- Seed script to populate initial banners from public/banner

INSERT INTO public.banners (image_url, display_order, is_active)
VALUES 
  ('/banner/banner-01.webp', 0, true),
  ('/banner/banner-01.jpg', 1, true),
  ('/banner/banner-03.webp', 2, true);
