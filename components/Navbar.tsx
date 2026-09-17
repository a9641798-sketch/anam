'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/db';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setMobileSearchOpen(false);
      setMobileOpen(false);
      setShowResults(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        setShowResults(true);
        const { data } = await supabase!
          .from('products')
          .select('id, name, price, product_images(image_url, is_cover)')
          .ilike('name', `%${searchQuery.trim()}%`)
          .limit(5);
        setSearchResults(data || []);
        setIsSearching(false);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.reduce((s: number, i: any) => s + i.quantity, 0));
      } catch (e) {}
    };
    
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    
    const handleOpenSearch = () => {
      setMobileSearchOpen(true);
      setMobileOpen(false);
    };
    window.addEventListener('openMobileSearch', handleOpenSearch);
    
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('openMobileSearch', handleOpenSearch);
    };
  }, []);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { 
    setMobileOpen(false); 
    setMobileSearchOpen(false);
    setShowResults(false);
  }, [pathname]);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header className={`sticky top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled || mobileOpen || mobileSearchOpen || showResults
          ? 'bg-white/95 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.1)] border-b border-gold-200/60'
          : 'bg-white shadow-sm border-b border-gold-100/40'}`}>
        
        {/* Universal Search Full-Screen Overlay (Desktop & Mobile) */}
        <div className={`fixed inset-0 z-[100] bg-white transition-all duration-300 flex flex-col ${mobileSearchOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-4'}`}>
          {/* Header Row */}
          <div className="flex items-center px-2 sm:px-4 h-16 border-b border-gray-100 bg-white shadow-sm shrink-0">
            <button onClick={() => { setMobileSearchOpen(false); setShowResults(false); }} className="p-3 text-gray-500 hover:text-gray-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length > 1 && setShowResults(true)}
              onKeyDown={handleSearch}
              placeholder="Search jewelry..." 
              autoFocus={mobileSearchOpen}
              className="flex-1 bg-transparent border-none focus:ring-0 text-base sm:text-lg px-2 text-gray-900 placeholder:text-gray-400 outline-none w-full"
            />
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-gray-200 border-t-gold-500 rounded-full animate-spin shrink-0 mx-3" />
            ) : (
              <button onClick={() => handleSearch({ key: 'Enter' } as any)} className="p-3 text-gold-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Results Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50/50">
            {showResults && searchResults.length > 0 ? (
              <div className="flex flex-col">
                {searchResults.map(product => {
                  const cover = product.product_images?.find((i: any) => i.is_cover)?.image_url || product.product_images?.[0]?.image_url;
                  return (
                    <Link 
                      key={product.id} 
                      href={`/shop/${product.id}`}
                      onClick={() => { setShowResults(false); setSearchQuery(''); setMobileSearchOpen(false); }}
                      className="flex items-center gap-4 p-4 border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors"
                    >
                      {cover ? (
                        <img src={cover} alt={product.name} className="w-16 h-16 object-cover rounded-xl shrink-0" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-xl shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate mb-1">{product.name}</h4>
                        <p className="text-sm font-semibold text-gold-600">₹{product.price}</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </Link>
                  );
                })}
                <Link 
                  href={`/shop?search=${encodeURIComponent(searchQuery.trim())}`}
                  onClick={() => { setShowResults(false); setSearchQuery(''); setMobileSearchOpen(false); }}
                  className="block w-full text-center py-5 text-xs font-bold text-gold-600 uppercase tracking-widest hover:bg-gray-50 bg-white shadow-sm mt-2"
                >
                  View all results
                </Link>
              </div>
            ) : showResults && searchQuery.trim().length > 1 && !isSearching ? (
              <div className="flex flex-col items-center justify-center p-12 text-center mt-10 text-gray-400">
                <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <p className="text-sm">No products found for "{searchQuery}"</p>
              </div>
            ) : (
               <div className="p-10 text-center text-gray-400 text-sm mt-4">
                 <p>Type to start searching...</p>
               </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative z-[60]">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Mobile: Hamburger & Search Toggles */}
            <div className="flex md:hidden items-center flex-1 gap-2">
              <button 
                onClick={() => { setMobileOpen(!mobileOpen); setMobileSearchOpen(false); setShowResults(false); }}
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

            {/* Right: Desktop Search, Track, Wishlist, Cart */}
            <div className="flex items-center justify-end gap-2 md:gap-4 flex-1">
              
              {/* Search is handled completely by MobileBottomNav or the full screen modal, removed from top header */}

              {/* Desktop Track Order */}
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

        {/* Mobile Slide-down Sidebar Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white relative z-40 ${mobileOpen ? 'max-h-screen border-t border-gold-100/50' : 'max-h-0'}`}>
          <div className="px-5 py-6">
            <nav className="flex flex-col gap-6">
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
