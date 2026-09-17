const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple ENV parser for .env.local
let env = {};
try {
  env = Object.fromEntries(
    fs.readFileSync('.env.local', 'utf-8')
      .split('\n')
      .filter(line => line && !line.trim().startsWith('#') && line.includes('='))
      .map(line => {
        const firstEq = line.indexOf('=');
        return [line.slice(0, firstEq).trim(), line.slice(firstEq + 1).trim().replace(/^["']|["']$/g, '')];
      })
  );
} catch (e) {
  console.error("Could not read .env.local:", e.message);
  process.exit(1);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars in .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Generate dummy UUIDs
const uuid = (i) => `00000000-0000-4000-a000-${String(i).padStart(12, '0')}`;

async function seed() {
  console.log("Starting Seeding Process...");

  // 1. Clean up
  console.log("Cleaning existing data from product_images and products...");
  await supabase.from('product_images').delete().neq('image_url', 'DUMMY_URL');
  await supabase.from('products').delete().neq('name', 'DUMMY_NAME');

  // 2. Define Products
  const products = [
    // Necklaces (c1)
    { id: uuid(101), name: 'Royal Kundan Choker', description: 'A majestic kundan choker set with matching earrings.', price: 4500, stock: 10, category_id: 'c1000000-0000-0000-0000-000000000000', category: 'Necklaces' },
    { id: uuid(102), name: 'Pearl Grace Necklace', description: 'Elegant multi-layered pearl necklace for formal events.', price: 3200, stock: 15, category_id: 'c1000000-0000-0000-0000-000000000000', category: 'Necklaces' },
    { id: uuid(103), name: 'Golden Lotus Pendant', description: 'Intricately designed lotus pendant with a gold-plated chain.', price: 1800, stock: 20, category_id: 'c1000000-0000-0000-0000-000000000000', category: 'Necklaces' },
    { id: uuid(104), name: 'Emerald Queen Set', description: 'Deep green emerald-style necklace set with premium stones.', price: 5500, stock: 5, category_id: 'c1000000-0000-0000-0000-000000000000', category: 'Necklaces' },
    { id: uuid(105), name: 'Minimalist Gold Chain', description: 'Simple yet sophisticated 24k gold-plated daily wear chain.', price: 1200, stock: 30, category_id: 'c1000000-0000-0000-0000-000000000000', category: 'Necklaces' },
    // Earrings (c2)
    { id: uuid(201), name: 'Bridal Jhumkas', description: 'Traditional heavy gold-plated jhumkas with pearl drops.', price: 2500, stock: 12, category_id: 'c2000000-0000-0000-0000-000000000000', category: 'Earrings' },
    { id: uuid(202), name: 'Diamond Sparkle Studs', description: 'High-quality zircon studs that look like real diamonds.', price: 1500, stock: 25, category_id: 'c2000000-0000-0000-0000-000000000000', category: 'Earrings' },
    { id: uuid(203), name: 'Chandbali Hoops', description: 'Modern fusion of chandbali design and hoop earrings.', price: 1900, stock: 18, category_id: 'c2000000-0000-0000-0000-000000000000', category: 'Earrings' },
    { id: uuid(204), name: 'Ruby Drop Earrings', description: 'Stunning ruby red drops with silver plating.', price: 2200, stock: 8, category_id: 'c2000000-0000-0000-0000-000000000000', category: 'Earrings' },
    { id: uuid(205), name: 'Floral Meenakari Tops', description: 'Colorful hand-painted meenakari floral earrings.', price: 900, stock: 40, category_id: 'c2000000-0000-0000-0000-000000000000', category: 'Earrings' },
    // Rings (c3)
    { id: uuid(300), name: 'Solitaire Promise Ring', description: 'Classic zircon solitaire ring with a sleek band.', price: 1100, stock: 50, category_id: 'c3000000-0000-0000-0000-000000000000', category: 'Rings' },
    { id: uuid(301), name: 'Vintage Rose Ring', description: 'Antique finished rose design ring with adjustable band.', price: 850, stock: 35, category_id: 'c3000000-0000-0000-0000-000000000000', category: 'Rings' },
    { id: uuid(302), name: 'Adjustable Kundan Ring', description: 'Broad kundan ring perfect for celebratory wear.', price: 1400, stock: 20, category_id: 'c3000000-0000-0000-0000-000000000000', category: 'Rings' },
    { id: uuid(303), name: 'Blue Sapphire Band', description: 'Elegant band featuring deep blue synthetic sapphires.', price: 1600, stock: 15, category_id: 'c3000000-0000-0000-0000-000000000000', category: 'Rings' },
    { id: uuid(304), name: 'Infinity Love Ring', description: 'Modern infinity symbol ring studded with fine zircons.', price: 950, stock: 45, category_id: 'c3000000-0000-0000-0000-000000000000', category: 'Rings' },
    // Bracelets (c4)
    { id: uuid(401), name: 'Golden Cuff Bracelet', description: 'Bold and beautiful gold-plated textured cuff.', price: 1700, stock: 15, category_id: 'c4000000-0000-0000-0000-000000000000', category: 'Bracelets' },
    { id: uuid(402), name: 'Pearl String Bracelet', description: 'Delicate single-strand pearl bracelet with gold clasp.', price: 1300, stock: 20, category_id: 'c4000000-0000-0000-0000-000000000000', category: 'Bracelets' },
    { id: uuid(403), name: 'Zircon Link Bracelet', description: 'Sparkling link bracelet perfect for stacking.', price: 2100, stock: 10, category_id: 'c4000000-0000-0000-0000-000000000000', category: 'Bracelets' },
    { id: uuid(404), name: 'Antique Bangle Pair', description: 'Set of two antique-finish bangles with intricate carvings.', price: 2800, stock: 8, category_id: 'c4000000-0000-0000-0000-000000000000', category: 'Bracelets' },
    { id: uuid(405), name: 'Evil Eye Charm Bracelet', description: 'Enamel evil eye charm on a dainty golden chain.', price: 1100, stock: 25, category_id: 'c4000000-0000-0000-0000-000000000000', category: 'Bracelets' },
  ];

  console.log(`Inserting ${products.length} products with valid UUIDs...`);
  const { error: prodErr } = await supabase.from('products').insert(products);
  if (prodErr) {
    console.error("Error inserting products:", prodErr.message);
    process.exit(1);
  }

  // 3. Insert Images
  const images = products.map(p => {
    let url = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800'; // Default Necklace
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

  console.log(`Inserting ${images.length} images...`);
  const { error: imgErr } = await supabase.from('product_images').insert(images);
  if (imgErr) {
    console.error("Error inserting images:", imgErr.message);
    process.exit(1);
  }

  console.log("\n✅ SUCCESS: 20 Products seeded successfully via Remote Script!");
}

seed();
