'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import { Plus, Trash2, Tag, Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', slug: '', description: '' });

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name || !newCat.slug) {
      alert('Name and Slug are required');
      return;
    }
    setSaving(true);
    const { error } = await supabase!.from('categories').insert([newCat]);
    if (error) {
      alert('Error creating category: ' + error.message);
    } else {
      setNewCat({ name: '', slug: '', description: '' });
      fetchCategories();
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
    setNewCat({ ...newCat, name, slug: generateSlug(name) });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-gold-600" />
            Category Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">Organize your products into meaningful collections.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Create New Category</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Royal Necklaces"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all"
                  value={newCat.name}
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
                  value={newCat.slug}
                  onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description (Optional)</label>
                <textarea 
                  rows={3}
                  placeholder="Describe this collection..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all"
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                />
              </div>
              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-gold-600 hover:bg-gold-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-gold-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Add Category
              </button>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Loading categories...</p>
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center">
                        <Tag className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                        <p className="text-gray-900 font-semibold">No categories found</p>
                        <p className="text-gray-400 text-sm mt-1">Create your first category using the form.</p>
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{cat.name}</div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-xs">{cat.description || 'No description'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono">{cat.slug}</code>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Category"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
