'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import Link from 'next/link';
import { Check, X, Trash2 } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase!
      .from('reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false });
    if (data) setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase!.from('reviews').update({ status }).eq('id', id);
    fetchReviews();
  };

  const deleteReview = async (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      await supabase!.from('reviews').delete().eq('id', id);
      fetchReviews();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Reviews</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No reviews found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold border-b">Customer</th>
                  <th className="p-4 font-semibold border-b">Product</th>
                  <th className="p-4 font-semibold border-b">Rating</th>
                  <th className="p-4 font-semibold border-b">Comment</th>
                  <th className="p-4 font-semibold border-b">Status</th>
                  <th className="p-4 font-semibold border-b text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {reviews.map((review) => (
                  <tr key={review.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{review.customer_name}</td>
                    <td className="p-4 text-gray-600">
                      <Link href={`/shop/${review.product_id}`} className="hover:text-gold-600 hover:underline">
                        {review.products?.name}
                      </Link>
                    </td>
                    <td className="p-4">
                      <div className="flex text-gold-500">
                         {[...Array(5)].map((_, i) => (
                           <svg key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                         ))}
                       </div>
                    </td>
                    <td className="p-4 text-gray-600 max-w-xs truncate" title={review.comment}>
                      {review.comment}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${review.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          review.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      {review.status !== 'approved' && (
                        <button onClick={() => updateStatus(review.id, 'approved')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                          <Check size={16} />
                        </button>
                      )}
                      {review.status !== 'rejected' && (
                        <button onClick={() => updateStatus(review.id, 'rejected')} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Reject">
                          <X size={16} />
                        </button>
                      )}
                      <button onClick={() => deleteReview(review.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
    </div>
  );
}
