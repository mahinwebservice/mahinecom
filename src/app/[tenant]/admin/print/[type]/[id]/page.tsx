'use client';
// @ts-nocheck

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Printer, X, Phone, Mail, MapPin, Store, Truck, Tag, QrCode } from 'lucide-react';

function PrintSuiteContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tenantId = (params?.tenant as string) || '';
  const type = (params?.type as string) || 'invoice'; // 'invoice' | 'shipping-label'
  const id = (params?.id as string) || '';
  const idsParam = searchParams.get('ids');

  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Tenant General Settings
        const tenantSnap = await getDoc(doc(db, `tenants/${tenantId}/settings/general`));
        if (tenantSnap.exists()) {
          setTenantInfo(tenantSnap.data());
        } else {
          setTenantInfo({ 
            businessName: tenantId.toUpperCase(), 
            phone: '01700-000000', 
            email: 'support@store.com', 
            officeAddress: 'ঢাকা, বাংলাদেশ' 
          });
        }

        // 2. Determine Order IDs to fetch
        let orderIds: string[] = [];
        if (idsParam) {
          orderIds = idsParam.split(',').map(s => s.trim()).filter(Boolean);
        } else if (id && id !== 'bulk') {
          orderIds = [id];
        }

        if (orderIds.length > 0) {
          const fetchPromises = orderIds.map(async (oId) => {
            try {
              const snap = await getDoc(doc(db, `tenants/${tenantId}/orders/${oId}`));
              if (snap.exists()) {
                return { id: snap.id, ...snap.data() };
              }
            } catch (err) {
              console.error(`Failed to fetch order ${oId}:`, err);
            }
            return null;
          });

          const results = await Promise.all(fetchPromises);
          setOrdersList(results.filter(Boolean));
        }
      } catch (err) {
        console.error("Error fetching print data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) fetchData();
  }, [tenantId, type, id, idsParam]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm font-semibold">ডকুমেন্ট লোড হচ্ছে...</p>
      </div>
    );
  }

  if (ordersList.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-500 font-bold mb-2">কোনো অর্ডারের তথ্য পাওয়া যায়নি!</p>
        <button 
          onClick={() => window.close()} 
          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm cursor-pointer"
        >
          উইন্ডো বন্ধ করুন
        </button>
      </div>
    );
  }

  // Format Helper for Order Date
  const formatOrderDate = (timestamp: any) => {
    const d = timestamp ? new Date(timestamp) : new Date();
    return d.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate Unique Invoice Number: StoreID-YYMMDDHHMMSS
  const getInvoiceNumber = (order: any) => {
    const d = order?.createdAt ? new Date(order.createdAt) : new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    const storePrefix = (tenantId || 'STORE').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    return `${storePrefix}-${yy}${mm}${dd}${hh}${min}${ss}`;
  };

  // Single Order for Invoice
  const singleOrder = ordersList[0];

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white text-slate-900 font-sans print:p-0">
      
      {/* =========================================================================
         ACTION HEADER BAR (HIDDEN IN PRINT)
         ========================================================================= */}
      <div className="no-print bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">
              {type === 'shipping-label' 
                ? `📦 শিপিং লেবেল প্রিভিউ (${ordersList.length}টি অর্ডার)` 
                : '📄 A4 ইনভয়েস প্রিভিউ'}
            </span>
            {type === 'shipping-label' && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                A4 প্রতি পাতায় ৪টি লেবেল (2×2)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন {type === 'shipping-label' ? `(${ordersList.length}টি লেবেল)` : '(A4 Invoice)'}</span>
            </button>

            <button
              onClick={() => window.close()}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
         MAIN PRINT CONTENT CONTAINER
         ========================================================================= */}
      <div className="p-4 sm:p-6 print:p-0">
        
        {type === 'shipping-label' ? (
          /* =========================================================================
             VIEW A: SHIPPING LABELS (2x2 GRID FOR 4 LABELS PER A4 PAGE)
             ========================================================================= */
          <div className="labels-grid-container max-w-[210mm] mx-auto">
            {ordersList.map((order, index) => {
              const customerName = order.customerInfo?.name || order.customer?.name || order.name || 'সম্মানিত গ্রাহক';
              const customerPhone = order.customerInfo?.phone || order.customer?.phone || order.phone || 'ফোন নম্বর নেই';
              const customerAddress = order.customerInfo?.address || order.customer?.address || order.address || 'ঠিকানা দেওয়া হয়নি';
              const customerCity = order.customerInfo?.city || order.city || '';
              const customerArea = order.customerInfo?.area || '';
              const customerZone = order.customerInfo?.zone || '';
              const invoiceNumber = getInvoiceNumber(order);
              const formattedDate = formatOrderDate(order.createdAt);

              return (
                <div 
                  key={order.id || index}
                  className="label-card-print bg-white border-2 border-dashed border-slate-800 rounded-xl print:rounded-none p-3.5 flex flex-col justify-between shadow-md print:shadow-none"
                >
                  {/* 1. Header: Shop Info & Logo (Sender) */}
                  <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {tenantInfo?.logoUrl ? (
                        <img 
                          src={tenantInfo.logoUrl} 
                          alt="Shop Logo" 
                          className="h-8 w-auto max-w-[80px] object-contain shrink-0" 
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0">
                          {tenantId.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <h2 className="text-sm font-black text-slate-900 uppercase leading-none truncate">
                          {tenantInfo?.businessName || tenantId.toUpperCase()}
                        </h2>
                        <p className="text-[10px] text-slate-600 font-bold mt-0.5 truncate">
                          হেল্পলাইন: {tenantInfo?.phone || '০১৭০০-০০০০০০'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block bg-slate-900 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                        PARCEL LABEL
                      </span>
                      <p className="text-[9px] font-mono text-slate-600 font-bold mt-0.5">{invoiceNumber}</p>
                    </div>
                  </div>

                  {/* 2. Recipient Information (Customer Delivery Details) */}
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-300 space-y-1 my-1">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block border-b border-slate-200 pb-0.5">
                      প্রাপক / DELIVER TO (RECIPIENT)
                    </span>

                    <div className="space-y-0.5">
                      <p className="text-sm font-black text-slate-900 truncate">{customerName}</p>
                      <p className="text-xs font-black text-blue-700 tracking-wide flex items-center gap-1">
                        <Phone className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>{customerPhone}</span>
                      </p>
                      <p className="text-[11px] font-bold text-slate-800 leading-tight line-clamp-2">
                        ঠিকানা: {customerAddress}
                      </p>
                      {(customerCity || customerArea || customerZone) && (
                        <p className="text-[10px] font-semibold text-slate-600 truncate">
                          জেলা/এরিয়া: <span className="font-bold text-slate-800">{customerCity || customerZone}</span> {customerArea ? `(${customerArea})` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 3. Cash on Delivery (COD) Collection Box */}
                  <div className="border border-slate-900 rounded-lg p-2 bg-slate-900 text-white flex items-center justify-between my-1">
                    <div>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-300 block">
                        কালেকশন টাকা / COD AMOUNT
                      </span>
                      <span className="text-xl font-black tracking-tight text-white font-mono leading-none">
                        ৳{Number(order.total || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-black uppercase">
                        {order.paymentMethod === 'cod' ? 'CASH ON DELIVERY' : order.paymentMethod?.toUpperCase()}
                      </span>
                      <p className="text-[9px] text-slate-300 mt-0.5 font-mono">{formattedDate.split(',')[0]}</p>
                    </div>
                  </div>

                  {/* 4. Package Contents & Barcode Simulation */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-start text-slate-600 text-[10px]">
                      <div className="truncate max-w-[190px]">
                        <span className="font-bold text-slate-800">পণ্য: </span>
                        <span>
                          {order.items?.map((it: any) => `${it.title} (${it.quantity}টি)`).join(', ') || 'ই-কমার্স পার্সেল'}
                        </span>
                      </div>
                      <span className="font-bold text-slate-800 shrink-0">মোট: {order.items?.length || 1} আইটেম</span>
                    </div>

                    {/* Barcode Graphic Simulation */}
                    <div className="pt-1 text-center border-t border-slate-200">
                      <div className="font-mono text-base tracking-[0.25em] font-black text-slate-900 select-none leading-none">
                        |||| | || |||| | ||||| || ||| ||||
                      </div>
                      <span className="text-[8px] font-mono text-slate-500 font-bold block mt-0.5">
                        {invoiceNumber}
                      </span>
                    </div>

                    {/* NEW UPDATED FOOTER MESSAGE (Check product with delivery person) */}
                    <div className="text-center pt-1 border-t border-slate-100">
                      <p className="text-[8.5px] leading-tight text-slate-700 font-medium bg-amber-50/90 px-1.5 py-1 rounded border border-amber-200">
                        ⚠️ <strong>বিশেষ অনুরোধ:</strong> ডেলিভারি ম্যান থাকা অবস্থায় অনুগ্রহ করে পার্সেল খুলে পণ্য চেক করে নিন। কোনো অসঙ্গতি থাকলে ডেলিভারি ম্যানের উপস্থিতিতেই আমাদের জানান।
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* =========================================================================
             VIEW B: A4 OFFICIAL LETTERHEAD INVOICE PAD (NO SIGNATURES)
             ========================================================================= */
          <div 
            id="printable-invoice"
            className="w-full max-w-[210mm] min-h-[285mm] mx-auto bg-white p-8 sm:p-12 shadow-xl print:shadow-none print:p-0 border border-slate-200 print:border-none rounded-2xl print:rounded-none flex flex-col justify-between"
          >
            <div>
              {/* 1. ELEGANT OFFICE LETTERHEAD PAD HEADER */}
              <div className="border-b-2 border-slate-900 pb-5 mb-6">
                <div className="flex items-start justify-between gap-6">
                  
                  {/* Left: Shop Logo, Name, Address */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {tenantInfo?.logoUrl ? (
                        <img 
                          src={tenantInfo.logoUrl} 
                          alt="Shop Logo" 
                          className="h-12 w-auto max-w-[160px] object-contain" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                          {tenantId.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                          {tenantInfo?.businessName || tenantId.toUpperCase()}
                        </h1>
                        {tenantInfo?.tagline && (
                          <p className="text-xs text-slate-500 font-medium">{tenantInfo.tagline}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5 mt-3">
                      {tenantInfo?.officeAddress && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{tenantInfo.officeAddress}</span>
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 font-medium">
                        {tenantInfo?.phone && (
                          <p className="flex items-center gap-1 text-slate-700">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{tenantInfo.phone}</span>
                          </p>
                        )}
                        {tenantInfo?.email && (
                          <p className="flex items-center gap-1 text-slate-700">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{tenantInfo.email}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Invoice Meta Box */}
                  <div className="text-right">
                    <div className="inline-block bg-slate-900 text-white px-3 py-1 rounded text-xs font-black tracking-widest uppercase mb-2">
                      INVOICE / বিল
                    </div>
                    <div className="space-y-1 text-xs font-mono">
                      <p className="text-slate-500">
                        ইনভয়েস নং: <span className="font-bold text-slate-900">{getInvoiceNumber(singleOrder)}</span>
                      </p>
                      <p className="text-slate-500">
                        তারিখ: <span className="font-semibold text-slate-800">{formatOrderDate(singleOrder?.createdAt)}</span>
                      </p>
                      <p className="text-slate-500">
                        স্ট্যাটাস: <span className="font-bold text-emerald-600 uppercase">{singleOrder?.paymentStatus || 'Pending'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. CUSTOMER / BILL TO SECTION */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-6">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    বিলিং ও ডেলিভারি প্রাপক (Customer Info)
                  </span>
                  <p className="text-base font-bold text-slate-900">
                    {singleOrder?.customerInfo?.name || singleOrder?.customer?.name || singleOrder?.name || 'সম্মানিত গ্রাহক'}
                  </p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    ফোন: {singleOrder?.customerInfo?.phone || singleOrder?.customer?.phone || singleOrder?.phone || 'N/A'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">
                    ঠিকানা: {singleOrder?.customerInfo?.address || singleOrder?.customer?.address || singleOrder?.address || 'ঠিকানা দেওয়া হয়নি'}
                  </p>
                  {(singleOrder?.customerInfo?.city || singleOrder?.customerInfo?.zone) && (
                    <p className="text-xs text-blue-700 font-semibold mt-1">
                      জেলা/এরিয়া: {singleOrder?.customerInfo?.city || singleOrder?.customerInfo?.zone}
                    </p>
                  )}
                </div>

                <div className="text-right border-l border-slate-200 pl-6 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      পেমেন্ট মেথড
                    </span>
                    <span className="inline-block bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-xs font-bold uppercase">
                      {singleOrder?.paymentMethod === 'cod' ? 'Cash On Delivery' : singleOrder?.paymentMethod}
                    </span>
                  </div>
                  {singleOrder?.courierTrackingCode && (
                    <div className="mt-2 text-xs font-mono text-slate-600">
                      <span>কুরিয়ার ট্র্যাকিং: </span>
                      <span className="font-bold text-slate-900">{singleOrder.courierTrackingCode}</span> ({singleOrder.courierName})
                    </div>
                  )}
                </div>
              </div>

              {/* 3. ORDER ITEMS TABLE */}
              <div className="mb-6">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-900 bg-slate-100 text-slate-900 uppercase font-black tracking-wider text-[11px]">
                      <th className="py-2.5 px-3">নং</th>
                      <th className="py-2.5 px-3">পণ্যের বিবরণ</th>
                      <th className="py-2.5 px-3 text-right">মূল্য</th>
                      <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                      <th className="py-2.5 px-3 text-right">মোট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {singleOrder?.items?.map((item: any, idx: number) => {
                      const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{item.title}</div>
                            {item.sku && <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-700">
                            ৳{Number(item.price || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-800">
                            {item.quantity || 1}
                          </td>
                          <td className="py-3 px-3 text-right font-black font-mono text-slate-900">
                            ৳{itemTotal.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 4. TOTAL SUMMARY CALCULATION */}
              <div className="flex justify-end mb-8">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>সাবটোটাল (Subtotal):</span>
                    <span className="font-mono font-semibold">৳{Number(singleOrder?.subtotal || singleOrder?.total || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>ডেলিভারি চার্জ:</span>
                    <span className="font-mono font-semibold">৳{Number(singleOrder?.deliveryFee || 0).toLocaleString()}</span>
                  </div>
                  <div className="border-t-2 border-slate-900 pt-2 flex justify-between text-sm font-black text-slate-900">
                    <span>সর্বমোট দেয় টাকা:</span>
                    <span className="font-mono text-base">৳{Number(singleOrder?.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 5. TERMS & CONDITIONS (OFFICIAL NOTE) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">শর্তাবলী ও নির্দেশিকা:</p>
                <p>১. ডেলিভারি ম্যানের উপস্থিতিতে পণ্য দেখে ও চেক করে রিসিভ করুন। কোনো অসঙ্গতি থাকলে তাৎক্ষণিক আমাদের জানান।</p>
                <p>২. পণ্য সংক্রান্ত যেকোনো অভিযোগের জন্য ক্রয়ের ৭২ ঘণ্টার মধ্যে ইনভয়েস নম্বরসহ যোগাযোগ করুন।</p>
                <p>৩. এটি একটি কম্পিউটারাইজড অফিস প্যাড ইনভয়েস, কোনো ম্যানুয়াল স্বাক্ষরের প্রয়োজন নেই।</p>
              </div>
            </div>

            {/* 6. BOTTOM OFFICIAL PAD FOOTER */}
            <div className="pt-6 border-t border-slate-200 mt-6 text-center text-[10px] text-slate-400">
              <p className="font-bold text-slate-700">{tenantInfo?.businessName || tenantId.toUpperCase()} - ধন্যবাদ আমাদের সাথে থাকার জন্য!</p>
              <p className="mt-0.5">Website: {tenantInfo?.websiteUrl || `https://${tenantId}.ecomsaas.com`}</p>
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
         GLOBAL PRINT STYLES FOR INVOICE & 4-LABEL A4 GRID
         ========================================================================= */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm;
          }
          
          body, html {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print {
            display: none !important;
          }

          /* 4 Labels per A4 page (2 columns x 2 rows) */
          .labels-grid-container {
            display: grid !important;
            grid-template-columns: repeat(2, 96mm) !important;
            grid-auto-rows: 138mm !important;
            gap: 4mm !important;
            width: 196mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }

          .label-card-print {
            width: 96mm !important;
            height: 138mm !important;
            max-height: 138mm !important;
            box-sizing: border-box !important;
            border: 1.5px dashed #1e293b !important;
            border-radius: 4px !important;
            padding: 3mm !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
          }

          /* Every 4th label triggers a clean page break */
          .label-card-print:nth-child(4n) {
            page-break-after: always !important;
            break-after: page !important;
          }

          #printable-invoice {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }

        /* Screen Preview styles */
        .labels-grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 16px;
          justify-content: center;
        }

        @media (min-width: 768px) {
          .labels-grid-container {
            grid-template-columns: repeat(2, 380px);
          }
        }
      `}</style>
    </div>
  );
}

export default function PrintSuite() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
        <span>প্রিন্ট প্রিভিউ তৈরি হচ্ছে...</span>
      </div>
    }>
      <PrintSuiteContent />
    </Suspense>
  );
}
