'use client';
// @ts-nocheck

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  LayoutTemplate, 
  Save, 
  Palette, 
  Sliders, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Eye, 
  Layers, 
  ShoppingBag, 
  CheckCircle2, 
  Sparkles,
  Upload,
  Phone,
  Mail,
  ExternalLink,
  Award,
  ChevronRight,
  Clock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default function StorefrontCustomizer() {
  const params = useParams();
  const tenantId = (params?.tenant as string) || '';

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

  const [activeTab, setActiveTab] = useState<'header' | 'slider' | 'categories' | 'products' | 'banners' | 'footer'>('header');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Storefront Layout & Header/Footer State
  const [layout, setLayout] = useState({
    // 1. Header & Top Bar
    header: {
      topBarEnabled: true,
      topBarText: '🎉 সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা! হেল্পলাইন: ০১৭১১-০০০০০০',
      topBarPhone: '01711-000000',
      topBarEmail: 'support@yourstore.com',
      topBarBg: '#0f172a',
      topBarTextCol: '#f8fafc',
      headerBg: '#ffffff',
      headerTextCol: '#0f172a',
      sticky: true,
      showStoreName: true,
      showTagline: true,
      storeName: '',
      tagline: 'অফিসিয়াল অনলাইন স্টোর',
      logoUrl: '',
      fontFamily: 'Hind Siliguri',
      primaryColor: '#2563eb',
      accentColor: '#f59e0b',
      menuItems: [
        { id: '1', label: 'হোম', url: `/${tenantId}` },
        { id: '2', label: 'সকল প্রোডাক্ট', url: `/${tenantId}#products` },
        { id: '3', label: 'হট অফার', url: `/${tenantId}#offers` },
        { id: '4', label: 'যোগাযোগ', url: `/${tenantId}#contact` }
      ]
    },

    // 2. Video-like Hero Slider
    heroSlider: {
      enabled: true,
      autoplaySpeed: 5000,
      slides: [
        {
          id: '1',
          badge: '🔥 মেগা সেল অফার',
          title: 'প্রিমিয়াম কোয়ালিটি লাইফস্টাইল ও ফ্যাশন কালেকশন',
          subtitle: '১০০% অরিজিনাল প্রোডাক্ট এবং দ্রুততম সময়ে হোম ডেলিভারি নিশ্চয়তা।',
          bgImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80',
          ctaText: 'এখনই অর্ডার করুন',
          ctaLink: `/${tenantId}/checkout`,
          secondaryCtaText: 'কালেকশন দেখুন',
          secondaryCtaLink: `/${tenantId}#products`
        },
        {
          id: '2',
          badge: '✨ নতুন কালেকশন ২০২৬',
          title: 'লেটেস্ট ট্রেন্ডি গ্যাজেট ও ইলেকট্রনিক্স এক্সেসরিজ',
          subtitle: 'সেরা ডিল ও আকর্ষণীয় ডিসকাউন্টে আপনার পছন্দের পণ্য বেছে নিন।',
          bgImage: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1920&q=80',
          ctaText: 'শপিং শুরু করুন',
          ctaLink: `/${tenantId}/checkout`,
          secondaryCtaText: 'অফার দেখুন',
          secondaryCtaLink: `/${tenantId}#offers`
        }
      ]
    },

    // 3. Category Showcase
    categories: {
      enabled: true,
      title: 'জনপ্রিয় ক্যাটাগরি সমূহ',
      subtitle: 'পছন্দের ক্যাটাগরি নির্বাচন করে সহজে কেনাকাটা করুন',
      style: 'circle' // 'circle' | 'card'
    },

    // 4. Product Grids & Carousel
    products: {
      showTrendingCarousel: true,
      trendingTitle: 'ট্রেন্ডিং ও সর্বাধিক বিক্রিত পণ্য',
      showFeaturedGrid: true,
      featuredTitle: 'আমাদের স্পেশাল কালেকশন',
      featuredSubtitle: 'গ্রাহকদের পছন্দের বাছাইকৃত সেরা পণ্যসমূহ',
      gridColumns: 4 // 3 or 4
    },

    // 5. Promo Banners & Flash Sale CTA
    banners: {
      showPromoBanners: true,
      items: [
        {
          id: '1',
          title: 'নতুন সিজন ফ্যাশন সেল',
          discount: '৪০% পর্যন্ত মূল্যছাড়',
          imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
          btnText: 'অর্ডার করুন',
          linkUrl: `/${tenantId}#products`
        },
        {
          id: '2',
          title: 'স্মার্ট লাইফস্টাইল গ্যাজেট',
          discount: 'সেরা দামে সেরা গ্যাজেট',
          imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
          btnText: 'কালেকশন দেখুন',
          linkUrl: `/${tenantId}#products`
        }
      ],
      showFlashSale: true,
      flashSaleTitle: 'স্পেশাল ফ্ল্যাশ ডিল ২০২৬',
      flashSaleSubtitle: 'সীমিত সময়ের এই অফার উপভোগ করতে এখনই অর্ডার প্লেস করুন!',
      flashSaleDiscount: '৫০% পর্যন্ত ছাড়',
      flashSaleLink: `/${tenantId}/checkout`
    },

    // 6. 4-Column Footer
    footer: {
      bgColor: '#0b1120',
      textColor: '#94a3b8',
      col1About: 'আমরা দিচ্ছি সেরা মানের পণ্য, দ্রুততম হোম ডেলিভারি এবং সহজ রিটার্ন পলিসি। গ্রাহকের সন্তুষ্টিই আমাদের প্রথম অগ্রাধিকার।',
      dbid: 'DBID-198273645',
      bin: 'BIN: 002938475-0101',
      tradeLicense: 'TRAD/DSCC/019283',
      facebook: '',
      whatsapp: '',
      youtube: '',
      instagram: '',
      col2Title: 'প্রয়োজনীয় লিঙ্ক',
      col2Links: [
        { label: 'হোম পেজ', url: `/${tenantId}` },
        { label: 'সকল প্রোডাক্ট', url: `/${tenantId}#products` },
        { label: 'হট ডিলস', url: `/${tenantId}#offers` },
        { label: 'অর্ডার ট্র্যাক করুন', url: `/${tenantId}#orders` }
      ],
      col3Title: 'কাস্টমার কেয়ার ও পলিসি',
      col3Links: [
        { label: 'ডেলিভারি পলিসি', url: '#' },
        { label: 'রিটার্ন ও রিফান্ড পলিসি', url: '#' },
        { label: 'প্রাইভেসি পলিসি', url: '#' },
        { label: 'শর্তাবলী', url: '#' }
      ],
      col4Title: 'যোগাযোগ ও সাপোর্ট',
      hotline: '০১৭০০-০০০০০০',
      email: 'support@yourstore.com',
      address: 'উত্তরা সেক্টর ৭, ঢাকা - ১২৩০, বাংলাদেশ',
      workingHours: 'সকাল ১০টা - রাত ১০টা (প্রতিদিন)',
      copyrightText: 'সর্বস্বত্ব সংরক্ষিত।',
      showPaymentBadges: true
    }
  });

  useEffect(() => {
    if (!tenantId) return;

    const fetchStorefront = async () => {
      try {
        // Fetch layout settings
        const layoutSnap = await getDoc(doc(db, `tenants/${tenantId}/settings/homepage_layout`));
        if (layoutSnap.exists() && layoutSnap.data().storefrontConfig) {
          const cfg = layoutSnap.data().storefrontConfig;
          setLayout(prev => ({
            ...prev,
            ...cfg,
            header: { ...prev.header, ...(cfg.header || {}) },
            heroSlider: { ...prev.heroSlider, ...(cfg.heroSlider || {}) },
            categories: { ...prev.categories, ...(cfg.categories || {}) },
            products: { ...prev.products, ...(cfg.products || {}) },
            banners: { ...prev.banners, ...(cfg.banners || {}) },
            footer: { ...prev.footer, ...(cfg.footer || {}) }
          }));
        }

        // Also sync general settings for business name/logo
        const genSnap = await getDoc(doc(db, `tenants/${tenantId}/settings/general`));
        if (genSnap.exists()) {
          const genData = genSnap.data();
          setLayout(prev => ({
            ...prev,
            header: {
              ...prev.header,
              storeName: prev.header.storeName || genData.businessName || tenantId,
              logoUrl: prev.header.logoUrl || genData.logoUrl || '',
              topBarPhone: prev.header.topBarPhone || genData.phone || '01711-000000',
              topBarEmail: prev.header.topBarEmail || genData.email || 'support@yourstore.com'
            },
            footer: {
              ...prev.footer,
              hotline: prev.footer.hotline || genData.phone || '০১৭০০-০০০০০০',
              email: prev.footer.email || genData.email || 'support@yourstore.com',
              address: prev.footer.address || genData.officeAddress || prev.footer.address,
              dbid: genData.compliance?.dbidNumber || prev.footer.dbid,
              bin: genData.compliance?.binNumber || prev.footer.bin,
              tradeLicense: genData.compliance?.tradeLicenseNo || prev.footer.tradeLicense
            }
          }));
        }
      } catch (err) {
        console.error("Error fetching storefront layout:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStorefront();
  }, [tenantId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await setDoc(doc(db, `tenants/${tenantId}/settings/homepage_layout`), {
        storefrontConfig: layout,
        updatedAt: Date.now()
      }, { merge: true });

      // Also sync brand details into general settings
      await setDoc(doc(db, `tenants/${tenantId}/settings/general`), {
        businessName: layout.header.storeName,
        logoUrl: layout.header.logoUrl,
        tagline: layout.header.tagline,
        phone: layout.header.topBarPhone,
        email: layout.header.topBarEmail,
        updatedAt: Date.now()
      }, { merge: true });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error("Error saving storefront layout:", err);
      alert("Error saving storefront: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Slide Helpers
  const handleAddSlide = () => {
    const newSlide = {
      id: Date.now().toString(),
      badge: '🔥 বিশেষ অফার',
      title: 'নতুন প্রিমিয়াম কালেকশন',
      subtitle: 'সেরা কোয়ালিটির প্রোডাক্ট কিনুন আকর্ষণীয় মূল্যে।',
      bgImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80',
      ctaText: 'অর্ডার করুন',
      ctaLink: `/${tenantId}/checkout`,
      secondaryCtaText: 'অফার দেখুন',
      secondaryCtaLink: `/${tenantId}#products`
    };
    setLayout({
      ...layout,
      heroSlider: {
        ...layout.heroSlider,
        slides: [...layout.heroSlider.slides, newSlide]
      }
    });
  };

  const handleRemoveSlide = (idx: number) => {
    const updated = [...layout.heroSlider.slides];
    updated.splice(idx, 1);
    setLayout({
      ...layout,
      heroSlider: { ...layout.heroSlider, slides: updated }
    });
  };

  const handleUpdateSlide = (idx: number, field: string, val: string) => {
    const updated = [...layout.heroSlider.slides];
    updated[idx] = { ...updated[idx], [field]: val };
    setLayout({
      ...layout,
      heroSlider: { ...layout.heroSlider, slides: updated }
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        হোমপেজ সেটিংস লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutTemplate className="w-7 h-7 text-blue-600" />
            ক্লায়েন্ট হোমপেজ ও স্টোরফ্রন্ট কাস্টমাইজেশন
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            হেডার, অ্যানিমেটেড স্লাইডার, ক্যাটাগরি, প্রোডাক্ট গ্রিড, ব্যানার এবং ৪-কলাম ফুটার পূর্ণ কাস্টমাইজ করুন
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${tenantId}`}
            target="_blank"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm flex items-center gap-2 transition"
          >
            <Eye className="w-4 h-4" />
            <span>লাইভ প্রিভিউ দেখুন</span>
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition cursor-pointer disabled:opacity-70 text-sm"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>পরিবর্তন সেভ করুন</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">হোমপেজ ও স্টোরফ্রন্টের সকল পরিবর্তন সফলভাবে সংরক্ষিত ও লাইভ হয়েছে!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 border-b border-slate-200 text-sm font-semibold">
        {[
          { id: 'header', label: '১. হেডার ও টপ বার', icon: Sliders },
          { id: 'slider', label: '২. ভিডিও অ্যানিমেটেড স্লাইডার', icon: Sparkles },
          { id: 'categories', label: '৩. থাম্বনেইল ক্যাটাগরি', icon: Layers },
          { id: 'products', label: '৪. প্রোডাক্ট গ্রিড ও ক্যারাসেল', icon: ShoppingBag },
          { id: 'banners', label: '৫. ব্যানার ও ফ্ল্যাশ সেল CTA', icon: ImageIcon },
          { id: 'footer', label: '৬. ৪-কলাম রিচ ফুটার', icon: Award }
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

      {/* Tab 1: Header & Top Bar */}
      {activeTab === 'header' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">হেডার ও টপ বার কাস্টমাইজেশন</h2>

          {/* Top Announcement Bar */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-sm text-slate-900 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={layout.header.topBarEnabled}
                  onChange={e => setLayout({ ...layout, header: { ...layout.header, topBarEnabled: e.target.checked } })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>টপ অ্যানাউন্সমেন্ট বার সক্রিয় করুন (Top Notification Bar)</span>
              </label>
            </div>

            {layout.header.topBarEnabled && (
              <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ঘোষণা টেক্সট (Notice Text)</label>
                  <input 
                    type="text"
                    value={layout.header.topBarText}
                    onChange={e => setLayout({ ...layout, header: { ...layout.header, topBarText: e.target.value } })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                    placeholder="যেমন: সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা!"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">টপ বার ফোন / হেল্পলাইন</label>
                  <input 
                    type="text"
                    value={layout.header.topBarPhone}
                    onChange={e => setLayout({ ...layout, header: { ...layout.header, topBarPhone: e.target.value } })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">টপ বার ব্যাকগ্রাউন্ড কালার</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color"
                      value={layout.header.topBarBg}
                      onChange={e => setLayout({ ...layout, header: { ...layout.header, topBarBg: e.target.value } })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                    />
                    <input 
                      type="text"
                      value={layout.header.topBarBg}
                      onChange={e => setLayout({ ...layout, header: { ...layout.header, topBarBg: e.target.value } })}
                      className="w-32 p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Logo & Identity */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">স্টোরের নাম (Store Name)</label>
              <input 
                type="text"
                value={layout.header.storeName}
                onChange={e => setLayout({ ...layout, header: { ...layout.header, storeName: e.target.value } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                placeholder="যেমন: Mahin Shop"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">স্লোগান / ট্যাগলাইন (Slogan)</label>
              <input 
                type="text"
                value={layout.header.tagline}
                onChange={e => setLayout({ ...layout, header: { ...layout.header, tagline: e.target.value } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                placeholder="যেমন: অফিসিয়াল প্রিমিয়াম স্টোর"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-600 uppercase">স্টোর লোগো (Cloudinary Upload / URL)</label>
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
                      if (f) handleCloudinaryUpload(f, url => setLayout({ ...layout, header: { ...layout.header, logoUrl: url } }), 'logo');
                      e.target.value = '';
                    }} 
                    className="hidden" 
                    disabled={uploadingField === 'logo'}
                  />
                </label>
              </div>
              <input 
                type="text"
                value={layout.header.logoUrl}
                onChange={e => setLayout({ ...layout, header: { ...layout.header, logoUrl: e.target.value } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                placeholder="https://res.cloudinary.com/... বা লোগো URL"
              />
              {layout.header.logoUrl && (
                <div className="p-2 bg-slate-100 rounded-xl inline-block border border-slate-200">
                  <img src={layout.header.logoUrl} alt="Logo Preview" className="h-10 w-auto object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">ফন্ট ফ্যামিলি (Font Family)</label>
              <select 
                value={layout.header.fontFamily}
                onChange={e => setLayout({ ...layout, header: { ...layout.header, fontFamily: e.target.value } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              >
                <option value="Hind Siliguri">Hind Siliguri (প্রস্তাবিত সুন্দর বাংলা ফন্ট)</option>
                <option value="Inter">Inter (মডার্ন ক্লিন)</option>
                <option value="Roboto">Roboto</option>
                <option value="Outfit">Outfit (লাক্সারি স্টাইল)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">প্রাইমারি ব্রান্ড কালার (Primary Brand Color)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color"
                  value={layout.header.primaryColor}
                  onChange={e => setLayout({ ...layout, header: { ...layout.header, primaryColor: e.target.value } })}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <input 
                  type="text"
                  value={layout.header.primaryColor}
                  onChange={e => setLayout({ ...layout, header: { ...layout.header, primaryColor: e.target.value } })}
                  className="w-32 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Video-like Hero Slider */}
      {activeTab === 'slider' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">স্লাইডার ডিজাইন (ভিডিও অ্যানিমেশন মোশন)</h2>
              <p className="text-xs text-slate-500">Ken-Burns সিনেমাটিক স্লো-জুম ভিডিও-মতো স্লাইডার কনফিগার করুন</p>
            </div>
            <button
              onClick={handleAddSlide}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন স্লাইড যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-6">
            {layout.heroSlider.slides.map((slide, idx) => (
              <div key={slide.id || idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg">
                    স্লাইড #{idx + 1}
                  </span>
                  {layout.heroSlider.slides.length > 1 && (
                    <button
                      onClick={() => handleRemoveSlide(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition"
                      title="স্লাইড মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">অ্যানিমেটেড ব্যাজ (Floating Badge)</label>
                    <input 
                      type="text"
                      value={slide.badge || ''}
                      onChange={e => handleUpdateSlide(idx, 'badge', e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                      placeholder="যেমন: 🔥 মেগা অফার"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-600 uppercase">ব্যাকগ্রাউন্ড ইমেজ (Cloudinary / URL)</label>
                      <label className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
                        <Upload className="w-3 h-3" />
                        <span>আপলোড</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) handleCloudinaryUpload(f, url => handleUpdateSlide(idx, 'bgImage', url), `slide_${idx}`);
                            e.target.value = '';
                          }} 
                          className="hidden" 
                          disabled={uploadingField === `slide_${idx}`}
                        />
                      </label>
                    </div>
                    <input 
                      type="text"
                      value={slide.bgImage || ''}
                      onChange={e => handleUpdateSlide(idx, 'bgImage', e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono"
                      placeholder="https://res.cloudinary.com/..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">মূল শিরোনাম (Hero Title) *</label>
                    <input 
                      type="text"
                      value={slide.title || ''}
                      onChange={e => handleUpdateSlide(idx, 'title', e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                      placeholder="যেমন: প্রিমিয়াম কোয়ালিটি লাইফস্টাইল কালেকশন"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">সাবটাইটেল / বিবরণ</label>
                    <textarea 
                      rows={2}
                      value={slide.subtitle || ''}
                      onChange={e => handleUpdateSlide(idx, 'subtitle', e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                      placeholder="যেমন: ১০০% অরিজিনাল প্রোডাক্ট এবং দ্রুততম সময়ে হোম ডেলিভারি নিশ্চয়তা।"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">প্রধান বাটন টেক্সট (CTA Text)</label>
                    <input 
                      type="text"
                      value={slide.ctaText || ''}
                      onChange={e => handleUpdateSlide(idx, 'ctaText', e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                      placeholder="যেমন: এখনই অর্ডার করুন"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">প্রধান বাটন লিঙ্ক (CTA Link)</label>
                    <input 
                      type="text"
                      value={slide.ctaLink || ''}
                      onChange={e => handleUpdateSlide(idx, 'ctaLink', e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono"
                      placeholder="যেমন: /store1/checkout"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Thumbnail Categories */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">ক্যাটাগরি মেনু উইথ থাম্বনেইল ইমেজ</h2>
              <p className="text-xs text-slate-500">হোমপেজে গোল বা কার্ড স্টাইলে ক্যাটাগরি পিল প্রদর্শন করুন</p>
            </div>
            <Link
              href={`/${tenantId}/ecomsaas/products`}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>ক্যাটাগরি ম্যানেজ করুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">সেকশন টাইটেল (Title)</label>
              <input 
                type="text"
                value={layout.categories.title}
                onChange={e => setLayout({ ...layout, categories: { ...layout.categories, title: e.target.value } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">ডিসপ্লে স্টাইল (Display Style)</label>
              <select
                value={layout.categories.style}
                onChange={e => setLayout({ ...layout, categories: { ...layout.categories, style: e.target.value as any } })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              >
                <option value="circle">সার্কুলার গোল থাম্বনেইল (Modern Circle Style)</option>
                <option value="card">রেকট্যাঙ্গেল প্রিমিয়াম কার্ড (Card Style)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Product Grids & Carousel */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">প্রোডাক্ট গ্রিড ও ক্যারাসেল সেটিংস</h2>

          <div className="space-y-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <label className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={layout.products.showTrendingCarousel}
                  onChange={e => setLayout({ ...layout, products: { ...layout.products, showTrendingCarousel: e.target.checked } })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>ট্রেন্ডিং প্রোডাক্ট ক্যারাসেল স্লাইডার প্রদর্শন করুন (Product Carousel)</span>
              </label>

              {layout.products.showTrendingCarousel && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ক্যারাসেল টাইটেল</label>
                  <input 
                    type="text"
                    value={layout.products.trendingTitle}
                    onChange={e => setLayout({ ...layout, products: { ...layout.products, trendingTitle: e.target.value } })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              )}
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <label className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={layout.products.showFeaturedGrid}
                  onChange={e => setLayout({ ...layout, products: { ...layout.products, showFeaturedGrid: e.target.checked } })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>প্রধান প্রোডাক্ট গ্রিড ও ক্যাটাগরি ফিল্টার সক্রিয় রাখুন</span>
              </label>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">গ্রিড টাইটেল</label>
                  <input 
                    type="text"
                    value={layout.products.featuredTitle}
                    onChange={e => setLayout({ ...layout, products: { ...layout.products, featuredTitle: e.target.value } })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">গ্রিড সাবটাইটেল</label>
                  <input 
                    type="text"
                    value={layout.products.featuredSubtitle}
                    onChange={e => setLayout({ ...layout, products: { ...layout.products, featuredSubtitle: e.target.value } })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Promo Banners & Flash Sale CTA */}
      {activeTab === 'banners' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">প্রমোশনাল ব্যানার ও ফ্ল্যাশ সেল CTA</h2>

          {/* Flash Sale Banner */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-4">
            <label className="flex items-center gap-2 font-bold text-sm text-slate-900 cursor-pointer">
              <input 
                type="checkbox"
                checked={layout.banners.showFlashSale}
                onChange={e => setLayout({ ...layout, banners: { ...layout.banners, showFlashSale: e.target.checked } })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>ফ্ল্যাশ সেল কাউন্টডাউন টাইমার ব্যানার প্রদর্শন করুন</span>
            </label>

            {layout.banners.showFlashSale && (
              <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ফ্ল্যাশ সেল টাইটেল</label>
                  <input 
                    type="text"
                    value={layout.banners.flashSaleTitle}
                    onChange={e => setLayout({ ...layout, banners: { ...layout.banners, flashSaleTitle: e.target.value } })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ডিসকাউন্ট হাইলাইট</label>
                  <input 
                    type="text"
                    value={layout.banners.flashSaleDiscount}
                    onChange={e => setLayout({ ...layout, banners: { ...layout.banners, flashSaleDiscount: e.target.value } })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-amber-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Two-Column Promo Banners */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">২-কলাম প্রমোশনাল কার্ডস</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {layout.banners.items.map((b, bIdx) => (
                <div key={b.id || bIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase">ব্যানার কার্ড #{bIdx + 1}</span>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">টাইটেল</label>
                    <input 
                      type="text"
                      value={b.title}
                      onChange={e => {
                        const updated = [...layout.banners.items];
                        updated[bIdx].title = e.target.value;
                        setLayout({ ...layout, banners: { ...layout.banners, items: updated } });
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-600 uppercase">ব্যানার ছবি (Cloudinary / URL)</label>
                      <label className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
                        <Upload className="w-3 h-3" />
                        <span>আপলোড</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) handleCloudinaryUpload(f, url => {
                              const updated = [...layout.banners.items];
                              updated[bIdx].imageUrl = url;
                              setLayout({ ...layout, banners: { ...layout.banners, items: updated } });
                            }, `banner_${bIdx}`);
                            e.target.value = '';
                          }} 
                          className="hidden" 
                          disabled={uploadingField === `banner_${bIdx}`}
                        />
                      </label>
                    </div>
                    <input 
                      type="text"
                      value={b.imageUrl}
                      onChange={e => {
                        const updated = [...layout.banners.items];
                        updated[bIdx].imageUrl = e.target.value;
                        setLayout({ ...layout, banners: { ...layout.banners, items: updated } });
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: 4-Column Rich Footer */}
      {activeTab === 'footer' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-8">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">৪-কলাম বিশিষ্ট রিচ ফুটার সম্পূর্ণ কাস্টমাইজেশন</h2>
              <p className="text-xs text-slate-500">ফুটারের প্রতিটি কলামের শিরোনাম, লিঙ্ক, তথ্য ও সোশ্যাল মিডিয়া কাস্টমাইজ করুন</p>
            </div>
          </div>

          {/* Color Settings */}
          <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200/70">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">ফুটার ব্যাকগ্রাউন্ড কালার</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color"
                  value={layout.footer.bgColor || '#0b1120'}
                  onChange={e => setLayout({ ...layout, footer: { ...layout.footer, bgColor: e.target.value } })}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <input 
                  type="text"
                  value={layout.footer.bgColor || '#0b1120'}
                  onChange={e => setLayout({ ...layout, footer: { ...layout.footer, bgColor: e.target.value } })}
                  className="w-32 p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">ফুটার টেক্সট কালার</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color"
                  value={layout.footer.textColor || '#94a3b8'}
                  onChange={e => setLayout({ ...layout, footer: { ...layout.footer, textColor: e.target.value } })}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <input 
                  type="text"
                  value={layout.footer.textColor || '#94a3b8'}
                  onChange={e => setLayout({ ...layout, footer: { ...layout.footer, textColor: e.target.value } })}
                  className="w-32 p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Column 1: Store Intro & Compliance */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">১</span>
              <span>কলাম ১: স্টোর পরিচিতি, সরকারি লাইসেন্স ও সোশ্যাল মিডিয়া</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">স্টোর পরিচিতি বিবরণ (About Text)</label>
              <textarea 
                rows={2}
                value={layout.footer.col1About || ''}
                onChange={e => setLayout({ ...layout, footer: { ...layout.footer, col1About: e.target.value } })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                placeholder="আমরা দিচ্ছি সেরা মানের পণ্য, দ্রুততম হোম ডেলিভারি..."
              />
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">DBID সনদ নম্বর</label>
                <input 
                  type="text"
                  value={layout.footer.dbid || ''}
                  onChange={e => setLayout({ ...layout, footer: { ...layout.footer, dbid: e.target.value } })}
                  placeholder="DBID-198273645"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">BIN নম্বর</label>
                <input 
                  type="text"
                  value={layout.footer.bin || ''}
                  onChange={e => setLayout({ ...layout, footer: { ...layout.footer, bin: e.target.value } })}
                  placeholder="BIN: 002938475-0101"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">ট্রেড লাইসেন্স</label>
                <input 
                  type="text"
                  value={layout.footer.tradeLicense || ''}
                  onChange={e => setLayout({ ...layout, footer: { ...layout.footer, tradeLicense: e.target.value } })}
                  placeholder="TRAD/DSCC/019283"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-2 border-t border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">সোশ্যাল মিডিয়া পেজ লিঙ্কস</label>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                <input 
                  type="text"
                  value={layout.footer.facebook || ''}
                  onChange={e => setLayout({ ...layout, footer: { ...layout.footer, facebook: e.target.value } })}
                  placeholder="Facebook Page URL"
                  className="p-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
                <input 
                  type="text"
                  value={layout.footer.whatsapp || ''}
                  onChange={e => setLayout({ ...layout, footer: { ...layout.footer, whatsapp: e.target.value } })}
                  placeholder="WhatsApp Number / Link"
                  className="p-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
                <input 
                  type="text"
                  value={layout.footer.youtube || ''}
                  onChange={e => setLayout({ ...layout, footer: { ...layout.footer, youtube: e.target.value } })}
                  placeholder="YouTube Channel URL"
                  className="p-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
                <input 
                  type="text"
                  value={layout.footer.instagram || ''}
                  onChange={e => setLayout({ ...layout, footer: { ...layout.footer, instagram: e.target.value } })}
                  placeholder="Instagram URL"
                  className="p-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">২</span>
                <span>কলাম ২: প্রয়োজনীয় লিঙ্ক সমূহ (Quick Links)</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  const updatedLinks = [...(layout.footer.col2Links || [])];
                  updatedLinks.push({ label: 'নতুন লিঙ্ক', url: `/${tenantId}` });
                  setLayout({ ...layout, footer: { ...layout.footer, col2Links: updatedLinks } });
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ লিঙ্ক যোগ করুন</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">কলাম ২ শিরোনাম (Column Title)</label>
              <input 
                type="text"
                value={layout.footer.col2Title || 'প্রয়োজনীয় লিঙ্ক'}
                onChange={e => setLayout({ ...layout, footer: { ...layout.footer, col2Title: e.target.value } })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold"
              />
            </div>

            {/* Links List */}
            <div className="space-y-2.5">
              {(layout.footer.col2Links || []).map((link, lIdx) => (
                <div key={lIdx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                  <input 
                    type="text"
                    value={link.label}
                    onChange={e => {
                      const updated = [...layout.footer.col2Links];
                      updated[lIdx].label = e.target.value;
                      setLayout({ ...layout, footer: { ...layout.footer, col2Links: updated } });
                    }}
                    placeholder="লিঙ্ক নাম (যেমন: সব পণ্য)"
                    className="flex-1 p-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                  <input 
                    type="text"
                    value={link.url}
                    onChange={e => {
                      const updated = [...layout.footer.col2Links];
                      updated[lIdx].url = e.target.value;
                      setLayout({ ...layout, footer: { ...layout.footer, col2Links: updated } });
                    }}
                    placeholder="URL লিঙ্ক (যেমন: /store1#products)"
                    className="flex-1 p-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...layout.footer.col2Links];
                      updated.splice(lIdx, 1);
                      setLayout({ ...layout, footer: { ...layout.footer, col2Links: updated } });
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                    title="লিঙ্কটি মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Customer Care & Policies */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">৩</span>
                <span>কলাম ৩: কাস্টমার সাপোর্ট ও পলিসি লিঙ্কস</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  const updatedLinks = [...(layout.footer.col3Links || [])];
                  updatedLinks.push({ label: 'নতুন পলিসি লিঙ্ক', url: '#' });
                  setLayout({ ...layout, footer: { ...layout.footer, col3Links: updatedLinks } });
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ লিঙ্ক যোগ করুন</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">কলাম ৩ শিরোনাম (Column Title)</label>
              <input 
                type="text"
                value={layout.footer.col3Title || 'কাস্টমার কেয়ার ও পলিসি'}
                onChange={e => setLayout({ ...layout, footer: { ...layout.footer, col3Title: e.target.value } })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold"
              />
            </div>

            {/* Links List */}
            <div className="space-y-2.5">
              {(layout.footer.col3Links || []).map((link, lIdx) => (
                <div key={lIdx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                  <input 
                    type="text"
                    value={link.label}
                    onChange={e => {
                      const updated = [...layout.footer.col3Links];
                      updated[lIdx].label = e.target.value;
                      setLayout({ ...layout, footer: { ...layout.footer, col3Links: updated } });
                    }}
                    placeholder="পলিসি নাম (যেমন: ডেলিভারি পলিসি)"
                    className="flex-1 p-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                  <input 
                    type="text"
                    value={link.url}
                    onChange={e => {
                      const updated = [...layout.footer.col3Links];
                      updated[lIdx].url = e.target.value;
                      setLayout({ ...layout, footer: { ...layout.footer, col3Links: updated } });
                    }}
                    placeholder="URL লিঙ্ক (যেমন: #delivery)"
                    className="flex-1 p-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...layout.footer.col3Links];
                      updated.splice(lIdx, 1);
                      setLayout({ ...layout, footer: { ...layout.footer, col3Links: updated } });
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                    title="লিঙ্কটি মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Contact & Helpline */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">৪</span>
              <span>কলাম ৪: যোগাযোগ, হেল্পলাইন ও কাজের সময়</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">কলাম ৪ শিরোনাম (Column Title)</label>
              <input 
                type="text"
                value={layout.footer.col4Title || 'যোগাযোগ ও সাপোর্ট'}
                onChange={e => setLayout({ ...layout, footer: { ...layout.footer, col4Title: e.target.value } })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">হটলাইন ফোন নম্বর</label>
                <input 
                  type="text"
                  value={layout.footer.hotline || ''}
                  onChange={e => setLayout({ ...layout, footer: { ...layout.footer, hotline: e.target.value } })}
                  placeholder="০১৭০০-০০০০০০"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">সাপোর্ট ইমেইল</label>
                <input 
                  type="email"
                  value={layout.footer.email || ''}
                  onChange={e => setLayout({ ...layout, footer: { ...layout.footer, email: e.target.value } })}
                  placeholder="support@store.com"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">অফিস / শোরুম পূর্ণ ঠিকানা</label>
                <input 
                  type="text"
                  value={layout.footer.address || ''}
                  onChange={e => setLayout({ ...layout, footer: { ...layout.footer, address: e.target.value } })}
                  placeholder="রোড নং ৪, হাউস ১২, উত্তরা, ঢাকা - ১২৩০"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">কাজের সময় (Working Hours)</label>
                <input 
                  type="text"
                  value={layout.footer.workingHours || ''}
                  onChange={e => setLayout({ ...layout, footer: { ...layout.footer, workingHours: e.target.value } })}
                  placeholder="সকাল ১০টা - রাত ১০টা (প্রতিদিন)"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Payment Badges */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">বটম ফুটার সেটিংস (Bottom Footer & Badges)</h3>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">কপিরাইট টেক্সট</label>
              <input 
                type="text"
                value={layout.footer.copyrightText || 'সর্বস্বত্ব সংরক্ষিত।'}
                onChange={e => setLayout({ ...layout, footer: { ...layout.footer, copyrightText: e.target.value } })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={layout.footer.showPaymentBadges ?? true}
                  onChange={e => setLayout({ ...layout, footer: { ...layout.footer, showPaymentBadges: e.target.checked } })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-bold text-slate-800">পেমেন্ট মেথড ব্যাজ (bKash, Nagad, Rocket, VISA, MasterCard, COD) প্রদর্শন করুন</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
