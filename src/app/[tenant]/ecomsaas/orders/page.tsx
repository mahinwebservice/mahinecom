// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ShoppingBag, TrendingUp, Clock, CheckCircle2, XCircle, Printer, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function TenantOrdersPage() {
  const params = useParams();
  const tenantId = (params?.tenant as string) || '';

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      const snap = await getDocs(collection(db, `tenants/${tenantId}/orders`));
      const ordersData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort newest first
      ordersData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) fetchOrders();
  }, [tenantId]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, `tenants/${tenantId}/orders/${orderId}`), {
        status: newStatus
      });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const totalSales = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending' || !o.status).length;
  const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => (o.status || 'pending') === filter);

  return (
    <div className="p-8 md:p-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Orders & Sales</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all customer orders and track live store revenue.</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
        >
          Refresh Orders
        </button>
      </div>

      {/* KPI Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Sales</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">৳ {totalSales.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{orders.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Pending Orders</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{pendingOrders}</h3>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-bold text-slate-900">Recent Customer Orders</h2>
          <div className="flex gap-2">
            {['all', 'pending', 'processing', 'delivered', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${filter === tab ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
                <th className="p-4">Customer Details</th>
                <th className="p-4">Items / Total</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">No orders found.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{order.name || 'Anonymous'}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{order.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 max-w-xs truncate">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{order.address || order.city || 'No address'}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-black text-slate-900">৳ {Number(order.total || 0).toLocaleString()}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {order.items?.length || 0} items
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold uppercase bg-slate-100 text-slate-700">
                        {order.paymentMethod || 'COD'}
                      </span>
                    </td>

                    <td className="p-4">
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-xs font-bold p-1.5 rounded-lg border border-slate-200 outline-none bg-white"
                      >
                        <option value="pending">🟡 Pending</option>
                        <option value="processing">🔵 Processing</option>
                        <option value="delivered">🟢 Delivered</option>
                        <option value="cancelled">🔴 Cancelled</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <Link
                        href={`/${tenantId}/admin/print/invoice/${order.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
