'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import { Loader2, Plus, X, Edit, Trash2 } from 'lucide-react';

interface Announcement {
  id: string;
  message: string;
  is_active: boolean;
  display_order: number;
}

export default function AnnouncementsAdmin() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    message: '',
    is_active: true,
    display_order: 0
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase!
      .from('announcements')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error(error);
    } else if (data) {
      setAnnouncements(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditingId(announcement.id);
      setFormData({
        message: announcement.message,
        is_active: announcement.is_active,
        display_order: announcement.display_order
      });
    } else {
      setEditingId(null);
      setFormData({
        message: '',
        is_active: true,
        display_order: announcements.length
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        const { error } = await supabase!
          .from('announcements')
          .update({
            message: formData.message,
            is_active: formData.is_active,
            display_order: formData.display_order
          })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase!
          .from('announcements')
          .insert([{
            message: formData.message,
            is_active: formData.is_active,
            display_order: formData.display_order
          }]);
        if (error) throw error;
      }
      handleCloseModal();
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    
    try {
      const { error } = await supabase!.from('announcements').delete().eq('id', id);
      if (error) throw error;
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.message || "Could not delete");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase!
        .from('announcements')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      fetchAnnouncements();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading uppercase text-gold-600">Manage Announcements</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded text-sm uppercase tracking-wider hover:bg-gold-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Announcement
        </button>
      </div>

      <div className="bg-white border border-gold-100 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No announcements found. Add one to display a scrolling banner.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gold-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-medium">Message</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-center">Order</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {announcements.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {item.message}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleActive(item.id, item.is_active)}
                        className={`text-xs px-2 py-1 rounded-full uppercase tracking-wider font-bold ${
                          item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.is_active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="p-4 text-center text-sm text-gray-500">
                      {item.display_order}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-heading font-semibold uppercase tracking-wider text-gray-900">
                {editingId ? 'Edit Announcement' : 'Add Announcement'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Announcement Text</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all text-sm h-24 resize-none"
                  placeholder="e.g. 🚚 Free Shipping on All Orders | 🎉 Flat 20% OFF"
                />
                <p className="text-xs text-gray-400">Emojis are supported. Use pipe (|) to visually separate items.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Display Order</label>
                <input
                  type="number"
                  required
                  value={formData.display_order}
                  onChange={e => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 text-gold-600 rounded border-gray-300 focus:ring-gold-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 font-medium cursor-pointer">
                  Active (Display on website)
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gray-900 text-white font-bold uppercase tracking-[0.2em] py-4 rounded-lg text-xs hover:bg-gold-600 transition-colors disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? 'Saving...' : 'Save Announcement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
