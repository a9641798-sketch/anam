'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.reduce((s: number, i: any) => s + i.quantity, 0));
      } catch (e) {}
    };
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  // Don't show on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      label: 'Shop',
      href: '/shop',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      label: 'Search',
      onClick: () => window.dispatchEvent(new Event('openMobileSearch')),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      label: 'Wishlist',
      href: '/wishlist',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Spacer to prevent content from hiding behind the bottom bar */}
      <div className="md:hidden h-20" />
      
      {/* Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-[100] pb-safe">
        <nav className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = item.href && pathname === item.href;
            
            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative text-gray-400 hover:text-gold-500"
                >
                  {item.icon}
                  <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href!}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative
                  ${isActive ? 'text-gold-600' : 'text-gray-400 hover:text-gold-500'}`}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-[2px] bg-gold-500 rounded-b-full" />
                )}
                {item.icon}
                <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })}

          <Link
            href="/cart"
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative
              ${pathname === '/cart' ? 'text-gold-600' : 'text-gray-400 hover:text-gold-500'}`}
          >
            {pathname === '/cart' && (
              <span className="absolute top-0 w-8 h-[2px] bg-gold-500 rounded-b-full" />
            )}
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] bg-gold-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 border-2 border-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest">Cart</span>
          </Link>
        </nav>
      </div>
    </>
  );
}
