'use client';
import { useState } from 'react';
import { supabase } from '@/lib/db';
import { FadeIn, SlideUp } from "@/components/ui/FadeIn";
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) return;
    
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      // First check if it's a valid UUID (since our orders use UUIDs)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      let data, error;
      if (uuidRegex.test(orderId.trim())) {
        const res = await supabase!
          .from('orders')
          .select('*, order_items(*, products(*))')
          .eq('id', orderId.trim())
          .eq('customer_email', email.trim())
          .single();
        data = res.data;
        error = res.error;
      } else {
        // If not UUID, maybe they have a short ID we can implement later, for now error.
        throw new Error('Invalid Order ID format. It should look like a long code.');
      }

      if (error || !data) {
        throw new Error('Order not found. Please check your details.');
      }

      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Failed to track order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': return 1;
      case 'confirmed': return 1;
      case 'paid': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      case 'cancelled': return -1;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <FadeIn className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl text-gray-900 uppercase tracking-wider mb-4">
              Track <span className="text-gold-500 italic font-light">Order</span>
            </h1>
            <p className="text-gray-500 uppercase tracking-widest text-sm">Enter your details to track your package</p>
          </FadeIn>

          <SlideUp>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto mb-12">
              <form onSubmit={handleTrack} className="space-y-4">
                <div>
                  <label htmlFor="orderId" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Order ID</label>
                  <input 
                    required 
                    type="text" 
                    id="orderId" 
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-gold-500 transition-colors" 
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-gold-500 transition-colors" 
                  />
                </div>
                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                <button disabled={loading} type="submit" className="w-full bg-gray-900 text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-gold-600 transition-colors disabled:opacity-50">
                  {loading ? 'Tracking...' : 'Track Order'}
                </button>
              </form>
            </div>
          </SlideUp>

          {order && (
            <SlideUp delay={0.2} className="bg-white p-8 rounded-2xl shadow-sm border border-gold-100">
              <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest mb-1">Order Status</h2>
                  <p className="text-gray-500 text-sm">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-gold-50 text-gold-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {order.status}
                  </span>
                </div>
              </div>

              {order.status !== 'cancelled' ? (
                <div className="relative mb-12">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
                  <div className="absolute top-1/2 left-0 h-1 bg-gold-500 -translate-y-1/2 z-0 transition-all duration-1000" style={{ width: `${((getStatusStep(order.status) - 1) / 3) * 100}%` }}></div>
                  
                  <div className="relative z-10 flex justify-between items-center">
                    {[
                      { step: 1, icon: Clock, label: 'Order Placed' },
                      { step: 2, icon: Package, label: 'Processing' },
                      { step: 3, icon: Truck, label: 'Shipped' },
                      { step: 4, icon: CheckCircle, label: 'Delivered' }
                    ].map((s) => (
                      <div key={s.step} className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white transition-colors duration-500
                          ${getStatusStep(order.status) >= s.step ? 'bg-gold-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          <s.icon size={20} />
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold mt-3 ${getStatusStep(order.status) >= s.step ? 'text-gray-900' : 'text-gray-400'}`}>
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl text-center font-bold uppercase tracking-widest mb-12">
                  Order Cancelled
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Order Items</h3>
                <div className="space-y-4">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center">
                          {/* We don't have direct access to cover image here easily without a complex query, just show name or placeholder */}
                          <span className="text-xs text-gray-400 font-bold">ITEM</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">{item.products?.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900">₹{(item.price_at_time * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </SlideUp>
          )}
        </div>
      </main>
    </div>
  );
}
