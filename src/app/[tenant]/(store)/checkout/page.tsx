// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { BANGLADESH_DISTRICTS, District, DEFAULT_DELIVERY_FEE, DEFAULT_DHAKA_FEE } from '@/lib/constants/districts';
import { MapPin, Phone, User, Home, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = (params?.tenant as string) || '';
  const { items, clearCart } = useCartStore();

  // Store Settings & Delivery Configuration
  const [deliverySettings, setDeliverySettings] = useState<{
    defaultDeliveryFee: number;
    insideDhakaFee: number;
    districts: District[];
  }>({
    defaultDeliveryFee: DEFAULT_DELIVERY_FEE,
    insideDhakaFee: DEFAULT_DHAKA_FEE,
    districts: []
  });

  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    districtId: 'dhaka',
    specificArea: '',
    notes: '',
    senderNumber: '',
    trxId: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'manual_bkash'>('cod');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Store General Settings (Delivery & Payments)
  useEffect(() => {
    if (!tenantId) return;

    const fetchStoreSettings = async () => {
      try {
        const snap = await getDoc(doc(db, `tenants/${tenantId}/settings/general`));
        if (snap.exists()) {
          const data = snap.data();
          if (data.delivery) {
            setDeliverySettings({
              defaultDeliveryFee: Number(data.delivery.defaultDeliveryFee) || DEFAULT_DELIVERY_FEE,
              insideDhakaFee: Number(data.delivery.insideDhakaFee) || DEFAULT_DHAKA_FEE,
              districts: data.delivery.districts || []
            });
          }
          if (data.payments) {
            setPaymentSettings(data.payments);
          }
        }
      } catch (err) {
        console.error("Error fetching checkout settings:", err);
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchStoreSettings();
  }, [tenantId]);

  // Merge standard 64 districts with store custom overrides
  const combinedDistricts = React.useMemo(() => {
    const savedOverrides = deliverySettings.districts || [];
    const baseList = [...BANGLADESH_DISTRICTS];

    const merged = baseList.map(std => {
      const found = savedOverrides.find(o => o.id === std.id);
      if (found) {
        return { ...std, ...found };
      }
      if (std.id === 'dhaka') {
        return { ...std, deliveryFee: deliverySettings.insideDhakaFee };
      }
      return { ...std, deliveryFee: deliverySettings.defaultDeliveryFee };
    });

    // Append custom areas
    savedOverrides.forEach(ov => {
      if (ov.isCustom && !merged.find(m => m.id === ov.id)) {
        merged.push({
          ...ov,
          deliveryFee: ov.deliveryFee ?? deliverySettings.defaultDeliveryFee
        });
      }
    });

    return merged;
  }, [deliverySettings]);

  // Current selected district object
  const selectedDistrict = combinedDistricts.find(d => d.id === formData.districtId) || combinedDistricts[0];

  // Calculate Delivery Fee dynamically
  const deliveryFee = React.useMemo(() => {
    if (!selectedDistrict) return deliverySettings.defaultDeliveryFee;
    if (selectedDistrict.id === 'dhaka') {
      return deliverySettings.insideDhakaFee ?? DEFAULT_DHAKA_FEE;
    }
    // Check if district has a specific fee
    if (selectedDistrict.deliveryFee !== undefined && selectedDistrict.deliveryFee !== null && Number(selectedDistrict.deliveryFee) > 0) {
      return Number(selectedDistrict.deliveryFee);
    }
    return deliverySettings.defaultDeliveryFee ?? DEFAULT_DELIVERY_FEE;
  }, [selectedDistrict, deliverySettings]);

  // Price calculations
  const subtotal = items.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const total = subtotal + deliveryFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      alert('অনুগ্রহ করে নাম, ফোন নম্বর এবং সম্পূর্ণ ঠিকানা সঠিকভাবে পূরণ করুন।');
      return;
    }

    setSubmitting(true);

    try {
      const orderRef = await addDoc(collection(db, `tenants/${tenantId}/orders`), {
        customerInfo: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: selectedDistrict?.nameBn || 'ঢাকা',
          area: formData.specificArea.trim() || '',
          district: selectedDistrict?.nameBn || 'ঢাকা',
          zone: selectedDistrict?.id === 'dhaka' ? 'ঢাকা সিটির ভেতরে' : `${selectedDistrict?.nameBn || 'অন্যান্য জেলা'} (ঢাকার বাহিরে)`
        },
        items: items.map(item => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image || ''
        })),
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        paymentStatus: 'pending',
        senderNumber: formData.senderNumber || null,
        trxId: formData.trxId || null,
        createdAt: Date.now(),
        status: 'pending'
      });

      clearCart();
      router.push(`/${tenantId}/checkout/success?orderId=${orderRef.id}`);
    } catch (error: any) {
      console.error('Error placing order:', error);
      alert('অর্ডার সাবমিট করতে সমস্যা হয়েছে: ' + (error?.message || 'অনুগ্রহ করে আবার চেষ্টা করুন।'));
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">আপনার কার্ট খালি রয়েছে</h2>
        <p className="text-slate-500 text-sm mb-6">অর্ডার সম্পন্ন করার জন্য অনুগ্রহ করে পণ্য কার্টে যোগ করুন।</p>
        <button
          onClick={() => router.push(`/${tenantId}`)}
          className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition cursor-pointer"
        >
          কেনাকাটা চালিয়ে যান
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">অর্ডার চেকআউট</h1>
        <p className="text-slate-500 text-sm mt-1">পণ্য নিশ্চিত করতে আপনার ডেলিভারি তথ্য ও জেলা নির্বাচন করুন</p>
      </div>
      
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Customer & Delivery Details */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Shipping Address Box */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-xs border border-slate-200/80 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">ডেলিভারি ঠিকানা ও যোগাযোগের তথ্য</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                  <span>আপনার নাম</span>
                  <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="আপনার পুরো নাম লিখুন" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm text-slate-900" 
                />
              </div>

              {/* Phone Number */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                  <span>মোবাইল নম্বর</span>
                  <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="01XXXXXXXXX" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-mono text-slate-900" 
                />
              </div>

              {/* District Selection (All 64 Districts) */}
              <div className="sm:col-span-2 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                    <span>জেলা নির্বাচন করুন</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] font-bold text-blue-600">
                    শিপিং চার্জ: ৳{deliveryFee}
                  </span>
                </div>
                
                <select 
                  required 
                  name="districtId" 
                  value={formData.districtId} 
                  onChange={handleChange} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-semibold text-slate-900 cursor-pointer"
                >
                  {/* Dhaka first */}
                  <option value="dhaka">
                    ঢাকা (Dhaka) — ডেলিভারি চার্জ: ৳{deliverySettings.insideDhakaFee}
                  </option>
                  
                  {/* Rest of districts */}
                  <optgroup label="বাংলাদেশের সকল জেলা">
                    {combinedDistricts.filter(d => d.id !== 'dhaka').map(d => (
                      <option key={d.id} value={d.id}>
                        {d.nameBn} ({d.nameEn}) — {d.deliveryFee ? ('৳' + d.deliveryFee) : ('৳' + deliverySettings.defaultDeliveryFee)}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-[11px] text-slate-400">
                  * জেলা অনুযায়ী নির্ধারিত ডেলিভারি চার্জ স্বয়ংক্রিয়ভাবে মোট মূল্যের সাথে যুক্ত হবে।
                </p>
              </div>

              {/* Specific Area / Thana / Upazila */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  থানা / উপজেলা / নির্দিষ্ট এলাকা
                </label>
                <input 
                  type="text" 
                  name="specificArea" 
                  value={formData.specificArea} 
                  onChange={handleChange} 
                  placeholder="যেমন: মিরপুর ১০, উত্তরা, ধানমন্ডি অথবা নির্দিষ্ট থানা/উপজেলা" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm text-slate-900" 
                />
              </div>

              {/* Full Address */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                  <span>সম্পূর্ণ ডেলিভারি ঠিকানা</span>
                  <span className="text-red-500">*</span>
                </label>
                <textarea 
                  required 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  rows={2} 
                  placeholder="বাড়ি নং, রোড নং, এলাকার বিস্তারিত ঠিকানা..." 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm resize-none text-slate-900" 
                />
              </div>

            </div>
          </div>

          {/* Payment Method Box */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-xs border border-slate-200/80 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">পেমেন্ট মেথড</h2>
            
            <div className="space-y-3">
              {/* Cash On Delivery */}
              <label className={`block border-2 p-4 rounded-2xl cursor-pointer transition ${
                paymentMethod === 'cod' 
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs' 
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={paymentMethod === 'cod'} 
                      onChange={() => setPaymentMethod('cod')} 
                      className="w-4 h-4 text-blue-600 cursor-pointer" 
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">ক্যাশ অন ডেলিভারি (Cash on Delivery)</div>
                      <div className="text-xs text-slate-500 mt-0.5">পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    জনপ্রিয়
                  </span>
                </div>
              </label>

              {/* bKash Payment */}
              <label className={`block border-2 p-4 rounded-2xl cursor-pointer transition ${
                paymentMethod === 'manual_bkash' 
                  ? 'border-pink-500 bg-pink-50/50 shadow-xs' 
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={paymentMethod === 'manual_bkash'} 
                      onChange={() => setPaymentMethod('manual_bkash')} 
                      className="w-4 h-4 text-pink-600 cursor-pointer" 
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">বিকাশ পেমেন্ট (bKash)</div>
                      <div className="text-xs text-slate-500 mt-0.5">বিকাশ সেন্ড মানি করে TrxID প্রদান করুন।</div>
                    </div>
                  </div>
                </div>
              </label>

              {paymentMethod === 'manual_bkash' && (
                <div className="p-4 bg-pink-50 rounded-2xl text-pink-900 border border-pink-200 space-y-3 animate-in fade-in duration-150">
                  <p className="font-bold text-xs">
                    {paymentSettings?.manualBkash?.instructions || 'বিকাশ পার্সোনাল নম্বরে সেন্ড মানি করুন:'}
                  </p>
                  {paymentSettings?.manualBkash?.number && (
                    <div className="text-sm font-black font-mono bg-white p-2 rounded-lg border border-pink-200 inline-block text-pink-700">
                      নম্বর: {paymentSettings.manualBkash.number}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <input 
                      required 
                      type="text" 
                      name="senderNumber" 
                      value={formData.senderNumber} 
                      onChange={handleChange} 
                      placeholder="যে বিকাশ নম্বর থেকে টাকা পাঠিয়েছেন" 
                      className="p-2.5 bg-white border border-pink-300 rounded-xl text-xs font-mono outline-none" 
                    />
                    <input 
                      required 
                      type="text" 
                      name="trxId" 
                      value={formData.trxId} 
                      onChange={handleChange} 
                      placeholder="Transaction ID (TrxID)" 
                      className="p-2.5 bg-white border border-pink-300 rounded-xl text-xs font-mono font-bold uppercase outline-none" 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="md:col-span-5">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs sticky top-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">অর্ডার বিবরণী (Order Summary)</h2>
            
            {/* Products List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 divide-y divide-slate-100">
              {items.map(item => (
                <div key={item.productId} className="flex gap-3 items-center pt-2 first:pt-0">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">ছবি নেই</div>
                    )}
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-slate-800 line-clamp-2">{item.title}</p>
                    <p className="text-slate-500 mt-0.5">{item.quantity}টি × ৳{Number(item.price).toLocaleString()}</p>
                  </div>
                  <div className="font-black text-slate-900 text-sm font-mono">
                    ৳{(Number(item.price) * Number(item.quantity)).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>পণ্যের মোট মূল্য (Subtotal):</span>
                <span className="font-bold font-mono text-slate-800">৳{subtotal.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-slate-600 items-center">
                <div>
                  <span>ডেলিভারি চার্জ:</span>
                  <span className="text-[11px] text-blue-600 font-semibold block">
                    ({selectedDistrict?.nameBn || 'জেলা'})
                  </span>
                </div>
                <span className="font-bold font-mono text-slate-800">৳{deliveryFee.toLocaleString()}</span>
              </div>

              <div className="border-t-2 border-slate-900 pt-3 flex justify-between text-base font-black text-slate-900">
                <span>সর্বমোট পরিশোধযোগ্য:</span>
                <span className="text-xl font-mono text-blue-600">৳{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white font-bold text-base rounded-2xl transition shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>অর্ডার প্রসেস হচ্ছে...</span>
                </>
              ) : (
                <span>অর্ডার নিশ্চিত করুন (৳{total.toLocaleString()})</span>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>১০০% নিরাপদ ও বিশ্বস্ত ডেলিভারি সার্ভিস</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
