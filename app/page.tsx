'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/db';
import Link from 'next/link';
import CartFab from '@/components/CartFab';
import { FadeIn, SlideUp } from '@/components/ui/FadeIn';

type Banner = { id: string; image_url: string; title?: string; link?: string };
type Product = { id: string; name: string; price: number; product_images?: { image_url: string; is_cover: boolean }[] };
type Category = { id: string; name: string; image_url?: string };
type CartItem = { id: string; name: string; quantity: number; price: number; image?: string };

const TESTIMONIALS = [
  { name: "Priya Sharma", rating: 5, text: "Absolutely stunning pieces! The quality of the gold plating is incredible, it looks and feels like real 18k gold." },
  { name: "Aisha Patel", rating: 5, text: "I bought a necklace set for my sister's wedding and received so many compliments. Customer service was also very responsive!" },
  { name: "Neha Gupta", rating: 5, text: "The attention to detail in the craftsmanship is unmatched. This is my third time ordering and I'm always amazed." }
];

const INSTAGRAM_POSTS = [
  "https://images.unsplash.com/photo-1599643478514-4a4204df6111?w=500&q=80",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80",
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80"
];

const CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1599643477874-ed3ba3cb9ce8?w=800&q=80",
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80"
];

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const testRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try { const s = localStorage.getItem('cart'); if (s) setCart(JSON.parse(s)); } catch {}
    setCartLoaded(true);
  }, []);
  useEffect(() => { 
    if (cartLoaded) {
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [cart, cartLoaded]);

  useEffect(() => {
    const load = async () => {
      const [{ data: b }, { data: p }, { data: c }] = await Promise.all([
        supabase!.from('banners').select('*').eq('is_active', true).order('display_order').limit(5),
        supabase!.from('products').select('*, product_images(image_url, is_cover)').order('created_at', { ascending: false }).limit(12),
        supabase!.from('categories').select('*').limit(4)
      ]);
      
      if (b) setBanners(b);
      if (p) {
        setProducts(p.slice(0, 8) as any);
        // Use a different slice for bestsellers simulation
        setBestsellers(p.slice(4, 8) as any);
      }
      if (c) setCategories(c);
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

  // Auto-slide testimonials
  useEffect(() => {
    testRef.current = setInterval(() => {
      setCurrentTestimonial(i => (i + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => { if (testRef.current) clearInterval(testRef.current); };
  }, []);

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

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus('Thank you for subscribing! Check your inbox for the discount code.');
    setNewsletterEmail('');
    setTimeout(() => setNewsletterStatus(''), 4000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <CartFab items={cart} />

      {/* Hero Banner - Auto Sliding */}
      <section className="relative w-full h-[80vh] md:h-screen max-h-[780px] overflow-hidden mt-0">
        {banners.length > 0 ? (
          <>
            {banners.map((banner, idx) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <img src={banner.image_url} alt={banner.title || 'Banner'} className="w-full h-full object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
              </div>
            ))}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
              <FadeIn>
                <span className="text-white/80 text-xs font-bold uppercase tracking-[0.5em] mb-4 block">New Season</span>
                <h1 className="font-heading text-5xl sm:text-6xl md:text-8xl text-white font-medium uppercase tracking-tight drop-shadow-2xl mb-6">
                  Royal <span className="italic font-light">Grace</span>
                </h1>
                <p className="text-white/90 text-sm md:text-base font-medium tracking-widest uppercase max-w-md mx-auto mb-8">
                  Discover the zenith of artificial jewelry
                </p>
                <Link href="/shop" className="inline-block bg-white/15 backdrop-blur-md border border-white/30 text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-gray-900 transition-all duration-500 shadow-2xl">
                  Shop the Collection
                </Link>
              </FadeIn>
            </div>
            {banners.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-2">
                {banners.map((_, idx) => (
                  <button key={idx} onClick={() => goToBanner(idx)} className={`transition-all duration-300 rounded-full ${idx === currentBanner ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`} />
                ))}
              </div>
            )}
            {banners.length > 1 && (
              <>
                <button onClick={() => goToBanner((currentBanner - 1 + banners.length) % banners.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={() => goToBanner((currentBanner + 1) % banners.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#2a1f0a] to-[#1a1a1a] flex items-center justify-center mt-16">
            <div className="text-center px-4">
              <h1 className="font-heading text-5xl md:text-7xl text-gold-400 font-medium uppercase tracking-[0.1em] mb-4">Her Highness</h1>
              <p className="text-gold-200/60 text-xs uppercase tracking-[0.4em] mb-8">Premium Artificial Jewelry</p>
              <Link href="/shop" className="inline-block bg-gold-500 text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold-400 transition-colors">Shop Now</Link>
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

      {/* Category Showcase */}
      {categories.length > 0 && (
        <section className="py-20 bg-[#FDFBF7]">
          <div className="max-w-7xl mx-auto px-4">
            <SlideUp className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-medium text-gray-900 uppercase tracking-wide">Shop by Category</h2>
              <p className="text-gray-500 text-sm mt-4 tracking-widest uppercase">Explore our curated collections</p>
            </SlideUp>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat, i) => (
                <SlideUp key={cat.id} delay={i * 0.1}>
                  <Link href={`/shop?category=${cat.id}`} className="group relative block aspect-[3/4] overflow-hidden rounded-xl">
                    <img src={CATEGORY_IMAGES[i % CATEGORY_IMAGES.length]} alt={cat.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center p-8 transition-opacity duration-500 group-hover:from-black/90">
                      <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className="text-white font-heading text-2xl uppercase tracking-widest mb-3">{cat.name}</h3>
                        <span className="inline-block bg-transparent border border-white text-white text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Explore</span>
                      </div>
                    </div>
                  </Link>
                </SlideUp>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&q=80" alt="Craftsmanship" className="w-full h-full object-cover" />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl" />
              </div>
            </FadeIn>
            <SlideUp delay={0.2} className="md:pl-10">
              <span className="text-gold-500 text-[10px] tracking-[0.3em] uppercase font-bold mb-4 block">The Heritage</span>
              <h2 className="font-heading text-3xl md:text-5xl font-medium text-gray-900 uppercase tracking-wide mb-6 leading-tight">
                Crafted for the <br/><span className="text-gold-600 italic font-light">Modern Royalty</span>
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                At Her Highness, we believe every woman deserves to feel like royalty. Our master artisans blend traditional techniques with contemporary designs to create premium artificial jewelry that stands the test of time.
              </p>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Using only the finest hypoallergenic alloys and brilliant ethically-sourced stones, our pieces offer the opulent look of fine jewelry without the exorbitant price tag.
              </p>
              <Link href="/about" className="inline-block border-b-2 border-gold-500 pb-1 text-xs font-bold text-gray-900 uppercase tracking-widest hover:text-gold-600 transition-colors">
                Discover Our Story
              </Link>
            </SlideUp>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4">
          <SlideUp className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-medium text-gray-900 uppercase tracking-wide">New Arrivals</h2>
          </SlideUp>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, idx) => {
              const coverImage = product.product_images?.find(i => i.is_cover)?.image_url || product.product_images?.[0]?.image_url;
              const inCart = cart.find(i => i.id === product.id);
              return (
                <SlideUp key={product.id} delay={(idx % 4) * 0.1} className="group relative">
                  <div className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-3 transition-all duration-500 group-hover:shadow-xl">
                    <Link href={`/shop/${product.id}`} className="absolute inset-0">
                      {coverImage ? (
                        <img src={coverImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200 text-[10px] tracking-widest">NO IMAGE</div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                    </Link>
                    <button onClick={() => addToCart(product)} className={`absolute bottom-3 left-3 right-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg transform ${inCart ? 'translate-y-0 opacity-100 bg-gold-600 text-white' : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 bg-white/95 text-gray-900 hover:bg-gold-600 hover:text-white'}`}>
                      {inCart ? `✓ In Cart` : '+ Add to Cart'}
                    </button>
                  </div>
                  <Link href={`/shop/${product.id}`} className="block px-1 text-center">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gold-600 transition-colors line-clamp-1 mb-1">{product.name}</h3>
                    <p className="text-gold-600 text-sm font-bold">₹{product.price.toFixed(0)}</p>
                  </Link>
                </SlideUp>
              );
            })}
          </div>
          <FadeIn delay={0.3} className="mt-12 text-center">
            <Link href="/shop" className="inline-block bg-white border border-gold-300 text-gold-600 hover:bg-gold-600 hover:border-gold-600 hover:text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-sm">
              Explore All →
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Bestsellers Spotlight */}
      {bestsellers.length > 0 && (
        <section className="py-20 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <SlideUp>
                <span className="text-gold-400 text-[10px] tracking-[0.3em] uppercase font-bold mb-3 block">Most Loved</span>
                <h2 className="font-heading text-3xl md:text-5xl font-medium uppercase tracking-wide">Bestsellers</h2>
              </SlideUp>
              <SlideUp delay={0.1}>
                <Link href="/shop?sort=popular" className="hidden md:inline-block border-b border-gold-400/50 pb-1 text-xs font-bold text-gold-400 uppercase tracking-widest hover:text-gold-300 hover:border-gold-300 transition-colors">
                  View All Bestsellers
                </Link>
              </SlideUp>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {bestsellers.map((product, idx) => {
                const coverImage = product.product_images?.find(i => i.is_cover)?.image_url || product.product_images?.[0]?.image_url;
                return (
                  <SlideUp key={product.id} delay={(idx % 4) * 0.1} className="group relative">
                    <div className="relative aspect-square bg-gray-800 rounded-xl overflow-hidden mb-3">
                      <Link href={`/shop/${product.id}`} className="absolute inset-0">
                        {coverImage && <img src={coverImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />}
                      </Link>
                    </div>
                    <Link href={`/shop/${product.id}`} className="block px-1">
                      <h3 className="text-sm font-semibold text-gray-200 group-hover:text-gold-400 transition-colors line-clamp-1 mb-1">{product.name}</h3>
                      <p className="text-gold-400 text-sm font-bold">₹{product.price.toFixed(0)}</p>
                    </Link>
                  </SlideUp>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 bg-[#FDFBF7] overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FadeIn>
            <span className="text-gold-500 text-[10px] tracking-[0.3em] uppercase font-bold mb-6 block">The Royal Court</span>
            <div className="relative h-48 md:h-40">
              {TESTIMONIALS.map((test, idx) => (
                <div key={idx} className={`absolute inset-0 transition-all duration-700 transform ${idx === currentTestimonial ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                  <div className="flex justify-center gap-1 mb-6">
                    {[...Array(test.rating)].map((_, i) => <span key={i} className="text-gold-500 text-sm">★</span>)}
                  </div>
                  <h3 className="font-heading text-xl md:text-3xl text-gray-900 leading-relaxed italic mb-6">"{test.text}"</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">— {test.name}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-8">
              {TESTIMONIALS.map((_, idx) => (
                <button key={idx} onClick={() => { setCurrentTestimonial(idx); if (testRef.current) clearInterval(testRef.current); }} className={`w-2 h-2 rounded-full transition-all ${idx === currentTestimonial ? 'bg-gold-500 w-6' : 'bg-gold-200 hover:bg-gold-300'}`} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className="py-2 bg-white">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 flex items-center justify-center p-12 bg-[#FDFBF7]">
            <FadeIn className="text-center">
              <h2 className="font-heading text-3xl font-medium text-gray-900 uppercase tracking-wide mb-4">Follow Us</h2>
              <p className="text-gray-500 text-sm mb-6">Join our community on Instagram for daily inspiration and exclusive drops.</p>
              <a href="#" className="inline-block border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-3 text-xs font-bold uppercase tracking-widest transition-colors">
                @HerHighness
              </a>
            </FadeIn>
          </div>
          <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-4">
            {INSTAGRAM_POSTS.map((img, i) => (
              <a key={i} href="#" className="relative aspect-square group overflow-hidden block">
                <img src={img} alt="Instagram post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-2xl">♥</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gold-50 py-20 border-t border-gold-100">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <SlideUp>
            <h2 className="font-heading text-3xl md:text-4xl font-medium text-gray-900 uppercase tracking-wide mb-4">Join the Royal Court</h2>
            <p className="text-gray-600 text-sm mb-8">Subscribe to receive 10% off your first order, plus updates on exclusive collections and private sales.</p>
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative">
              <input 
                type="email" 
                required 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address" 
                className="flex-1 bg-white border border-gray-200 px-6 py-4 rounded-full text-sm focus:outline-none focus:border-gold-500 transition-colors"
              />
              <button type="submit" className="bg-gray-900 text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold-600 transition-colors">
                Subscribe
              </button>
            </form>
            {newsletterStatus && (
              <p className="text-gold-600 text-xs font-bold mt-4 tracking-wider">{newsletterStatus}</p>
            )}
          </SlideUp>
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
