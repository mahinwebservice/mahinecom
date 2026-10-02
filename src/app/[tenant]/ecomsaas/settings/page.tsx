'use client';
// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  Settings, 
  Save,
  Truck,
  Upload, 
  Globe, 
  Shield, 
  CreditCard, 
  MessageSquare, 
  Image as ImageIcon, 
  Award, 
  Percent, 
  FileText, 
  CheckCircle2, 
  Key, 
  Lock, 
  Phone, 
  Mail, 
  Building, 
  MapPin, 
  Sparkles,
  ExternalLink,
  DollarSign
} from 'lucide-react';

export default function TenantSettingsPage() {
  const params = useParams();
  const tenantId = (params?.tenant as string) || '';

  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'sms' | 'payments' | 'cloudinary' | 'compliance' | 'courier'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleCloudinaryUpload = async (file: File, callback: (url: string) => void, fieldId: string) => {
    if (!file) return;
    setUploadingField(fieldId);
    try {
      const url = await uploadToCloudinary(file, tenantId);
      callback(url);
      alert('ছবি সফলভাবে Cloudinary-তে আপলোড হয়েছে!');
    } catch (err: any) {
      alert(err.message || 'ক্লাউডিনারি আপলোড ত্রুটি');
    } finally {
      setUploadingField(null);
    }
  };
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    // 1. General & Language
    businessName: '',
    tagline: 'আপনার বিশ্বস্ত অনলাইন শপ',
    defaultLanguage: 'bn',
    faviconUrl: '',
    logoUrl: '',
    phone: '',
    email: '',
    officeAddress: '',
    currency: '৳',
    
    // 2. SEO Settings
    seo: {
      metaTitle: '',
      metaDescription: 'সেরা মূল্যে আকর্ষণীয় পণ্য অর্ডার করুন ক্যাশ অন ডেলিভারিতে দ্রুত সারা দেশে।',
      metaKeywords: 'online shop, ecommerce bangladesh, cash on delivery, best products',
      ogImageUrl: ''
    },

    // 3. Bulk SMS API (Bulksmsbd.net)
    sms: {
      provider: 'bulksmsbd.net',
      apiKey: '',
      senderId: '',
      clientId: '',
      orderPlacedSms: true,
      orderShippedSms: true,
      templateOrderPlaced: 'প্রিয় {customer_name}, আপনার অর্ডার #{order_id} সফলভাবে গ্রহণ করা হয়েছে। মোট মূল্য {total} টাকা। সাথে থাকার জন্য ধন্যবাদ।'
    },

    // 4. Payment Gateway APIs
    payments: {
      cod: {
        enabled: true,
        advanceDeliveryFee: 0,
        instructions: 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।'
      },
      bkash: {
        enabled: false,
        appKey: '',
        appSecret: '',
        username: '',
        password: '',
        isLive: false
      },
      sslcommerz: {
        enabled: false,
        storeId: '',
        storePassword: '',
        isLive: false
      },
      surjopay: {
        enabled: false,
        username: '',
        password: '',
        prefix: '',
        isLive: false
      },
      manualBkash: {
        enabled: true,
        number: '',
        type: 'personal',
        instructions: 'বিকাশ সেন্ড মানি করে ট্রানজেকশন আইডি (TrxID) দিন।'
      },
      manualNagad: {
        enabled: true,
        number: '',
        type: 'personal',
        instructions: 'নগদ সেন্ড মানি করে ট্রানজেকশন আইডি (TrxID) দিন।'
      }
    },

    // 5. Cloudinary Image Setting
    cloudinary: {
      cloudName: '',
      uploadPreset: '',
      apiKey: ''
    },

    // 6. Government Compliance & Legal
    compliance: {
      vatPercent: 0,
      vatRegistrationNo: '',
      dbidNumber: '',
      binNumber: '',
      tradeLicenseNo: '',
      displayOnFooter: true
    },

    // 7. Courier API Settings
    courier: {
      steadfast: {
        enabled: true,
        apiKey: '',
        secretKey: '',
        baseUrl: 'https://portal.packzy.com/api/v1'
      },
      pathao: {
        enabled: false,
        clientId: '',
        clientSecret: '',
        username: '',
        password: '',
        storeId: ''
      }
    }
  });

  useEffect(() => {
    if (!tenantId) return;

    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, `tenants/${tenantId}/settings/general`));
        if (snap.exists()) {
          const data = snap.data();
          setSettings(prev => ({
            ...prev,
            ...data,
            seo: { ...prev.seo, ...(data.seo || {}) },
            sms: { ...prev.sms, ...(data.sms || {}) },
            payments: { 
              ...prev.payments, 
              ...(data.payments || {}),
              cod: { ...prev.payments.cod, ...(data.payments?.cod || {}) },
              bkash: { ...prev.payments.bkash, ...(data.payments?.bkash || {}) },
              sslcommerz: { ...prev.payments.sslcommerz, ...(data.payments?.sslcommerz || {}) },
              surjopay: { ...prev.payments.surjopay, ...(data.payments?.surjopay || {}) },
              manualBkash: { ...prev.payments.manualBkash, ...(data.payments?.manualBkash || {}) },
              manualNagad: { ...prev.payments.manualNagad, ...(data.payments?.manualNagad || {}) }
            },
            cloudinary: { ...prev.cloudinary, ...(data.cloudinary || {}) },
            compliance: { ...prev.compliance, ...(data.compliance || {}) },
            courier: { ...prev.courier, ...(data.courier || {}) }
          }));
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [tenantId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await setDoc(doc(db, `tenants/${tenantId}/settings/general`), {
        ...settings,
        updatedAt: Date.now()
      }, { merge: true });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error("Save error:", err);
      alert("Error saving settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        সেটিংস লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Settings className="w-7 h-7 text-blue-600" />
            ওয়েবসাইট ও এপিআই সেটিংস
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            ভাষা, এসইও, এসএমএস গেটওয়ে, পেমেন্ট মেথড ও সরকারি কমপ্লায়েন্স কনফিগার করুন
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition cursor-pointer disabled:opacity-70"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>সংরক্ষণ হচ্ছে...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>সেটিংস সেভ করুন</span>
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">আপনার স্টোরের সকল সেটিংস সফলভাবে আপডেট ও সেভ হয়েছে!</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 border-b border-slate-200 text-sm font-semibold">
        {[
          { id: 'general', label: '১. সাধারণ ও ভাষা', icon: Globe },
          { id: 'seo', label: '২. এসইও (SEO)', icon: Sparkles },
          { id: 'sms', label: '৩. বাল্ক এসএমএস (SMS)', icon: MessageSquare },
          { id: 'payments', label: '৪. পেমেন্ট গেটওয়ে', icon: CreditCard },
          { id: 'cloudinary', label: '৫. ক্লাউডিনারি ইমেজ', icon: ImageIcon },
          { id: 'compliance', label: '৬. ভ্যাট / DBID / BIN', icon: Award },
          { id: 'courier', label: '৭. কুরিয়ার API (SteadFast & Pathao)', icon: Truck }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: General & Language */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">সাধারণ ও ভাষা সেটিংস</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">স্টোরের নাম (Store Name)</label>
              <input 
                type="text" 
                value={settings.businessName}
                onChange={e => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="যেমন: Mahin Shop"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">স্লোগান / ট্যাগলাইন (Slogan)</label>
              <input 
                type="text" 
                value={settings.tagline}
                onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="যেমন: আপনার বিশ্বস্ত অনলাইন শপিং পার্টনার"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">ডিফল্ট ভাষা (Default Language)</label>
              <select 
                value={settings.defaultLanguage}
                onChange={e => setSettings({ ...settings, defaultLanguage: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-medium"
              >
                <option value="bn">বাংলা (Bangla)</option>
                <option value="en">English</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">গ্রাহক ওয়েবসাইটে প্রবেশ করলে প্রথমে নির্বাচিত ভাষায় দেখতে পাবেন।</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">কারেন্সি প্রতীক (Currency Symbol)</label>
              <input 
                type="text" 
                value={settings.currency || '৳'}
                onChange={e => setSettings({ ...settings, currency: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                placeholder="৳ বা BDT"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-600 uppercase">লোগো ইমেজ (Cloudinary / URL)</label>
                <label className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
                  {uploadingField === 'logo' ? (
                    <span className="text-xs text-blue-600 animate-pulse">আপলোড হচ্ছে...</span>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>লোগো আপলোড (Cloudinary)</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleCloudinaryUpload(f, url => setSettings({ ...settings, logoUrl: url }), 'logo');
                      e.target.value = '';
                    }} 
                    className="hidden" 
                    disabled={uploadingField === 'logo'}
                  />
                </label>
              </div>
              <input 
                type="text" 
                value={settings.logoUrl}
                onChange={e => setSettings({ ...settings, logoUrl: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="https://res.cloudinary.com/... বা লোগো URL"
              />
              {settings.logoUrl && (
                <div className="mt-2 p-2 bg-slate-100 rounded-xl inline-block border border-slate-200">
                  <img src={settings.logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-600 uppercase">ব্রাউজার ফেভিকন (Cloudinary / URL)</label>
                <label className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
                  {uploadingField === 'favicon' ? (
                    <span className="text-xs text-blue-600 animate-pulse">আপলোড হচ্ছে...</span>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>ফেভিকন আপলোড (Cloudinary)</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleCloudinaryUpload(f, url => setSettings({ ...settings, faviconUrl: url }), 'favicon');
                      e.target.value = '';
                    }} 
                    className="hidden" 
                    disabled={uploadingField === 'favicon'}
                  />
                </label>
              </div>
              <input 
                type="text" 
                value={settings.faviconUrl}
                onChange={e => setSettings({ ...settings, faviconUrl: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="https://res.cloudinary.com/... বা favicon.ico"
              />
              {settings.faviconUrl && (
                <div className="mt-2 p-2 bg-slate-100 rounded-xl inline-block border border-slate-200">
                  <img src={settings.faviconUrl} alt="Favicon" className="w-6 h-6 object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">হটলাইন ফোন নম্বর</label>
              <input 
                type="text" 
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="01700-000000"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">সাপোর্ট ইমেইল</label>
              <input 
                type="email" 
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="support@yourstore.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">অফিস / শোরুম ঠিকানা</label>
            <textarea 
              rows={2}
              value={settings.officeAddress}
              onChange={e => setSettings({ ...settings, officeAddress: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="রোড নং ৪, হাউস ১২, উত্তরা, ঢাকা - ১২৩০"
            />
          </div>
        </div>
      )}

      {/* Tab 2: SEO Settings */}
      {activeTab === 'seo' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">সার্চ ইঞ্জিন অপ্টিমাইজেশন (SEO)</h2>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">মেটা টাইটেল (Meta Browser Title)</label>
            <input 
              type="text" 
              value={settings.seo?.metaTitle || ''}
              onChange={e => setSettings({ ...settings, seo: { ...settings.seo, metaTitle: e.target.value } })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-medium"
              placeholder="Mahin Shop | প্রিমিয়াম গ্যাজেট ও ফ্যাশন অনলাইন স্টোর"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">মেটা বিবরণ (Meta Description)</label>
            <textarea 
              rows={3}
              value={settings.seo?.metaDescription || ''}
              onChange={e => setSettings({ ...settings, seo: { ...settings.seo, metaDescription: e.target.value } })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="গুগল সার্চ ও সোশ্যাল মিডিয়া শেয়ারে এই ডেসক্রিপশনটি প্রদর্শিত হবে..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">মেটা কি-ওয়ার্ডস (SEO Keywords)</label>
            <input 
              type="text" 
              value={settings.seo?.metaKeywords || ''}
              onChange={e => setSettings({ ...settings, seo: { ...settings.seo, metaKeywords: e.target.value } })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="online shopping, gadget bd, clothing, cash on delivery"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">সোশ্যাল শেয়ার ইমেজ (Open Graph Image URL)</label>
            <input 
              type="text" 
              value={settings.seo?.ogImageUrl || ''}
              onChange={e => setSettings({ ...settings, seo: { ...settings.seo, ogImageUrl: e.target.value } })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="https://.../preview.jpg"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Bulk SMS API */}
      {activeTab === 'sms' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Bulksmsbd.net / বাল্ক এসএমএস গেটওয়ে</h2>
              <p className="text-xs text-slate-500">অর্ডার প্লেস বা কনফার্ম হলে কাস্টমারকে স্বয়ংক্রিয় এসএমএস নোটিফিকেশন পাঠান</p>
            </div>
            <a href="https://bulksmsbd.net" target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              <span>bulksmsbd.net</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">প্রোভাইডার</label>
              <select 
                value={settings.sms?.provider || 'bulksmsbd.net'}
                onChange={e => setSettings({ ...settings, sms: { ...settings.sms, provider: e.target.value } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-medium"
              >
                <option value="bulksmsbd.net">BulkSMSBD.net</option>
                <option value="bulksmsbd.com">BulkSMSBD.com</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">SMS API Key</label>
              <input 
                type="text" 
                value={settings.sms?.apiKey || ''}
                onChange={e => setSettings({ ...settings, sms: { ...settings.sms, apiKey: e.target.value } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="আপনার API Key দিন"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Sender ID (অনুমোদিত সেন্ডার আইডি)</label>
              <input 
                type="text" 
                value={settings.sms?.senderId || ''}
                onChange={e => setSettings({ ...settings, sms: { ...settings.sms, senderId: e.target.value } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="e.g. 8809612..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Client ID (যদি থাকে)</label>
              <input 
                type="text" 
                value={settings.sms?.clientId || ''}
                onChange={e => setSettings({ ...settings, sms: { ...settings.sms, clientId: e.target.value } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="ঐচ্ছিক ক্লায়েন্ট আইডি"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.sms?.orderPlacedSms ?? true}
                onChange={e => setSettings({ ...settings, sms: { ...settings.sms, orderPlacedSms: e.target.checked } })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-bold text-slate-800">অর্ডার সাবমিট হওয়ার সাথে সাথে কাস্টমারকে এসএমএস পাঠান</span>
            </label>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">অর্ডার এসএমএস টেমপ্লেট</label>
              <textarea 
                rows={2}
                value={settings.sms?.templateOrderPlaced || ''}
                onChange={e => setSettings({ ...settings, sms: { ...settings.sms, templateOrderPlaced: e.target.value } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:ring-2 focus:ring-blue-600 outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">ভেরিয়েবল: <code className="bg-slate-100 px-1 py-0.5 rounded">{'{customer_name}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">{'{order_id}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">{'{total}'}</code></p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Payment Gateways */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Cash on Delivery */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">COD</div>
                <div>
                  <h3 className="font-bold text-slate-900">ক্যাশ অন ডেলিভারি (Cash on Delivery)</h3>
                  <p className="text-xs text-slate-500">পণ্য হাতে পেয়ে মূল্য পরিশোধ</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.payments?.cod?.enabled ?? true}
                  onChange={e => setSettings({
                    ...settings,
                    payments: {
                      ...settings.payments,
                      cod: { ...settings.payments.cod, enabled: e.target.checked }
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {settings.payments?.cod?.enabled && (
              <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">অগ্রিম ডেলিভারি চার্জ (যদি থাকে)</label>
                  <input 
                    type="number"
                    value={settings.payments?.cod?.advanceDeliveryFee || 0}
                    onChange={e => setSettings({
                      ...settings,
                      payments: {
                        ...settings.payments,
                        cod: { ...settings.payments.cod, advanceDeliveryFee: Number(e.target.value) }
                      }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="0"
                  />
                  <p className="text-xs text-slate-400 mt-1">০ দিলে সম্পূর্ণ মূল্যই কাস্টমার ডেলিভারির সময় দেবেন।</p>
                </div>
              </div>
            )}
          </div>

          {/* bKash Merchant API */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-xs">bKash</div>
                <div>
                  <h3 className="font-bold text-slate-900">bKash মার্চেন্ট পেমেন্ট গেটওয়ে (PGW API)</h3>
                  <p className="text-xs text-slate-500">সরাসরি বিকাশ পেমেন্ট গেটওয়ে দিয়ে অটোমেটিক পেমেন্ট সংগ্রহ</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.payments?.bkash?.enabled || false}
                  onChange={e => setSettings({
                    ...settings,
                    payments: {
                      ...settings.payments,
                      bkash: { ...settings.payments.bkash, enabled: e.target.checked }
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>

            {settings.payments?.bkash?.enabled && (
              <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">bKash App Key</label>
                  <input 
                    type="text"
                    value={settings.payments?.bkash?.appKey || ''}
                    onChange={e => setSettings({
                      ...settings,
                      payments: { ...settings.payments, bkash: { ...settings.payments.bkash, appKey: e.target.value } }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">bKash App Secret</label>
                  <input 
                    type="password"
                    value={settings.payments?.bkash?.appSecret || ''}
                    onChange={e => setSettings({
                      ...settings,
                      payments: { ...settings.payments, bkash: { ...settings.payments.bkash, appSecret: e.target.value } }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">bKash Username</label>
                  <input 
                    type="text"
                    value={settings.payments?.bkash?.username || ''}
                    onChange={e => setSettings({
                      ...settings,
                      payments: { ...settings.payments, bkash: { ...settings.payments.bkash, username: e.target.value } }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">bKash Password</label>
                  <input 
                    type="password"
                    value={settings.payments?.bkash?.password || ''}
                    onChange={e => setSettings({
                      ...settings,
                      payments: { ...settings.payments, bkash: { ...settings.payments.bkash, password: e.target.value } }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input 
                      type="checkbox"
                      checked={settings.payments?.bkash?.isLive || false}
                      onChange={e => setSettings({
                        ...settings,
                        payments: { ...settings.payments, bkash: { ...settings.payments.bkash, isLive: e.target.checked } }
                      })}
                      className="w-4 h-4 rounded text-pink-600"
                    />
                    <span>Live Mode (লাইভ প্রোডাকশন অ্যাকাউন্ট চালু করতে টিক দিন)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* SSLCommerz API */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">SSL</div>
                <div>
                  <h3 className="font-bold text-slate-900">SSLCommerz পেমেন্ট গেটওয়ে</h3>
                  <p className="text-xs text-slate-500">ভিসা, মাস্টারকার্ড ও সকল কার্ড/মোবাইল ব্যাংকিং সাপোর্ট</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.payments?.sslcommerz?.enabled || false}
                  onChange={e => setSettings({
                    ...settings,
                    payments: {
                      ...settings.payments,
                      sslcommerz: { ...settings.payments.sslcommerz, enabled: e.target.checked }
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.payments?.sslcommerz?.enabled && (
              <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Store ID</label>
                  <input 
                    type="text"
                    value={settings.payments?.sslcommerz?.storeId || ''}
                    onChange={e => setSettings({
                      ...settings,
                      payments: { ...settings.payments, sslcommerz: { ...settings.payments.sslcommerz, storeId: e.target.value } }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Store Password</label>
                  <input 
                    type="password"
                    value={settings.payments?.sslcommerz?.storePassword || ''}
                    onChange={e => setSettings({
                      ...settings,
                      payments: { ...settings.payments, sslcommerz: { ...settings.payments.sslcommerz, storePassword: e.target.value } }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input 
                      type="checkbox"
                      checked={settings.payments?.sslcommerz?.isLive || false}
                      onChange={e => setSettings({
                        ...settings,
                        payments: { ...settings.payments, sslcommerz: { ...settings.payments.sslcommerz, isLive: e.target.checked } }
                      })}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>Live Mode (লাইভ প্রোডাকশন অ্যাকাউন্ট চালু করতে টিক দিন)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* SurjoPay API */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">Surjo</div>
                <div>
                  <h3 className="font-bold text-slate-900">SurjoPay পেমেন্ট গেটওয়ে</h3>
                  <p className="text-xs text-slate-500">বাংলাদেশী জনপ্রিয় পেমেন্ট গেটওয়ে সার্ভিস</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.payments?.surjopay?.enabled || false}
                  onChange={e => setSettings({
                    ...settings,
                    payments: {
                      ...settings.payments,
                      surjopay: { ...settings.payments.surjopay, enabled: e.target.checked }
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            {settings.payments?.surjopay?.enabled && (
              <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Merchant Username</label>
                  <input 
                    type="text"
                    value={settings.payments?.surjopay?.username || ''}
                    onChange={e => setSettings({
                      ...settings,
                      payments: { ...settings.payments, surjopay: { ...settings.payments.surjopay, username: e.target.value } }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Password</label>
                  <input 
                    type="password"
                    value={settings.payments?.surjopay?.password || ''}
                    onChange={e => setSettings({
                      ...settings,
                      payments: { ...settings.payments, surjopay: { ...settings.payments.surjopay, password: e.target.value } }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Prefix</label>
                  <input 
                    type="text"
                    value={settings.payments?.surjopay?.prefix || ''}
                    onChange={e => setSettings({
                      ...settings,
                      payments: { ...settings.payments, surjopay: { ...settings.payments.surjopay, prefix: e.target.value } }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="e.g. NOK"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Manual Mobile Banking (Personal bKash / Nagad) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">ম্যানুয়াল মোবাইল ব্যাংকিং (পার্সোনাল বিকাশ / নগদ)</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <label className="flex items-center gap-2 font-bold text-sm text-pink-700 mb-2">
                  <input 
                    type="checkbox"
                    checked={settings.payments?.manualBkash?.enabled || false}
                    onChange={e => setSettings({
                      ...settings,
                      payments: { ...settings.payments, manualBkash: { ...settings.payments.manualBkash, enabled: e.target.checked } }
                    })}
                    className="w-4 h-4 rounded text-pink-600"
                  />
                  <span>ম্যানুয়াল বিকাশ একাউন্ট চালু</span>
                </label>
                <input 
                  type="text"
                  value={settings.payments?.manualBkash?.number || ''}
                  onChange={e => setSettings({
                    ...settings,
                    payments: { ...settings.payments, manualBkash: { ...settings.payments.manualBkash, number: e.target.value } }
                  })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono"
                  placeholder="বিকাশ নম্বর (01XXXXXXXXX)"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <label className="flex items-center gap-2 font-bold text-sm text-orange-700 mb-2">
                  <input 
                    type="checkbox"
                    checked={settings.payments?.manualNagad?.enabled || false}
                    onChange={e => setSettings({
                      ...settings,
                      payments: { ...settings.payments, manualNagad: { ...settings.payments.manualNagad, enabled: e.target.checked } }
                    })}
                    className="w-4 h-4 rounded text-orange-600"
                  />
                  <span>ম্যানুয়াল নগদ একাউন্ট চালু</span>
                </label>
                <input 
                  type="text"
                  value={settings.payments?.manualNagad?.number || ''}
                  onChange={e => setSettings({
                    ...settings,
                    payments: { ...settings.payments, manualNagad: { ...settings.payments.manualNagad, number: e.target.value } }
                  })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono"
                  placeholder="নগদ নম্বর (01XXXXXXXXX)"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Cloudinary Image Hosting */}
      {activeTab === 'cloudinary' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Cloudinary ইমেজ হোস্টিং API</h2>
              <p className="text-xs text-slate-500">প্রোডাক্ট ও ব্যানার ছবি হাই-স্পিড সিডিএন ক্লাউডে আপলোড করতে ক্লাউডিনারি কনফিগার করুন</p>
            </div>
            <a href="https://cloudinary.com" target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              <span>cloudinary.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Cloud Name</label>
              <input 
                type="text" 
                value={settings.cloudinary?.cloudName || ''}
                onChange={e => setSettings({ ...settings, cloudinary: { ...settings.cloudinary, cloudName: e.target.value } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                placeholder="e.g. demo-cloud"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Upload Preset (Unsigned)</label>
              <input 
                type="text" 
                value={settings.cloudinary?.uploadPreset || ''}
                onChange={e => setSettings({ ...settings, cloudinary: { ...settings.cloudinary, uploadPreset: e.target.value } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                placeholder="e.g. ecommerce_preset"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">API Key</label>
              <input 
                type="text" 
                value={settings.cloudinary?.apiKey || ''}
                onChange={e => setSettings({ ...settings, cloudinary: { ...settings.cloudinary, apiKey: e.target.value } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                placeholder="e.g. 1234567890"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Government Compliance & Legal */}
      {activeTab === 'compliance' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">সরকারি বিজনেস কমপ্লায়েন্স ও রেজিস্ট্রেশন</h2>
            <p className="text-xs text-slate-500">বাংলাদেশে ই-কমার্স ব্যবসা পরিচালনার জন্য সরকারি DBID, BIN ও ভ্যাট তথ্য সেট করুন</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">ডিজিটাল বিজনেস আইডি (DBID Number)</label>
              <input 
                type="text" 
                value={settings.compliance?.dbidNumber || ''}
                onChange={e => setSettings({ ...settings, compliance: { ...settings.compliance, dbidNumber: e.target.value } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="যেমন: DBID-198273645"
              />
              <p className="text-xs text-slate-400 mt-1">বাণিজ্য মন্ত্রণালয় কর্তৃক প্রদত্ত DBID সনদ নম্বর।</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">বিজনেস আইডেন্টিফিকেশন নম্বর (BIN Number)</label>
              <input 
                type="text" 
                value={settings.compliance?.binNumber || ''}
                onChange={e => setSettings({ ...settings, compliance: { ...settings.compliance, binNumber: e.target.value } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="যেমন: 002938475-0101"
              />
              <p className="text-xs text-slate-400 mt-1">জাতীয় রাজস্ব বোর্ড (NBR) প্রদত্ত ১৩ ডিজিট BIN নম্বর।</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">ট্রেড লাইসেন্স নম্বর (Trade License No)</label>
              <input 
                type="text" 
                value={settings.compliance?.tradeLicenseNo || ''}
                onChange={e => setSettings({ ...settings, compliance: { ...settings.compliance, tradeLicenseNo: e.target.value } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="যেমন: TRAD/DSCC/019283/2026"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">ভ্যাট শতকরা হার (VAT %)</label>
              <input 
                type="number" 
                value={settings.compliance?.vatPercent || 0}
                onChange={e => setSettings({ ...settings, compliance: { ...settings.compliance, vatPercent: Number(e.target.value) } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="0 বা 5 বা 7.5"
              />
              <p className="text-xs text-slate-400 mt-1">০ হলে কোনো অতিরিক্ত ভ্যাট যুক্ত হবে না।</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">ভ্যাট রেজিস্ট্রেশন নম্বর (VAT Registration No)</label>
              <input 
                type="text" 
                value={settings.compliance?.vatRegistrationNo || ''}
                onChange={e => setSettings({ ...settings, compliance: { ...settings.compliance, vatRegistrationNo: e.target.value } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="VAT-REG-10928374"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.compliance?.displayOnFooter ?? true}
                  onChange={e => setSettings({ ...settings, compliance: { ...settings.compliance, displayOnFooter: e.target.checked } })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-bold text-slate-800">ওয়েবসাইটের ফুটারে সরকারি DBID, BIN ও লাইসেন্স ব্যাজ প্রদর্শন করুন (গ্রাহকের আস্থা বৃদ্ধি পাবে)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Courier API Settings (SteadFast & Pathao) */}
      {activeTab === 'courier' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-8">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">কুরিয়ার সার্ভিস API কনফিগারেশন</h2>
              <p className="text-xs text-slate-500">অর্ডারসমূহ ১-ক্লিকে সরাসরি SteadFast ও Pathao কুরিয়ারে বুকিং করার জন্য API তথ্য দিন</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
              SteadFast & Pathao Supported
            </span>
          </div>

          {/* 1. SteadFast Courier API */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                  SF
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">SteadFast Courier (স্টেডফাস্ট কুরিয়ার)</h3>
                  <p className="text-xs text-slate-500">সারাদেশে ক্যাশ অন ডেলিভারি ও দ্রুত পার্সেল পিকআপ</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-700">
                <input 
                  type="checkbox"
                  checked={settings.courier?.steadfast?.enabled ?? true}
                  onChange={e => setSettings({
                    ...settings,
                    courier: {
                      ...settings.courier,
                      steadfast: { ...settings.courier?.steadfast, enabled: e.target.checked }
                    }
                  })}
                  className="w-4 h-4 text-orange-600 rounded"
                />
                <span>SteadFast সক্রিয় রাখুন</span>
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">SteadFast API Key *</label>
                <input 
                  type="text"
                  value={settings.courier?.steadfast?.apiKey || ''}
                  onChange={e => setSettings({
                    ...settings,
                    courier: {
                      ...settings.courier,
                      steadfast: { ...settings.courier?.steadfast, apiKey: e.target.value }
                    }
                  })}
                  placeholder="e.g. your_steadfast_api_key"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">SteadFast Secret Key *</label>
                <input 
                  type="password"
                  value={settings.courier?.steadfast?.secretKey || ''}
                  onChange={e => setSettings({
                    ...settings,
                    courier: {
                      ...settings.courier,
                      steadfast: { ...settings.courier?.steadfast, secretKey: e.target.value }
                    }
                  })}
                  placeholder="••••••••••••••••"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
              <span>স্টেডফাস্ট মার্চেন্ট প্যানেল: <a href="https://portal.steadfast.com.bd" target="_blank" rel="noreferrer" className="text-orange-600 font-bold hover:underline">portal.steadfast.com.bd</a></span>
              <span className="text-slate-400">Settings &gt; API Credentials থেকে Key সংগ্রহ করুন</span>
            </div>
          </div>

          {/* 2. Pathao Courier API */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                  PT
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Pathao Courier (পাঠাও কুরিয়ার)</h3>
                  <p className="text-xs text-slate-500">অন-ডিমান্ড ও এক্সপ্রেস কুরিয়ার হোম ডেলিভারি</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-700">
                <input 
                  type="checkbox"
                  checked={settings.courier?.pathao?.enabled ?? false}
                  onChange={e => setSettings({
                    ...settings,
                    courier: {
                      ...settings.courier,
                      pathao: { ...settings.courier?.pathao, enabled: e.target.checked }
                    }
                  })}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span>Pathao সক্রিয় রাখুন</span>
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Client ID</label>
                <input 
                  type="text"
                  value={settings.courier?.pathao?.clientId || ''}
                  onChange={e => setSettings({
                    ...settings,
                    courier: {
                      ...settings.courier,
                      pathao: { ...settings.courier?.pathao, clientId: e.target.value }
                    }
                  })}
                  placeholder="Pathao Client ID"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Client Secret</label>
                <input 
                  type="password"
                  value={settings.courier?.pathao?.clientSecret || ''}
                  onChange={e => setSettings({
                    ...settings,
                    courier: {
                      ...settings.courier,
                      pathao: { ...settings.courier?.pathao, clientSecret: e.target.value }
                    }
                  })}
                  placeholder="••••••••••••••••"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Pathao Registered Email / Username</label>
                <input 
                  type="email"
                  value={settings.courier?.pathao?.username || ''}
                  onChange={e => setSettings({
                    ...settings,
                    courier: {
                      ...settings.courier,
                      pathao: { ...settings.courier?.pathao, username: e.target.value }
                    }
                  })}
                  placeholder="merchant@store.com"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Password</label>
                <input 
                  type="password"
                  value={settings.courier?.pathao?.password || ''}
                  onChange={e => setSettings({
                    ...settings,
                    courier: {
                      ...settings.courier,
                      pathao: { ...settings.courier?.pathao, password: e.target.value }
                    }
                  })}
                  placeholder="••••••••••••••••"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Pathao Store ID</label>
                <input 
                  type="text"
                  value={settings.courier?.pathao?.storeId || ''}
                  onChange={e => setSettings({
                    ...settings,
                    courier: {
                      ...settings.courier,
                      pathao: { ...settings.courier?.pathao, storeId: e.target.value }
                    }
                  })}
                  placeholder="e.g. 12948"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
              <span>পাঠাও মার্চেন্ট পোর্টাল: <a href="https://merchant.pathao.com" target="_blank" rel="noreferrer" className="text-red-600 font-bold hover:underline">merchant.pathao.com</a></span>
              <span className="text-slate-400">Developer Settings থেকে Credentials তৈরি করুন</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
