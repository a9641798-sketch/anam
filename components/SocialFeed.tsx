'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import { Instagram, Pin } from 'lucide-react';
import { FadeIn, SlideUp } from '@/components/ui/FadeIn';

const FEED_IMAGES = [
  "https://images.unsplash.com/photo-1599643478514-4a4204df6111?w=500&q=80",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80",
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80",
  "https://images.unsplash.com/photo-1599643477874-ed3ba3cb9ce8?w=500&q=80"
];

export default function SocialFeed() {
  const [socialLinks, setSocialLinks] = useState({
    instagram: '#',
    pinterest: '#'
  });

  useEffect(() => {
    supabase?.from('site_settings').select('value').eq('id', 'social_links').single()
      .then(({ data }) => {
        if (data?.value) {
          setSocialLinks({
            instagram: data.value.instagram || '#',
            pinterest: data.value.pinterest || '#'
          });
        }
      });
  }, []);

  return (
    <section className="py-20 bg-white border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center mb-12">
        <FadeIn>
          <h2 className="font-heading text-3xl md:text-4xl font-medium text-gray-900 uppercase tracking-wide mb-4">
            Follow Our <span className="text-gold-500 italic font-light">Journey</span>
          </h2>
          <p className="text-gray-500 text-sm tracking-widest uppercase mb-8">
            Tag @HerHighness on Instagram or Pinterest to be featured
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold-600 transition-colors"
            >
              <Instagram className="w-4 h-4" /> Instagram
            </a>
            <a 
              href={socialLinks.pinterest}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#E60023] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              <Pin className="w-4 h-4" /> Pinterest
            </a>
          </div>
        </FadeIn>
      </div>

      <SlideUp delay={0.2}>
        <div className="flex w-[150%] md:w-full overflow-x-auto scrollbar-hide snap-x md:grid md:grid-cols-5 gap-4 px-4 md:px-4 mx-auto max-w-screen-2xl">
          {FEED_IMAGES.map((img, i) => (
            <a 
              key={i} 
              href={i % 2 === 0 ? socialLinks.instagram : socialLinks.pinterest}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square overflow-hidden rounded-2xl group shrink-0 w-64 md:w-auto snap-center"
            >
              <img 
                src={img} 
                alt={`Social Feed Image ${i+1}`} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                {i % 2 === 0 ? (
                  <Instagram className="w-8 h-8 text-white transform scale-50 group-hover:scale-100 transition-transform duration-500" />
                ) : (
                  <Pin className="w-8 h-8 text-white transform scale-50 group-hover:scale-100 transition-transform duration-500" />
                )}
              </div>
            </a>
          ))}
        </div>
      </SlideUp>
    </section>
  );
}
