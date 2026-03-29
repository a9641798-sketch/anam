'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/db';

function CheckoutSuccessContent({ orderId }: { orderId: string }) {
  const searchParams = useSearchParams();
  const isError = searchParams.get('error') === 'true';
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchOrder() {
      const { data, error } = await supabase!
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (!error && data) {
        setOrder(data);
      }
      setLoading(false);
    }
    if (!isError) fetchOrder();
    else setLoading(false);
  }, [orderId, isError]);

  if (!mounted) return null;

  if (loading) return (
    <div className="flex-1 flex items-center justify-center pt-32 pb-24">
      <div className="w-8 h-8 rounded-full border-4 border-gold-200 border-t-gold-500 animate-spin"></div>
    </div>
  );

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 pt-32 pb-24">
      {isError ? (
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white p-10 md:p-16 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-red-100 max-w-lg w-full text-center relative overflow-hidden"
         >
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-100">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h1 className="font-heading text-3xl font-medium text-gray-900 uppercase tracking-[0.1em] mb-4">Payment Failed</h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-10 font-medium">
              We could not verify your Cashfree transaction. Please try placing your order again or contact our support team.
            </p>
            <Link href={`/checkout/${orderId}`} className="block w-full bg-gray-900 hover:bg-black text-white px-8 py-5 uppercase tracking-[0.2em] text-xs rounded-full font-bold transition-all shadow-lg">
              Try Payment Again
            </Link>
         </motion.div>
      ) : (
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="bg-white p-10 md:p-12 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-gold-100 max-w-xl w-full relative overflow-hidden"
         >
            <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
               className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-100"
            >
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </motion.div>
            
            <div className="text-center mb-10">
              <h1 className="font-heading text-3xl md:text-4xl font-medium text-gray-900 uppercase tracking-[0.1em] mb-4">Order Confirmed</h1>
              <p className="text-sm text-gray-500 leading-relaxed font-medium tracking-wide">
                Your order <strong className="text-gray-900 font-bold">#{orderId.split('-')[0].toUpperCase()}</strong> has been successfully placed.
              </p>
            </div>

            {order && (
              <div className="bg-[#FCFBF8] rounded-2xl p-6 border border-gold-50 mb-10">
                <h2 className="text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-6 border-b border-gold-100 pb-2">Delivery Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold shrink-0">Recipient</span>
                    <span className="text-xs text-right font-semibold text-gray-900 uppercase">{order.customer_name}</span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold shrink-0">Phone</span>
                    <span className="text-xs text-right font-semibold text-gray-900">{order.customer_phone}</span>
                  </div>
                  <div className="flex justify-between items-start gap-4 border-t border-gold-100/50 pt-4">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold shrink-0">Address</span>
                    <div className="text-xs text-right font-semibold text-gray-700 leading-relaxed uppercase">
                      {order.house_no}, {order.street_address}<br/>
                      {order.landmark && <>{order.landmark}<br/></>}
                      {order.state}, {order.pincode}<br/>
                      {order.country}
                    </div>
                  </div>
                  <div className="flex justify-between items-center gap-4 border-t border-gold-100/50 pt-4">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold shrink-0">Total Amount</span>
                    <span className="text-sm font-bold text-gray-900">₹{order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4 border-t border-gold-100/50 pt-4">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold shrink-0">Payment</span>
                    <span className="text-[10px] text-right font-bold text-gold-600 uppercase tracking-widest bg-gold-50 px-3 py-1 rounded-full border border-gold-100">
                      {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <Link href="/shop" className="block w-full bg-gold-500 hover:bg-gold-600 text-white px-8 py-5 text-center uppercase tracking-[0.2em] text-xs rounded-full font-bold transition-all shadow-[0_4px_20px_rgba(212,175,55,0.4)]">
              Continue Shopping
            </Link>

            {/* Decorative Corner Ornaments */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold-100/50 rounded-tl-3xl"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-gold-100/50 rounded-tr-3xl"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-gold-100/50 rounded-bl-3xl"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold-100/50 rounded-br-3xl"></div>
         </motion.div>
      )}
    </main>
  );
}

export default function CheckoutSuccessPage({ params: paramsPromise }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = React.use(paramsPromise);
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl border-b border-gold-200/40 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-center relative">
          <Link href="/" className="font-heading text-xl md:text-2xl font-bold tracking-[0.2em] text-gold-600 uppercase">
            Her Highness
          </Link>
        </div>
      </header>

      <Suspense fallback={<div className="flex-1 flex items-center justify-center pt-32 pb-24"><div className="w-8 h-8 rounded-full border-4 border-gold-200 border-t-gold-500 animate-spin"></div></div>}>
        <CheckoutSuccessContent orderId={orderId} />
      </Suspense>
    </div>
  );
}
