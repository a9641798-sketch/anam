'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/db';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CartFab from '@/components/CartFab';
import { FadeIn, SlideUp } from '@/components/ui/FadeIn';

type Banner = { id: string; image_url: string; title?: string; link?: string };
type Product = { id: string; name: string; price: number; product_images?: { image_url: string; is_cover: boolean }[] };
type CartItem = { id: string; name: string; quantity: number; price: number; image?: string };

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try { const s = localStorage.getItem('cart'); if (s) setCart(JSON.parse(s)); } catch {}
  }, []);
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);

  useEffect(() => {
    const load = async () => {
      const [{ data: b }, { data: p }] = await Promise.all([
        supabase!.from('banners').select('*').eq('is_active', true).order('display_order').limit(5),
        supabase!.from('products').select('*, product_images(image_url, is_cover)').order('created_at', { ascending: false }).limit(8)
      ]);
      if (b) setBanners(b);
      if (p) setProducts(p as any);
    };
    load();
  }, []);

  // Auto-slide banner every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentBanner(i => (i + 1) % banners.length);
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [banners.length]);

  const goToBanner = (idx: number) => {
    setCurrentBanner(idx);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentBanner(i => (i + 1) % banners.length);
    }, 5000);
  };

  const addToCart = (product: Product) => {
    const img = product.product_images?.find(i => i.is_cover)?.image_url || product.product_images?.[0]?.image_url;
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, image: img }];
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar cartCount={cart.reduce((s, i) => s + i.quantity, 0)} />
      <CartFab items={cart} />

      {/* Hero Banner - Auto Sliding */}
      <section className="relative w-full h-[80vh] md:h-screen max-h-[780px] overflow-hidden mt-0">
        {banners.length > 0 ? (
          <>
            {/* Slides */}
            {banners.map((banner, idx) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <img
                  src={banner.image_url}
                  alt={banner.title || 'Banner'}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
              </div>
            ))}

            {/* Hero Text Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
              <FadeIn>
                <span className="text-white/70 text-xs font-bold uppercase tracking-[0.5em] mb-4 block">New Season</span>
                <h1 className="font-heading text-5xl sm:text-6xl md:text-8xl text-white font-medium uppercase tracking-tight drop-shadow-2xl mb-6">
                  Royal <span className="italic font-light">Grace</span>
                </h1>
                <p className="text-white/80 text-sm md:text-base font-medium tracking-widest uppercase max-w-md mx-auto mb-8">
                  Discover the zenith of artificial jewelry
                </p>
                <Link href="/shop" className="inline-block bg-white/15 backdrop-blur-md border border-white/30 text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-gray-900 transition-all duration-500 shadow-2xl">
                  Shop the Collection
                </Link>
              </FadeIn>
            </div>

            {/* Dot indicators */}
            {banners.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-2">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToBanner(idx)}
                    className={`transition-all duration-300 rounded-full ${idx === currentBanner ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                  />
                ))}
              </div>
            )}

            {/* Arrow navigation */}
            {banners.length > 1 && (
              <>
                <button onClick={() => goToBanner((currentBanner - 1 + banners.length) % banners.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={() => goToBanner((currentBanner + 1) % banners.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </>
        ) : (
          /* Fallback */
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#2a1f0a] to-[#1a1a1a] flex items-center justify-center mt-16">
            <div className="text-center px-4">
              <h1 className="font-heading text-5xl md:text-7xl text-gold-400 font-medium uppercase tracking-[0.1em] mb-4">Her Highness</h1>
              <p className="text-gold-200/60 text-xs uppercase tracking-[0.4em] mb-8">Premium Artificial Jewelry</p>
              <Link href="/shop" className="inline-block bg-gold-500 text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold-400 transition-colors">
                Shop Now
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Feature Strip */}
      <section className="bg-white py-10 md:py-14 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { icon: '✦', title: 'Handcrafted', desc: 'Meticulously made by master artisans.' },
            { icon: '◈', title: 'Premium Quality', desc: 'High-grade alloys and sparkling stones.' },
            { icon: '◉', title: 'Free Shipping', desc: 'On all orders above ₹999.' },
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 0.1} className="text-center px-4">
              <span className="text-gold-500 text-xl block mb-3">{item.icon}</span>
              <h3 className="font-heading text-sm font-bold text-gray-900 uppercase tracking-widest mb-2">{item.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4">
          <SlideUp className="text-center mb-10 md:mb-14">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="w-10 h-px bg-gold-300" />
              <span className="text-gold-500 text-[10px] tracking-[0.3em] uppercase font-bold">Curated For You</span>
              <div className="w-10 h-px bg-gold-300" />
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-medium text-gray-900 uppercase tracking-wide">New Arrivals</h2>
          </SlideUp>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, idx) => {
              const coverImage = product.product_images?.find(i => i.is_cover)?.image_url || product.product_images?.[0]?.image_url;
              const inCart = cart.find(i => i.id === product.id);
              return (
                <SlideUp key={product.id} delay={(idx % 4) * 0.1} className="group relative">
                  <div className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] mb-3 transition-all duration-500 group-hover:shadow-[0_12px_40px_rgba(212,175,55,0.2)] group-hover:-translate-y-1">
                    <Link href={`/shop/${product.id}`} className="absolute inset-0">
                      {coverImage ? (
                        <img src={coverImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200 text-[10px] tracking-widest">NO IMAGE</div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                    </Link>
                    <button
                      onClick={() => addToCart(product)}
                      className={`absolute bottom-3 left-3 right-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg
                        transform ${inCart ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'}
                        ${inCart ? 'bg-gold-600 text-white' : 'bg-white/95 text-gray-900 hover:bg-gold-600 hover:text-white'}`}
                    >
                      {inCart ? `✓ In Cart` : '+ Add to Cart'}
                    </button>
                  </div>
                  <Link href={`/shop/${product.id}`} className="block px-1">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gold-600 transition-colors line-clamp-2 mb-1">{product.name}</h3>
                    <p className="text-gold-600 text-sm font-bold">₹{product.price.toFixed(0)}</p>
                  </Link>
                </SlideUp>
              );
            })}
          </div>

          <FadeIn delay={0.3} className="mt-12 text-center">
            <Link href="/shop" className="inline-block bg-white border border-gold-300 text-gold-600 hover:bg-gold-600 hover:border-gold-600 hover:text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_4px_14px_rgba(212,175,55,0.15)] hover:shadow-[0_8px_24px_rgba(212,175,55,0.3)]">
              Explore Full Collection →
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-[#1a1208] via-[#2d1e08] to-[#1a1208] py-16 md:py-20">
        <FadeIn className="text-center px-4 max-w-2xl mx-auto">
          <h2 className="font-heading text-2xl md:text-4xl font-medium text-white uppercase tracking-wider mb-4">
            Elevate Your <span className="text-gold-400 italic font-light">Style</span>
          </h2>
          <p className="text-white/50 text-xs tracking-widest uppercase mb-8">
            Discover pieces that tell your story
          </p>
          <Link href="/shop" className="inline-block bg-gold-500 hover:bg-gold-400 text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-[0.3em] transition-all duration-300 shadow-[0_6px_20px_rgba(212,175,55,0.3)]">
            Shop Now
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
