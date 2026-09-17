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

  // Calculate dynamic duration based on character count so speed is ALWAYS constant
  // regardless of how long or short the text is.
  const totalChars = messages.join(' ').length;
  // 10 repeats * totalChars * 0.2 seconds per character, plus 5s for padding/gaps
  const dynamicDuration = `${5 + (totalChars * 10 * 0.15)}s`;

  return (
    <div className="bg-[#8B0000] text-white overflow-hidden py-1.5 relative z-[60] flex w-full">
      <div 
        className="flex animate-marquee whitespace-nowrap min-w-max items-center"
        style={{ animationDuration: dynamicDuration }}
      >
        {/* We render the text multiple times to ensure continuous smooth scrolling */}
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex gap-16 px-8 items-center shrink-0">
            {messages.map((msg, j) => (
              <div key={`${i}-${j}`} className="flex items-center gap-16">
                <span className="text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase">
                  {msg}
                </span>
                <span className="text-white/40 text-[10px]">✦</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
