// @ts-nocheck
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import StorefrontLayout from '@/components/storefront/StorefrontLayout';
import { 
  CheckCircle2, 
  Printer, 
  Download, 
  ShoppingBag, 
  ArrowRight, 
  Phone, 
  MapPin, 
  Calendar, 
  MessageCircle, 
  Store, 
  Truck, 
  CreditCard,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tenantId = (params?.tenant as string) || '';
  const orderId = searchParams.get('orderId') || '';

  const [order, setOrder] = useState<any>(null);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!tenantId || !orderId) {
      setLoading(false);
      return;
    }

    const fetchOrderData = async () => {
      try {
        const [orderSnap, settingsSnap] = await Promise.all([
          getDoc(doc(db, `tenants/${tenantId}/orders/${orderId}`)),
          getDoc(doc(db, `tenants/${tenantId}/settings/general`))
        ]);

        if (orderSnap.exists()) {
          setOrder({ id: orderSnap.id, ...orderSnap.data() });
        }
        if (settingsSnap.exists()) {
          setStoreSettings(settingsSnap.data());
        }
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [tenantId, orderId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold text-slate-500">অর্ডার বিবরণ লোড হচ্ছে...</p>
      </div>
    );
  }

  // Format Order / Invoice Number
  const orderDate = order?.createdAt ? new Date(order.createdAt) : new Date();
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

  const hotline = storeSettings?.phone || '01700-000000';
  const whatsappNumber = hotline.replace(/[^0-9]/g, '');

  const copyInvoiceNum = () => {
    navigator.clipboard.writeText(invoiceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full space-y-8">
      
      {/* 1. SUCCESS HERO BANNER (Print Hidden) */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm text-center space-y-4 print:hidden">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.2]" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            আমাদের কাস্টমার কেয়ার প্রতিনিধি শীঘ্রই আপনার দেওয়া নম্বরে ফোন করে অর্ডারটি কনফার্ম করবেন।
          </p>
        </div>

        {/* Invoice Number Pill */}
        <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 px-4 py-2 rounded-2xl">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">ইনভয়েস / অর্ডার নম্বর:</span>
          <span className="font-mono text-sm font-black text-blue-600">{invoiceNumber}</span>
          <button
            onClick={copyInvoiceNum}
            className="p-1 text-slate-400 hover:text-blue-600 transition"
            title="নম্বর কপি করুন"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Action Buttons: Print, Download, Shopping */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <a
            href={`/${tenantId}/admin/print/invoice/${orderId}`}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>অফিসিয়াল ইনভয়েস প্রিন্ট / ডাউনলোড (A4 Pad)</span>
          </a>

          <button
            onClick={handlePrint}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer border border-slate-200"
          >
            <Download className="w-4 h-4" />
            <span>পেজ প্রিন্ট করুন</span>
          </button>

          <Link
            href={`/${tenantId}`}
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs sm:text-sm transition flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>আরও কেনাকাটা করুন</span>
          </Link>
        </div>
      </div>

      {/* 2. ORDER DETAILS CARD (PRINT READY) */}
      <div id="order-receipt-card" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
        
        {/* Receipt Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Store className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-black text-slate-900 uppercase">
                {storeSettings?.businessName || tenantId.toUpperCase()}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">অর্ডার রসিদ ও কাস্টমার কপি</p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1">
            <p className="text-slate-500">
              <span className="font-bold text-slate-700">তারিখ: </span>
              <span>{formattedDate}</span>
            </p>
            <p className="text-slate-500">
              <span className="font-bold text-slate-700">ইনভয়েস: </span>
              <span className="font-mono font-bold text-slate-900">{invoiceNumber}</span>
            </p>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
              {order?.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (পেন্ডিং)' : `${order?.paymentMethod?.toUpperCase()} (পেন্ডিং)`}
            </span>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">গ্রাহকের তথ্য</span>
            <p className="text-sm font-black text-slate-900">{order?.customerInfo?.name || order?.name || 'গ্রাহকের নাম'}</p>
            <p className="font-bold text-slate-700">ফোন: {order?.customerInfo?.phone || order?.phone || 'N/A'}</p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ডেলিভারি ঠিকানা</span>
            <p className="font-medium text-slate-800 leading-relaxed">
              {order?.customerInfo?.address || order?.address || 'ঠিকানা দেওয়া হয়নি'}
            </p>
            <p className="text-slate-500 font-semibold">
              এরিয়া: {order?.customerInfo?.zone === 'inside_city' ? 'ঢাকা সিটির ভেতরে' : 'ঢাকা সিটির বাহিরে'} {order?.customerInfo?.city ? `(${order.customerInfo.city})` : ''}
            </p>
          </div>
        </div>

        {/* Ordered Items List */}
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">
            অর্ডারকৃত পণ্যসমূহ (Ordered Items)
          </h3>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {order?.items && order.items.length > 0 ? (
              order.items.map((item: any, idx: number) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-4 bg-white hover:bg-slate-50/50 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{item.title}</h4>
                      <span className="text-xs text-slate-400">৳{item.price} × {item.quantity}</span>
                    </div>
                  </div>

                  <span className="font-black text-slate-900 text-sm sm:text-base shrink-0">
                    ৳{item.price * item.quantity}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">পণ্য তথ্য পাওয়া যায়নি</div>
            )}
          </div>
        </div>

        {/* Order Totals Summary */}
        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500 space-y-1">
            <p>• পণ্য ডেলিভারির সময় দেখে মূল্য পরিশোধ করুন।</p>
            <p>• যেকোনো প্রয়োজনে আমাদের হেল্পলাইনে যোগাযোগ করুন: <span className="font-bold text-slate-800">{hotline}</span></p>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>সাবটোটাল:</span>
              <span className="font-bold text-slate-900">৳{order?.subtotal || 0}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>ডেলিভারি চার্জ:</span>
              <span className="font-bold text-slate-900">৳{order?.deliveryFee || 0}</span>
            </div>
            <div className="flex items-center justify-between text-base font-black text-slate-900 border-t border-slate-200 pt-2">
              <span>সর্বমোট:</span>
              <span className="text-blue-600 text-lg">৳{order?.total || 0}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. SUPPORT & ASSISTANCE BAR */}
      <div className="bg-slate-100 rounded-3xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left print:hidden">
        <div>
          <h4 className="text-sm font-bold text-slate-900">অর্ডার সংক্রান্ত কোনো পরিবর্তন বা প্রশ্ন আছে?</h4>
          <p className="text-xs text-slate-500 mt-0.5">আমাদের কাস্টমার কেয়ার টিম সার্বক্ষণিক সেবায় নিয়োজিত রয়েছে।</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${hotline}`}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition flex items-center gap-2 shadow-xs"
          >
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <span>{hotline}</span>
          </a>

          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`হ্যালো, আমার অর্ডার নম্বর ${invoiceNumber} সম্পর্কে জানতে চাই।`)}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/20"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>হোয়াটসঅ্যাপ সাপোর্ট</span>
            </a>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          header, footer, .print\\:hidden, button, a {
            display: none !important;
          }
          #order-receipt-card {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            padding: 20px !important;
            margin: 0 !important;
          }
        }
      `}} />

    </div>
  );
}

export default function CheckoutSuccessPage() {
  const params = useParams();
  const tenantId = (params?.tenant as string) || '';

  return (
    <StorefrontLayout tenantId={tenantId}>
      <Suspense fallback={
        <div className="min-h-[50vh] flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold text-slate-500">লোড হচ্ছে...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </StorefrontLayout>
  );
}
