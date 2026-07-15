'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import { Tag } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
}

export default function ActiveOffers({ className = '' }: { className?: string }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    async function fetchCoupons() {
      const { data } = await supabase!
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (data) {
        setCoupons(data);
      }
    }
    fetchCoupons();
  }, []);

  if (coupons.length === 0) return null;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-5 h-5 text-gold-600" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Active Offers</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        {coupons.map(coupon => (
          <div key={coupon.id} className="border border-gold-200 bg-gold-50/30 rounded-lg p-3 flex flex-col gap-1 min-w-[200px] flex-1 sm:flex-none relative overflow-hidden group hover:bg-gold-50/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 font-mono text-sm uppercase tracking-wider">{coupon.code}</span>
              <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded uppercase">
                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
              </span>
            </div>
            {coupon.min_order_amount ? (
              <p className="text-[11px] text-gray-500 font-medium">On orders above ₹{coupon.min_order_amount}</p>
            ) : (
              <p className="text-[11px] text-gray-500 font-medium">No minimum order</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
