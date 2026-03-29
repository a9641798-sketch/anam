import { supabase } from '@/lib/db';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminDashboard() {
  const { count: productCount } = await supabase!.from('products').select('*', { count: 'exact', head: true });
  const { count: bannerCount } = await supabase!.from('banners').select('*', { count: 'exact', head: true });
  const { count: orderCount } = await supabase!.from('orders').select('*', { count: 'exact', head: true });

  const stats = [
    { name: 'Total Products', value: productCount || 0, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'bg-blue-50 text-blue-600 border-blue-100', href: '/admin/products' },
    { name: 'Active Banners', value: bannerCount || 0, icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'bg-green-50 text-green-600 border-green-100', href: '/admin/banners' },
    { name: 'Total Orders', value: orderCount || 0, icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', color: 'bg-purple-50 text-purple-600 border-purple-100', href: '/admin/orders' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/" className="px-4 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
             View Live Store
           </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col items-start hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl ${stat.color} border mb-4 shadow-sm`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path></svg>
            </div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.name}</h3>
            <p className="text-4xl font-black text-gray-900 tracking-tight mb-4">{stat.value}</p>
            <Link href={stat.href} className="text-sm text-gold-600 hover:text-gold-700 font-semibold flex items-center gap-1 group mt-auto">
              Manage
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </Link>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
         {/* Recent Orders Stub */}
         <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Recent Orders</h3>
              <Link href="/admin/orders" className="text-xs font-semibold text-gold-600 hover:text-gold-700">View All</Link>
            </div>
            <div className="p-10 text-center flex flex-col items-center justify-center">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
               </div>
               <p className="text-sm font-medium text-gray-500">Go to the Orders tab to fulfill customer purchases.</p>
            </div>
         </div>

         {/* Quick Actions Stub */}
         <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Quick Actions</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 flex-1">
               <Link href="/admin/products/new" className="border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-6 text-gray-500 hover:text-gold-600 hover:border-gold-500 hover:bg-gold-50 transition-all group">
                 <svg className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                 <span className="text-sm font-semibold tracking-wide">Add Product</span>
               </Link>
               <Link href="/admin/banners" className="border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-6 text-gray-500 hover:text-gold-600 hover:border-gold-500 hover:bg-gold-50 transition-all group">
                 <svg className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                 <span className="text-sm font-semibold tracking-wide">Update Banner</span>
               </Link>
               <Link href="/admin/settings" className="border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-6 text-gray-500 hover:text-gold-600 hover:border-gold-500 hover:bg-gold-50 transition-all group">
                 <svg className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                 <span className="text-sm font-semibold tracking-wide">Store Settings</span>
               </Link>
            </div>
         </div>
      </div>
    </div>
  );
}
