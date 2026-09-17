'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CartFabProps {
  items: { id: string; name: string; quantity: number; price: number; image?: string }[];
}

export default function CartFab({ items }: CartFabProps) {
  const [open, setOpen] = useState(false);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (count === 0) return null;

  return (
    <>
      {/* Backdrop - desktop only */}
      {open && <div className="hidden md:block fixed inset-0 z-40" onClick={() => setOpen(false)} />}

      {/* FAB + Popover — desktop only (mobile uses bottom nav) */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-50 flex-col items-end gap-3">
        {/* Mini Cart Popover */}
        {open && (
          <div className="w-72 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">Cart ({count})</span>
              <Link href="/cart" className="text-xs font-bold text-gold-600 hover:text-gold-700 uppercase tracking-wider" onClick={() => setOpen(false)}>
                View Full Cart →
              </Link>
            </div>
            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0 bg-gray-50" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-gray-300 text-[8px]">IMG</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-gray-900 shrink-0">₹{(item.price * item.quantity).toFixed(0)}</p>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Total</span>
              <span className="text-sm font-bold text-gray-900">₹{total.toFixed(2)}</span>
            </div>
            <div className="px-4 pb-4 pt-2">
              <Link href="/cart"
                className="block w-full text-center bg-gold-600 hover:bg-gold-700 text-white text-sm font-bold py-3 px-4 rounded-xl transition-colors"
                onClick={() => setOpen(false)}>
                Checkout
              </Link>
            </div>
          </div>
        )}

        {/* Floating Cart Button */}
        <button
          onClick={() => setOpen(o => !o)}
          className={`relative flex items-center gap-2 bg-gold-600 hover:bg-gold-700 text-white font-bold shadow-[0_8px_30px_rgba(212,175,55,0.4)] rounded-2xl transition-all duration-200 active:scale-95
            ${open ? 'px-5 py-3' : 'px-4 py-3.5'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="text-sm">{count}</span>
          {!open && (
            <span className="text-xs font-medium opacity-80 hidden sm:inline">
              · ₹{total.toFixed(0)}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
