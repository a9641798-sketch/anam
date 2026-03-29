'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/db';
import { format } from 'date-fns';

type OrderItem = {
  id: string;
  quantity: number;
  price_at_time: number;
  product_id: string | null;
  products: {
    name: string;
    category: string | null;
  } | null;
};

type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  house_no: string | null;
  street_address: string | null;
  landmark: string | null;
  pincode: string | null;
  state: string | null;
  country: string | null;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  processing: 'text-blue-700 bg-blue-50 border-blue-200',
  shipped: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  delivered: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  cancelled: 'text-red-700 bg-red-50 border-red-200',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#B45309',
  processing: '#1D4ED8',
  shipped: '#4338CA',
  delivered: '#047857',
  cancelled: '#B91C1C',
};

export default function OrderDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(paramsPromise);
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      const { data: orderData, error: orderErr } = await supabaseAdmin!
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (orderErr || !orderData) {
        setError('Order not found.');
        setLoading(false);
        return;
      }
      setOrder(orderData as Order);

      const { data: itemsData } = await supabaseAdmin!
        .from('order_items')
        .select('id, quantity, price_at_time, product_id, products(name, category)')
        .eq('order_id', id);

      if (itemsData) setItems(itemsData as any);
      setLoading(false);
    }
    fetchOrder();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    if (!order) return;
    setUpdatingStatus(true);
    const { error: err } = await supabaseAdmin!
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);
    if (!err) {
      setOrder({ ...order, status: newStatus });
    }
    setUpdatingStatus(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-gray-100 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !order) return (
    <div className="text-center py-20 text-gray-500">
      <p className="text-lg font-semibold">{error || 'Order not found.'}</p>
      <Link href="/admin/orders" className="mt-4 inline-block text-amber-600 hover:underline text-sm font-medium">
        ← Back to Orders
      </Link>
    </div>
  );

  const shortId = order.id.split('-')[0].toUpperCase();
  const subtotal = items.reduce((s, i) => s + i.price_at_time * i.quantity, 0);

  const fullAddress = [
    order.house_no,
    order.street_address,
    order.landmark,
    order.state,
    order.pincode,
    order.country,
  ].filter(Boolean).join(', ');

  return (
    <>
      {/* ─── Print Styles ─── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-bill, #print-bill * { visibility: visible !important; }
          #print-bill {
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            height: auto !important;
            z-index: 9999 !important;
            background: white !important;
            padding: 24px !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="space-y-6 animate-in fade-in duration-500 no-print">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/orders"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Order #{shortId}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{format(new Date(order.created_at), 'MMMM d, yyyy · HH:mm')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Status Dropdown */}
            <select
              value={order.status}
              onChange={e => updateStatus(e.target.value)}
              disabled={updatingStatus}
              className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg border outline-none cursor-pointer transition-colors
                ${updatingStatus ? 'opacity-50 cursor-wait' : ''}
                ${STATUS_STYLES[order.status] || 'text-gray-700 bg-gray-50 border-gray-200'}`}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Print Bill Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Bill
            </button>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Customer + Address */}
          <div className="lg:col-span-1 space-y-4">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Customer</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-base font-bold text-gray-900">{order.customer_name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{order.customer_email}</p>
                </div>
                {order.customer_phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-semibold">{order.customer_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Delivery Address</h3>
              {fullAddress ? (
                <address className="not-italic text-sm text-gray-700 leading-relaxed space-y-1">
                  {order.house_no && <p className="font-semibold text-gray-900">{order.house_no}</p>}
                  {order.street_address && <p>{order.street_address}</p>}
                  {order.landmark && <p className="text-gray-500 text-xs">Near: {order.landmark}</p>}
                  <p>{[order.state, order.pincode].filter(Boolean).join(' – ')}</p>
                  {order.country && <p className="text-gray-400 text-xs uppercase tracking-wider">{order.country}</p>}
                </address>
              ) : (
                <p className="text-sm text-gray-400 italic">No address on file</p>
              )}
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Payment</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Method</span>
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border
                    ${order.payment_method === 'cod'
                      ? 'text-orange-700 bg-orange-50 border-orange-200'
                      : 'text-blue-700 bg-blue-50 border-blue-200'}`}>
                    {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border
                    ${order.payment_status === 'paid'
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                    {order.payment_status || 'pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-sm font-semibold text-gray-700">Total</span>
                  <span className="text-lg font-bold text-gray-900">₹{order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Items</h3>
              </div>

              {items.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-sm">No items found for this order</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Product</th>
                          <th className="px-6 py-3 font-semibold text-center">Qty</th>
                          <th className="px-6 py-3 font-semibold text-right">Unit Price</th>
                          <th className="px-6 py-3 font-semibold text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {items.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-gray-900">{item.products?.name || 'Deleted Product'}</p>
                              {item.products?.category && (
                                <p className="text-xs text-gray-400 mt-0.5 capitalize">{item.products.category}</p>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-gray-900">{item.quantity}</td>
                            <td className="px-6 py-4 text-right text-gray-600">₹{item.price_at_time.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right font-bold text-gray-900">
                              ₹{(item.price_at_time * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Totals */}
                  <div className="px-6 py-4 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-100 pt-2">
                      <span>Total</span>
                      <span>₹{order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────── */}
      {/* PRINT BILL — only visible when printing        */}
      {/* ─────────────────────────────────────────────── */}
      <div id="print-bill" ref={printRef} style={{
        display: 'none',
        fontFamily: 'Georgia, serif',
        color: '#111',
        background: '#fff',
        padding: '24px',
        maxWidth: '420px',
        margin: '0 auto',
      }}>
        {/* Store Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #111', paddingBottom: '16px' }}>
          <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Georgia, serif' }}>
            HER HIGHNESS
          </div>
          <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.15em', marginTop: '4px', textTransform: 'uppercase' }}>
            Fine Jewellery
          </div>
        </div>

        {/* Bill Title */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#555', marginBottom: '4px' }}>Delivery Bill</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.1em' }}>#{shortId}</div>
          <div style={{ fontSize: '11px', color: '#777', marginTop: '4px' }}>
            {format(new Date(order.created_at), 'dd MMM yyyy, HH:mm')}
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{
            display: 'inline-block',
            fontSize: '10px',
            fontWeight: 'bold',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: STATUS_COLORS[order.status] || '#374151',
            border: `1.5px solid ${STATUS_COLORS[order.status] || '#374151'}`,
            borderRadius: '99px',
            padding: '3px 12px',
          }}>
            {order.status}
          </span>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px dashed #ccc', marginBottom: '16px' }} />

        {/* Customer Details */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', marginBottom: '10px', fontWeight: 'bold' }}>
            Deliver To
          </div>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ color: '#777', paddingBottom: '6px', width: '35%', verticalAlign: 'top', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Name</td>
                <td style={{ fontWeight: 'bold', paddingBottom: '6px', textTransform: 'uppercase' }}>{order.customer_name}</td>
              </tr>
              {order.customer_phone && (
                <tr>
                  <td style={{ color: '#777', paddingBottom: '6px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Phone</td>
                  <td style={{ fontWeight: 'bold', paddingBottom: '6px' }}>{order.customer_phone}</td>
                </tr>
              )}
              {fullAddress && (
                <tr>
                  <td style={{ color: '#777', paddingBottom: '6px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', verticalAlign: 'top' }}>Address</td>
                  <td style={{ paddingBottom: '6px', lineHeight: '1.6', textTransform: 'uppercase' }}>
                    {order.house_no && <div style={{ fontWeight: 'bold' }}>{order.house_no}</div>}
                    {order.street_address && <div>{order.street_address}</div>}
                    {order.landmark && <div style={{ color: '#777', fontSize: '11px' }}>Near: {order.landmark}</div>}
                    <div>{[order.state, order.pincode].filter(Boolean).join(' – ')}</div>
                    {order.country && <div style={{ color: '#999', fontSize: '10px' }}>{order.country}</div>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px dashed #ccc', marginBottom: '16px' }} />

        {/* Items Table */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', marginBottom: '10px', fontWeight: 'bold' }}>
            Items
          </div>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ color: '#999', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '6px' }}>Item</td>
                <td style={{ color: '#999', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '6px', textAlign: 'center' }}>Qty</td>
                <td style={{ color: '#999', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '6px', textAlign: 'right' }}>Price</td>
                <td style={{ color: '#999', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '6px', textAlign: 'right' }}>Total</td>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f3f3f3' }}>
                  <td style={{ padding: '7px 0', fontWeight: '600', maxWidth: '140px' }}>
                    {item.products?.name || 'Product'}
                  </td>
                  <td style={{ padding: '7px 0', textAlign: 'center', color: '#555' }}>×{item.quantity}</td>
                  <td style={{ padding: '7px 0', textAlign: 'right', color: '#555' }}>₹{item.price_at_time.toFixed(2)}</td>
                  <td style={{ padding: '7px 0', textAlign: 'right', fontWeight: 'bold' }}>₹{(item.price_at_time * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ borderTop: '2px solid #111', paddingTop: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#777', marginBottom: '6px' }}>
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold' }}>
            <span>Total</span>
            <span>₹{order.total_amount.toFixed(2)}</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '10px', color: '#777', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {order.payment_method === 'cod' ? '💵 Cash on Delivery' : '✓ Paid Online'}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px dashed #ccc', marginBottom: '16px' }} />

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '10px', color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Thank you for your order · Her Highness · Fine Jewellery
        </div>
      </div>

      {/* Show print bill on screen too (styled nicely) */}
      <style>{`
        @media screen {
          #print-bill { display: none !important; }
        }
        @media print {
          #print-bill { display: block !important; }
        }
      `}</style>
    </>
  );
}
