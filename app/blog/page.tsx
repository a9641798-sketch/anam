'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { FadeIn, SlideUp } from '@/components/ui/FadeIn';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  published_at: string;
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase!
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_image, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar cartCount={0} />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl text-gray-900 uppercase tracking-wider mb-4">
              The Royal <span className="text-gold-500 italic font-light">Journal</span>
            </h1>
            <p className="text-gray-500 uppercase tracking-widest text-sm max-w-xl mx-auto leading-relaxed">
              Stories, styling tips, and insights into the world of premium artificial jewelry
            </p>
          </FadeIn>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/3] bg-gray-100 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No journal entries published yet. Stay tuned!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {posts.map((post, idx) => (
                <SlideUp key={post.id} delay={idx * 0.1}>
                  <Link href={`/blog/${post.slug}`} className="group block bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                      {post.cover_image ? (
                        <img 
                          src={post.cover_image} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <span className="text-4xl font-heading opacity-50">HH</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                    </div>
                    <div className="p-8">
                      <div className="text-xs font-bold text-gold-500 uppercase tracking-widest mb-3">
                        {new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <h2 className="font-heading text-2xl font-medium text-gray-900 mb-4 line-clamp-2 group-hover:text-gold-600 transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="text-xs font-bold uppercase tracking-widest text-gray-900 flex items-center gap-2 group-hover:gap-4 transition-all">
                        Read Article <span className="text-gold-500">→</span>
                      </div>
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
