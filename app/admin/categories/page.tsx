'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/db';
import { Plus, Trash2, Tag, Loader2, Image as ImageIcon, X, Edit2 } from 'lucide-react';
import { compressImageToWebP } from '@/lib/image-utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
}

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [editingCat, setEditingCat] = useState<Partial<Category>>({ name: '', slug: '', description: '', image_url: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase!.from('categories').select('*').order('name');
    if (data) setCategories(data);
    if (error) console.error('Error fetching categories:', error.message);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setFormError(null);
    setEditingCat({ name: '', slug: '', description: '', image_url: '' });
    setImageFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setFormError(null);
    setEditingCat(cat);
    setImageFile(null);
    setPreviewUrl(cat.image_url || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCat({ name: '', slug: '', description: '', image_url: '' });
    setImageFile(null);
    setPreviewUrl(null);
    setFormError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!editingCat.name || !editingCat.slug) {
      setFormError('Name and Slug are required');
      return;
    }
    setSaving(true);
    
    let finalImageUrl = editingCat.image_url || '';
    if (imageFile) {
      try {
        const compressedFile = await compressImageToWebP(imageFile);
        const fileName = `category-${Date.now()}.webp`;
        const { error: uploadError } = await supabase!.storage.from('categories').upload(fileName, compressedFile, { upsert: true });
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase!.storage.from('categories').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      } catch (err: any) {
        setFormError('Failed to upload image: ' + err.message);
        setSaving(false);
        return;
      }
    }

    const categoryData = { 
      name: editingCat.name, 
      slug: editingCat.slug, 
      description: editingCat.description, 
      image_url: finalImageUrl 
    };

    if (editingCat.id) {
      // Update
      const { error } = await supabase!.from('categories').update(categoryData).eq('id', editingCat.id);
      if (error) {
        if (error.code === '23505' || error.message.includes('unique constraint')) {
          setFormError(`A category with the name "${editingCat.name}" already exists.`);
        } else {
          setFormError('Error updating category: ' + error.message);
        }
      } else {
        closeModal();
        fetchCategories();
      }
    } else {
      // Insert
      const { error } = await supabase!.from('categories').insert([categoryData]);
      if (error) {
        if (error.code === '23505' || error.message.includes('unique constraint')) {
          setFormError(`A category with the name "${editingCat.name}" already exists.`);
        } else {
          setFormError('Error creating category: ' + error.message);
        }
      } else {
        closeModal();
        fetchCategories();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? Products linked to this category will be uncategorized.`)) return;
    const { error } = await supabase!.from('categories').delete().eq('id', id);
    if (error) {
      alert('Error deleting category: ' + error.message);
    } else {
      fetchCategories();
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const onNameChange = (name: string) => {
    setEditingCat({ ...editingCat, name, slug: generateSlug(name) });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setEditingCat({ ...editingCat, image_url: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-gold-600" />
            Category Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">Organize your products into meaningful collections.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-gold-600 hover:bg-gold-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-gold-500/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-16">Image</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Loading categories...</p>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Tag className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                    <p className="text-gray-900 font-semibold">No categories found</p>
                    <p className="text-gray-400 text-sm mt-1">Create your first category by clicking the Add button above.</p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                          <ImageIcon className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{cat.name}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-xs">{cat.description || 'No description'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono">{cat.slug}</code>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(cat)}
                          className="p-2 text-gray-400 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition-all"
                          title="Edit Category"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Category"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingCat.id ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-start gap-2">
                  <X className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{formError}</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Royal Necklaces"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all"
                  value={editingCat.name}
                  onChange={(e) => onNameChange(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Slug (URL Path)</label>
                <input 
                  required
                  type="text" 
                  placeholder="royal-necklaces"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all font-mono"
                  value={editingCat.slug}
                  onChange={(e) => setEditingCat({ ...editingCat, slug: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description (Optional)</label>
                <textarea 
                  rows={3}
                  placeholder="Describe this collection..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all"
                  value={editingCat.description || ''}
                  onChange={(e) => setEditingCat({ ...editingCat, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category Image (Optional)</label>
                <div className="flex flex-col gap-3">
                  {previewUrl ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-500 p-1.5 rounded-full shadow-sm transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-gold-400 transition-colors">
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500 font-medium">Click to upload image</span>
                      <span className="text-xs text-gray-400 mt-1">Automatically compressed to WebP (~50kb)</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-100 flex gap-3">
                <button 
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-[2] bg-gold-600 hover:bg-gold-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-gold-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editingCat.id ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
