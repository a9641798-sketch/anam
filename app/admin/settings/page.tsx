'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import { compressImageToWebP } from '@/lib/image-utils';
import { Loader2, X, Image as ImageIcon } from 'lucide-react';

type CODConfig = {
  extra_charge: number;
};

type SocialLinks = {
  whatsapp: string;
  instagram: string;
  facebook: string;
  pinterest: string;
};

export default function SettingsPage() {
  const [codCharge, setCodCharge] = useState<number>(0);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    whatsapp: '', instagram: '', facebook: '', pinterest: ''
  });
  const [feedImages, setFeedImages] = useState<string[]>(Array(5).fill(''));
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase!
        .from('site_settings')
        .select('*')
        .in('id', ['cod_config', 'social_links', 'social_feed_images']);
      
      if (!error && data) {
        const cod = data.find(d => d.id === 'cod_config');
        if (cod) setCodCharge((cod.value as CODConfig).extra_charge || 0);

        const social = data.find(d => d.id === 'social_links');
        if (social) setSocialLinks(social.value as SocialLinks);

        const feed = data.find(d => d.id === 'social_feed_images');
        if (feed && Array.isArray(feed.value)) {
          // Ensure we always have an array of length 5
          const loadedImages = [...feed.value];
          while (loadedImages.length < 5) loadedImages.push('');
          setFeedImages(loadedImages.slice(0, 5));
        }
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleImageUpload = async (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingSlot(slotIndex);
    setMessage(null);
    try {
      // Compress the image with a target of 30KB
      const compressedFile = await compressImageToWebP(file, 0.9, 30);
      const fileName = `social-feed-${Date.now()}-${slotIndex}.webp`;
      
      const { error: uploadError } = await supabase!.storage
        .from('banners')
        .upload(fileName, compressedFile, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase!.storage.from('banners').getPublicUrl(fileName);
      
      const newImages = [...feedImages];
      newImages[slotIndex] = publicUrl;
      setFeedImages(newImages);
      
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Image upload failed: ' + err.message });
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleClearImage = (slotIndex: number) => {
    const newImages = [...feedImages];
    newImages[slotIndex] = '';
    setFeedImages(newImages);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error: codErr } = await supabase!
      .from('site_settings')
      .upsert({
        id: 'cod_config',
        value: { extra_charge: codCharge },
        updated_at: new Date().toISOString()
      });

    const { error: socialErr } = await supabase!
      .from('site_settings')
      .upsert({
        id: 'social_links',
        value: socialLinks,
        updated_at: new Date().toISOString()
      });
      
    const { error: feedErr } = await supabase!
      .from('site_settings')
      .upsert({
        id: 'social_feed_images',
        value: feedImages,
        updated_at: new Date().toISOString()
      });

    if (codErr || socialErr || feedErr) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } else {
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-gold-500 rounded-full animate-spin" />
        <p className="mt-4 text-sm text-gray-500 font-medium tracking-wide">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Store Settings</h2>
        <p className="text-sm text-gray-500">Configure global checkout rules and payment options.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <form onSubmit={handleSave} className="p-8 md:p-12 space-y-10">
          
          {/* COD Configuration Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100/50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest text-sm">Cash on Delivery (COD)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Extra Charge (₹)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={codCharge}
                    onChange={(e) => setCodCharge(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-4 bg-[#FCFBF8] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all font-bold text-lg"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed uppercase tracking-wider">
                  This fee will be added to the total amount when a customer selects Cash on Delivery as their payment method.
                </p>
              </div>
            </div>
          </section>

          <div className="h-[1px] bg-gray-50 w-full"></div>

          {/* Social Links Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest text-sm">Social Media Links</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">WhatsApp Number</label>
                <input
                  type="text"
                  value={socialLinks.whatsapp}
                  onChange={(e) => setSocialLinks({...socialLinks, whatsapp: e.target.value})}
                  className="w-full px-4 py-4 bg-[#FCFBF8] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all text-sm font-medium"
                  placeholder="e.g. 919876543210 (Include country code)"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Instagram URL</label>
                <input
                  type="text"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                  className="w-full px-4 py-4 bg-[#FCFBF8] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all text-sm font-medium"
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Facebook URL</label>
                <input
                  type="text"
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
                  className="w-full px-4 py-4 bg-[#FCFBF8] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all text-sm font-medium"
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pinterest URL</label>
                <input
                  type="text"
                  value={socialLinks.pinterest}
                  onChange={(e) => setSocialLinks({...socialLinks, pinterest: e.target.value})}
                  className="w-full px-4 py-4 bg-[#FCFBF8] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all text-sm font-medium"
                  placeholder="https://pinterest.com/yourhandle"
                />
              </div>
            </div>
          </section>

          <div className="h-[1px] bg-gray-50 w-full"></div>

          {/* Social Feed Images Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 border border-pink-100/50">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest text-sm">Social Feed Images</h3>
            </div>
            
            <p className="text-xs text-gray-400 font-medium leading-relaxed tracking-wider">
              Upload exactly 5 images to display in the "Follow Our Journey" section on the homepage. Images are automatically compressed to WebP format (under 30KB) for optimal performance.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {feedImages.map((imageUrl, idx) => (
                <div key={idx} className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block text-center">Slot {idx + 1}</label>
                  <div className="relative aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden group">
                    {uploadingSlot === idx ? (
                      <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
                    ) : imageUrl ? (
                      <>
                        <img src={imageUrl} alt={`Feed slot ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleClearImage(idx)}
                          className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                        <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(idx, e)}
                          disabled={uploadingSlot !== null}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="h-[1px] bg-gray-50 w-full"></div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {message && (
              <div className={`px-6 py-3 rounded-2xl text-xs font-bold tracking-wide animate-in fade-in slide-in-from-left-2 
                ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {message.type === 'success' ? '✦ ' : '⚠ '}{message.text}
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className={`ml-auto px-10 py-4 bg-gold-600 hover:bg-gold-700 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-3 ${saving ? 'opacity-50 cursor-wait' : ''}`}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>Update Configuration</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
