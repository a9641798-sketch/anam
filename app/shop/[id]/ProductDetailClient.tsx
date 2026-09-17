'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import Link from 'next/link';
import CartFab from '@/components/CartFab';
import { motion, AnimatePresence } from 'framer-motion';
import ActiveOffers from '@/components/ActiveOffers';

type CartItem = { id: string; name: string; quantity: number; price: number; image?: string; variant?: string };
type Variant = { id: string; name: string; price_override: number; stock: number };
type Review = { id: string; customer_name: string; rating: number; comment: string; created_at: string };

export default function ProductDetailClient({ productId }: { productId: string }) {
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  // Review Form State
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

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
    async function fetch() {
      const [{ data: prod }, { data: imgs }, { data: vars }, { data: revs }] = await Promise.all([
        supabase!.from('products').select('*').eq('id', productId).single(),
        supabase!.from('product_images').select('*').eq('product_id', productId).order('display_order'),
        supabase!.from('product_variants').select('*').eq('product_id', productId),
        supabase!.from('reviews').select('*').eq('product_id', productId).eq('status', 'approved').order('created_at', { ascending: false })
      ]);
      
      if (prod) {
        setProduct(prod);
        
        // Fetch related
        const { data: related } = await supabase!
          .from('products')
          .select('*, product_images(image_url, is_cover)')
          .eq('category_id', prod.category_id)
          .neq('id', prod.id)
          .limit(4);
        if (related) setRelatedProducts(related);
      }
      
      if (imgs && imgs.length > 0) {
        setImages(imgs);
        const cover = imgs.find((i: any) => i.is_cover);
        setActiveImage(cover ? cover.image_url : imgs[0].image_url);
      }
      
      if (vars && vars.length > 0) {
        setVariants(vars);
        setSelectedVariant(vars[0]);
      }
      
      if (revs) setReviews(revs);
      
      setLoading(false);
    }
    fetch();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    const img = activeImage || '';
    
    // Use variant price if selected and has override
    const priceToUse = selectedVariant && selectedVariant.price_override ? selectedVariant.price_override : product.price;
    const itemName = selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name;
    const uniqueId = selectedVariant ? `${product.id}_${selectedVariant.id}` : product.id;

    setCart(prev => {
      const existing = prev.find(i => i.id === uniqueId);
      if (existing) return prev.map(i => i.id === uniqueId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: uniqueId, name: itemName, price: priceToUse, quantity: 1, image: img }];
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };
  
  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    const { error } = await supabase!.from('reviews').insert({
      product_id: productId,
      customer_name: reviewName,
      rating: reviewRating,
      comment: reviewComment,
      status: 'pending' // Needs admin approval
    });
    setSubmittingReview(false);
    if (!error) {
      setReviewSuccess(true);
      setReviewName('');
      setReviewComment('');
    }
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

  // Use variant stock if applicable
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentPrice = selectedVariant && selectedVariant.price_override ? selectedVariant.price_override : product.price;

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
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
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col-reverse md:flex-row gap-5 lg:sticky lg:top-32">
            {images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide w-full md:w-20 shrink-0">
                {images.map((img: any) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.image_url)}
                    className={`relative shrink-0 w-16 h-20 md:w-full md:h-24 overflow-hidden rounded-xl transition-all duration-300 p-0.5
                      ${activeImage === img.image_url ? 'ring-2 ring-gold-500 opacity-100 shadow-md' : 'ring-1 ring-gray-200 opacity-60 hover:opacity-100 hover:ring-gold-300'}`}
                  >
                    <div className="w-full h-full rounded-lg overflow-hidden bg-[#FDFBF7] relative">
                      {img.is_video ? (
                        <>
                          <video src={img.image_url} className="w-full h-full object-cover opacity-50" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/90 p-1.5 rounded-full shadow-sm backdrop-blur-sm">
                              <svg className="w-4 h-4 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                          </div>
                        </>
                      ) : (
                        <img src={img.image_url} alt="thumbnail" className="w-full h-full object-cover" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* Main Media Area */}
            <div className="relative aspect-square sm:aspect-[4/5] w-full bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-sm border border-gold-100/50">
              <AnimatePresence mode="wait">
                {images.find(i => i.image_url === activeImage)?.is_video || activeImage === product.video_url ? (
                  <motion.video 
                    key={`video-${activeImage}`}
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0 }} 
                    transition={{ duration: 0.4 }}
                    src={activeImage} 
                    controls 
                    autoPlay 
                    loop 
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                ) : (
                  <motion.img
                    key={`img-${activeImage}`}
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0 }} 
                    transition={{ duration: 0.4 }}
                    src={activeImage}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
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
            
            {/* Reviews Summary */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <div className="flex text-gold-500">
                   {[...Array(5)].map((_, i) => (
                     <svg key={i} className={`w-3.5 h-3.5 ${i < (reviews.reduce((s,r) => s+r.rating,0)/reviews.length) ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                   ))}
                </div>
                <span>({reviews.length} Reviews)</span>
              </div>
            )}
            
            <p className="text-2xl md:text-3xl text-gold-600 mb-6 font-semibold tracking-wide">
              ₹{currentPrice.toFixed(2)}
            </p>

            {product.description && (
              <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-lg">
                {product.description}
              </p>
            )}

            {/* Variants Selector */}
            {variants.length > 0 && (
              <div className="mb-8">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-3">Select Option</h3>
                 <div className="flex flex-wrap gap-3">
                   {variants.map(v => (
                     <button
                       key={v.id}
                       onClick={() => setSelectedVariant(v)}
                       className={`px-5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all
                         ${selectedVariant?.id === v.id ? 'border-gold-500 bg-gold-50 text-gold-700' : 'border-gray-200 text-gray-600 hover:border-gold-300'}`}
                     >
                       {v.name}
                     </button>
                   ))}
                 </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-6 mb-6 flex items-center justify-between text-xs uppercase tracking-widest">
              <span className="text-gray-400 font-semibold">Availability</span>
              <span className={`font-bold ${currentStock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {currentStock > 0 ? `In Stock (${currentStock})` : 'Sold Out'}
              </span>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={currentStock === 0}
                className={`w-full py-4 text-center uppercase tracking-[0.2em] text-sm font-bold transition-all duration-300 rounded-2xl shadow-lg
                  ${addedToCart
                    ? 'bg-emerald-500 text-white'
                    : currentStock > 0
                    ? 'bg-gold-600 hover:bg-gold-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                {addedToCart
                  ? '✦ Added to Cart!'
                  : currentStock > 0
                  ? 'Add to Cart'
                  : 'Currently Unavailable'}
              </motion.button>
              
              <Link
                href="/cart"
                className="block w-full py-3.5 text-center border border-gray-200 text-gray-700 hover:border-gold-400 hover:text-gold-700 uppercase tracking-[0.15em] text-xs font-bold transition-all duration-300 rounded-2xl"
              >
                View Cart
              </Link>
            </div>
            
            <div className="mt-8">
              <ActiveOffers />
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

        {/* Reviews Section */}
        <div className="mt-24 border-t border-gray-100 pt-16">
          <h2 className="font-heading text-3xl font-medium text-gray-900 mb-10 text-center uppercase tracking-wider">Customer Reviews</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Review List */}
            <div>
              {reviews.length === 0 ? (
                <p className="text-gray-500 italic">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                       <div className="flex justify-between items-start mb-2">
                         <h4 className="font-bold text-gray-900">{review.customer_name}</h4>
                         <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                       </div>
                       <div className="flex text-gold-500 mb-3">
                         {[...Array(5)].map((_, i) => (
                           <svg key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                         ))}
                       </div>
                       <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write Review Form */}
            <div>
              <div className="bg-[#FAF8F3] p-8 rounded-3xl border border-gold-100/50">
                <h3 className="font-bold text-gray-900 uppercase tracking-widest mb-6">Write a Review</h3>
                {reviewSuccess ? (
                  <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium">
                    Thank you! Your review has been submitted and is pending approval.
                  </div>
                ) : (
                  <form onSubmit={submitReview} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Name</label>
                      <input required type="text" value={reviewName} onChange={e => setReviewName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-gold-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Rating</label>
                      <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-gold-500">
                         <option value={5}>5 - Excellent</option>
                         <option value={4}>4 - Very Good</option>
                         <option value={3}>3 - Average</option>
                         <option value={2}>2 - Poor</option>
                         <option value={1}>1 - Terrible</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Comment</label>
                      <textarea required value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-gold-500"></textarea>
                    </div>
                    <button disabled={submittingReview} type="submit" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gold-600 transition-colors w-full">
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 border-t border-gray-100 pt-16">
            <h2 className="font-heading text-3xl font-medium text-gray-900 mb-10 text-center uppercase tracking-wider">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((prod) => {
                const coverImg = prod.product_images?.find((i:any) => i.is_cover)?.image_url || prod.product_images?.[0]?.image_url;
                return (
                  <div key={prod.id} className="group relative">
                    <div className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden border border-gray-100 mb-3">
                      <Link href={`/shop/${prod.id}`} className="absolute inset-0">
                        {coverImg ? (
                          <img src={coverImg} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200 text-xs tracking-widest">NO IMAGE</div>
                        )}
                      </Link>
                    </div>
                    <Link href={`/shop/${prod.id}`} className="block px-1">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gold-600 transition-colors line-clamp-1">{prod.name}</h3>
                      <p className="text-gold-600 text-sm font-bold">₹{prod.price.toFixed(0)}</p>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
