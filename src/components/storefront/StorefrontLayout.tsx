'use client';
// @ts-nocheck

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useCartStore } from '@/store/cartStore';
import { 
  Store, 
  ShoppingBag, 
  Phone, 
  Mail, 
  ArrowRight, 
  Search, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Sparkles, 
  Globe, 
  ChevronRight 
} from 'lucide-react';
import Link from 'next/link';

interface StorefrontLayoutProps {
  children: React.ReactNode;
  tenantId: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  lang?: 'bn' | 'en';
  onLangChange?: (l: 'bn' | 'en') => void;
}

export default function StorefrontLayout({
  children,
  tenantId,
  searchQuery = '',
  onSearchChange,
  lang: controlledLang,
  onLangChange
}: StorefrontLayoutProps) {
  const router = useRouter();
  const [internalLang, setInternalLang] = useState<'bn' | 'en'>('bn');
  const lang = controlledLang || internalLang;
  const setLang = (l: 'bn' | 'en') => {
    if (onLangChange) onLangChange(l);
    else setInternalLang(l);
  };

  const { items: cartItems, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [generalSettings, setGeneralSettings] = useState<any>(null);
  const [customizerConfig, setCustomizerConfig] = useState<any>(null);

  useEffect(() => {
    if (!tenantId) return;
    const fetchLayoutSettings = async () => {
      try {
        const [genSnap, layoutSnap] = await Promise.all([
          getDoc(doc(db, `tenants/${tenantId}/settings/general`)),
          getDoc(doc(db, `tenants/${tenantId}/settings/homepage_layout`))
        ]);
        if (genSnap.exists()) {
          setGeneralSettings(genSnap.data());
          if (genSnap.data().defaultLanguage && !controlledLang) {
            setInternalLang(genSnap.data().defaultLanguage);
          }
        }
        if (layoutSnap.exists() && layoutSnap.data().storefrontConfig) {
          setCustomizerConfig(layoutSnap.data().storefrontConfig);
        }
      } catch (err) {
        console.error('Error fetching layout data:', err);
      }
    };
    fetchLayoutSettings();
  }, [tenantId, controlledLang]);

  // Merge Config with Defaults
  const config = {
    header: {
      storeName: customizerConfig?.header?.storeName || generalSettings?.businessName || tenantId.toUpperCase(),
      tagline: customizerConfig?.header?.tagline || generalSettings?.tagline || (lang === 'bn' ? 'অফিসিয়াল অনলাইন স্টোর' : 'Official Online Store'),
      showStoreName: customizerConfig?.header?.showStoreName ?? true,
      showTagline: customizerConfig?.header?.showTagline ?? true,
      logoUrl: customizerConfig?.header?.logoUrl || generalSettings?.logoUrl || '',
      primaryColor: customizerConfig?.header?.primaryColor || '#2563eb',
      headerBg: customizerConfig?.header?.headerBg || '#ffffff',
      headerTextCol: customizerConfig?.header?.headerTextCol || '#0f172a',
      sticky: customizerConfig?.header?.sticky ?? true,
      topBarEnabled: customizerConfig?.header?.topBarEnabled ?? true,
      topBarText: customizerConfig?.header?.topBarText || (lang === 'bn' ? 'সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা এবং ১০০% অরিজিনাল পণ্যের নিশ্চয়তা!' : 'Cash on delivery available nationwide with 100% authentic products!'),
      topBarBg: customizerConfig?.header?.topBarBg || '#0f172a',
      topBarTextCol: customizerConfig?.header?.topBarTextCol || '#f8fafc',
      topBarPhone: customizerConfig?.header?.topBarPhone || generalSettings?.phone || '01700-000000',
      menuItems: customizerConfig?.header?.menuItems || [
        { id: 1, label: lang === 'bn' ? 'হোম' : 'Home', url: `/${tenantId}` },
        { id: 2, label: lang === 'bn' ? 'সকল প্রোডাক্ট' : 'All Products', url: `/${tenantId}#products` },
        { id: 3, label: lang === 'bn' ? 'হট অফার' : 'Hot Offers', url: `/${tenantId}#offers` },
        { id: 4, label: lang === 'bn' ? 'যোগাযোগ' : 'Contact', url: `/${tenantId}#contact` },
      ]
    },
    footer: {
      bgColor: customizerConfig?.footer?.bgColor || '#0b1120',
      textColor: customizerConfig?.footer?.textColor || '#94a3b8',
      col1About: customizerConfig?.footer?.col1About || (lang === 'bn' ? 'আমরা দিচ্ছি সেরা মানের পণ্য, দ্রুততম হোম ডেলিভারি এবং সহজ রিটার্ন পলিসি। গ্রাহকের সন্তুষ্টিই আমাদের প্রথম অগ্রাধিকার।' : 'Delivering authentic premium products nationwide with fast delivery and easy returns.'),
      dbid: generalSettings?.compliance?.dbidNumber || customizerConfig?.footer?.dbid || 'DBID-198273645',
      bin: generalSettings?.compliance?.binNumber || customizerConfig?.footer?.bin || 'BIN: 002938475-0101',
      tradeLicense: generalSettings?.compliance?.tradeLicenseNo || customizerConfig?.footer?.tradeLicense || 'TRAD/DSCC/019283',
      facebook: customizerConfig?.footer?.facebook || '',
      whatsapp: customizerConfig?.footer?.whatsapp || '',
      youtube: customizerConfig?.footer?.youtube || '',
      instagram: customizerConfig?.footer?.instagram || '',
      col2Title: customizerConfig?.footer?.col2Title || (lang === 'bn' ? 'প্রয়োজনীয় লিঙ্ক' : 'Quick Links'),
      col2Links: customizerConfig?.footer?.col2Links || [
        { label: lang === 'bn' ? 'হোম পেজ' : 'Home', url: `/${tenantId}` },
        { label: lang === 'bn' ? 'সকল প্রোডাক্ট' : 'All Products', url: `/${tenantId}#products` },
        { label: lang === 'bn' ? 'হট অফার' : 'Hot Offers', url: `/${tenantId}#offers` },
        { label: lang === 'bn' ? 'চেকআউট' : 'Checkout', url: `/${tenantId}/checkout` }
      ],
      col3Title: customizerConfig?.footer?.col3Title || (lang === 'bn' ? 'কাস্টমার কেয়ার ও পলিসি' : 'Customer Care & Policies'),
      col3Links: customizerConfig?.footer?.col3Links || [
        { label: lang === 'bn' ? 'ডেলিভারি পলিসি' : 'Delivery Policy', url: `/${tenantId}/page/delivery-policy` },
        { label: lang === 'bn' ? 'রিটার্ন ও রিফান্ড পলিসি' : 'Return & Refund Policy', url: `/${tenantId}/page/return-policy` },
        { label: lang === 'bn' ? 'প্রাইভেসি পলিসি' : 'Privacy Policy', url: `/${tenantId}/page/privacy-policy` },
        { label: lang === 'bn' ? 'শর্তাবলী' : 'Terms & Conditions', url: `/${tenantId}/page/terms` }
      ],
      col4Title: customizerConfig?.footer?.col4Title || (lang === 'bn' ? 'যোগাযোগ ও হেল্পলাইন' : 'Contact & Helpline'),
      hotline: customizerConfig?.footer?.hotline || generalSettings?.phone || '01700-000000',
      email: customizerConfig?.footer?.email || generalSettings?.email || 'support@yourstore.com',
      address: customizerConfig?.footer?.address || generalSettings?.officeAddress || 'ঢাকা, বাংলাদেশ',
      workingHours: customizerConfig?.footer?.workingHours || (lang === 'bn' ? 'সকাল ১০টা - রাত ১০টা (প্রতিদিন)' : '10:00 AM - 10:00 PM (Daily)'),
      copyrightText: customizerConfig?.footer?.copyrightText || (lang === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'),
      showPaymentBadges: customizerConfig?.footer?.showPaymentBadges ?? true
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      {config.header.topBarEnabled && (
        <div 
          className="text-xs py-2 px-4 border-b border-white/10 transition-colors z-40"
          style={{ backgroundColor: config.header.topBarBg, color: config.header.topBarTextCol }}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <span className="font-medium tracking-wide flex items-center gap-1.5 justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{config.header.topBarText}</span>
            </span>

            <div className="flex items-center gap-4 text-xs font-semibold">
              {config.header.topBarPhone && (
                <a href={`tel:${config.header.topBarPhone}`} className="hover:opacity-80 transition flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{config.header.topBarPhone}</span>
                </a>
              )}

              {/* Language Switcher */}
              <button
                onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
                className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center gap-1 cursor-pointer font-bold"
                title="Switch Language"
              >
                <Globe className="w-3 h-3" />
                <span>{lang === 'bn' ? 'ENGLISH' : 'বাংলা'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN HEADER */}
      <header 
        className={`w-full border-b border-slate-100 z-40 transition-all ${config.header.sticky ? 'sticky top-0 bg-white/95 backdrop-blur-md shadow-xs' : 'bg-white'}`}
        style={{ backgroundColor: config.header.headerBg, color: config.header.headerTextCol }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Store Identity */}
          <Link href={`/${tenantId}`} className="flex items-center gap-3 shrink-0 group">
            {config.header.logoUrl ? (
              <img 
                src={config.header.logoUrl} 
                alt={config.header.storeName} 
                className="h-11 w-auto max-w-[160px] object-contain"
              />
            ) : (
              <div 
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md font-black text-lg transition group-hover:scale-105"
                style={{ backgroundColor: config.header.primaryColor }}
              >
                <Store className="w-6 h-6" />
              </div>
            )}

            <div>
              {config.header.showStoreName && (
                <span className="text-xl md:text-2xl font-black tracking-tight block text-slate-900 leading-none">
                  {config.header.storeName}
                </span>
              )}
              {config.header.showTagline && (
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                  {config.header.tagline}
                </span>
              )}
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange ? onSearchChange(e.target.value) : router.push(`/${tenantId}#products`)}
              placeholder={lang === 'bn' ? 'পণ্য বা ক্যাটাগরি অনুসন্ধান করুন...' : 'Search products or categories...'}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border border-slate-200/80 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Nav Menu Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-slate-700">
            {config.header.menuItems.map((m: any) => (
              <Link 
                key={m.id} 
                href={m.url} 
                className="hover:text-blue-600 transition"
              >
                {m.label}
              </Link>
            ))}
          </nav>

          {/* Cart & Merchant Action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Interactive Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition flex items-center gap-2 cursor-pointer shadow-xs"
              title="শপিং ব্যাগ"
            >
              <ShoppingBag className="w-5 h-5 text-slate-800" />
              <span className="hidden sm:inline text-xs font-bold">
                {lang === 'bn' ? 'কার্ট' : 'Cart'}
              </span>
              {cartCount > 0 && (
                <span 
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-[11px] font-black flex items-center justify-center shadow-md animate-pulse"
                  style={{ backgroundColor: config.header.primaryColor }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* Merchant Access Button */}
            <Link
              href={`/${tenantId}/ecomsaas`}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition hidden sm:block border border-slate-200/70"
            >
              {lang === 'bn' ? 'মার্চেন্ট লগিন' : 'Merchant Login'}
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN BODY CONTENT */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* 4-COLUMN RICH FOOTER */}
      <footer 
        className="mt-auto border-t border-slate-800 pt-16 pb-12"
        style={{ backgroundColor: config.footer.bgColor, color: config.footer.textColor }}
        id="contact"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Store Logo & Compliance Badges */}
          <div className="space-y-4">
            <Link href={`/${tenantId}`} className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-md"
                style={{ backgroundColor: config.header.primaryColor }}
              >
                <Store className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                {config.header.storeName}
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-slate-400">
              {config.footer.col1About}
            </p>

            {/* Government Compliance Numbers */}
            <div className="pt-2 space-y-1.5 text-xs text-slate-400 font-mono">
              {config.footer.dbid && (
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">DBID:</span>
                  <span>{config.footer.dbid}</span>
                </div>
              )}
              {config.footer.bin && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">BIN:</span>
                  <span>{config.footer.bin}</span>
                </div>
              )}
              {config.footer.tradeLicense && (
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">Trade Lic:</span>
                  <span>{config.footer.tradeLicense}</span>
                </div>
              )}
            </div>

            {/* Social Media Links */}
            {(config.footer.facebook || config.footer.whatsapp || config.footer.youtube || config.footer.instagram) && (
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                {config.footer.facebook && (
                  <a href={config.footer.facebook} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-white/10 hover:bg-blue-600 rounded-lg text-[11px] font-bold text-white transition flex items-center gap-1.5" title="Facebook">
                    <span>Facebook</span>
                  </a>
                )}
                {config.footer.whatsapp && (
                  <a href={config.footer.whatsapp.startsWith('http') ? config.footer.whatsapp : `https://wa.me/${config.footer.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5" title="WhatsApp">
                    <span>WhatsApp</span>
                  </a>
                )}
                {config.footer.youtube && (
                  <a href={config.footer.youtube} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-white/10 hover:bg-red-600 rounded-lg text-[11px] font-bold text-white transition flex items-center gap-1.5" title="YouTube">
                    <span>YouTube</span>
                  </a>
                )}
                {config.footer.instagram && (
                  <a href={config.footer.instagram} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-white/10 hover:bg-pink-600 rounded-lg text-[11px] font-bold text-white transition flex items-center gap-1.5" title="Instagram">
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              {config.footer.col2Title}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {config.footer.col2Links.map((l: any, lIdx: number) => (
                <li key={lIdx}>
                  <Link href={l.url} className="hover:text-white transition flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care & Policies */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              {config.footer.col3Title}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {config.footer.col3Links.map((l: any, lIdx: number) => (
                <li key={lIdx}>
                  <Link href={l.url} className="hover:text-white transition flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Hotline */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              {config.footer.col4Title}
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block text-sm">{config.footer.hotline}</span>
                  <span className="text-[11px] text-slate-500">{config.footer.workingHours}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{config.footer.email}</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Store className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{config.footer.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {config.header.storeName}. {config.footer.copyrightText}
          </p>

          {/* Payment Method Badges */}
          {config.footer.showPaymentBadges && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 mr-1">{lang === 'bn' ? 'পেমেন্ট মেথড:' : 'We Accept:'}</span>
              <span className="px-2 py-1 bg-white/10 rounded-md text-white font-bold text-[10px]">bKash</span>
              <span className="px-2 py-1 bg-white/10 rounded-md text-white font-bold text-[10px]">Nagad</span>
              <span className="px-2 py-1 bg-white/10 rounded-md text-white font-bold text-[10px]">Rocket</span>
              <span className="px-2 py-1 bg-white/10 rounded-md text-white font-bold text-[10px]">VISA</span>
              <span className="px-2 py-1 bg-white/10 rounded-md text-white font-bold text-[10px]">MasterCard</span>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md font-bold text-[10px]">COD</span>
            </div>
          )}
        </div>
      </footer>

      {/* SLIDE-OVER QUICK CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-lg">
                    {lang === 'bn' ? 'আপনার শপিং ব্যাগ' : 'Shopping Cart'} ({cartCount})
                  </h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
                    <p className="font-medium text-sm">
                      {lang === 'bn' ? 'আপনার কার্ট বর্তমানে খালি আছে' : 'Your cart is empty'}
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition"
                    >
                      {lang === 'bn' ? 'কেনাকাটা শুরু করুন' : 'Start Shopping'}
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.productId} className="flex gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                        <img 
                          src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'} 
                          alt={item.title} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs truncate">{item.title}</h4>
                          <span className="text-blue-600 font-black text-sm">৳{item.price}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2 border border-slate-200 rounded-lg bg-white p-0.5">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-600 transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-slate-900 px-1">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-600 transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-slate-400 hover:text-red-600 p-1 transition"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {cartItems.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
                  <div className="flex items-center justify-between text-slate-600 text-sm">
                    <span>{lang === 'bn' ? 'মোট সাবটোটাল:' : 'Subtotal:'}</span>
                    <span className="text-xl font-black text-slate-900">৳{getSubtotal()}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    {lang === 'bn' ? 'ডেলিভারি চার্জ চেকআউটে যুক্ত করা হবে' : 'Delivery charge calculated at checkout'}
                  </p>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push(`/${tenantId}/checkout`);
                    }}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{lang === 'bn' ? 'অর্ডার সম্পন্ন করুন' : 'Proceed to Checkout'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
