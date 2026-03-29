import { NextResponse } from 'next/server';
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { supabase } from '@/lib/db';

const cfEnv = process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION' 
    ? CFEnvironment.PRODUCTION 
    : CFEnvironment.SANDBOX;

const cashfree = new Cashfree(
    cfEnv,
    process.env.CASHFREE_APP_ID || '',
    process.env.CASHFREE_SECRET_KEY || ''
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cfOrderId = searchParams.get('order_id');
    const internalId = searchParams.get('internal_id');

    if (!cfOrderId || !internalId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Fetch Payment Status securely from Cashfree Server
    const response = await cashfree.PGOrderFetchPayments(cfOrderId);
    
    // Check if any payment was SUCCESS
    const payments = response.data || [];
    const isPaid = payments.some((p: any) => p.payment_status === 'SUCCESS');

    if (isPaid) {
      // 2. Mark order as Paid in Supabase
      const { error } = await supabase!
        .from('orders')
        .update({ payment_status: 'paid', status: 'processing' })
        .eq('id', internalId);
        
      if (error) {
        console.error("Supabase Error Updating Payment Status:", error);
      }
    }

    // 3. Redirect back to frontend Success Page
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/checkout/${internalId}/success`);

  } catch (error: any) {
    console.error('Cashfree Verification Error:', error.response?.data || error);
    
    const { searchParams } = new URL(req.url);
    const internalId = searchParams.get('internal_id');
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    return NextResponse.redirect(`${baseUrl}/checkout/${internalId}/success?error=true`);
  }
}
