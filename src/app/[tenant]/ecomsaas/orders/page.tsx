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
  Check,
  Layers
} from 'lucide-react';
import Link from 'next/link';

export default function TenantOrdersPage() {
  const params = useParams();
  const tenantId = (params?.tenant as string) || '';

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Multi-select for Bulk 4-per-A4 Label Printing
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

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

  // Selection handlers
  const toggleOrderSelection = (id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (filteredList: any[]) => {
    if (selectedOrders.length === filteredList.length && filteredList.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredList.map(o => o.id));
    }
  };

  const handleBulkPrintLabels = () => {
    if (selectedOrders.length === 0) return;
    window.open(`/${tenantId}/admin/print/shipping-label/bulk?ids=${selectedOrders.join(',')}`, '_blank');
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

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.error || result.details || 'কুরিয়ারে পাঠাতে ব্যর্থ হয়েছে।');
      }

      setCourierSuccess(`অর্ডারটি সফলভাবে ${result.courierName}-এ পাঠানো হয়েছে! ট্র্যাকিং কোড: ${result.trackingCode}`);
      
      // Update local state
      setOrders(orders.map(o => o.id === selectedOrder.id ? {
        ...o,
        courierTrackingCode: result.trackingCode,
        courierName: result.courierName,
        courierConsignmentId: result.consignmentId,
        status: 'processing'
      } : o));

      setTimeout(() => {
        setCourierModalOpen(false);
      }, 2000);

    } catch (err: any) {
      console.error('Courier send error:', err);
      setCourierError(err.message || 'কুরিয়ার এপিআই এর সাথে সংযোগ করতে ব্যর্থ হয়েছে। সেটিংস এপিআই কি সঠিক কিনা যাচাই করুন।');
    } finally {
      setCourierLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  const totalSales = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Orders & Sales</h1>
          <p className="text-slate-500 text-sm mt-1">
            গ্রাহকের অর্ডারসমূহ পরিচালনা করুন, কুরিয়ারে পাঠান এবং ইনভয়েস ও শিপিং লেবেল প্রিন্ট করুন।
          </p>
        </div>
        <button 
          onClick={fetchOrders}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-sm self-start cursor-pointer"
        >
          Refresh Orders
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">৳ {totalSales.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{orders.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Orders</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{pendingOrders}</h3>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        
        {/* Filter Bar & Tabs */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Customer Orders</h2>
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl self-start overflow-x-auto text-xs font-bold">
            {['all', 'pending', 'processing', 'delivered', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-xl capitalize transition cursor-pointer ${
                  filter === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* BULK ACTION BAR WHEN ORDERS ARE SELECTED */}
        {selectedOrders.length > 0 && (
          <div className="bg-slate-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-lg font-black tracking-wide">
                {selectedOrders.length}টি অর্ডার সিলেক্ট করা হয়েছে
              </span>
              <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                একটি A4 পাতায় ৪টি করে পার্সেল লেবেল প্রিন্ট হবে।
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkPrintLabels}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট লেবেল ({selectedOrders.length}টি - A4 এ ৪টি)</span>
              </button>
              
              <button
                onClick={() => setSelectedOrders([])}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition cursor-pointer"
              >
                সিলেকশন বাতিল
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    onChange={() => toggleSelectAll(filteredOrders)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    title="সবগুলো সিলেক্ট করুন"
                  />
                </th>
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
                <tr><td colSpan={7} className="p-8 text-center text-slate-400">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400">No orders found.</td></tr>
              ) : (
                filteredOrders.map((order) => {
                  const customerName = order.customerInfo?.name || order.customer?.name || order.name || 'সম্মানিত গ্রাহক';
                  const customerPhone = order.customerInfo?.phone || order.customer?.phone || order.phone || 'N/A';
                  const customerAddress = order.customerInfo?.address || order.customer?.address || order.address || (order.customerInfo?.city ? order.customerInfo.city : 'ঠিকানা দেওয়া হয়নি');
                  const customerCity = order.customerInfo?.city || order.city || '';
                  const customerArea = order.customerInfo?.area || '';
                  const customerZone = order.customerInfo?.zone || '';
                  const isSelected = selectedOrders.includes(order.id);

                  return (
                    <tr key={order.id} className={`hover:bg-slate-50/70 transition ${isSelected ? 'bg-blue-50/40' : ''}`}>
                      
                      {/* Selection Checkbox */}
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

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
                        {(customerCity || customerArea || customerZone) && (
                          <div className="text-[11px] text-blue-600 font-bold mt-1">
                            জেলা: {customerCity || customerZone} {customerArea ? `(${customerArea})` : ''}
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
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                          {order.paymentMethod || 'COD'}
                        </span>
                        {order.senderNumber && (
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">
                            Sender: {order.senderNumber}
                          </div>
                        )}
                        {order.trxId && (
                          <div className="text-[10px] text-pink-600 font-mono font-bold">
                            TrxID: {order.trxId}
                          </div>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-4">
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border-0 outline-none cursor-pointer ${
                            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                            order.status === 'processing' ? 'bg-blue-50 text-blue-700' :
                            order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                            'bg-amber-50 text-amber-700'
                          }`}
                        >
                          <option value="pending">🟡 Pending</option>
                          <option value="processing">🔵 Processing</option>
                          <option value="delivered">🟢 Delivered</option>
                          <option value="cancelled">🔴 Cancelled</option>
                        </select>
                      </td>

                      {/* Courier & Tracking Code Column */}
                      <td className="p-4">
                        {order.courierTrackingCode ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white font-mono">
                              <Truck className="w-3 h-3 text-emerald-400" />
                              <span>{order.courierName || 'Courier'}: {order.courierTrackingCode}</span>
                            </span>
                            {order.courierConsignmentId && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                ID: {order.courierConsignmentId}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => openCourierModal(order)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                          >
                            <Truck className="w-3.5 h-3.5 text-blue-600" />
                            <span>কুরিয়ারে পাঠান</span>
                          </button>
                        )}
                      </td>

                      {/* Actions: Invoice & Shipping Label */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. A4 Letterhead Invoice Print */}
                          <button
                            onClick={() => window.open(`/${tenantId}/admin/print/invoice/${order.id}`, '_blank')}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                            title="A4 অফিসিয়াল প্যাড ইনভয়েস প্রিন্ট"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                            <span>ইনভয়েস</span>
                          </button>

                          {/* 2. Parcel Shipping Sticker Label (Single) */}
                          <button
                            onClick={() => window.open(`/${tenantId}/admin/print/shipping-label/${order.id}`, '_blank')}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                            title="পার্সেল শিপিং স্টিকার / লেবেল প্রিন্ট"
                          >
                            <Tag className="w-3.5 h-3.5 text-amber-400" />
                            <span>লেবেল</span>
                          </button>
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

      {/* =========================================================================
          COURIER DISPATCH MODAL (STEADFAST & PATHAO)
          ========================================================================= */}
      {courierModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => setCourierModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">কুরিয়ারে পার্সেল পাঠান</h3>
                <p className="text-xs text-slate-500">
                  অর্ডার #{selectedOrder.id.slice(0, 8)} কুরিয়ার সিস্টেমে স্বয়ংক্রিয়ভাবে বুক করুন
                </p>
              </div>
            </div>

            {/* Success / Error Messages */}
            {courierSuccess && (
              <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{courierSuccess}</span>
              </div>
            )}

            {courierError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{courierError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSendToCourier} className="space-y-4">
              
              {/* Courier Selection Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  কুরিয়ার সার্ভিস নির্বাচন করুন
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCourierProvider('steadfast')}
                    className={`p-3 rounded-2xl border-2 text-left transition flex items-center gap-3 cursor-pointer ${
                      courierProvider === 'steadfast' 
                        ? 'border-blue-600 bg-blue-50/50 text-slate-900 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                      SF
                    </div>
                    <div>
                      <div className="font-bold text-sm">SteadFast</div>
                      <div className="text-[10px] text-slate-500">স্টেডফাস্ট কুরিয়ার</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCourierProvider('pathao')}
                    className={`p-3 rounded-2xl border-2 text-left transition flex items-center gap-3 cursor-pointer ${
                      courierProvider === 'pathao' 
                        ? 'border-red-600 bg-red-50/50 text-slate-900 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center">
                      PT
                    </div>
                    <div>
                      <div className="font-bold text-sm">Pathao</div>
                      <div className="text-[10px] text-slate-500">পাঠাও এক্সপ্রেস</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Order Recipient Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">গ্রাহকের নাম:</span>
                  <span className="font-bold text-slate-900">
                    {selectedOrder.customerInfo?.name || selectedOrder.customer?.name || selectedOrder.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ফোন নম্বর:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {selectedOrder.customerInfo?.phone || selectedOrder.customer?.phone || selectedOrder.phone || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ঠিকানা:</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[240px] truncate">
                    {selectedOrder.customerInfo?.address || selectedOrder.customer?.address || selectedOrder.address || 'ঠিকানা দেওয়া হয়নি'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-700">ক্যাশ অন ডেলিভারি (COD):</span>
                  <span className="font-black text-blue-600 text-sm font-mono">
                    ৳{Number(selectedOrder.total || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Notice */}
              <p className="text-[11px] text-slate-400 leading-relaxed">
                * নিশ্চিত করুন যে ওয়েবসাইট ও API সেটিংস পেজে <strong>{courierProvider === 'steadfast' ? 'SteadFast' : 'Pathao'}</strong> এর এপিআই কি সঠিকভাবে দেওয়া আছে।
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCourierModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>

                <button
                  type="submit"
                  disabled={courierLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition"
                >
                  {courierLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
