// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Phone, 
  MapPin, 
  Tag, 
  Truck, 
  ExternalLink, 
  X, 
  Send,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';

export default function TenantOrdersPage() {
  const params = useParams();
  const tenantId = (params?.tenant as string) || '';

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Courier Modal State
  const [courierModalOpen, setCourierModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [courierProvider, setCourierProvider] = useState<'steadfast' | 'pathao'>('steadfast');
  const [courierLoading, setCourierLoading] = useState(false);
  const [courierError, setCourierError] = useState<string | null>(null);
  const [courierSuccess, setCourierSuccess] = useState<string | null>(null);

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
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  // Open Courier Dispatch Modal
  const openCourierModal = (order: any) => {
    setSelectedOrder(order);
    setCourierError(null);
    setCourierSuccess(null);
    setCourierModalOpen(true);
  };

  // Submit Order to Courier via API Route
  const handleSendToCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setCourierLoading(true);
    setCourierError(null);
    setCourierSuccess(null);

    const customerName = selectedOrder.customerInfo?.name || selectedOrder.customer?.name || selectedOrder.name || 'সম্মানিত গ্রাহক';
    const customerPhone = selectedOrder.customerInfo?.phone || selectedOrder.customer?.phone || selectedOrder.phone || '';
    const customerAddress = selectedOrder.customerInfo?.address || selectedOrder.customer?.address || selectedOrder.address || 'ঠিকানা দেওয়া হয়নি';
    const codAmount = selectedOrder.total || 0;

    try {
      const res = await fetch('/api/courier/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          orderId: selectedOrder.id,
          courierType: courierProvider,
          recipientName: customerName,
          recipientPhone: customerPhone,
          recipientAddress: customerAddress,
          codAmount,
          city: selectedOrder.customerInfo?.city || '',
          zone: selectedOrder.customerInfo?.zone || '',
          note: `অর্ডার #${selectedOrder.id.slice(0, 8)}`
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'কুরিয়ার বুকিং ব্যর্থ হয়েছে।');
      }

      setCourierSuccess(data.message || 'অর্ডারটি সফলভাবে কুরিয়ারে বুকিং হয়েছে!');
      
      // Update state locally
      setOrders(prev => prev.map(o => {
        if (o.id === selectedOrder.id) {
          return {
            ...o,
            courierName: data.courierName,
            courierTrackingCode: data.trackingCode,
            status: 'processing'
          };
        }
        return o;
      }));

      setTimeout(() => {
        setCourierModalOpen(false);
      }, 2500);

    } catch (err: any) {
      setCourierError(err.message || 'কুরিয়ার এপিআই কল করতে সমস্যা হয়েছে।');
    } finally {
      setCourierLoading(false);
    }
  };

  // Metrics
  const totalSales = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingOrders = orders.filter(o => !o.status || o.status === 'pending').length;

  // Filter logic
  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    return (o.status || 'pending') === filter;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Orders & Sales</h1>
          <p className="text-slate-500 text-sm mt-1">
            গ্রাহকের অর্ডারসমূহ পরিচালনা করুন, কুরিয়ারে পাঠান এবং ইনভয়েস ও শিপিং লেবেল প্রিন্ট করুন।
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer self-start sm:self-auto"
        >
          Refresh Orders
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales</div>
            <div className="text-2xl font-black text-slate-900">৳ {totalSales.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</div>
            <div className="text-2xl font-black text-slate-900">{orders.length}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Orders</div>
            <div className="text-2xl font-black text-slate-900">{pendingOrders}</div>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Table Filters */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Customer Orders</h2>

          <div className="flex flex-wrap items-center gap-2">
            {['all', 'pending', 'processing', 'delivered', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                  filter === tab 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
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
                <th className="p-4">Courier / Tracking</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">No orders found.</td></tr>
              ) : (
                filteredOrders.map((order) => {
                  const customerName = order.customerInfo?.name || order.customer?.name || order.name || 'সম্মানিত গ্রাহক';
                  const customerPhone = order.customerInfo?.phone || order.customer?.phone || order.phone || 'N/A';
                  const customerAddress = order.customerInfo?.address || order.customer?.address || order.address || (order.customerInfo?.city ? order.customerInfo.city : 'ঠিকানা দেওয়া হয়নি');
                  const customerCity = order.customerInfo?.city || order.city || '';
                  const customerZone = order.customerInfo?.zone || '';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition">
                      
                      {/* Customer Details Column (Fixed data mapping) */}
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{customerName}</div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 mt-1 font-semibold">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{customerPhone}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-xs text-slate-500 mt-1 max-w-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 leading-tight" title={customerAddress}>
                            {customerAddress}
                          </span>
                        </div>
                        {(customerCity || customerZone) && (
                          <div className="text-[11px] text-blue-600 font-bold mt-1">
                            {customerZone === 'inside_city' ? 'ঢাকা সিটির ভেতরে' : 'ঢাকা সিটির বাহিরে'} {customerCity ? `(${customerCity})` : ''}
                          </div>
                        )}
                      </td>

                      {/* Items & Total */}
                      <td className="p-4">
                        <div className="font-black text-slate-900 text-base">
                          ৳ {Number(order.total || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {order.items?.length || 0} items
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-slate-100 text-slate-700">
                          {order.paymentMethod || 'COD'}
                        </span>
                      </td>

                      {/* Order Status Dropdown */}
                      <td className="p-4">
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-xs font-bold p-1.5 rounded-lg border border-slate-200 outline-none bg-white cursor-pointer"
                        >
                          <option value="pending">🟡 Pending</option>
                          <option value="processing">🔵 Processing</option>
                          <option value="delivered">🟢 Delivered</option>
                          <option value="cancelled">🔴 Cancelled</option>
                        </select>
                      </td>

                      {/* Courier Tracking Status */}
                      <td className="p-4">
                        {order.courierTrackingCode ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-mono font-bold">
                              <Truck className="w-3.5 h-3.5" />
                              <span>{order.courierName || 'SteadFast'}: {order.courierTrackingCode}</span>
                            </span>
                            <span className="block text-[10px] text-slate-400">পার্সেল বুকড</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openCourierModal(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>কুরিয়ারে পাঠান</span>
                          </button>
                        )}
                      </td>

                      {/* Actions: Invoice & Shipping Label */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* 1. A4 Letterhead Invoice Print */}
                          <Link
                            href={`/${tenantId}/admin/print/invoice/${order.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shadow-xs"
                            title="A4 অফিস প্যাড ইনভয়েস"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                            <span>ইনভয়েস</span>
                          </Link>

                          {/* 2. Parcel Shipping Label Print */}
                          <Link
                            href={`/${tenantId}/admin/print/shipping-label/${order.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition shadow-xs"
                            title="পার্সেল শিপিং স্টিকার / লেবেল প্রিন্ট"
                          >
                            <Tag className="w-3.5 h-3.5 text-amber-600" />
                            <span>শিপিং লেবেল</span>
                          </Link>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COURIER DISPATCH MODAL (SteadFast & Pathao) */}
      {courierModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">কুরিয়ারে পার্সেল বুকিং করুন</h3>
                  <p className="text-xs text-slate-500">অর্ডার নম্বর: {selectedOrder.id.slice(0, 8)}</p>
                </div>
              </div>
              <button
                onClick={() => setCourierModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {courierError && (
              <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs flex items-start gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{courierError}</div>
              </div>
            )}

            {courierSuccess && (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-xs flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <div className="font-bold">{courierSuccess}</div>
              </div>
            )}

            <form onSubmit={handleSendToCourier} className="space-y-4">
              {/* Courier Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">কুরিয়ার প্রোভাইডার নির্বাচন করুন *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCourierProvider('steadfast')}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
                      courierProvider === 'steadfast' 
                        ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-600 text-white font-black text-xs flex items-center justify-center">
                      SF
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">SteadFast</span>
                      <span className="text-[10px] text-slate-500">স্টেডফাস্ট কুরিয়ার</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCourierProvider('pathao')}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
                      courierProvider === 'pathao' 
                        ? 'border-red-500 bg-red-50/50 ring-2 ring-red-500/20' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">
                      PT
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">Pathao</span>
                      <span className="text-[10px] text-slate-500">পাঠাও এক্সপ্রেস</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Delivery Details Summary Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">প্রাপকের নাম:</span>
                  <span className="font-bold text-slate-900">
                    {selectedOrder.customerInfo?.name || selectedOrder.customer?.name || selectedOrder.name || 'সম্মানিত গ্রাহক'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">মোবাইল নম্বর:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {selectedOrder.customerInfo?.phone || selectedOrder.customer?.phone || selectedOrder.phone || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ঠিকানা:</span>
                  <span className="font-bold text-slate-800 text-right max-w-[250px] truncate">
                    {selectedOrder.customerInfo?.address || selectedOrder.customer?.address || selectedOrder.address || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-700">কালেকশন টাকা (COD Amount):</span>
                  <span className="font-black text-blue-600 text-sm font-mono">
                    ৳{Number(selectedOrder.total || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                • বুকিং নিশ্চিত করার পূর্বে নিশ্চিত করুন যে <strong>ওয়েবসাইট ও API সেটিংস &gt; ৭. কুরিয়ার API</strong> এ আপনার {courierProvider === 'steadfast' ? 'SteadFast' : 'Pathao'} API Key যুক্ত করা আছে।
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCourierModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={courierLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {courierLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>বুকিং হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{courierProvider === 'steadfast' ? 'SteadFast' : 'Pathao'}-এ পাঠান</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
