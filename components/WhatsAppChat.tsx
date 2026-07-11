'use client';
import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';

export default function WhatsAppChat() {
  const [phoneNumber, setPhoneNumber] = useState('919876543210'); // Default fallback

  useEffect(() => {
    supabase?.from('site_settings').select('value').eq('id', 'social_links').single()
      .then(({ data }) => {
        if (data?.value?.whatsapp) {
          setPhoneNumber(data.value.whatsapp);
        }
      });
  }, []);

  const message = "Hi! I'm interested in Her Highness jewelry.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}
