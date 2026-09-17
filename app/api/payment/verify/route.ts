import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        internal_id 
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !internal_id) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Verify Razorpay Signature
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    
    const bodyText = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(bodyText.toString())
        .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // 2. Mark order as Paid in Supabase
      const { error } = await supabase!
        .from('orders')
        .update({ payment_status: 'paid', status: 'processing' })
        .eq('id', internal_id);
        
      if (error) {
        console.error("Supabase Error Updating Payment Status:", error);
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
      }
      
      return NextResponse.json({ success: true, message: 'Payment verified successfully' });
    } else {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Razorpay Verification Error:', error);
    return NextResponse.json({ error: 'Internal server error during verification' }, { status: 500 });
  }
}
