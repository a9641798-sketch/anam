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
    <div className="bg-[#8B0000] text-white overflow-hidden py-2 relative z-[60] flex w-full">
      <div className="flex animate-marquee whitespace-nowrap min-w-max items-center">
        {/* We render the text multiple times to ensure continuous smooth scrolling */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-12 px-6 items-center shrink-0">
            {messages.map((msg, j) => (
              <span key={`${i}-${j}`} className="text-xs md:text-sm font-semibold tracking-wider uppercase">
                {msg}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
