/**
 * Generate a unique filename for image uploads
 * Uses timestamp + random string to ensure uniqueness and cache busting
 */
export function generateUniqueImageFilename(originalName?: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = originalName?.match(/\.[^.]+$/)?.[0] || '.webp'
  return `${timestamp}-${random}${extension}`
}

/**
 * Get the full URL for an image stored in Supabase Storage
 * If the path is already a full URL, return it as-is
 * 
 * Note: When images are updated, they get NEW filenames, which automatically
 * bypasses browser cache (new URL = new resource = fresh fetch)
 * 
 * Uses Next.js API proxy route to ensure proper cache headers are set
 */
export function getImageUrl(imagePath: string | null | undefined, bucket?: string, useProxy: boolean = true): string | null {
  if (!imagePath || typeof imagePath !== 'string') {
    return null
  }

  // If it's already a full URL, check if it's a Supabase Storage URL
  // If so, extract bucket and path to use our proxy for proper caching
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    // Check if it's a Supabase Storage URL
    if (supabaseUrl && imagePath.includes('/storage/v1/object/public/')) {
      // Extract bucket and path from Supabase Storage URL
      // Format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
      const storagePathMatch = imagePath.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)$/)
      if (storagePathMatch) {
        const extractedBucket = storagePathMatch[1]
        const extractedPath = storagePathMatch[2]
        
        // Use proxy route for proper cache headers
        if (useProxy) {
          return `/api/images/${extractedBucket}/${extractedPath}`
        } else {
          return imagePath // Return as-is if proxy disabled
        }
      }
    }
    
    // For other external URLs, return as-is (don't proxy)
    return imagePath
  }

  // Get Supabase URL from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL is not set')
    return null
  }

  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
  
  // Determine bucket and path
  let finalBucket = bucket
  let finalPath = cleanPath
  
  if (finalBucket) {
    // If bucket is provided, use the path as-is (it should not include bucket name)
    finalPath = cleanPath
  } else {
    // Try to extract bucket from path (e.g., "banners/image.jpg" or "hero/image.webp")
    // Common bucket names from schema: banners, menu-items, events, gallery, offers, site-assets
    const pathParts = cleanPath.split('/').filter(part => part.length > 0)
    const possibleBuckets = ['banners', 'menu-items', 'events', 'gallery', 'offers', 'hero', 'site-assets']
    
    if (pathParts.length > 1 && possibleBuckets.includes(pathParts[0])) {
      // First part is a known bucket name
      finalBucket = pathParts[0]
      finalPath = pathParts.slice(1).join('/')
    } else if (pathParts.length > 1) {
      // First part might be a bucket, use it anyway
      finalBucket = pathParts[0]
      finalPath = pathParts.slice(1).join('/')
    } else {
      // Single path segment - can't determine bucket, return null
      console.warn(`Cannot determine bucket for image path: ${imagePath}. Please specify bucket parameter.`)
      return null
    }
  }
  
  // Ensure we have both bucket and path
  if (!finalBucket || !finalPath) {
    console.warn(`Invalid image path or bucket: path=${imagePath}, bucket=${bucket}`)
    return null
  }
  
  // Use Next.js API proxy route to ensure proper cache headers
  // This ensures images are cached for 1 year with proper Cache-Control headers
  if (useProxy) {
    // Use proxy route for proper cache headers (works for both server and client)
    // Relative URLs work fine with Next.js Image component
    return `/api/images/${finalBucket}/${finalPath}`
  } else {
    // Fallback: direct Supabase Storage URL (if proxy is disabled)
    // Format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    return `${supabaseUrl}/storage/v1/object/public/${finalBucket}/${finalPath}`
  }
}


/**
 * Compresses an image file to WebP format, aiming for under 50KB if possible.
 */
export async function compressImageToWebP(file: File, quality: number = 0.8, targetSizeKb: number = 50): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Max dimensions to ensure file size is small
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Recursive function to hit target size
        const targetSizeBytes = targetSizeKb * 1024;
        let currentQuality = quality;
        
        const tryCompress = (q: number) => {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error("Canvas to Blob failed"));
              return;
            }
            if (blob.size > targetSizeBytes && q > 0.1) {
              tryCompress(q - 0.1); // Reduce quality and try again
            } else {
              const fileName = file.name.split('.')[0] + '.webp';
              const webpFile = new File([blob], fileName, {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(webpFile);
            }
          }, 'image/webp', q);
        };
        
        tryCompress(currentQuality);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
