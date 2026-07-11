'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { FadeIn, SlideUp } from '@/components/ui/FadeIn';

type Category = { id: string; name: string; description: string; slug: string; image_url?: string };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase!.from('categories').select('*').order('name');
      if (data) setCategories(data);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar cartCount={0} />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl text-gray-900 uppercase tracking-wider mb-4">
              Shop by <span className="text-gold-500 italic font-light">Category</span>
            </h1>
            <p className="text-gray-500 uppercase tracking-widest text-sm">Discover our curated collections</p>
          </FadeIn>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat, idx) => (
                <SlideUp key={cat.id} delay={idx * 0.1}>
                  <Link href={`/shop?category=${cat.id}`} className="group block relative aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                    {/* Placeholder for category image if none provided */}
                    <div className="absolute inset-0 bg-gold-50/50 group-hover:bg-gold-100/50 transition-colors duration-500 flex items-center justify-center">
                       {cat.image_url ? (
                         <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                       ) : (
                         <span className="text-6xl text-gold-200/50 font-heading">HH</span>
                       )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-2xl font-heading font-medium text-white uppercase tracking-wider mb-2">{cat.name}</h3>
                      <p className="text-white/80 text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                        Explore <span className="text-gold-400">→</span>
                      </p>
                    </div>
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
