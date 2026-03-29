'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CartFab from '@/components/CartFab';
import { motion, AnimatePresence } from 'framer-motion';

type CartItem = { id: string; name: string; quantity: number; price: number; image?: string };

function ProductDetailContent({ productId }: { productId: string }) {
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart
  useEffect(() => {
    try { const s = localStorage.getItem('cart'); if (s) setCart(JSON.parse(s)); } catch {}
  }, []);

  // Sync cart to storage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    async function fetch() {
      const [{ data: prod }, { data: imgs }] = await Promise.all([
        supabase!.from('products').select('*').eq('id', productId).single(),
        supabase!.from('product_images').select('*').eq('product_id', productId).order('display_order')
      ]);
      if (prod) setProduct(prod);
      if (imgs && imgs.length > 0) {
        setImages(imgs);
        const cover = imgs.find((i: any) => i.is_cover);
        setActiveImage(cover ? cover.image_url : imgs[0].image_url);
      }
      setLoading(false);
    }
    fetch();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    const img = activeImage || '';
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, image: img }];
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <div className="w-12 h-12 border-4 border-gold-200 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-gray-400 text-xs uppercase tracking-widest">
      Product not found.
    </div>
  );

  const inCart = cart.find(i => i.id === product.id);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      <Navbar cartCount={cartCount} />
      <CartFab items={cart} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-20 flex-1 w-full">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Link href="/shop" className="inline-flex items-center gap-2 text-xs text-gold-600 hover:text-gold-700 mb-10 uppercase tracking-[0.2em] font-semibold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Collection
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-20 items-start">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-32">
            {images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide w-full md:w-20 shrink-0">
                {images.map((img: any) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.image_url)}
                    className={`relative shrink-0 w-16 h-20 md:w-full md:h-24 overflow-hidden rounded-xl border-2 transition-all duration-300 p-1
                      ${activeImage === img.image_url ? 'border-gold-500 opacity-100' : 'border-gray-100 opacity-50 hover:opacity-80'}`}
                  >
                    <img src={img.image_url} alt="thumb" className="w-full h-full object-cover rounded-lg" />
                  </button>
                ))}
              </div>
            )}
            <div className="relative aspect-square sm:aspect-[4/5] w-full bg-white rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-gold-100/50">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={activeImage}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col"
          >
            <p className="text-gold-500 uppercase tracking-[0.3em] text-[10px] font-bold mb-3">Her Highness</p>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-medium text-gray-900 mb-4 leading-[1.1]">
              {product.name}
            </h1>
            <p className="text-2xl md:text-3xl text-gold-600 mb-6 font-semibold tracking-wide">
              ₹{product.price.toFixed(2)}
            </p>

            {product.description && (
              <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-lg">
                {product.description}
              </p>
            )}

            <div className="border-t border-gray-100 pt-6 mb-6 flex items-center justify-between text-xs uppercase tracking-widest">
              <span className="text-gray-400 font-semibold">Availability</span>
              <span className={`font-bold ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Sold Out'}
              </span>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full py-4 text-center uppercase tracking-[0.2em] text-sm font-bold transition-all duration-300 rounded-2xl shadow-lg
                  ${addedToCart
                    ? 'bg-emerald-500 text-white'
                    : product.stock > 0
                    ? 'bg-gold-600 hover:bg-gold-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                {addedToCart
                  ? '✦ Added to Cart!'
                  : product.stock > 0
                  ? inCart ? `Add More (${inCart.quantity} in cart)` : 'Add to Cart'
                  : 'Currently Unavailable'}
              </motion.button>

              <AnimatePresence>
                {addedToCart && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <p className="text-xs text-gray-400">
                      Item added · Check the cart icon or{' '}
                      <Link href="/cart" className="text-gold-600 font-bold hover:underline">
                        go to cart →
                      </Link>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <Link
                href="/cart"
                className="block w-full py-3.5 text-center border border-gray-200 text-gray-700 hover:border-gold-400 hover:text-gold-700 uppercase tracking-[0.15em] text-xs font-bold transition-all duration-300 rounded-2xl"
              >
                View Cart
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-10 grid grid-cols-2 gap-3 border-t border-gray-100 pt-8">
              {[
                { icon: '✦', label: 'Premium Finish' },
                { icon: '◈', label: 'Secure Payments' },
                { icon: '◉', label: 'Fast Delivery' },
                { icon: '◇', label: 'Easy Returns' },
              ].map(badge => (
                <div key={badge.label} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gold-50 flex items-center justify-center text-gold-500 text-sm shrink-0">
                    {badge.icon}
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{badge.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  return <ProductDetailContent productId={unwrappedParams.id} />;
}
