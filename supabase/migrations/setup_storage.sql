-- 1. Create the Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('jewelry_images', 'jewelry_images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true) ON CONFLICT (id) DO NOTHING;

-- 2. Enable Public Read Access for jewelry_images
CREATE POLICY "Public Access for jewelry_images" ON storage.objects
  FOR SELECT USING (bucket_id = 'jewelry_images');

-- 3. Enable Public Read Access for banners
CREATE POLICY "Public Access for banners" ON storage.objects
  FOR SELECT USING (bucket_id = 'banners');

-- 4. Enable Authenticated Uploads for jewelry_images
CREATE POLICY "Auth Upload for jewelry_images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'jewelry_images');

-- 5. Enable Authenticated Uploads for banners
CREATE POLICY "Auth Upload for banners" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'banners');
