'use client';

import React from 'react';
import { supabase } from '@/lib/db';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage({ params: paramsPromise }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = React.use(paramsPromise);
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase!.from('orders').select('*, order_items(*)').eq('id', orderId).single();
      if (data) {
        setOrder(data);
      }
      setLoading(false);
    }
    loadData();

    // Dynamically load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [orderId]);

  const handleRazorpayPayment = async () => {
    try {
      setPaymentLoading(true);

      // 1. Get Razorpay Order ID from our backend
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      const data = await response.json();

      if (!response.ok || !data.razorpay_order_id) {
        const errorMsg = data.error || 'Failed to initialize payment';
        const errorDetail = data.details ? `\n\nDetail: ${JSON.stringify(data.details)}` : '';
        throw new Error(`${errorMsg}${errorDetail}`);
      }

      // 2. Configure Razorpay Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: data.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: data.currency,
        name: "Her Highness",
        description: `Order #${order.id.split('-')[0]}`,
        image: "/logo.png", // Optional logo
        order_id: data.razorpay_order_id,
        handler: async function (response: any) {
          // 3. Verify Payment Signature on backend
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                internal_id: order.id,
              })
            });
            const verifyData = await verifyRes.json();
            
            if (verifyRes.ok && verifyData.success) {
               router.replace(`/checkout/${order.id}/success`);
            } else {
               throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (err: any) {
            console.error("Verification error:", err);
            router.replace(`/checkout/${order.id}/success?error=true`);
          }
        },
        prefill: {
          name: order.customer_name,
          email: order.customer_email || "customer@example.com",
          contact: order.customer_phone
        },
        theme: {
          color: "#D4AF37" // Gold color matching Her Highness theme
        },
        modal: {
          ondismiss: function() {
            setPaymentLoading(false);
          }
        }
      };

      // @ts-ignore
      const rzp1 = new window.Razorpay(options);
      
      rzp1.on('payment.failed', function (response: any) {
         console.error("Payment Failed:", response.error);
         alert(`Payment Failed: ${response.error.description}`);
         setPaymentLoading(false);
      });

      rzp1.open();

    } catch (err: any) {
       console.error("Razorpay Init Error:", err);
       alert(`Payment Gateway Error: ${err.message}\n\nPlease check your .env configuration.`);
       setPaymentLoading(false);
    }
  };

  if (loading) return null;
  if (!order) return <div className="text-center py-20 text-xs font-semibold uppercase tracking-widest text-gray-500">Order not found.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl border-b border-gold-200/40 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <Link href="/" className="font-heading text-xl md:text-2xl font-bold tracking-[0.2em] text-gold-600 uppercase">
            Her Highness
          </Link>
          <nav className="flex gap-6 md:gap-10">
            <Link href="/" className="text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-gray-600 hover:text-gold-600 transition-colors">Home</Link>
            <Link href="/shop" className="text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-gray-600 hover:text-gold-600 transition-colors">Shop</Link>
            <Link href="/cart" className="text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-gray-600 hover:text-gold-600 transition-colors">Cart</Link>
          </nav>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 flex-1 w-full flex flex-col items-center">
        
        <div className="flex items-center justify-center gap-4 mb-4">
           <div className="w-12 h-[1px] bg-gold-300"></div>
           <span className="text-gold-500 text-xs tracking-[0.2em] uppercase font-bold">Secure Checkout</span>
           <div className="w-12 h-[1px] bg-gold-300"></div>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-medium text-gray-900 uppercase tracking-[0.1em] mb-12 text-center">Complete Your Order</h1>
        
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gold-100/50 w-full relative overflow-hidden">
          
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-wide">Amount Due</h2>
            <p className="text-4xl font-heading font-medium text-gold-600 tracking-wider">₹{order.total_amount.toFixed(2)}</p>
            <p className="text-gray-500 mt-2 text-xs uppercase tracking-widest font-semibold">Order #{order.id.split('-')[0]}</p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-8 pt-8 border-t border-gold-100/50 relative z-10 w-full text-center">
            
            {/* Delivery Address Review */}
            <div className="bg-[#FCFBF8] border border-gold-100 rounded-2xl p-6 w-full max-w-lg mb-4 text-left">
              <h3 className="text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-4 border-b border-gold-50 pb-2">Shipping To</h3>
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-900 uppercase">{order.customer_name}</p>
                <p className="text-xs text-gray-600 font-medium">{order.customer_phone}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed uppercase mt-2">
                  {order.house_no}, {order.street_address}<br/>
                  {order.landmark && <>{order.landmark}<br/></>}
                  {order.state}, {order.pincode}<br/>
                  {order.country}
                </p>
              </div>
            </div>

            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">You will be securely redirected to our payment gateway portal</p>
            
            <button 
              onClick={handleRazorpayPayment}
              disabled={paymentLoading}
              className={`w-full max-w-md bg-gold-500 hover:bg-gold-600 text-white px-8 py-5 text-sm uppercase tracking-[0.2em] rounded-full font-bold transition-all shadow-[0_12px_24px_-8px_rgba(212,175,55,0.4)] flex items-center justify-center gap-3 ${paymentLoading ? 'opacity-80 cursor-wait' : ''}`}
            >
              {paymentLoading ? (
                 <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Initializing Gateway...
                 </>
              ) : (
                'Pay Securely via Razorpay'
              )}
            </button>
            <div className="flex items-center gap-4 mt-8 opacity-60">
               <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">UPI</span>
               <div className="w-1 h-1 rounded-full bg-gray-300"></div>
               <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Credit / Debit Cards</span>
               <div className="w-1 h-1 rounded-full bg-gray-300"></div>
               <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Netbanking</span>
            </div>
          </div>
          
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold-100/50 rounded-tl-3xl"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-gold-100/50 rounded-tr-3xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-gold-100/50 rounded-bl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold-100/50 rounded-br-3xl"></div>
        </div>
      </main>
    </div>
  );
}
