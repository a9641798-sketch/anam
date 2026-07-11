'use client';

import Link from 'next/link';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState({
    instagram: '#',
    facebook: '#',
    twitter: '#'
  });

  useEffect(() => {
    supabase?.from('site_settings').select('value').eq('id', 'social_links').single()
      .then(({ data }) => {
        if (data?.value) {
          setSocialLinks({
            instagram: data.value.instagram || '#',
            facebook: data.value.facebook || '#',
            twitter: data.value.twitter || '#'
          });
        }
      });
  }, []);
  // We hide footer on admin pages
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-white border-t border-gold-100 pt-24 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-20">
          
          {/* Brand Section */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="font-heading text-3xl font-bold tracking-[0.2em] text-gold-600 uppercase">
              HER HIGHNESS
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md font-medium tracking-wide">
              Exquisite artificial jewelry designed for the modern woman who values elegance, craftsmanship, and timeless style. Empowering your radiance since 2024.
            </p>
            <div className="flex gap-4 pt-4">
             {[
                 { name: 'Instagram', icon: Instagram, href: socialLinks.instagram },
                 { name: 'Facebook', icon: Facebook, href: socialLinks.facebook },
                 { name: 'Twitter', icon: Twitter, href: socialLinks.twitter }
               ].map((social) => (
                 <a key={social.name} href={social.href} className="w-10 h-10 rounded-full border border-gold-100 flex items-center justify-center text-gold-600 hover:bg-gold-500 hover:text-white transition-all duration-300">
                   <span className="sr-only">{social.name}</span>
                   <social.icon size={18} />
                 </a>
               ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900">Collections</h4>
            <ul className="space-y-4">
              <li><Link href="/shop?category=necklaces" className="text-sm text-gray-500 hover:text-gold-600 transition-colors">Necklaces</Link></li>
              <li><Link href="/shop?category=earrings" className="text-sm text-gray-500 hover:text-gold-600 transition-colors">Earrings</Link></li>
              <li><Link href="/shop?category=rings" className="text-sm text-gray-500 hover:text-gold-600 transition-colors">Rings</Link></li>
              <li><Link href="/shop?category=bracelets" className="text-sm text-gray-500 hover:text-gold-600 transition-colors">Bracelets</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900">Information</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-gold-600 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-500 hover:text-gold-600 transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="text-sm text-gray-500 hover:text-gold-600 transition-colors">FAQ</Link></li>
              <li><Link href="/blog" className="text-sm text-gray-500 hover:text-gold-600 transition-colors">Blog</Link></li>
              <li><Link href="/track-order" className="text-sm text-gray-500 hover:text-gold-600 transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900">Policies</h4>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-gold-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="text-sm text-gray-500 hover:text-gold-600 transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/shipping" className="text-sm text-gray-500 hover:text-gold-600 transition-colors">Shipping Policy</Link></li>
              <li><Link href="/return-refund" className="text-sm text-gray-500 hover:text-gold-600 transition-colors">Return & Refund</Link></li>
              <li><Link href="/cancellation" className="text-sm text-gray-500 hover:text-gold-600 transition-colors">Cancellation Policy</Link></li>
              <li><Link href="/cookie-policy" className="text-sm text-gray-500 hover:text-gold-600 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gold-50 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} HER HIGHNESS. Crafted with passion.
          </p>
          <div className="flex gap-8">
             <div className="flex items-center gap-2">
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Secure Payments via</span>
               <span className="text-xs font-black text-gray-600">RAZORPAY</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
