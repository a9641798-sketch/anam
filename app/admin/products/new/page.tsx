'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/admin/ImageUpload';
import { X, Loader2, Star } from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  price: number | '';
  stock: number | '';
  category_id: string;
  is_best_seller: boolean;
  video_url: string;
}

export default function NewProduct() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>({
    name: '', description: '', price: '', stock: '', category_id: '', is_best_seller: false, video_url: ''
  });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [images, setImages] = useState<{ url: string; is_cover: boolean }[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    supabase!.from('categories').select('id, name').order('name').then(({ data }) => {
      if (data) setCategories(data);
      setLoadingCats(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) { alert('Please select a category.'); return; }
    if (images.length === 0) { alert('Please upload at least 1 image.'); return; }
    setSaving(true);

    const { data: product, error: productError } = await supabase!
      .from('products')
      .insert({
        name: formData.name, description: formData.description,
        price: Number(formData.price), stock: Number(formData.stock),
        category_id: formData.category_id,
        is_best_seller: formData.is_best_seller,
        video_url: formData.video_url || null
      })
      .select().single();

    if (productError || !product) {
      alert('Error creating product: ' + productError?.message);
      setSaving(false);
      return;
    }

    const imageRecords = images.map((img, i) => ({
      product_id: product.id, image_url: img.url, is_cover: img.is_cover, display_order: i
    }));
    await supabase!.from('product_images').insert(imageRecords);

    setSaving(false);
    router.push('/admin/products');
  };

  const handleImageUpload = (url: string) => {
    if (images.length >= 5) { alert('Maximum 5 images allowed.'); return; }
    setImages([...images, { url, is_cover: images.length === 0 }]);
  };

  const setAsCover = (idx: number) =>
    setImages(images.map((img, i) => ({ ...img, is_cover: i === idx })));

  const removeImage = (idx: number) => {
    const updated = images.filter((_, i) => i !== idx);
    if (updated.length > 0 && !updated.some(i => i.is_cover)) updated[0].is_cover = true;
    setImages(updated);
  };

  const inputClass = 'w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-shadow';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Product</h2>
          <p className="text-sm text-gray-500 mt-1">Fill in the details and upload images.</p>
        </div>
        <Link href="/admin/products" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100">
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <h3 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-4">Product Information</h3>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Product Name *</label>
            <input required type="text" className={inputClass} placeholder="e.g. Gold Leaf Necklace"
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Description</label>
            <textarea rows={4} className={inputClass} placeholder="Describe the product..."
              value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Price (₹) *</label>
              <input required type="number" step="0.01" min="0" className={inputClass} placeholder="0.00"
                value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value === '' ? '' : Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Stock Qty *</label>
              <input required type="number" min="0" className={inputClass} placeholder="0"
                value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value === '' ? '' : Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Category *</label>
            {loadingCats ? (
              <div className={`${inputClass} flex items-center gap-2 text-gray-400`}>
                <Loader2 className="w-4 h-4 animate-spin" /> Loading categories...
              </div>
            ) : (
              <select required className={inputClass} value={formData.category_id}
                onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                <option value="">Select a category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            )}
            {categories.length === 0 && !loadingCats && (
              <p className="text-xs text-amber-600 mt-2">
                ⚠️ No categories found. <Link href="/admin/categories" className="underline">Create one first.</Link>
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Video URL (Optional)</label>
            <input type="url" className={inputClass} placeholder="https://example.com/video.mp4"
              value={formData.video_url} onChange={e => setFormData({ ...formData, video_url: e.target.value })} />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="isBestSeller" 
              checked={formData.is_best_seller} 
              onChange={e => setFormData({ ...formData, is_best_seller: e.target.checked })} 
              className="rounded border-gray-300 text-gold-600 focus:ring-gold-500 w-4 h-4" 
            />
            <label htmlFor="isBestSeller" className="text-sm text-gray-700 font-semibold cursor-pointer">Mark as Best Seller</label>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] h-fit">
          <h3 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-4">Images <span className="text-gray-400 font-normal">(max 5)</span></h3>
          <p className="text-xs text-gray-400 leading-relaxed">First image becomes the cover shown in the storefront.</p>

          <div className="space-y-3">
            {images.map((img, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${img.is_cover ? 'border-gold-300 bg-gold-50/50' : 'border-gray-200'}`}>
                <img src={img.url} alt="upload" className="w-14 h-14 object-cover rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  {img.is_cover ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-gold-700 uppercase tracking-wider">
                      <Star className="w-3 h-3 fill-current" /> Cover
                    </span>
                  ) : (
                    <button type="button" onClick={() => setAsCover(i)} className="text-xs text-gray-400 hover:text-gold-600 font-medium transition-colors">
                      Set as Cover
                    </button>
                  )}
                </div>
                <button type="button" onClick={() => removeImage(i)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {images.length < 5 && (
            <ImageUpload bucketName="jewelry_images" onUploadComplete={handleImageUpload} buttonText="Upload Image" className="mt-2" />
          )}
        </div>

        {/* Submit */}
        <div className="md:col-span-3 flex justify-end gap-3">
          <Link href="/admin/products" className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className={`bg-gold-600 hover:bg-gold-700 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors shadow-md flex items-center gap-2 ${saving ? 'cursor-not-allowed' : ''}`}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
