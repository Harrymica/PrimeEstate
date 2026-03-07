-- ==============================================
-- Migration: Add image_url column to properties
-- and create storage bucket for property images
-- ==============================================

-- 1. Add image_url column (array of text/URLs)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS image_url TEXT[] DEFAULT '{}';

-- 2. Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  5242880, -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policies: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-images');

-- 4. Anyone can view property images (public bucket)
CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'property-images');

-- 5. Users can update their own uploads
CREATE POLICY "Users can update their own property images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 6. Users can delete their own uploads
CREATE POLICY "Users can delete their own property images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);
