'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import { FadeIn, SlideUp } from "@/components/ui/FadeIn";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { downloadInvoice } from '@/lib/invoice';

export default function MyAccountPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase!.auth.getSession();
      if (!session) {
        // Just show a login prompt for now since we don't have a dedicated user login page yet
        setLoading(false);
        return;
      }
      
      setUser(session.user);
      
      // Fetch user's orders with items for invoice generation
      const { data } = await supabase!
        .from('orders')
        .select('*, order_items(*, products(name))')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (data) setOrders(data);
      
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase!.auth.signOut();
    setUser(null);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-4">
          <FadeIn className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl text-gray-900 uppercase tracking-wider mb-4">
              My <span className="text-gold-500 italic font-light">Account</span>
            </h1>
          </FadeIn>

          {loading ? (
            <div className="text-center text-gray-500 animate-pulse">Loading your account details...</div>
          ) : !user ? (
            <SlideUp className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md mx-auto">
              <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4">Not Logged In</h2>
              <p className="text-gray-500 mb-8">Please log in to view your account details, order history, and saved items.</p>
              <button 
                onClick={() => alert("User authentication flow to be implemented based on requirements.")}
                className="bg-gold-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-gold-500 transition-colors w-full"
              >
                Sign In / Register
              </button>
            </SlideUp>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Sidebar */}
              <SlideUp className="md:col-span-1">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="mb-8 pb-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold uppercase tracking-widest text-gray-900 truncate">{user.email}</h2>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Royal Member</p>
                  </div>
                  <nav className="space-y-2">
                    <button className="w-full text-left px-4 py-3 rounded-xl bg-gold-50 text-gold-700 font-bold uppercase tracking-widest text-xs">
                      Order History
                    </button>
                    <Link href="/wishlist" className="block w-full text-left px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 font-bold uppercase tracking-widest text-xs transition-colors">
                      Wishlist
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-bold uppercase tracking-widest text-xs transition-colors mt-4">
                      Logout
                    </button>
                  </nav>
                </div>
              </SlideUp>

              {/* Main Content */}
              <SlideUp delay={0.1} className="md:col-span-2">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-6 border-b border-gray-100 pb-4">Recent Orders</h3>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                      <Link href="/shop" className="text-gold-600 font-bold uppercase tracking-widest text-xs hover:underline">
                        Start Shopping →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Order #{order.id.split('-')[0]}</p>
                            <p className="font-bold text-gray-900">₹{order.total_amount.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="inline-block bg-gold-50 text-gold-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                              {order.status}
                            </span>
                            <Link href="/track-order" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gold-600 transition-colors">
                              Track
                            </Link>
                            <button 
                              onClick={() => downloadInvoice(order, order.order_items || [])}
                              className="text-xs font-bold uppercase tracking-widest text-gold-600 hover:text-gold-700 transition-colors border border-gold-200 px-3 py-1 rounded"
                            >
                              Invoice
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SlideUp>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
