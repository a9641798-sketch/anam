'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface ImageUploadComponentProps {
  bucketName: string;
  onUploadComplete: (url: string) => void;
  buttonText?: string;
  className?: string;
}

type Banner = {
  id: string;
  image_url: string;
  title: string | null;
  link: string | null;
  is_active: boolean;
};

export default function BannersAdmin() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    const { data } = await supabase!.from('banners').select('*').order('display_order', { ascending: true });
    if (data) setBanners(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `banner-${Date.now()}.${ext}`;
    const { data, error } = await supabase!.storage.from('banners').upload(fileName, file, { upsert: true });
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase!.storage.from('banners').getPublicUrl(fileName);
    await supabase!.from('banners').insert({ image_url: publicUrl, is_active: true, display_order: banners.length });
    setUploading(false);
    fetchBanners();
  };

  const toggleStatus = async (id: string, current: boolean) => {
    await supabase!.from('banners').update({ is_active: !current }).eq('id', id);
    setBanners(banners.map(b => b.id === id ? { ...b, is_active: !current } : b));
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await supabase!.from('banners').delete().eq('id', id);
    fetchBanners();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Banners</h2>
          <p className="text-sm text-gray-500 mt-1">Manage homepage hero banners. Active banners auto-rotate.</p>
        </div>
        <label className={`inline-flex items-center gap-2 ${uploading ? 'opacity-60 cursor-wait' : 'cursor-pointer'} bg-gold-600 hover:bg-gold-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm`}>
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          )}
          {uploading ? 'Uploading...' : 'Upload Banner'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
        </label>
      </div>

      {/* Banner Grid */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-gold-500 rounded-full animate-spin" />
          </div>
        ) : banners.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-semibold text-gray-900 mb-1">No banners yet</p>
            <p className="text-sm">Upload your first banner image to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {banners.map((banner, idx) => (
              <div key={banner.id} className="flex items-center gap-5 px-6 py-5 hover:bg-gray-50/70 transition-colors">
                {/* Preview */}
                <div className="w-32 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                  <img src={banner.image_url} alt="Banner" className="w-full h-full object-cover" />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{banner.title || `Banner #${idx + 1}`}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{banner.image_url}</p>
                </div>
                {/* Status toggle */}
                <button
                  onClick={() => toggleStatus(banner.id, banner.is_active)}
                  className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors
                    ${banner.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${banner.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  {banner.is_active ? 'Active' : 'Inactive'}
                </button>
                {/* Delete */}
                <button onClick={() => deleteBanner(banner.id)} className="shrink-0 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {!loading && banners.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          💡 Active banners auto-rotate on the homepage every 5 seconds. Drag to reorder (coming soon).
        </p>
      )}
    </div>
  );
}
