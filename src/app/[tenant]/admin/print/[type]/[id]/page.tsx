'use client';
// @ts-nocheck

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Printer, X, Phone, Mail, MapPin, Store, Truck, Tag, QrCode } from 'lucide-react';

export default function PrintSuite() {
  const params = useParams();
  const router = useRouter();
  const tenantId = (params?.tenant as string) || '';
  const type = (params?.type as string) || 'invoice'; // 'invoice' | 'shipping-label'
  const id = (params?.id as string) || '';

  const [data, setData] = useState<any>(null);
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

        // 2. Fetch specific Order
        const orderSnap = await getDoc(doc(db, `tenants/${tenantId}/orders/${id}`));
        if (orderSnap.exists()) {
          setData(orderSnap.data());
        }
      } catch (err) {
        console.error("Error fetching print data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) fetchData();
  }, [tenantId, type, id]);

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

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-500 font-bold mb-2">অর্ডার তথ্য পাওয়া যায়নি!</p>
        <button 
          onClick={() => window.close()} 
          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm cursor-pointer"
        >
          উইন্ডো বন্ধ করুন
        </button>
      </div>
    );
  }

  // Generate Unique Invoice Number: StoreID-YYMMDDHHMMSS
  const orderDate = data?.createdAt ? new Date(data.createdAt) : new Date();
  const yy = String(orderDate.getFullYear()).slice(-2);
  const mm = String(orderDate.getMonth() + 1).padStart(2, '0');
  const dd = String(orderDate.getDate()).padStart(2, '0');
  const hh = String(orderDate.getHours()).padStart(2, '0');
  const min = String(orderDate.getMinutes()).padStart(2, '0');
  const ss = String(orderDate.getSeconds()).padStart(2, '0');
  const cleanTenant = tenantId.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const invoiceNumber = `${cleanTenant}-${yy}${mm}${dd}${hh}${min}${ss}`;

  const formattedDate = orderDate.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) + ', ' + orderDate.toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const customerName = data.customerInfo?.name || data.name || 'সম্মানিত গ্রাহক';
  const customerPhone = data.customerInfo?.phone || data.phone || 'N/A';
  const customerAddress = data.customerInfo?.address || data.address || 'ঠিকানা পাওয়া যায়নি';
  const customerCity = data.customerInfo?.city || data.city || '';
  const customerZone = data.customerInfo?.zone || '';

  return (
    <div className="min-h-screen bg-slate-100/60 print:bg-white text-slate-900 py-6 px-4 print:p-0">
      
      {/* On-Screen Action Bar (Hidden during Print) */}
      <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between print:hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {type === 'shipping-label' ? '📦 শিপিং লেবেল প্রিভিউ' : '📄 A4 ইনভয়েস প্রিভিউ'}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-mono font-bold">
            {invoiceNumber}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md flex items-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট করুন ({type === 'shipping-label' ? 'Label Print' : 'A4 Print'})</span>
          </button>
          <button
            onClick={() => window.close()}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW A: SHIPPING LABEL (4x6 INCH / PARCEL STICKER FORMAT)
          ========================================================================= */}
      {type === 'shipping-label' ? (
        <div 
          id="printable-shipping-label"
          className="w-full max-w-[125mm] mx-auto bg-white p-6 sm:p-8 shadow-xl print:shadow-none border-2 border-dashed border-slate-800 rounded-2xl print:rounded-none font-sans text-slate-900 space-y-4"
        >
          {/* 1. Header: Shop Info & Logo (Sender) */}
          <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {tenantInfo?.logoUrl ? (
                <img 
                  src={tenantInfo.logoUrl} 
                  alt="Shop Logo" 
                  className="h-10 w-auto max-w-[120px] object-contain" 
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-lg">
                  {tenantId.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-lg font-black text-slate-900 uppercase leading-none">
                  {tenantInfo?.businessName || tenantId.toUpperCase()}
                </h2>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  হেল্পলাইন: <span className="font-bold text-slate-800">{tenantInfo?.phone || '০১৭০০-০০০০০০'}</span>
                </p>
                {tenantInfo?.officeAddress && (
                  <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{tenantInfo.officeAddress}</p>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block bg-slate-900 text-white px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">
                PARCEL LABEL
              </span>
              <p className="text-[10px] font-mono text-slate-500 mt-1">{invoiceNumber}</p>
            </div>
          </div>

          {/* 2. Recipient Information (Customer Delivery Details) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block border-b border-slate-200 pb-1">
              প্রাপক / DELIVER TO (RECIPIENT)
            </span>

            <div className="space-y-1">
              <p className="text-xl font-black text-slate-900">{customerName}</p>
              <p className="text-base font-black text-blue-700 tracking-wide flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>{customerPhone}</span>
              </p>
              <p className="text-xs font-bold text-slate-800 leading-snug pt-1">
                ঠিকানা: {customerAddress}
              </p>
              {(customerCity || customerZone) && (
                <p className="text-[11px] font-semibold text-slate-600">
                  এরিয়া: {customerZone === 'inside_city' ? 'ঢাকা সিটির ভেতরে' : 'ঢাকা সিটির বাহিরে'} {customerCity ? `(${customerCity})` : ''}
                </p>
              )}
            </div>
          </div>

          {/* 3. Cash on Delivery (COD) Collection Box */}
          <div className="border-2 border-slate-900 rounded-xl p-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                কালেকশন টাকা / COD AMOUNT
              </span>
              <span className="text-2xl font-black tracking-tight text-white font-mono">
                ৳{Number(data.total || 0).toLocaleString()}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black uppercase">
                {data.paymentMethod === 'cod' ? 'CASH ON DELIVERY' : data.paymentMethod?.toUpperCase()}
              </span>
              <p className="text-[10px] text-slate-300 mt-1 font-mono">{formattedDate.split(',')[0]}</p>
            </div>
          </div>

          {/* 4. Package Contents & Barcode Simulation */}
          <div className="space-y-2 pt-1 text-xs">
            <div className="flex justify-between items-start text-slate-600 text-[11px]">
              <div>
                <span className="font-bold text-slate-800">পণ্য বিবরণ: </span>
                <span>
                  {data.items?.map((it: any) => `${it.title} (${it.quantity}টি)`).join(', ') || 'ই-কমার্স পার্সেল'}
                </span>
              </div>
              <span className="font-bold text-slate-800 shrink-0 ml-2">মোট: {data.items?.length || 1} আইটেম</span>
            </div>

            {/* Barcode Graphic Simulation */}
            <div className="pt-2 text-center border-t border-slate-200">
              <div className="font-mono text-xl tracking-[0.25em] font-black text-slate-900 select-none">
                |||| | || |||| | ||||| || ||| ||||
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-bold block mt-0.5">
                {invoiceNumber}
              </span>
            </div>

            <div className="text-center pt-1 border-t border-slate-100">
              <p className="text-[10px] text-slate-500 font-semibold">
                ডেলিভারি ম্যানের প্রতি অনুরোধ: ডেলিভারি দেওয়ার পূর্বে অনুগ্রহ করে গ্রাহককে ফোন দিন।
              </p>
            </div>
          </div>
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
                        className="h-12 w-auto max-w-[140px] object-contain" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                        {tenantId.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">
                        {tenantInfo?.businessName || tenantId.toUpperCase()}
                      </h1>
                      <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                        {tenantInfo?.tagline || 'অফিসিয়াল অনলাইন স্টোর'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-0.5 mt-2">
                    {tenantInfo?.officeAddress && <p>{tenantInfo.officeAddress}</p>}
                    <p className="flex items-center gap-3">
                      {tenantInfo?.phone && <span>ফোন: {tenantInfo.phone}</span>}
                      {tenantInfo?.email && <span>ইমেইল: {tenantInfo.email}</span>}
                    </p>
                    {(tenantInfo?.compliance?.dbidNumber || tenantInfo?.compliance?.binNumber) && (
                      <p className="text-[10px] text-slate-500 font-mono">
                        {tenantInfo?.compliance?.dbidNumber && `DBID: ${tenantInfo.compliance.dbidNumber} | `}
                        {tenantInfo?.compliance?.binNumber && `BIN: ${tenantInfo.compliance.binNumber}`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Invoice Meta Box */}
                <div className="text-right shrink-0">
                  <div className="inline-block bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest mb-2">
                    ইনভয়েস / INVOICE
                  </div>
                  <p className="text-xs text-slate-500 font-bold">ইনভয়েস নম্বর:</p>
                  <p className="text-sm font-black font-mono text-slate-900 tracking-wide">{invoiceNumber}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{formattedDate}</p>
                  
                  <div className="mt-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                      data.paymentStatus === 'paid' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                        : 'bg-amber-50 text-amber-700 border-amber-300'
                    }`}>
                      {data.paymentMethod === 'cod' ? 'CASH ON DELIVERY (PENDING)' : `${data.paymentMethod?.toUpperCase()} (${data.paymentStatus?.toUpperCase()})`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. CUSTOMER & DELIVERY INFO */}
            <div className="grid grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 mb-6 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                  গ্রাহকের তথ্য (CUSTOMER INFO)
                </span>
                <p className="font-black text-slate-900 text-sm">{customerName}</p>
                <p className="font-bold text-slate-800 mt-0.5">মোবাইল: {customerPhone}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                  ডেলিভারি ঠিকানা (SHIPPING ADDRESS)
                </span>
                <p className="font-semibold text-slate-800 leading-relaxed">
                  {customerAddress}
                </p>
                {(customerCity || customerZone) && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {customerZone === 'inside_city' ? 'ঢাকা সিটির ভেতরে' : 'ঢাকা সিটির বাহিরে'} {customerCity ? `(${customerCity})` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* 3. ORDER ITEMS TABLE */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="py-2.5 px-4 w-12 text-center">নং</th>
                    <th className="py-2.5 px-4">আইটেম বিবরণ (Item Description)</th>
                    <th className="py-2.5 px-4 text-center w-20">পরিমাণ</th>
                    <th className="py-2.5 px-4 text-right w-24">একক মূল্য</th>
                    <th className="py-2.5 px-4 text-right w-28">মোট টাকা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items?.map((item: any, idx: number) => {
                    const price = Number(item.price || 0);
                    const qty = Number(item.quantity || 1);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{item.title}</p>
                          {item.variant && <p className="text-[10px] text-slate-400">{item.variant}</p>}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">{qty}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600">৳{price.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono font-black text-slate-900">৳{(price * qty).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 4. TOTALS SUMMARY */}
            <div className="flex justify-end mb-8">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>পণ্যের উপ-মোট (Subtotal):</span>
                  <span className="font-mono font-bold text-slate-800">৳{Number(data.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ডেলিভারি চার্জ (Delivery Fee):</span>
                  <span className="font-mono font-bold text-slate-800">৳{Number(data.deliveryFee || 0).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center bg-slate-900 text-white p-2.5 rounded-lg font-black text-sm mt-2">
                  <span>সর্বমোট প্রদেয় (Grand Total):</span>
                  <span className="font-mono text-base">৳{Number(data.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. FOOTER (NO SIGNATURES PER REQUEST) */}
          <div className="text-center border-t border-slate-200 pt-4 text-[11px] text-slate-500">
            <p className="font-semibold text-slate-700">আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ!</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              যেকোনো প্রয়োজনে আমাদের হেল্পলাইনে যোগাযোগ করুন: {tenantInfo?.phone || '০১৭০০-০০০০০০'} | {tenantInfo?.email || ''}
            </p>
          </div>
        </div>
      )}

      {/* --- PURE A4 PRINT STYLES --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: ${type === 'shipping-label' ? '100mm 150mm' : 'A4 portrait'};
            margin: ${type === 'shipping-label' ? '4mm' : '8mm 10mm'};
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: ${type === 'shipping-label' ? '10pt' : '11pt'} !important;
          }
          aside, nav, header, button, .print-hide, .no-print {
            display: none !important;
          }
          #printable-invoice, #printable-shipping-label {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}} />
    </div>
  );
}
