// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { 
  Store, 
  Plus, 
  LayoutDashboard, 
  LogOut, 
  Palette, 
  Save, 
  Globe, 
  ExternalLink, 
  MessageSquare,
  Sparkles,
  Phone,
  Mail,
  Sliders,
  CheckCircle,
  Eye,
  Image as ImageIcon,
  DollarSign,
  Search,
  Trash2,
  AlertTriangle,
  Check,
  Copy,
  Key,
  Calendar,
  Pencil,
  ShoppingBag,
  Award
} from 'lucide-react';
import { defaultSettings } from '@/components/landing/AgencyLandingPage';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'stores' | 'customizer' | 'inquiries'>('stores');
  const [customizerSubTab, setCustomizerSubTab] = useState<'branding' | 'seo' | 'slider' | 'services' | 'pricing' | 'contact' | 'footer'>('branding');
  
  const [tenants, setTenants] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Platform Website Settings State
  const [siteSettings, setSiteSettings] = useState(defaultSettings);

  const [newStore, setNewStore] = useState({
    storeName: '',
    subdomain: '',
    domainType: 'sub-id',
    adminEmail: '',
    adminPassword: '',
    expireDate: '',
    customDomain: '',
    logoUrl: '',
    status: 'active'
  });
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Edit Store State
  const [editingStore, setEditingStore] = useState<any | null>(null);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Store State
  const [deletingStore, setDeletingStore] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/superadmin/login');
      } else {
        fetchTenants();
        fetchSettings();
        fetchInquiries();
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchTenants = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'tenants'));
      const tenantsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTenants(tenantsData);
    } catch (error) {
      console.error("Error fetching tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const snap = await getDoc(doc(db, 'platform_settings', 'landing_page'));
      if (snap.exists()) {
        const data = snap.data();
        setSiteSettings({
          ...defaultSettings,
          ...data,
          branding: { ...defaultSettings.branding, ...(data.branding || {}) },
          seo: { ...defaultSettings.seo, ...(data.seo || {}) },
          hero: { ...defaultSettings.hero, ...(data.hero || {}) },
          services: data.services && data.services.length > 0 ? data.services : defaultSettings.services,
          pricing: data.pricing && data.pricing.length > 0 ? data.pricing : defaultSettings.pricing,
          demos: { ...defaultSettings.demos, ...(data.demos || {}) },
          contact: { ...defaultSettings.contact, ...(data.contact || {}) },
          footer: {
            ...defaultSettings.footer,
            ...(data.footer || {}),
            col2Links: (data.footer?.col2Links && data.footer.col2Links.length > 0) ? data.footer.col2Links : defaultSettings.footer.col2Links,
            col3Links: (data.footer?.col3Links && data.footer.col3Links.length > 0) ? data.footer.col3Links : defaultSettings.footer.col3Links
          }
        });
      }
    } catch (error) {
      console.error("Error fetching site settings:", error);
    }
  };

  const fetchInquiries = async () => {
    try {
      const snap = await getDocs(collection(db, 'inquiries'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setInquiries(list);
    } catch (err) {
      console.error("Error fetching inquiries:", err);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/superadmin/login');
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    const storeId = newStore.subdomain.trim().toLowerCase();

    try {
      const storePayload = {
        id: storeId,
        name: newStore.storeName.trim(),
        email: newStore.adminEmail.trim(),
        password: newStore.adminPassword || '',
        expireDate: newStore.expireDate || '',
        customDomain: newStore.customDomain ? newStore.customDomain.trim().toLowerCase() : '',
        domainType: newStore.customDomain ? 'custom' : newStore.domainType,
        logoUrl: newStore.logoUrl || '',
        status: newStore.status || 'active',
        createdAt: Date.now()
      };

      await setDoc(doc(db, 'tenants', storeId), storePayload);

      await setDoc(doc(db, 'tenants/' + storeId + '/settings/general'), {
        businessName: newStore.storeName.trim(),
        email: newStore.adminEmail.trim(),
        password: newStore.adminPassword || '',
        expireDate: newStore.expireDate || '',
        customDomain: newStore.customDomain ? newStore.customDomain.trim().toLowerCase() : '',
        domainType: newStore.customDomain ? 'custom' : newStore.domainType,
        logoUrl: newStore.logoUrl || '',
        status: newStore.status || 'active',
        createdAt: Date.now()
      });

      alert(`নতুন স্টোর সফলভাবে যোগ করা হয়েছে!\n\nস্টোর আইডি: ${storeId}\nক্লায়েন্ট লগিন লিঙ্ক: /saasecom?store=${storeId}\nকাস্টমার ইমেইল: ${newStore.adminEmail}\nপাসওয়ার্ড: ${newStore.adminPassword || 'সেট করা হয়নি'}`);

      setNewStore({
        storeName: '',
        subdomain: '',
        domainType: 'sub-id',
        adminEmail: '',
        adminPassword: '',
        expireDate: '',
        customDomain: '',
        logoUrl: '',
        status: 'active'
      });

      fetchTenants();
    } catch (error: any) {
      console.error("Failed to create store:", error);
      alert("ত্রুটি: " + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEditStore = (store: any) => {
    setEditingStore({
      id: store.id,
      name: store.name || store.businessName || '',
      email: store.email || '',
      password: store.password || '',
      expireDate: store.expireDate || '',
      customDomain: store.customDomain || '',
      domainType: store.domainType || 'sub-id',
      logoUrl: store.logoUrl || '',
      status: store.status || 'active'
    });
  };

  const handleSaveEditStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    setIsSavingEdit(true);

    try {
      const storeId = editingStore.id;
      const updatedData = {
        name: editingStore.name.trim(),
        email: editingStore.email.trim(),
        password: editingStore.password || '',
        expireDate: editingStore.expireDate || '',
        customDomain: editingStore.customDomain ? editingStore.customDomain.trim().toLowerCase() : '',
        domainType: editingStore.customDomain ? 'custom' : (editingStore.domainType || 'sub-id'),
        logoUrl: editingStore.logoUrl || '',
        status: editingStore.status || 'active',
        updatedAt: Date.now()
      };

      await setDoc(doc(db, 'tenants', storeId), updatedData, { merge: true });
      await setDoc(doc(db, 'tenants/' + storeId + '/settings/general'), {
        businessName: editingStore.name.trim(),
        ...updatedData
      }, { merge: true });

      alert('স্টোরের তথ্য সফলভাবে আপডেট করা হয়েছে!');
      setEditingStore(null);
      fetchTenants();
    } catch (err: any) {
      console.error("Error updating store:", err);
      alert("আপডেট ব্যর্থ হয়েছে: " + err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteStore = async () => {
    if (!deletingStore) return;
    setIsDeleting(true);

    try {
      const storeId = deletingStore.id;
      await deleteDoc(doc(db, 'tenants', storeId));
      try {
        await deleteDoc(doc(db, 'tenants/' + storeId + '/settings/general'));
      } catch (e) {}

      alert(`স্টোর "${deletingStore.name || storeId}" সফলভাবে ডিলিট করা হয়েছে!`);
      setDeletingStore(null);
      fetchTenants();
    } catch (err: any) {
      console.error("Error deleting store:", err);
      alert("ডিলিট করতে ত্রুটি হয়েছে: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

    const handleAddFooterCol2Link = () => {
    setSiteSettings({
      ...siteSettings,
      footer: {
        ...siteSettings.footer,
        col2Links: [
          ...(siteSettings.footer?.col2Links || defaultSettings.footer.col2Links),
          { label: 'নতুন সার্ভিস বা সমাধান', url: '#services' }
        ]
      }
    });
  };

  const handleUpdateFooterCol2Link = (index: number, field: string, value: string) => {
    const updated = [...(siteSettings.footer?.col2Links || defaultSettings.footer.col2Links)];
    updated[index] = { ...updated[index], [field]: value };
    setSiteSettings({
      ...siteSettings,
      footer: { ...siteSettings.footer, col2Links: updated }
    });
  };

  const handleRemoveFooterCol2Link = (index: number) => {
    const updated = (siteSettings.footer?.col2Links || defaultSettings.footer.col2Links).filter((_, i) => i !== index);
    setSiteSettings({
      ...siteSettings,
      footer: { ...siteSettings.footer, col2Links: updated }
    });
  };

  const handleAddFooterCol3Link = () => {
    setSiteSettings({
      ...siteSettings,
      footer: {
        ...siteSettings.footer,
        col3Links: [
          ...(siteSettings.footer?.col3Links || defaultSettings.footer.col3Links),
          { label: 'নতুন লিংক', url: '#' }
        ]
      }
    });
  };

  const handleUpdateFooterCol3Link = (index: number, field: string, value: string) => {
    const updated = [...(siteSettings.footer?.col3Links || defaultSettings.footer.col3Links)];
    updated[index] = { ...updated[index], [field]: value };
    setSiteSettings({
      ...siteSettings,
      footer: { ...siteSettings.footer, col3Links: updated }
    });
  };

  const handleRemoveFooterCol3Link = (index: number) => {
    const updated = (siteSettings.footer?.col3Links || defaultSettings.footer.col3Links).filter((_, i) => i !== index);
    setSiteSettings({
      ...siteSettings,
      footer: { ...siteSettings.footer, col3Links: updated }
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      await setDoc(doc(db, 'platform_settings', 'landing_page'), {
        ...siteSettings,
        updatedAt: Date.now()
      });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 4000);
    } catch (err: any) {
      alert("Failed to save settings: " + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // Slide management helpers
  const handleUpdateSlide = (index: number, field: string, value: string) => {
    const updated = [...siteSettings.hero.slides];
    updated[index] = { ...updated[index], [field]: value };
    setSiteSettings({
      ...siteSettings,
      hero: { ...siteSettings.hero, slides: updated }
    });
  };

  const handleAddSlide = () => {
    const newSlide = {
      tag: 'নতুন ফিচার (New Solution)',
      title: 'আমাদের নতুন সফটওয়্যার সার্ভিস',
      highlight: 'আধুনিক অটোমেশন প্ল্যাটফর্ম',
      description: 'আপনার ব্যবসার জন্য সম্পূর্ণ কাস্টমাইজড সফটওয়্যার সমাধান।',
      bgImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80',
      ctaText: 'ডেমো দেখুন',
      ctaLink: '#demos',
      secondaryCtaText: 'পরামর্শ নিন',
      secondaryCtaLink: '#contact'
    };
    setSiteSettings({
      ...siteSettings,
      hero: { ...siteSettings.hero, slides: [...siteSettings.hero.slides, newSlide] }
    });
  };

  const handleRemoveSlide = (index: number) => {
    if (siteSettings.hero.slides.length <= 1) {
      alert('At least one slide must remain');
      return;
    }
    const updated = siteSettings.hero.slides.filter((_, idx) => idx !== index);
    setSiteSettings({
      ...siteSettings,
      hero: { ...siteSettings.hero, slides: updated }
    });
  };

  // Pricing management helpers
  const handleUpdatePricing = (index: number, field: string, value: any) => {
    const updated = [...siteSettings.pricing];
    updated[index] = { ...updated[index], [field]: value };
    setSiteSettings({ ...siteSettings, pricing: updated });
  };

  // Services management helpers
  const handleUpdateService = (index: number, field: string, value: any) => {
    const updated = [...siteSettings.services];
    updated[index] = { ...updated[index], [field]: value };
    setSiteSettings({ ...siteSettings, services: updated });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-500" /> SaaS Hub
          </h2>
          <p className="text-slate-400 text-xs mt-1">Super Admin Panel</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <button 
            onClick={() => setActiveTab('stores')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm ${activeTab === 'stores' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Store className="w-4 h-4" /> 
            <span>Stores / Tenants</span>
          </button>

          <button 
            onClick={() => setActiveTab('customizer')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm ${activeTab === 'customizer' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Palette className="w-4 h-4" /> 
            <span>Website Customizer</span>
          </button>

          <button 
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition text-sm ${activeTab === 'inquiries' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <span className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4" /> Customer Leads
            </span>
            {inquiries.length > 0 && (
              <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {inquiries.length}
              </span>
            )}
          </button>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <a 
              href="/" 
              target="_blank"
              className="flex items-center justify-between px-4 py-2.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" /> View Live Homepage
              </span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center w-full gap-2 py-2.5 text-red-400 hover:bg-slate-800 rounded-xl transition font-medium text-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto min-h-screen">

        {/* TAB 1: STORES / TENANTS */}
        {activeTab === 'stores' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">ক্লায়েন্ট স্টোর ও ওয়েবসাইট ম্যানেজমেন্ট</h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  নতুন ক্লায়েন্ট স্টোর তৈরি করুন, ইমেইল, পাসওয়ার্ড, এক্সপায়ার ডেট ও ডোমেইন এডিট বা ডিলিট করুন।
                </p>
              </div>
              <div className="flex items-center gap-3">
                {tenants.some(t => t.id === 'store1') && (
                  <button
                    onClick={() => {
                      const testStore = tenants.find(t => t.id === 'store1');
                      if (testStore) setDeletingStore(testStore);
                    }}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs border border-red-200 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>⚠️ টেস্ট স্টোর (store1) মুছুন</span>
                  </button>
                )}
                <span className="px-3.5 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl text-xs border border-blue-200">
                  মোট স্টোর: {tenants.length} টি
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Provision New Store Form */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 sticky top-6">
                <div className="flex items-center gap-2 mb-4 border-b pb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Plus className="w-4 h-4 font-bold" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">নতুন ক্লায়েন্ট স্টোর যোগ করুন</h3>
                    <p className="text-[11px] text-slate-500">সকল তথ্য দিয়ে সাবমিট করলেই স্টোর ও লগিন রেডি হবে</p>
                  </div>
                </div>

                <form onSubmit={handleCreateStore} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">স্টোরের নাম (Store Name) *</label>
                    <input 
                      required 
                      type="text" 
                      value={newStore.storeName} 
                      onChange={e => setNewStore({...newStore, storeName: e.target.value})} 
                      className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" 
                      placeholder="e.g. রয়্যাল ফ্যাশন শপ" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      স্টোর আইডি (Store ID / Subdomain) *
                    </label>
                    <div className="relative">
                      <input 
                        required 
                        type="text" 
                        pattern="[a-z0-9-]+" 
                        value={newStore.subdomain} 
                        onChange={e => setNewStore({...newStore, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} 
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm text-blue-600 font-bold" 
                        placeholder="e.g. fashionhub" 
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">ছোট হাতের ইংরেজি অক্ষর ও হাইফেন (ইউআরএল এ ব্যবহার হবে)</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ক্লায়েন্ট অ্যাডমিন ইমেইল *</label>
                      <input 
                        required 
                        type="email" 
                        value={newStore.adminEmail} 
                        onChange={e => setNewStore({...newStore, adminEmail: e.target.value})} 
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                        placeholder="client@gmail.com" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">অ্যাডমিন পাসওয়ার্ড *</label>
                      <div className="relative">
                        <input 
                          required 
                          type={showNewPassword ? "text" : "password"} 
                          value={newStore.adminPassword} 
                          onChange={e => setNewStore({...newStore, adminPassword: e.target.value})} 
                          className="w-full p-2.5 pr-9 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" 
                          placeholder="••••••••" 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">মেয়াদ শেষ (Expire Date) *</label>
                      <input 
                        required
                        type="date" 
                        value={newStore.expireDate} 
                        onChange={e => setNewStore({...newStore, expireDate: e.target.value})} 
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">স্ট্যাটাস (Status)</label>
                      <select 
                        value={newStore.status}
                        onChange={e => setNewStore({...newStore, status: e.target.value})}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-slate-800"
                      >
                        <option value="active">সক্রিয় (Active)</option>
                        <option value="suspended">স্থগিত (Suspended)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">কাস্টম ডোমেইন / সাব-ডোমেইন (যদি থাকে)</label>
                    <input 
                      type="text" 
                      value={newStore.customDomain} 
                      onChange={e => setNewStore({...newStore, customDomain: e.target.value})} 
                      className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono" 
                      placeholder="যেমন: mybrand.com বা shop.brand.com" 
                    />
                    <p className="text-[11px] text-slate-400 mt-1">খালি রাখলে সিস্টেমের ডিফল্ট সাব-আইডি লিংক ব্যবহার হবে।</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">স্টোর লোগো URL (ঐচ্ছিক)</label>
                    <input 
                      type="url" 
                      value={newStore.logoUrl} 
                      onChange={e => setNewStore({...newStore, logoUrl: e.target.value})} 
                      className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs" 
                      placeholder="https://.../logo.png" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isCreating}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>স্টোর তৈরি হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>স্টোর যুক্ত করুন</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column: Existing Stores List */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Store className="w-4 h-4 text-blue-600" />
                    <span>সকল সক্রিয় স্টোর ও ক্লায়েন্ট তালিকা ({tenants.length})</span>
                  </h3>
                  <button 
                    onClick={fetchTenants}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    রিফ্রেশ করুন
                  </button>
                </div>

                {loading ? (
                  <div className="bg-white p-12 rounded-2xl border text-center text-slate-500">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-xs">স্টোর তালিকা লোড হচ্ছে...</p>
                  </div>
                ) : tenants.length === 0 ? (
                  <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
                    <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-slate-700">কোনো ক্লায়েন্ট স্টোর নেই</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      বাম পাশের ফর্ম ব্যবহার করে ক্লায়েন্টের ইমেইল, পাসওয়ার্ড ও স্টোর আইডি দিয়ে প্রথম স্টোর তৈরি করুন।
                    </p>
                  </div>
                ) : (
                  tenants.map(tenant => {
                    const isExpired = tenant.expireDate && new Date(tenant.expireDate).getTime() < Date.now();
                    const isSuspended = tenant.status === 'suspended';

                    return (
                      <div 
                        key={tenant.id} 
                        className={`bg-white p-5 rounded-2xl border transition shadow-sm hover:shadow-md ${tenant.id === 'store1' ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200/90'}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          
                          {/* Store Identity */}
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            {tenant.logoUrl ? (
                              <img src={tenant.logoUrl} alt={tenant.name} className="w-12 h-12 rounded-xl object-contain border p-1 bg-slate-50 shrink-0" />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                                {(tenant.name || tenant.id).charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base font-bold text-slate-900 truncate">
                                  {tenant.name || tenant.id}
                                </h4>
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                                  ID: {tenant.id}
                                </span>
                                {isSuspended ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">
                                    স্থগিত (Suspended)
                                  </span>
                                ) : isExpired ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                                    মেয়াদ উত্তীর্ণ (Expired)
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                    সক্রিয় (Active)
                                  </span>
                                )}
                              </div>

                              {/* Details Grid */}
                              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 mt-2.5 text-xs text-slate-600">
                                <div className="flex items-center gap-1.5 truncate">
                                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{tenant.email || 'ইমেইল সেট নেই'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 font-mono">
                                  <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>পাসওয়ার্ড: <strong>{tenant.password || '••••••••'}</strong></span>
                                  {tenant.password && (
                                    <button 
                                      onClick={() => copyToClipboard(tenant.password, tenant.id + '_pass')}
                                      className="text-slate-400 hover:text-blue-600 ml-1"
                                      title="Copy Password"
                                    >
                                      {copiedKey === tenant.id + '_pass' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>মেয়াদ: <strong>{tenant.expireDate || 'আজীবন / অনির্ধারিত'}</strong></span>
                                </div>
                                <div className="flex items-center gap-1.5 truncate font-mono">
                                  <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{tenant.customDomain ? `ডোমেইন: ${tenant.customDomain}` : 'সাব-আইডি মোড'}</span>
                                </div>
                              </div>

                              {/* Direct Links */}
                              <div className="flex flex-wrap items-center gap-3 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                                <Link 
                                  href={`/saasecom?store=${tenant.id}`}
                                  target="_blank"
                                  className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100"
                                >
                                  <span>লগিন লিংক (/saasecom)</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>

                                <a 
                                  href={tenant.customDomain ? `https://${tenant.customDomain}` : `/${tenant.id}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200"
                                >
                                  <span>পাবলিক শপ</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Edit / Delete */}
                          <div className="flex sm:flex-col items-center gap-2 shrink-0 self-end sm:self-start">
                            <button
                              onClick={() => handleOpenEditStore(tenant)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition flex items-center gap-1.5 border border-slate-200"
                              title="স্টোরের তথ্য ও পাসওয়ার্ড এডিট করুন"
                            >
                              <Pencil className="w-3.5 h-3.5 text-blue-600" />
                              <span>এডিট</span>
                            </button>

                            <button
                              onClick={() => setDeletingStore(tenant)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs transition flex items-center gap-1.5 border border-red-200"
                              title="স্টোর মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              <span>ডিলিট</span>
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* EDIT STORE MODAL */}
            {editingStore && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b pb-3 mb-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-blue-600" />
                        <span>স্টোরের তথ্য এডিট করুন</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">স্টোর আইডি: {editingStore.id}</p>
                    </div>
                    <button 
                      onClick={() => setEditingStore(null)}
                      className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditStore} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">স্টোরের নাম</label>
                      <input 
                        required
                        type="text" 
                        value={editingStore.name}
                        onChange={e => setEditingStore({...editingStore, name: e.target.value})}
                        className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">অ্যাডমিন ইমেইল</label>
                        <input 
                          required
                          type="email" 
                          value={editingStore.email}
                          onChange={e => setEditingStore({...editingStore, email: e.target.value})}
                          className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">অ্যাডমিন পাসওয়ার্ড</label>
                        <div className="relative">
                          <input 
                            required
                            type={showEditPassword ? "text" : "password"} 
                            value={editingStore.password}
                            onChange={e => setEditingStore({...editingStore, password: e.target.value})}
                            className="w-full p-2.5 pr-9 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowEditPassword(!showEditPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">মেয়াদ শেষ (Expire Date)</label>
                        <input 
                          type="date" 
                          value={editingStore.expireDate}
                          onChange={e => setEditingStore({...editingStore, expireDate: e.target.value})}
                          className="w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">স্ট্যাটাস (Status)</label>
                        <select 
                          value={editingStore.status}
                          onChange={e => setEditingStore({...editingStore, status: e.target.value})}
                          className="w-full p-2.5 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="active">সক্রিয় (Active)</option>
                          <option value="suspended">স্থগিত (Suspended)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">কাস্টম ডোমেইন (Custom Domain)</label>
                      <input 
                        type="text" 
                        value={editingStore.customDomain}
                        onChange={e => setEditingStore({...editingStore, customDomain: e.target.value})}
                        placeholder="clientdomain.com"
                        className="w-full p-2.5 border rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">লোগো URL (Logo URL)</label>
                      <input 
                        type="url" 
                        value={editingStore.logoUrl}
                        onChange={e => setEditingStore({...editingStore, logoUrl: e.target.value})}
                        placeholder="https://..."
                        className="w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t">
                      <button 
                        type="button" 
                        onClick={() => setEditingStore(null)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition"
                      >
                        বাতিল
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSavingEdit}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-600/30 disabled:opacity-60"
                      >
                        {isSavingEdit ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deletingStore && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
                    <Trash2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">স্টোর মুছে ফেলবেন?</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">
                    আপনি কি নিশ্চিত যে <strong className="text-slate-800 font-bold">"{deletingStore.name || deletingStore.id}"</strong> (ID: {deletingStore.id}) স্টোরটি চিরতরে মুছে ফেলতে চান? এই কার্যক্রমটি ফিরিয়ে আনা যাবে না।
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={() => setDeletingStore(null)}
                      disabled={isDeleting}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition"
                    >
                      না, ফিরে যান
                    </button>
                    <button 
                      onClick={handleDeleteStore}
                      disabled={isDeleting}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-lg shadow-red-600/30 disabled:opacity-60"
                    >
                      {isDeleting ? 'ডিলিট হচ্ছে...' : 'হ্যাঁ, সম্পূর্ণ মুছে ফেলুন'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {activeTab === 'customizer' && (
          <div className="max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Full Website Customizer</h1>
                <p className="text-slate-500 text-sm mt-1">
                  Customize every element of https://mahinecom.vercel.app/ in real time.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a 
                  href="/" 
                  target="_blank"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Homepage</span>
                </a>
                <button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingSettings ? 'Saving...' : 'Save All Settings'}</span>
                </button>
              </div>
            </div>

            {settingsSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold text-sm flex items-center gap-2 shadow-sm">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>All settings saved successfully! Live website has been updated.</span>
              </div>
            )}

            {/* Customizer Sub-Tabs Navigation */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto text-xs font-bold">
              {[
                { id: 'branding', label: '1. Branding & Logo', icon: Palette },
                { id: 'seo', label: '2. Browser Title & SEO', icon: Search },
                { id: 'slider', label: '3. Video-Style Hero Slider', icon: ImageIcon },
                { id: 'services', label: '4. Service Cards', icon: Store },
                { id: 'pricing', label: '5. Price Cards', icon: DollarSign },
                { id: 'contact', label: '6. Contact & Socials', icon: Phone },
                { id: 'footer', label: '7. Footer & Info', icon: Sliders }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCustomizerSubTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${customizerSubTab === tab.id ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'}`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              {/* SUBTAB 1: BRANDING & IDENTITY */}
              {customizerSubTab === 'branding' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
                    <Palette className="w-4 h-4 text-blue-600" /> Platform Identity & Logo
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Agency / Platform Name</label>
                      <input 
                        type="text" 
                        value={siteSettings.branding.agencyName}
                        onChange={e => setSiteSettings({
                          ...siteSettings,
                          branding: { ...siteSettings.branding, agencyName: e.target.value }
                        })}
                        className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Top Badge Text</label>
                      <input 
                        type="text" 
                        value={siteSettings.branding.badgeText}
                        onChange={e => setSiteSettings({
                          ...siteSettings,
                          branding: { ...siteSettings.branding, badgeText: e.target.value }
                        })}
                        className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline / Slogan</label>
                    <input 
                      type="text" 
                      value={siteSettings.branding.tagline}
                      onChange={e => setSiteSettings({
                        ...siteSettings,
                        branding: { ...siteSettings.branding, tagline: e.target.value }
                      })}
                      className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Logo Image URL (Optional)</label>
                      <input 
                        type="text" 
                        value={siteSettings.branding.logoUrl || ''}
                        onChange={e => setSiteSettings({
                          ...siteSettings,
                          branding: { ...siteSettings.branding, logoUrl: e.target.value }
                        })}
                        placeholder="https://example.com/logo.png"
                        className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs" 
                      />
                      <p className="text-[11px] text-gray-400 mt-1">Leave empty to use modern icon badge logo.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Favicon URL</label>
                      <input 
                        type="text" 
                        value={siteSettings.branding.faviconUrl || ''}
                        onChange={e => setSiteSettings({
                          ...siteSettings,
                          branding: { ...siteSettings.branding, faviconUrl: e.target.value }
                        })}
                        placeholder="/favicon.ico or image URL"
                        className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: BROWSER TITLE & SEO */}
              {customizerSubTab === 'seo' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
                    <Search className="w-4 h-4 text-emerald-600" /> Browser Title & SEO Meta Tags
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Browser Tab Title (&lt;title&gt;)</label>
                    <input 
                      type="text" 
                      value={siteSettings.seo?.browserTitle || ''}
                      onChange={e => setSiteSettings({
                        ...siteSettings,
                        seo: { ...siteSettings.seo, browserTitle: e.target.value }
                      })}
                      className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <p className="text-[11px] text-gray-400 mt-1">This text appears at the top of the browser tab.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Google & Social Meta Description</label>
                    <textarea 
                      rows={3}
                      value={siteSettings.seo?.metaDescription || ''}
                      onChange={e => setSiteSettings({
                        ...siteSettings,
                        seo: { ...siteSettings.seo, metaDescription: e.target.value }
                      })}
                      className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">SEO Keywords (comma separated)</label>
                    <input 
                      type="text" 
                      value={siteSettings.seo?.keywords || ''}
                      onChange={e => setSiteSettings({
                        ...siteSettings,
                        seo: { ...siteSettings.seo, keywords: e.target.value }
                      })}
                      className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </div>
              )}

              {/* SUBTAB 3: VIDEO-STYLE HERO SLIDER */}
              {customizerSubTab === 'slider' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Hero Slider Slides ({siteSettings.hero.slides.length})</h3>
                      <p className="text-xs text-slate-500">Each slide has high-res background with smooth Ken-Burns video-like motion.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSlide}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold border border-blue-200 flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Slide</span>
                    </button>
                  </div>

                  {siteSettings.hero.slides.map((slide, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 relative">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-xs font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                          Slide #{idx + 1}
                        </span>
                        {siteSettings.hero.slides.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSlide(idx)}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Slide</span>
                          </button>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Slide Tag / Badge</label>
                          <input 
                            type="text" 
                            value={slide.tag || ''}
                            onChange={e => handleUpdateSlide(idx, 'tag', e.target.value)}
                            className="w-full p-2 border rounded-lg text-xs" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Background Image URL (Ken-Burns Motion)</label>
                          <input 
                            type="text" 
                            value={slide.bgImage || ''}
                            onChange={e => handleUpdateSlide(idx, 'bgImage', e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full p-2 border rounded-lg text-xs font-mono" 
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Slide Title (Top Line)</label>
                          <input 
                            type="text" 
                            value={slide.title || ''}
                            onChange={e => handleUpdateSlide(idx, 'title', e.target.value)}
                            className="w-full p-2 border rounded-lg text-sm" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Highlight Text (Gradient)</label>
                          <input 
                            type="text" 
                            value={slide.highlight || ''}
                            onChange={e => handleUpdateSlide(idx, 'highlight', e.target.value)}
                            className="w-full p-2 border rounded-lg text-sm font-bold text-blue-600" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                        <textarea 
                          rows={2}
                          value={slide.description || ''}
                          onChange={e => handleUpdateSlide(idx, 'description', e.target.value)}
                          className="w-full p-2 border rounded-lg text-xs" 
                        ></textarea>
                      </div>

                      <div className="grid sm:grid-cols-4 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Button 1 Text</label>
                          <input type="text" value={slide.ctaText || ''} onChange={e => handleUpdateSlide(idx, 'ctaText', e.target.value)} className="w-full p-1.5 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Button 1 Link</label>
                          <input type="text" value={slide.ctaLink || ''} onChange={e => handleUpdateSlide(idx, 'ctaLink', e.target.value)} className="w-full p-1.5 border rounded-lg text-xs font-mono" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Button 2 Text</label>
                          <input type="text" value={slide.secondaryCtaText || ''} onChange={e => handleUpdateSlide(idx, 'secondaryCtaText', e.target.value)} className="w-full p-1.5 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Button 2 Link</label>
                          <input type="text" value={slide.secondaryCtaLink || ''} onChange={e => handleUpdateSlide(idx, 'secondaryCtaLink', e.target.value)} className="w-full p-1.5 border rounded-lg text-xs font-mono" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SUBTAB 4: SERVICE CARDS */}
              {customizerSubTab === 'services' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Service Solutions Cards</h3>
                  {siteSettings.services.map((srv, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b pb-2 font-bold text-xs uppercase text-slate-500">
                        <span>Service #{idx + 1} ({srv.tagline})</span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Service Title</label>
                          <input type="text" value={srv.title} onChange={e => handleUpdateService(idx, 'title', e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline</label>
                          <input type="text" value={srv.tagline} onChange={e => handleUpdateService(idx, 'tagline', e.target.value)} className="w-full p-2 border rounded-lg text-xs" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                        <textarea rows={2} value={srv.description} onChange={e => handleUpdateService(idx, 'description', e.target.value)} className="w-full p-2 border rounded-lg text-xs"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Demo / Action Link</label>
                        <input type="text" value={srv.demoLink || ''} onChange={e => handleUpdateService(idx, 'demoLink', e.target.value)} className="w-full p-2 border rounded-lg text-xs font-mono" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SUBTAB 5: PRICING CARDS */}
              {customizerSubTab === 'pricing' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Pricing & Packages Cards</h3>
                  {siteSettings.pricing.map((plan, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b pb-2 font-bold text-xs uppercase text-slate-500">
                        <span>Plan #{idx + 1}: {plan.name}</span>
                        <label className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={!!plan.isPopular} 
                            onChange={e => handleUpdatePricing(idx, 'isPopular', e.target.checked)} 
                            className="rounded"
                          />
                          <span>Highlight as Popular</span>
                        </label>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Name</label>
                          <input type="text" value={plan.name} onChange={e => handleUpdatePricing(idx, 'name', e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Price Text</label>
                          <input type="text" value={plan.price} onChange={e => handleUpdatePricing(idx, 'price', e.target.value)} className="w-full p-2 border rounded-lg text-sm font-bold" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Period</label>
                          <input type="text" value={plan.period} onChange={e => handleUpdatePricing(idx, 'period', e.target.value)} className="w-full p-2 border rounded-lg text-xs" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                        <input type="text" value={plan.description} onChange={e => handleUpdatePricing(idx, 'description', e.target.value)} className="w-full p-2 border rounded-lg text-xs" />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Button Text</label>
                          <input type="text" value={plan.buttonText || ''} onChange={e => handleUpdatePricing(idx, 'buttonText', e.target.value)} className="w-full p-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Button Link / WhatsApp URL</label>
                          <input type="text" value={plan.buttonLink || ''} onChange={e => handleUpdatePricing(idx, 'buttonLink', e.target.value)} className="w-full p-2 border rounded-lg text-xs font-mono" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SUBTAB 6: CONTACT & SOCIALS */}
              {customizerSubTab === 'contact' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
                    <Phone className="w-4 h-4 text-purple-600" /> Contact & Social Media Information
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number (e.g. 88017XXXXXXXX)</label>
                      <input 
                        type="text" 
                        value={siteSettings.contact.whatsappNumber}
                        onChange={e => setSiteSettings({
                          ...siteSettings,
                          contact: { ...siteSettings.contact, whatsappNumber: e.target.value }
                        })}
                        className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Support Phone</label>
                      <input 
                        type="text" 
                        value={siteSettings.contact.phone}
                        onChange={e => setSiteSettings({
                          ...siteSettings,
                          contact: { ...siteSettings.contact, phone: e.target.value }
                        })}
                        className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
                      <input 
                        type="email" 
                        value={siteSettings.contact.email}
                        onChange={e => setSiteSettings({
                          ...siteSettings,
                          contact: { ...siteSettings.contact, email: e.target.value }
                        })}
                        className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Office Address</label>
                      <input 
                        type="text" 
                        value={siteSettings.contact.address}
                        onChange={e => setSiteSettings({
                          ...siteSettings,
                          contact: { ...siteSettings.contact, address: e.target.value }
                        })}
                        className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Facebook Page URL</label>
                      <input 
                        type="text" 
                        value={siteSettings.contact.facebookUrl || ''}
                        onChange={e => setSiteSettings({
                          ...siteSettings,
                          contact: { ...siteSettings.contact, facebookUrl: e.target.value }
                        })}
                        className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube Channel URL</label>
                      <input 
                        type="text" 
                        value={siteSettings.contact.youtubeUrl || ''}
                        onChange={e => setSiteSettings({
                          ...siteSettings,
                          contact: { ...siteSettings.contact, youtubeUrl: e.target.value }
                        })}
                        className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 7: FOOTER & LEGAL */}
              {customizerSubTab === 'footer' && (
                <div className="space-y-6">
                  {/* Card 1: Column 1 Bio & Social */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
                      <Sliders className="w-4 h-4 text-blue-600" /> কলাম ১: এজেন্সি বায়ো ও সোশ্যাল মিডিয়া (Bio & Social Links)
                    </h3>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">এজেন্সি পরিচিতি বিবরণ (Column 1 Bio Description)</label>
                      <textarea 
                        rows={2}
                        value={siteSettings.footer?.aboutText}
                        onChange={e => setSiteSettings({
                          ...siteSettings,
                          footer: { ...siteSettings.footer, aboutText: e.target.value }
                        })}
                        className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                      ></textarea>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">ফেসবুক পেজ লিংক (Facebook URL)</label>
                        <input 
                          type="text" 
                          value={siteSettings.contact?.facebookUrl}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            contact: { ...siteSettings.contact, facebookUrl: e.target.value }
                          })}
                          className="w-full p-2 border rounded-lg text-xs" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">ইউটিউব চ্যানেল লিংক (YouTube URL)</label>
                        <input 
                          type="text" 
                          value={siteSettings.contact?.youtubeUrl}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            contact: { ...siteSettings.contact, youtubeUrl: e.target.value }
                          })}
                          className="w-full p-2 border rounded-lg text-xs" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">হোয়াটসঅ্যাপ চ্যাট লিংক (WhatsApp Number)</label>
                        <input 
                          type="text" 
                          value={siteSettings.contact?.whatsappNumber}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            contact: { ...siteSettings.contact, whatsappNumber: e.target.value }
                          })}
                          className="w-full p-2 border rounded-lg text-xs" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Column 2 Solutions / Services */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-emerald-600" /> কলাম ২: সফটওয়্যার সেবাসমূহ (Services / Solutions Links)
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">ফুটারের ২য় কলামের হেডিং ও প্রতিটি সার্ভিস লিংক ইচ্ছামত এডিট বা যোগ করুন</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleAddFooterCol2Link}
                        className="px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-xl transition border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <Plus className="w-3.5 h-3.5" /> + নতুন সার্ভিস লিংক যোগ করুন
                      </button>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">কলাম ২ শিরোনাম (Column 2 Title)</label>
                      <input 
                        type="text" 
                        value={siteSettings.footer?.col2Title || 'সফটওয়্যার সেবাসমূহ'}
                        onChange={e => setSiteSettings({
                          ...siteSettings,
                          footer: { ...siteSettings.footer, col2Title: e.target.value }
                        })}
                        placeholder="সফটওয়্যার সেবাসমূহ"
                        className="w-full sm:w-1/2 p-2.5 border rounded-lg text-sm font-bold text-slate-800" 
                      />
                    </div>

                    <div className="space-y-2.5">
                      <div className="grid grid-cols-12 gap-2 text-[11px] font-bold uppercase text-slate-400 px-1">
                        <span className="col-span-6">সার্ভিসের নাম / টেক্সট (Label)</span>
                        <span className="col-span-5">লিংক বা হ্যাশট্যাগ (URL / Anchor)</span>
                        <span className="col-span-1 text-right">ডিলিট</span>
                      </div>
                      {(siteSettings.footer?.col2Links || defaultSettings.footer.col2Links).map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                          <div className="col-span-6">
                            <input 
                              type="text" 
                              value={item.label}
                              onChange={e => handleUpdateFooterCol2Link(idx, 'label', e.target.value)}
                              placeholder="সার্ভিসের নাম"
                              className="w-full p-2 bg-white border rounded-lg text-xs font-medium text-slate-800" 
                            />
                          </div>
                          <div className="col-span-5">
                            <input 
                              type="text" 
                              value={item.url}
                              onChange={e => handleUpdateFooterCol2Link(idx, 'url', e.target.value)}
                              placeholder="#services বা /url"
                              className="w-full p-2 bg-white border rounded-lg text-xs text-slate-600 font-mono" 
                            />
                          </div>
                          <div className="col-span-1 text-right">
                            <button 
                              type="button" 
                              onClick={() => handleRemoveFooterCol2Link(idx)}
                              title="Delete Link"
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 3: Column 3 Important / Quick Links */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-indigo-600" /> কলাম ৩: গুরুত্বপূর্ণ লিংক (Quick Links)
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">ফুটারের ৩য় কলামের হেডিং ও যেকোনো গুরুত্বপূর্ণ পেজ বা লগিন লিংক কাস্টমাইজ করুন</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleAddFooterCol3Link}
                        className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl transition border border-indigo-200 flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <Plus className="w-3.5 h-3.5" /> + নতুন গুরুত্বপূর্ণ লিংক যোগ করুন
                      </button>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">কলাম ৩ শিরোনাম (Column 3 Title)</label>
                      <input 
                        type="text" 
                        value={siteSettings.footer?.col3Title || 'গুরুত্বপূর্ণ লিংক'}
                        onChange={e => setSiteSettings({
                          ...siteSettings,
                          footer: { ...siteSettings.footer, col3Title: e.target.value }
                        })}
                        placeholder="গুরুত্বপূর্ণ লিংক"
                        className="w-full sm:w-1/2 p-2.5 border rounded-lg text-sm font-bold text-slate-800" 
                      />
                    </div>

                    <div className="space-y-2.5">
                      <div className="grid grid-cols-12 gap-2 text-[11px] font-bold uppercase text-slate-400 px-1">
                        <span className="col-span-6">লিংকের নাম / টেক্সট (Label)</span>
                        <span className="col-span-5">ট্রেসিং লিংক (URL / Route)</span>
                        <span className="col-span-1 text-right">ডিলিট</span>
                      </div>
                      {(siteSettings.footer?.col3Links || defaultSettings.footer.col3Links).map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                          <div className="col-span-6">
                            <input 
                              type="text" 
                              value={item.label}
                              onChange={e => handleUpdateFooterCol3Link(idx, 'label', e.target.value)}
                              placeholder="যেমন: মার্চেন্ট লগিন (/ecomsaas)"
                              className="w-full p-2 bg-white border rounded-lg text-xs font-medium text-slate-800" 
                            />
                          </div>
                          <div className="col-span-5">
                            <input 
                              type="text" 
                              value={item.url}
                              onChange={e => handleUpdateFooterCol3Link(idx, 'url', e.target.value)}
                              placeholder="/store1/ecomsaas বা #demos"
                              className="w-full p-2 bg-white border rounded-lg text-xs text-slate-600 font-mono" 
                            />
                          </div>
                          <div className="col-span-1 text-right">
                            <button 
                              type="button" 
                              onClick={() => handleRemoveFooterCol3Link(idx)}
                              title="Delete Link"
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 4: Column 4 Contact Details */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
                      <Phone className="w-4 h-4 text-cyan-600" /> কলাম ৪: অফিস ও যোগাযোগ তথ্য (Column 4 Contact Info)
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">কলাম ৪ শিরোনাম (Column 4 Title)</label>
                        <input 
                          type="text" 
                          value={siteSettings.footer?.col4Title || 'অফিস ও যোগাযোগ'}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            footer: { ...siteSettings.footer, col4Title: e.target.value }
                          })}
                          className="w-full p-2.5 border rounded-lg text-sm font-bold text-slate-800" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">অফিস ঠিকানা (Address)</label>
                        <input 
                          type="text" 
                          value={siteSettings.contact?.address}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            contact: { ...siteSettings.contact, address: e.target.value }
                          })}
                          className="w-full p-2.5 border rounded-lg text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">হেল্পলাইন ফোন নম্বর</label>
                        <input 
                          type="text" 
                          value={siteSettings.contact?.phone}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            contact: { ...siteSettings.contact, phone: e.target.value }
                          })}
                          className="w-full p-2.5 border rounded-lg text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">সাপোর্ট ইমেইল</label>
                        <input 
                          type="email" 
                          value={siteSettings.contact?.email}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            contact: { ...siteSettings.contact, email: e.target.value }
                          })}
                          className="w-full p-2.5 border rounded-lg text-sm" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Bottom Bar & Copyright */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
                      <Award className="w-4 h-4 text-purple-600" /> ফুটার বটম বার ও ক্রেডিট লাইন (Bottom Bar & Credits)
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">কপিরাইট লাইন (Copyright Text)</label>
                        <input 
                          type="text" 
                          value={siteSettings.footer?.copyrightText}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            footer: { ...siteSettings.footer, copyrightText: e.target.value }
                          })}
                          className="w-full p-2.5 border rounded-lg text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Powered By ব্র্যান্ড নাম</label>
                        <input 
                          type="text" 
                          value={siteSettings.footer?.poweredBy || 'Mahin Web Services'}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            footer: { ...siteSettings.footer, poweredBy: e.target.value }
                          })}
                          className="w-full p-2.5 border rounded-lg text-sm font-semibold" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Sticky Action Bar */}
              <div className="sticky bottom-6 z-20 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-slate-800">
                <span className="text-xs text-slate-300 font-medium">
                  Changes will be published immediately to <span className="text-blue-400 font-bold">https://mahinecom.vercel.app/</span>
                </span>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-70"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'Saving...' : 'Save All Website Settings'}</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 3: CUSTOMER INQUIRIES / LEADS */}
        {activeTab === 'inquiries' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Inquiries (Leads)</h1>
                <p className="text-slate-500 text-sm mt-1">Direct inquiries submitted by visitors from the website contact form.</p>
              </div>
              <button 
                onClick={fetchInquiries}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Refresh Leads
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
                    <th className="p-4">Customer</th>
                    <th className="p-4">Requested Service</th>
                    <th className="p-4">Message</th>
                    <th className="p-4">Received Date</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {inquiries.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">No customer inquiries yet.</td></tr>
                  ) : (
                    inquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-slate-50 transition">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{inq.name}</div>
                          <div className="text-xs text-blue-600 font-mono mt-0.5">{inq.phone}</div>
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold uppercase bg-blue-50 text-blue-700">
                            {inq.service}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-slate-600 max-w-xs">
                          {inq.message || 'No message provided'}
                        </td>
                        <td className="p-4 text-xs text-slate-400">
                          {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="p-4">
                          <a 
                            href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(inq.name)},%20thank%20you%20for%20contacting%20us%20about%20our%20services.`}
                            target="_blank"
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-xs hover:bg-emerald-100 transition inline-flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
