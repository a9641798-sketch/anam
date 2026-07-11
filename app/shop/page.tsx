'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '@/lib/db';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CartFab from '@/components/CartFab';
import { FadeIn, SlideUp } from '@/components/ui/FadeIn';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category_id: string;
  is_best_seller?: boolean;
  product_images?: { image_url: string; is_cover: boolean }[];
};
type Category = { id: string; name: string; slug?: string };
type CartItem = { id: string; name: string; quantity: number; price: number; image?: string };

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) setCart(JSON.parse(saved));
    } catch {}
    setCartLoaded(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (cartLoaded) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, cartLoaded]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: catData }, { data: prodData }] = await Promise.all([
        supabase!.from('categories').select('*').order('name'),
        supabase!.from('products').select('*, product_images(image_url, is_cover)').order('created_at', { ascending: false })
      ]);
      if (catData) setCategories(catData);
      if (prodData) setProducts(prodData as any);
      setLoading(false);
    };
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (activeCategory === 'best_sellers') {
      list = list.filter(p => p.is_best_seller);
    } else if (activeCategory !== 'all') {
      list = list.filter(p => p.category_id === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, activeCategory, search, sort]);

  const addToCart = (product: Product) => {
    const coverImage = product.product_images?.find(i => i.is_cover)?.image_url || product.product_images?.[0]?.image_url;
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, image: coverImage }];
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar cartCount={cart.reduce((s, i) => s + i.quantity, 0)} />
      <CartFab items={cart} />

      {/* Hero */}
      <section className="pt-24 pb-10 md:pt-28 md:pb-14 bg-gradient-to-b from-[#FAF8F3] to-[#FDFBF7]">
        <FadeIn className="text-center px-4 max-w-2xl mx-auto">
          <p className="text-gold-500 text-xs font-bold uppercase tracking-[0.3em] mb-3">Her Highness</p>
          <h1 className="font-heading text-3xl md:text-5xl font-medium text-gray-900 mb-4 uppercase tracking-[0.05em]">
            The Collection
          </h1>
          <p className="text-gray-400 text-sm tracking-wide">
            Premium artificial jewelry, meticulously crafted for everyday elegance.
          </p>
        </FadeIn>
      </section>

      {/* Category Pills - horizontal scroll */}
      <section className="sticky top-16 z-30 bg-[#FDFBF7]/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            <button
              onClick={() => setActiveCategory('all')}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-150
                ${activeCategory === 'all'
                  ? 'bg-gold-600 text-white border-gold-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gold-400 hover:text-gold-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveCategory('best_sellers')}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-150
                ${activeCategory === 'best_sellers'
                  ? 'bg-gold-600 text-white border-gold-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gold-400 hover:text-gold-700'}`}
            >
              Best Sellers
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-150
                  ${activeCategory === cat.id
                    ? 'bg-gold-600 text-white border-gold-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gold-400 hover:text-gold-700'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Search + Sort bar */}
      <section className="max-w-7xl mx-auto px-4 pt-6 pb-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative w-full sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search jewelry..."
            className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 ml-auto shrink-0">
          <span className="text-sm text-gray-400">{filteredProducts.length} items</span>
          <select
            value={sort} onChange={e => setSort(e.target.value)}
            className="bg-white border border-gray-200 text-sm text-gray-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold-500 cursor-pointer shadow-sm"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 py-6 pb-28">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-gray-100 rounded-2xl mb-3" />
                <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-700 mb-1">No products found</p>
            <p className="text-sm mb-4">{search ? `No results for "${search}"` : 'No products in this category.'}</p>
            <button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="text-gold-600 font-bold text-sm hover:underline">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, idx) => {
              const coverImage = product.product_images?.find(i => i.is_cover)?.image_url || product.product_images?.[0]?.image_url;
              const inCart = cart.find(i => i.id === product.id);
              return (
                <SlideUp key={product.id} delay={(idx % 8) * 0.05} className="group relative">
                  {/* Image Card */}
                  <div className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] mb-3 transition-all duration-500 group-hover:shadow-[0_12px_40px_rgba(212,175,55,0.18)] group-hover:-translate-y-1">
                    <Link href={`/shop/${product.id}`} className="absolute inset-0">
                      {coverImage ? (
                        <img src={coverImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200 text-xs tracking-widest bg-gray-50">NO IMAGE</div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                    </Link>

                    {/* Quick add button */}
                    <button
                      onClick={(e) => { e.preventDefault(); addToCart(product); }}
                      className={`absolute bottom-3 left-3 right-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg
                        transform ${inCart ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'}
                        ${inCart ? 'bg-gold-600 text-white' : 'bg-white/95 backdrop-blur-sm text-gray-900 hover:bg-gold-600 hover:text-white'}`}
                    >
                      {inCart ? `In Cart (${inCart.quantity})` : '+ Add to Cart'}
                    </button>
                  </div>

                  {/* Info */}
                  <Link href={`/shop/${product.id}`} className="block px-1">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gold-600 transition-colors leading-snug line-clamp-2 mb-1">{product.name}</h3>
                    <p className="text-gold-600 text-sm font-bold">₹{product.price.toFixed(0)}</p>
                  </Link>
                </SlideUp>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
