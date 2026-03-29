'use client';
import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/db';
import { generateUniqueImageFilename } from '@/lib/image-utils';

interface ImageUploadProps {
  bucketName: string;
  onUploadComplete: (url: string) => void;
  className?: string;
  buttonText?: string;
}

export default function ImageUpload({ bucketName, onUploadComplete, className = '', buttonText = 'Upload Image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // 1. Compress and convert to webp (< 50kb max if possible)
      const options = {
        maxSizeMB: 0.05, // 50kb
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp'
      };
      
      console.log('Original File Size:', file.size / 1024, 'KB');
      const compressedFile = await imageCompression(file, options);
      console.log('Compressed File Size:', compressedFile.size / 1024, 'KB');

      // 2. Generate unique filename directly as .webp
      const filename = generateUniqueImageFilename('image.webp');

      // 3. Upload to Supabase Storage
      const { data, error: uploadError } = await supabase!.storage
        .from(bucketName)
        .upload(filename, compressedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/webp'
        });

      if (uploadError) throw uploadError;

      // 4. Return the full public URL
      const { data: { publicUrl } } = supabase!.storage.from(bucketName).getPublicUrl(filename);
      onUploadComplete(publicUrl);

    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="relative cursor-pointer bg-[#222] hover:bg-[#333] border border-[#444] text-white px-4 py-2 rounded text-center transition-colors">
        <span>{uploading ? 'Uploading...' : buttonText}</span>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleUpload} 
          disabled={uploading}
        />
      </label>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
