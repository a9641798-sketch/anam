const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const categoriesMap = {
  'necklaces': 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=800&q=80&fm=webp',
  'earrings': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80&fm=webp',
  'rings': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80&fm=webp',
  'bracelets': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80&fm=webp'
};

async function main() {
  await supabase.storage.createBucket("categories", { public: true });

  for (const [slug, url] of Object.entries(categoriesMap)) {
    console.log(`Processing ${slug}...`);
    try {
      // 1. Fetch image buffer
      const res = await fetch(url);
      const buffer = await res.arrayBuffer();
      
      // 2. Upload to Supabase Storage
      const fileName = `category-${slug}-${Date.now()}.webp`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('categories')
        .upload(fileName, buffer, {
          contentType: 'image/webp',
          upsert: true
        });
        
      if (uploadError) {
        console.error(`Failed to upload ${slug}:`, uploadError);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('categories')
        .getPublicUrl(fileName);
        
      console.log(`Uploaded to ${publicUrl}`);
      
      // 3. Update category in DB
      const { error: dbError } = await supabase
        .from('categories')
        .update({ image_url: publicUrl })
        .eq('slug', slug);
        
      if (dbError) {
        console.error(`Failed to update DB for ${slug}:`, dbError);
      } else {
        console.log(`Successfully updated ${slug} in DB`);
      }
    } catch (e) {
      console.error(`Error processing ${slug}:`, e);
    }
  }
  console.log('Done!');
}

main();
