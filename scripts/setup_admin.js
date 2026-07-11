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
} catch (e) {}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  // Create admin user
  const { data: user, error: userError } = await supabase.auth.admin.createUser({
    email: 'admin@herhighness.com',
    password: 'AdminPassword123!',
    email_confirm: true
  });
  if (userError) {
    console.error('Error creating user:', userError.message);
  } else {
    console.log('✅ Admin user created successfully:');
    console.log('   Email: admin@herhighness.com');
    console.log('   Password: AdminPassword123!');
  }

  // Insert default social links
  const { error: setErr } = await supabase.from('site_settings').upsert({
    id: 'social_links',
    value: {
      whatsapp: '919876543210',
      instagram: 'https://instagram.com/',
      facebook: 'https://facebook.com/',
      twitter: 'https://twitter.com/'
    },
    updated_at: new Date().toISOString()
  });
  if (setErr) console.error('Error setting default social links:', setErr.message);
  else console.log('✅ Default social links inserted.');
}
setup();
