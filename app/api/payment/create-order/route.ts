import { NextResponse } from 'next/server';
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { supabaseAdmin } from '@/lib/db';

const cfEnv = process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === 'PRODUCTION' 
    ? CFEnvironment.PRODUCTION 
    : CFEnvironment.SANDBOX;

const cashfree = new Cashfree(
    cfEnv,
    process.env.CASHFREE_APP_ID || '',
    process.env.CASHFREE_SECRET_KEY || ''
);

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 1. Fetch exact total from DB using Admin client to bypass RLS
    if (!supabaseAdmin) {
       throw new Error('Supabase Admin client not initialized');
    }

    const { data: order, error } = await supabaseAdmin.from('orders').select('*').eq('id', orderId).single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found in DB' }, { status: 404 });
    }
    
    // Convert to string formatted precisely (e.g. 10.00)
    const amountStr = order.total_amount.toFixed(2);
    
    // We uniquely identify Cashfree orders mapping back to our internal order
    // Cashfree order_id max length is 50 chars, no special chars except _ and -
    const cfOrderId = `CF_${order.id.replace(/-/g, '')}`;

    // 2. Build Cashfree Order Request
    const request = {
      order_amount: parseFloat(amountStr),
      order_currency: "INR",
      order_id: cfOrderId,
      customer_details: {
        customer_id: order.id.split('-')[0],
        customer_phone: order.customer_phone || "9999999999",
        customer_name: order.customer_name || "Customer",
        customer_email: order.customer_email || "customer@example.com"
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payment/verify?order_id=${cfOrderId}&internal_id=${order.id}`
      }
    };

    // 3. Call Cashfree
    const response = await cashfree.PGCreateOrder(request as any);
    
    if (response.data && response.data.payment_session_id) {
       return NextResponse.json({ 
           payment_session_id: response.data.payment_session_id,
           order_id: response.data.order_id
       });
    }

    throw new Error('No payment session ID returned from Cashfree');

  } catch (error: any) {
    console.error('Cashfree Create Order Error:', error.response?.data || error.message);
    return NextResponse.json({ 
      error: 'Failed to create payment session',
      details: error.response?.data || error.message 
    }, { status: 500 });
  }
}
