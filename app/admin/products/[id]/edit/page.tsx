'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MediaUpload from '@/components/admin/MediaUpload';
import { X, Loader2 } from 'lucide-react';

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    video_url: '',
    is_best_seller: false
  });
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [images, setImages] = useState<{ id?: string, url: string, is_cover: boolean, is_video: boolean, toDelete?: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      // Load Categories first or in parallel
      const { data: catData } = await supabase!.from('categories').select('id, name').order('name');
      if (catData) setCategories(catData);
      setLoadingCats(false);

      // Load Product
      const { data: product } = await supabase!.from('products').select('*').eq('id', id).single();
      if (product) {
        setFormData({
          name: product.name,
          description: product.description || '',
          price: product.price,
          stock: product.stock,
          category_id: product.category_id || '',
          video_url: product.video_url || '',
          is_best_seller: product.is_best_seller || false
        });
      }

      // Load Images
      const { data: productImages } = await supabase!.from('product_images').select('*').eq('product_id', id).order('display_order');
      if (productImages) {
        setImages(productImages.map(img => ({
          id: img.id,
          url: img.image_url,
          is_cover: img.is_cover,
          is_video: img.is_video || false
        })));
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) {
      alert("Please select a category.");
      return;
    }
    const activeImages = images.filter(img => !img.toDelete);
    if (activeImages.length === 0) {
      alert("Please ensure at least 1 image.");
      return;
    }
    if (activeImages.length > 5) {
      alert("Maximum 5 images allowed.");
      return;
    }

    setSaving(true);
    
    // 1. Update Product
    await supabase!.from('products').update({
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      stock: Number(formData.stock),
      category_id: formData.category_id,
      video_url: formData.video_url || null,
      is_best_seller: formData.is_best_seller
    }).eq('id', id);

    // 2. Process Images
// ... rest of logic
    for (const [index, img] of activeImages.entries()) {
      if (img.id) {
        // Update existing
        await supabase!.from('product_images').update({
          is_cover: img.is_cover,
          is_video: img.is_video,
          display_order: index
        }).eq('id', img.id);
      } else {
        // Insert new
        await supabase!.from('product_images').insert({
          product_id: id,
          image_url: img.url,
          is_cover: img.is_cover,
          is_video: img.is_video,
          display_order: index
        });
      }
    }

    // Process deletes
    const toDelete = images.filter(img => img.toDelete && img.id);
    for (const img of toDelete) {
      await supabase!.from('product_images').delete().eq('id', img.id);
    }

    setSaving(false);
    router.push('/admin/products');
  };

  const setAsCover = (index: number) => {
    const updated = images.map((img, i) => ({ ...img, is_cover: i === index }));
    setImages(updated);
  };

  const removeImage = (index: number) => {
    const updated = [...images];
    if (updated[index].id) {
      updated[index].toDelete = true;
    } else {
      updated.splice(index, 1);
    }
    setImages(updated);
  };

  const handleMediaUpload = (url: string, isVideo: boolean) => {
    setImages([...images, { url, is_cover: images.filter(i => !i.toDelete).length === 0, is_video: isVideo }]);
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Edit Product</h2>
        <button onClick={() => router.push('/admin/products')} className="text-gray-400 hover:text-white">Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="gap-8 grid grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6 bg-[#111] p-6 rounded-xl border border-[#333]">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
            <input required type="text" className="w-full bg-[#222] border border-[#333] rounded px-4 py-2 text-white focus:border-[#D4AF37] outline-none" 
                   value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea rows={4} className="w-full bg-[#222] border border-[#333] rounded px-4 py-2 text-white focus:border-[#D4AF37] outline-none" 
                   value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Price ($)</label>
              <input required type="number" step="0.01" className="w-full bg-[#222] border border-[#333] rounded px-4 py-2 text-white focus:border-[#D4AF37] outline-none" 
                     value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Stock Quantity</label>
              <input required type="number" className="w-full bg-[#222] border border-[#333] rounded px-4 py-2 text-white focus:border-[#D4AF37] outline-none" 
                     value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
            {loadingCats ? (
              <div className="w-full bg-[#222] border border-[#333] rounded px-4 py-2 flex items-center gap-2 text-gray-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading categories...
              </div>
            ) : (
              <select 
                required
                className="w-full bg-[#222] border border-[#333] rounded px-4 py-2 text-white focus:border-[#D4AF37] outline-none appearance-none" 
                value={formData.category_id} 
                onChange={e => setFormData({...formData, category_id: e.target.value})}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            )}
            {categories.length === 0 && !loadingCats && (
              <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                <span>⚠️</span> No categories found. <Link href="/admin/categories" className="underline font-bold">Create one.</Link>
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Video URL (Optional)</label>
            <input type="url" className="w-full bg-[#222] border border-[#333] rounded px-4 py-2 text-white focus:border-[#D4AF37] outline-none" 
                   value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})} placeholder="https://example.com/video.mp4" />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="isBestSeller" 
              checked={formData.is_best_seller} 
              onChange={e => setFormData({ ...formData, is_best_seller: e.target.checked })} 
              className="rounded border-[#333] text-[#D4AF37] focus:ring-[#D4AF37] w-4 h-4 bg-[#222]" 
            />
            <label htmlFor="isBestSeller" className="text-sm text-gray-400 font-medium cursor-pointer">Mark as Best Seller</label>
          </div>
        </div>

        <div className="space-y-6 bg-[#111] p-6 rounded-xl border border-[#333] h-fit">
          <h3 className="font-medium text-white">Images</h3>
          <div className="space-y-3">
            {images.filter(img => !img.toDelete).map((img, i) => {
              const originalIndex = images.indexOf(img);
              return (
                <div key={originalIndex} className={`flex items-center gap-3 p-2 border rounded ${img.is_cover ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#333] bg-[#222]'}`}>
                  {img.is_video ? (
                    <video src={img.url} className="w-16 h-16 object-cover rounded bg-black" />
                  ) : (
                    <img src={img.url} className="w-16 h-16 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    {img.is_cover ? (
                       <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Cover Image</span>
                    ) : (
                       <button type="button" onClick={() => setAsCover(originalIndex)} className="text-xs text-gray-400 hover:text-white underline">Set as Cover</button>
                    )}
                    {img.is_video && <span className="ml-2 text-xs bg-gray-700 text-white px-2 py-0.5 rounded-full">Video</span>}
                  </div>
                  <button type="button" onClick={() => removeImage(originalIndex)} className="text-red-500 hover:text-red-400 p-1">
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          {images.filter(i => !i.toDelete).length < 5 && (
            <MediaUpload 
              bucketName="jewelry_images" 
              onUploadComplete={handleMediaUpload} 
              buttonText="Upload Image/Video" 
              className="mt-4"
            />
          )}
        </div>

        <div className="md:col-span-3 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className={`bg-[#D4AF37] hover:bg-[#c29c30] text-black font-semibold px-8 py-3 rounded text-lg transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
