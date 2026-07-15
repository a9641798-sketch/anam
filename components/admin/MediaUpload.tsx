'use client';
import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/db';
import { generateUniqueImageFilename } from '@/lib/image-utils';

interface MediaUploadProps {
  bucketName: string;
  onUploadComplete: (url: string, isVideo: boolean) => void;
  className?: string;
  buttonText?: string;
}

export default function MediaUpload({ bucketName, onUploadComplete, className = '', buttonText = 'Upload Media (Img/Vid)' }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const isVideo = file.type.startsWith('video/');

    try {
      let fileToUpload = file;
      let filename = '';
      let contentType = file.type;

      if (!isVideo) {
        // Compress image
        const options = {
          maxSizeMB: 0.1, // 100kb
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/webp'
        };
        fileToUpload = await imageCompression(file, options);
        filename = generateUniqueImageFilename('image.webp');
        contentType = 'image/webp';
      } else {
        // Just upload video directly
        filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
      }

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase!.storage
        .from(bucketName)
        .upload(filename, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
          contentType: contentType
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase!.storage.from(bucketName).getPublicUrl(filename);
      onUploadComplete(publicUrlData.publicUrl, isVideo);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors relative overflow-hidden">
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin"></div>
            Uploading...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {buttonText}
          </>
        )}
        <input 
          type="file" 
          accept="image/*,video/mp4,video/webm,video/quicktime" 
          onChange={handleUpload} 
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
      </label>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}
