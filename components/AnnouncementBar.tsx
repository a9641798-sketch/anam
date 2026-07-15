'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';

export default function AnnouncementBar() {
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnouncements() {
      const { data } = await supabase!
        .from('announcements')
        .select('message')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
        
      if (data && data.length > 0) {
        setMessages(data.map(d => d.message));
      }
      setLoading(false);
    }
    
    fetchAnnouncements();
  }, []);

  if (loading || messages.length === 0) return null;

  return (
    <div className="bg-[#8B0000] text-white overflow-hidden py-2 relative z-[60]">
      <div className="flex whitespace-nowrap animate-marquee">
        {/* We render the text multiple times to ensure continuous smooth scrolling if it's short */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-8 px-4 items-center">
            {messages.map((msg, j) => (
              <span key={`${i}-${j}`} className="text-xs md:text-sm font-semibold tracking-wider uppercase">
                {msg}
              </span>
            ))}
          </div>
        ))}
      </div>
      <style jsx>{`
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}
