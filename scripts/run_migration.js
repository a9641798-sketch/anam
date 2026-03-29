const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Simple ENV parser for .env.local
let env = {};
try {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  env = Object.fromEntries(
    envContent.split('\n')
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

async function runMigration() {
  console.log("Starting Migration Run...");

  // Since we don't have a direct SQL execution API in supabase-js,
  // we normally have to use an RPC or run multiple commands.
  // BUT, we can use the `postgres` extension if enabled or just do the ALTERs.
  // Actually, Supabase doesn't expose a raw 'query' method via the standard client.
  
  // HACK: We can use the REST API to run SQL via the 'rpc' method if a 'exec_sql' exists.
  // If not, we have to assume the user runs the .sql file or we use a lower-level pg client.
  
  // Since we have the SERVICE_ROLE_KEY, we can try to use a pg client if available.
  try {
     const { data, error } = await supabase.rpc('exec_sql', { 
       sql_query: `
        ALTER TABLE public.orders 
        ADD COLUMN IF NOT EXISTS customer_phone TEXT,
        ADD COLUMN IF NOT EXISTS house_no TEXT,
        ADD COLUMN IF NOT EXISTS street_address TEXT,
        ADD COLUMN IF NOT EXISTS landmark TEXT,
        ADD COLUMN IF NOT EXISTS pincode TEXT,
        ADD COLUMN IF NOT EXISTS state TEXT,
        ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India';

        DROP POLICY IF EXISTS "Enable insert for everyone" ON public.orders;
        CREATE POLICY "Enable insert for everyone" ON public.orders FOR INSERT WITH CHECK (true);

        DROP POLICY IF EXISTS "Enable insert for everyone" ON public.order_items;
        CREATE POLICY "Enable insert for everyone" ON public.order_items FOR INSERT WITH CHECK (true);

        DROP POLICY IF EXISTS "Allow public read order by id" ON public.orders;
        CREATE POLICY "Allow public read order by id" ON public.orders FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Allow public read order items by order_id" ON public.order_items;
        CREATE POLICY "Allow public read order items by order_id" ON public.order_items FOR SELECT USING (true);
       `
     });
     if (error) throw error;
     console.log("Migration executed successfully via RPC!");
  } catch (err) {
     console.log("RPC 'exec_sql' not found or failed. Falling back to manual notification.");
     console.log("Reason:", err.message);
     console.log("\n--------------------------------------------------");
     console.log("PLEASE RUN THIS SQL IN YOUR SUPABASE DASHBOARD:");
     console.log("--------------------------------------------------");
     console.log(fs.readFileSync('supabase/migrations/06_add_order_address_and_rls.sql', 'utf-8'));
     console.log("--------------------------------------------------\n");
  }
}

runMigration();
