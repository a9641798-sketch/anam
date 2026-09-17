const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase.from('orders').insert({
    customer_name: 'COD Tester',
    customer_email: 'test@example.com',
    customer_phone: '1234567890',
    house_no: '123',
    street_address: 'Test Street',
    pincode: '110001',
    state: 'Delhi',
    total_amount: 1500,
    payment_method: 'cod',
    payment_status: 'unpaid',
    status: 'pending'
  }).select();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Created order:', data[0].id);
  }
}
main();
