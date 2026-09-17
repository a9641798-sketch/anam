'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import { Plus, Trash2, Edit2 } from 'lucide-react';

type Coupon = {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  expiry_date: string | null;
  is_active: boolean;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [minOrderValue, setMinOrderValue] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data } = await supabase!
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setCoupons(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(0);
    setMinOrderValue(0);
    setExpiryDate('');
    setIsActive(true);
  };

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCode(coupon.code);
      setDiscountType(coupon.discount_type);
      setDiscountValue(coupon.discount_value);
      setMinOrderValue(coupon.min_order_value);
      setExpiryDate(coupon.expiry_date ? new Date(coupon.expiry_date).toISOString().split('T')[0] : '');
      setIsActive(coupon.is_active);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: code.toUpperCase().trim(),
      discount_type: discountType,
      discount_value: discountValue,
      min_order_value: minOrderValue,
      expiry_date: expiryDate || null,
      is_active: isActive
    };

    if (editingCoupon) {
      await supabase!.from('coupons').update(payload).eq('id', editingCoupon.id);
    } else {
      await supabase!.from('coupons').insert(payload);
    }

    setIsModalOpen(false);
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      await supabase!.from('coupons').delete().eq('id', id);
      fetchCoupons();
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await supabase!.from('coupons').update({ is_active: !currentStatus }).eq('id', id);
    fetchCoupons();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Coupons</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No coupons found. Create one to get started!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold border-b">Code</th>
                  <th className="p-4 font-semibold border-b">Discount</th>
                  <th className="p-4 font-semibold border-b">Min. Order</th>
                  <th className="p-4 font-semibold border-b">Expiry</th>
                  <th className="p-4 font-semibold border-b">Status</th>
                  <th className="p-4 font-semibold border-b text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gold-600 uppercase tracking-widest">{coupon.code}</td>
                    <td className="p-4 font-medium text-gray-900">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                    </td>
                    <td className="p-4 text-gray-600">₹{coupon.min_order_value}</td>
                    <td className="p-4 text-gray-600">
                      {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize cursor-pointer
                        ${coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <button onClick={() => openModal(coupon)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteCoupon(coupon.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Coupon Code</label>
                <input
                  required
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-gold-500 uppercase"
                  placeholder="e.g. SUMMER20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Type</label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as any)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-gold-500 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Discount Value</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="any"
                    value={discountValue}
                    onChange={e => setDiscountValue(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Minimum Order Value (₹)</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={minOrderValue}
                  onChange={e => setMinOrderValue(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-gold-600 focus:ring-gold-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 font-medium">Coupon is Active</label>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-gold-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-gold-700 transition-colors shadow-lg"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
