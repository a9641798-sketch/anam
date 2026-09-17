import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabaseAdmin } from '@/lib/db';

export async function POST(req: Request) {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay API keys are not configured.');
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
       throw new Error('Supabase Admin client not initialized');
    }

    const { data: order, error } = await supabaseAdmin.from('orders').select('*').eq('id', orderId).single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found in DB' }, { status: 404 });
    }
    
    // Razorpay requires amount in paise (multiply by 100)
    const amountInPaise = Math.round(order.total_amount * 100);
    
    // Create Razorpay Order
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `RCPT_${order.id.split('-')[0]}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    
    if (razorpayOrder && razorpayOrder.id) {
       return NextResponse.json({ 
           razorpay_order_id: razorpayOrder.id,
           amount: razorpayOrder.amount,
           currency: razorpayOrder.currency,
       });
    }

    throw new Error('No order ID returned from Razorpay');

  } catch (error: any) {
    console.error('Razorpay Create Order Error:', error);
    return NextResponse.json({ 
      error: 'Failed to create payment session',
      details: error.message || error 
    }, { status: 500 });
  }
}
