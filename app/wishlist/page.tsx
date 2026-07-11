'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { FadeIn, SlideUp } from '@/components/ui/FadeIn';

type CartItem = { id: string; name: string; quantity: number; price: number; image?: string };

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<CartItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      
      const savedCart = localStorage.getItem('cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch {}
  }, []);

  const removeFromWishlist = (id: string) => {
    const newWishlist = wishlist.filter(i => i.id !== id);
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      let newCart;
      if (existing) {
        newCart = prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        newCart = [...prev, { ...item, quantity: 1 }];
      }
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
    removeFromWishlist(item.id);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar cartCount={cart.reduce((s, i) => s + i.quantity, 0)} />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-4">
          <FadeIn>
            <h1 className="font-heading text-4xl md:text-5xl text-gray-900 uppercase tracking-wider mb-8 text-center">
              Your <span className="text-gold-500 italic font-light">Wishlist</span>
            </h1>
          </FadeIn>

          {wishlist.length === 0 ? (
            <FadeIn className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h2>
              <p className="text-gray-500 mb-8">Save your favorite pieces here for later.</p>
              <Link href="/shop" className="inline-block bg-gold-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-gold-500 transition-colors">
                Explore Collection
              </Link>
            </FadeIn>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {wishlist.map((item, idx) => (
                <SlideUp key={item.id} delay={(idx % 4) * 0.1} className="group relative">
                  <div className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] mb-3">
                    <Link href={`/shop/${item.id}`} className="absolute inset-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200 text-xs tracking-widest">NO IMAGE</div>
                      )}
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-colors"
                    >
                      ✕
                    </button>
                    <button
                      onClick={() => addToCart(item)}
                      className="absolute bottom-3 left-3 right-3 py-2.5 bg-white/95 backdrop-blur-sm text-gray-900 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gold-600 hover:text-white transition-all duration-300 shadow-lg"
                    >
                      Move to Cart
                    </button>
                  </div>
                  <Link href={`/shop/${item.id}`} className="block px-1">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{item.name}</h3>
                    <p className="text-gold-600 text-sm font-bold">₹{item.price.toFixed(0)}</p>
                  </Link>
                </SlideUp>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
