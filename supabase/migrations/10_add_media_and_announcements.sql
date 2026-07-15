-- Add is_video column to product_images
ALTER TABLE public.product_images 
ADD COLUMN IF NOT EXISTS is_video BOOLEAN NOT NULL DEFAULT false;

-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Announcements are viewable by everyone" 
ON public.announcements FOR SELECT 
USING (true);

CREATE POLICY "Announcements are insertable by authenticated users" 
ON public.announcements FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Announcements are updatable by authenticated users" 
ON public.announcements FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Announcements are deletable by authenticated users" 
ON public.announcements FOR DELETE 
USING (auth.role() = 'authenticated');
