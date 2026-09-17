const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let env = {};
try {
  env = Object.fromEntries(
    fs.readFileSync('.env', 'utf-8')
      .split('\n')
      .filter(line => line && !line.trim().startsWith('#') && line.includes('='))
      .map(line => {
        const firstEq = line.indexOf('=');
        return [line.slice(0, firstEq).trim(), line.slice(firstEq + 1).trim().replace(/^["']|["']$/g, '')];
      })
  );
} catch (e) {
  console.error("Could not read .env:", e.message);
  process.exit(1);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars in .env!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Starting Seeding Process...");

  // 1. Seed Categories
  const categories = [
    { id: 'c1000000-0000-0000-0000-000000000000', name: 'Necklaces', slug: 'necklaces', description: 'Elegant necklaces for every occasion' },
    { id: 'c2000000-0000-0000-0000-000000000000', name: 'Earrings', slug: 'earrings', description: 'Stunning earrings matching your style' },
    { id: 'c3000000-0000-0000-0000-000000000000', name: 'Rings', slug: 'rings', description: 'Premium rings crafted to perfection' },
    { id: 'c4000000-0000-0000-0000-000000000000', name: 'Bracelets', slug: 'bracelets', description: 'Beautiful bracelets and bangles' }
  ];
  
  console.log("Seeding Categories...");
  const { error: catErr } = await supabase.from('categories').upsert(categories, { onConflict: 'id' });
  if (catErr) console.error("Error seeding categories (maybe they exist):", catErr.message);

  // 2. Seed Banners
  const banners = [
    { image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=2000', title: 'The Royal Collection', is_active: true, display_order: 1 },
    { image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=2000', title: 'Bridal Elegance', is_active: true, display_order: 2 }
  ];
  
  console.log("Seeding Banners...");
  const { error: banErr } = await supabase.from('banners').insert(banners);
  if (banErr) console.error("Error seeding banners:", banErr.message);

  // 3. Clean up products (to allow re-seeding)
  console.log("Cleaning existing dummy products...");
  await supabase.from('product_images').delete().neq('image_url', 'DUMMY_URL');
  await supabase.from('products').delete().neq('name', 'DUMMY_NAME');

  // 4. Seed Products
  const uuid = (i) => `00000000-0000-4000-a000-${String(i).padStart(12, '0')}`;
  const products = [
    { id: uuid(101), name: 'Royal Kundan Choker', description: 'A majestic kundan choker set with matching earrings.', price: 4500, stock: 10, category_id: 'c1000000-0000-0000-0000-000000000000', category: 'Necklaces' },
    { id: uuid(102), name: 'Pearl Grace Necklace', description: 'Elegant multi-layered pearl necklace for formal events.', price: 3200, stock: 15, category_id: 'c1000000-0000-0000-0000-000000000000', category: 'Necklaces' },
    { id: uuid(103), name: 'Golden Lotus Pendant', description: 'Intricately designed lotus pendant with a gold-plated chain.', price: 1800, stock: 20, category_id: 'c1000000-0000-0000-0000-000000000000', category: 'Necklaces' },
    { id: uuid(201), name: 'Bridal Jhumkas', description: 'Traditional heavy gold-plated jhumkas with pearl drops.', price: 2500, stock: 12, category_id: 'c2000000-0000-0000-0000-000000000000', category: 'Earrings' },
    { id: uuid(202), name: 'Diamond Sparkle Studs', description: 'High-quality zircon studs that look like real diamonds.', price: 1500, stock: 25, category_id: 'c2000000-0000-0000-0000-000000000000', category: 'Earrings' },
    { id: uuid(300), name: 'Solitaire Promise Ring', description: 'Classic zircon solitaire ring with a sleek band.', price: 1100, stock: 50, category_id: 'c3000000-0000-0000-0000-000000000000', category: 'Rings' },
    { id: uuid(301), name: 'Vintage Rose Ring', description: 'Antique finished rose design ring with adjustable band.', price: 850, stock: 35, category_id: 'c3000000-0000-0000-0000-000000000000', category: 'Rings' },
    { id: uuid(401), name: 'Golden Cuff Bracelet', description: 'Bold and beautiful gold-plated textured cuff.', price: 1700, stock: 15, category_id: 'c4000000-0000-0000-0000-000000000000', category: 'Bracelets' },
    { id: uuid(402), name: 'Pearl String Bracelet', description: 'Delicate single-strand pearl bracelet with gold clasp.', price: 1300, stock: 20, category_id: 'c4000000-0000-0000-0000-000000000000', category: 'Bracelets' },
  ];

  console.log(`Inserting ${products.length} products...`);
  const { error: prodErr } = await supabase.from('products').insert(products);
  if (prodErr) {
    console.error("Error inserting products:", prodErr.message);
  } else {
    // Insert Images
    const images = products.map(p => {
      let url = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800'; 
      if (p.category === 'Earrings') url = 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800';
      if (p.category === 'Rings') url = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800';
      if (p.category === 'Bracelets') url = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800';
      return {
        product_id: p.id,
        image_url: url,
        is_cover: true,
        display_order: 0
      };
    });
    console.log(`Inserting ${images.length} product images...`);
    await supabase.from('product_images').insert(images);
    console.log("✅ SUCCESS: Initial Data Seeded Successfully!");
  }
}

seed();
