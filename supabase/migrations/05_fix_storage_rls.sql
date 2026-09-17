-- 1. Fix Banner Upload Policies
-- Ensure both 'anon' and 'authenticated' can upload to banners for easy local testing
-- For production, you should ideally restrict this to 'authenticated'.
DROP POLICY IF EXISTS "Auth Upload for banners" ON storage.objects;
CREATE POLICY "Public Upload for banners" ON storage.objects
  FOR INSERT TO public WITH CHECK (bucket_id = 'banners');

-- 2. Add Delete Policies for cleanup
-- Allow both buckets to be managed (delete existing images/banners)
CREATE POLICY "Public Delete for jewelry_images" ON storage.objects
  FOR DELETE TO public USING (bucket_id = 'jewelry_images');

CREATE POLICY "Public Delete for banners" ON storage.objects
  FOR DELETE TO public USING (bucket_id = 'banners');

-- 3. Add Update Policies (often needed by some uploaders)
CREATE POLICY "Public Update for jewelry_images" ON storage.objects
  FOR UPDATE TO public USING (bucket_id = 'jewelry_images');

CREATE POLICY "Public Update for banners" ON storage.objects
  FOR UPDATE TO public USING (bucket_id = 'banners');
