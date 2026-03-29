'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAdmin } from '@/lib/db';
import { format } from 'date-fns';

type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  created_at: string;
};

const STATUS_TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  processing: 'text-blue-700 bg-blue-50 border-blue-200',
  shipped: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  delivered: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  cancelled: 'text-red-700 bg-red-50 border-red-200',
};

export default function OrdersAdmin() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabaseAdmin!
      .from('orders')
      .select('id, customer_name, customer_email, customer_phone, total_amount, status, payment_status, payment_method, created_at')
      .order('created_at', { ascending: false });
    if (data) setOrders(data as Order[]);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (e: React.MouseEvent, id: string, newStatus: string) => {
    e.stopPropagation(); // prevent row click navigation
    setUpdatingId(id);
    const { error } = await supabaseAdmin!.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } else {
      alert('Failed to update: ' + error.message);
    }
    setUpdatingId(null);
  };

  const filteredOrders = useMemo(() => {
    let list = orders;

    // Tab filter
    if (activeTab !== 'all') list = list.filter(o => o.status === activeTab);

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(o =>
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_email?.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.id.split('-')[0].toUpperCase().includes(q.toUpperCase())
      );
    }

    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      list = list.filter(o => new Date(o.created_at) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter(o => new Date(o.created_at) <= to);
    }

    return list;
  }, [orders, activeTab, search, dateFrom, dateTo]);

  // Counts per status
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    STATUS_TABS.slice(1).forEach(t => { c[t.key] = orders.filter(o => o.status === t.key).length; });
    return c;
  }, [orders]);

  // CSV Export
  const exportCSV = () => {
    if (filteredOrders.length === 0) return;
    const rows = [
      ['Order ID', 'Short ID', 'Customer', 'Email', 'Phone', 'Amount', 'Status', 'Payment Status', 'Payment Method', 'Date'],
      ...filteredOrders.map(o => [
        o.id,
        o.id.split('-')[0].toUpperCase(),
        o.customer_name,
        o.customer_email,
        o.customer_phone || '',
        o.total_amount.toFixed(2),
        o.status,
        o.payment_status,
        o.payment_method || 'online',
        format(new Date(o.created_at), 'yyyy-MM-dd HH:mm'),
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch('');
    setActiveTab('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasFilters = search || activeTab !== 'all' || dateFrom || dateTo;
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage fulfillments ·{' '}
            <span className="font-semibold text-gray-700">₹{totalRevenue.toFixed(2)}</span> in filtered orders
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={filteredOrders.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150
              ${activeTab === tab.key
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400 hover:text-amber-700'}`}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'opacity-70' : 'text-gray-400'}`}>
                ({counts[tab.key]})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="relative w-full sm:max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email or order ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-shadow"
              />
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="py-2 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-shadow text-gray-600"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="py-2 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-shadow text-gray-600"
              />
            </div>

            <div className="flex items-center gap-3 ml-auto shrink-0">
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-amber-600 font-semibold hover:underline"
                >
                  Clear filters
                </button>
              )}
              <span className="text-sm text-gray-400">
                {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Order</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-gray-100 border-t-amber-500 rounded-full animate-spin" />
                    <p className="text-gray-400 font-medium">Loading orders...</p>
                  </div>
                </td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="font-semibold text-gray-900">No orders found</p>
                    <p className="text-sm">{hasFilters ? 'Try different filters.' : 'Orders will appear here when placed.'}</p>
                    {hasFilters && (
                      <button onClick={clearFilters} className="text-amber-600 text-sm font-semibold mt-2 hover:underline">
                        Clear filters
                      </button>
                    )}
                  </div>
                </td></tr>
              ) : filteredOrders.map(order => (
                <tr
                  key={order.id}
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                  className="hover:bg-amber-50/30 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                      #{order.id.split('-')[0].toUpperCase()}
                    </span>
                    {order.payment_status === 'paid' && (
                      <div className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        Paid
                      </div>
                    )}
                    {order.payment_method === 'cod' && (
                      <div className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-orange-600">
                        <span>💵</span>
                        COD
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">{order.customer_name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{order.customer_email}</div>
                    {order.customer_phone && (
                      <div className="text-xs text-gray-400 mt-0.5">{order.customer_phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {format(new Date(order.created_at), 'MMM d, yyyy')}
                    <div className="text-xs text-gray-400 mt-0.5">{format(new Date(order.created_at), 'HH:mm')}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">₹{order.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={e => updateStatus(e as any, order.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      disabled={updatingId === order.id}
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors focus:ring-2 focus:ring-amber-500/20
                        ${updatingId === order.id ? 'opacity-50 cursor-wait' : ''}
                        ${STATUS_STYLES[order.status] || 'text-gray-700 bg-gray-50 border-gray-200'}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={e => { e.stopPropagation(); router.push(`/admin/orders/${order.id}`); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredOrders.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-900">{filteredOrders.length}</span>{' '}
            of <span className="font-semibold text-gray-900">{orders.length}</span> orders
          </div>
        )}
      </div>
    </div>
  );
}
