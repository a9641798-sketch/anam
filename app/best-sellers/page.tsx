'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { FadeIn, SlideUp } from '@/components/ui/FadeIn';

type Product = {
  id: string;
  name: string;
  price: number;
  product_images?: { image_url: string; is_cover: boolean }[];
};

export default function BestSellersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase!
        .from('products')
        .select('*, product_images(image_url, is_cover)')
        .eq('is_best_seller', true)
        .order('created_at', { ascending: false });
      if (data) setProducts(data as any);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar cartCount={0} />
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl text-gray-900 uppercase tracking-wider mb-4">
              Best <span className="text-gold-500 italic font-light">Sellers</span>
            </h1>
            <p className="text-gray-500 uppercase tracking-widest text-sm">Our most loved pieces</p>
          </FadeIn>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-gray-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
             <div className="text-center py-20 text-gray-500">No best sellers found at the moment.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, idx) => {
                const coverImage = product.product_images?.find(i => i.is_cover)?.image_url || product.product_images?.[0]?.image_url;
                return (
                  <SlideUp key={product.id} delay={(idx % 4) * 0.1} className="group relative">
                    <div className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden border border-gray-100 mb-3">
                      <Link href={`/shop/${product.id}`} className="absolute inset-0">
                        {coverImage ? (
                          <img src={coverImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200 text-xs tracking-widest">NO IMAGE</div>
                        )}
                      </Link>
                    </div>
                    <Link href={`/shop/${product.id}`} className="block px-1">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gold-600 transition-colors line-clamp-1">{product.name}</h3>
                      <p className="text-gold-600 text-sm font-bold">₹{product.price.toFixed(0)}</p>
                    </Link>
                  </SlideUp>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
