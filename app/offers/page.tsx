'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import Link from 'next/link';
import { FadeIn, SlideUp } from '@/components/ui/FadeIn';

type Coupon = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  expiry_date: string;
};

export default function OffersPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      const { data } = await supabase!
        .from('coupons')
        .select('*')
        .eq('is_active', true);
        
      // Filter out expired client-side for simplicity
      const valid = (data || []).filter(c => {
         if (!c.expiry_date) return true;
         return new Date(c.expiry_date) >= new Date();
      });
      setCoupons(valid);
      setLoading(false);
    };
    fetchOffers();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl text-gray-900 uppercase tracking-wider mb-4">
              Current <span className="text-gold-500 italic font-light">Offers</span>
            </h1>
            <p className="text-gray-500 uppercase tracking-widest text-sm">Exclusive royal privileges</p>
          </FadeIn>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : coupons.length === 0 ? (
             <div className="text-center py-20 text-gray-500">No active offers at the moment. Please check back later!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coupons.map((coupon, idx) => (
                <SlideUp key={coupon.id} delay={idx * 0.1}>
                  <div className="bg-white p-8 rounded-3xl border border-gold-200 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
                     <div className="absolute -right-10 -top-10 w-32 h-32 bg-gold-50 rounded-full blur-2xl"></div>
                     <div className="shrink-0 text-center sm:text-left z-10">
                       <span className="block text-4xl font-heading font-bold text-gold-600 mb-1">
                         {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                       </span>
                       <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Off</span>
                     </div>
                     <div className="flex-1 text-center sm:text-left z-10 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6">
                       <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-2">Use Code: <span className="text-gold-600">{coupon.code}</span></h3>
                       <p className="text-sm text-gray-500 mb-2">On minimum order of ₹{coupon.min_order_value}</p>
                       {coupon.expiry_date && (
                         <p className="text-xs text-red-400 font-medium">Valid till: {new Date(coupon.expiry_date).toLocaleDateString()}</p>
                       )}
                     </div>
                  </div>
                </SlideUp>
              ))}
            </div>
          )}
          
          <FadeIn delay={0.4} className="mt-16 text-center">
             <Link href="/shop" className="inline-block bg-gold-600 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gold-500 transition-colors shadow-lg shadow-gold-500/20">
                Shop Now to Redeem
             </Link>
          </FadeIn>
        </div>
      </main>
    </div>
  );
}
