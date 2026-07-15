'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.reduce((s: number, i: any) => s + i.quantity, 0));
      } catch (e) {
        console.error("Error reading cart for Navbar", e);
      }
    };
    
    // Initial load
    updateCartCount();

    // Listen for custom event
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);


  const links = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);



  return (
    <>
      {/* ── Top Header ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled || mobileOpen
          ? 'bg-white/95 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.1)] border-b border-gold-200/60'
          : 'bg-white/80 backdrop-blur-md border-b border-gold-100/40'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile: Hamburger & Search */}
            <div className="flex md:hidden items-center flex-1 gap-1">
              <button 
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 text-gray-700 hover:text-gold-600 transition-colors -ml-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <button className="p-2 text-gray-700 hover:text-gold-600 transition-colors" onClick={() => setMobileOpen(true)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Logo */}
            <Link href="/" className="font-heading text-lg sm:text-xl md:text-2xl font-bold tracking-[0.25em] text-gold-600 uppercase shrink-0 hover:text-gold-500 transition-colors md:flex-none flex-1 text-center">
              Her Highness
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-10 ml-8">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[11px] font-bold uppercase tracking-[0.18em] transition-colors relative pb-1
                    ${isActive(link.href)
                      ? 'text-gold-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gold-500 after:rounded-full'
                      : 'text-gray-500 hover:text-gold-600'}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right: Search, Wishlist, Cart, Account */}
            <div className="flex items-center justify-end gap-2 md:gap-4 flex-1">
              {/* Search (Desktop) */}
              <div className="relative group hidden lg:block">
                <input 
                  type="text" 
                  placeholder="Search jewelry..." 
                  className="pl-4 pr-10 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-gold-500 w-48 transition-all duration-300 focus:w-64"
                />
                <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Track Order */}
              <Link href="/track-order" className="hidden md:flex items-center gap-2 p-2.5 text-gray-700 hover:text-gold-600 transition-colors rounded-xl hover:bg-gold-50" aria-label="Track Order">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>

              {/* Wishlist */}
              <Link href="/wishlist" className="p-1.5 md:p-2.5 text-gray-700 hover:text-gold-600 transition-colors rounded-xl hover:bg-gold-50" aria-label="Wishlist">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>

              {/* User Account */}
              <Link href="/my-account" className="p-1.5 md:p-2.5 text-gray-700 hover:text-gold-600 transition-colors rounded-xl hover:bg-gold-50" aria-label="My Account">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative p-1.5 md:p-2.5 text-gray-700 hover:text-gold-600 transition-colors rounded-xl hover:bg-gold-50 -mr-2 md:-mr-0">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 min-w-[16px] h-[16px] md:min-w-[18px] md:h-[18px] bg-gold-600 text-white text-[9px] md:text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white ${mobileOpen ? 'max-h-screen border-t border-gold-100/50' : 'max-h-0'}`}>
          <div className="px-5 py-6 space-y-6">
            {/* Mobile Search */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search jewelry..." 
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gold-500 bg-gray-50"
              />
              <svg className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <nav className="flex flex-col gap-4">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-lg font-bold uppercase tracking-[0.1em] transition-colors
                    ${isActive(link.href) ? 'text-gold-600' : 'text-gray-900 hover:text-gold-600'}`}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="text-lg font-bold uppercase tracking-[0.1em] text-gray-900 hover:text-gold-600 flex items-center gap-3">
                Wishlist
              </Link>
              <Link href="/my-account" onClick={() => setMobileOpen(false)} className="text-lg font-bold uppercase tracking-[0.1em] text-gray-900 hover:text-gold-600 flex items-center gap-3">
                My Account
              </Link>
              <Link href="/track-order" onClick={() => setMobileOpen(false)} className="text-lg font-bold uppercase tracking-[0.1em] text-gray-900 hover:text-gold-600 flex items-center gap-3">
                Track Order
              </Link>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
