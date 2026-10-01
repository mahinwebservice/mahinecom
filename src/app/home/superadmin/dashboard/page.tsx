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
  Eye
} from 'lucide-react';
import { defaultSettings } from '@/components/landing/AgencyLandingPage';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'stores' | 'customizer' | 'inquiries'>('stores');
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
    expireDate: ''
  });

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
        setSiteSettings({ ...defaultSettings, ...snap.data() });
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

    try {
      await setDoc(doc(db, 'tenants/' + newStore.subdomain + '/settings/general'), {
        businessName: newStore.storeName,
        email: newStore.adminEmail,
        domainType: newStore.domainType,
        expireDate: newStore.expireDate,
        createdAt: Date.now()
      });

      await setDoc(doc(db, 'tenants', newStore.subdomain), {
        id: newStore.subdomain,
        name: newStore.storeName,
        email: newStore.adminEmail,
        domainType: newStore.domainType,
        expireDate: newStore.expireDate,
        createdAt: Date.now()
      });

      alert(`Store created successfully!\n\nClient Login URL: /${newStore.subdomain}/ecomsaas\nClient Register: /${newStore.subdomain}/ecomsaas/register\nSuper Admin URL: /${newStore.subdomain}/mahinsaas`);
      setNewStore({ storeName: '', subdomain: '', domainType: 'sub-id', adminEmail: '', expireDate: '' });
      fetchTenants();

    } catch (error: any) {
      console.error("Failed to create store:", error);
      alert("Error: " + error.message);
    } finally {
      setIsCreating(false);
    }
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
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Registered Stores</h1>
                <p className="text-slate-500 text-sm mt-1">Manage client stores and issue new instant store invitations.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs border border-blue-100">
                  Total Stores: {tenants.length}
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
                    <Plus className="w-5 h-5 text-blue-600" /> Provision New Store
                  </h3>
                  <form onSubmit={handleCreateStore} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Store Name</label>
                      <input required type="text" value={newStore.storeName} onChange={e => setNewStore({...newStore, storeName: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. MahinPOS Store" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Domain Type</label>
                      <select value={newStore.domainType} onChange={e => setNewStore({...newStore, domainType: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                        <option value="sub-id">Sub-ID (mahinecom.vercel.app/store1)</option>
                        <option value="subdomain">Subdomain (store1.mahinecom.vercel.app)</option>
                        <option value="custom">Custom Domain (client.com)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Store ID / Path</label>
                      <input required type="text" pattern="[a-z0-9-]+" value={newStore.subdomain} onChange={e => setNewStore({...newStore, subdomain: e.target.value.toLowerCase()})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" placeholder="e.g. store1" />
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Client Admin Email</label>
                      <input required type="email" value={newStore.adminEmail} onChange={e => setNewStore({...newStore, adminEmail: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="client@email.com" />
                      <p className="text-[11px] text-gray-400 mt-1">Client will use this email at /ecomsaas/register to activate.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Expire Date</label>
                      <input required type="date" value={newStore.expireDate} onChange={e => setNewStore({...newStore, expireDate: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                    
                    <button type="submit" disabled={isCreating} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-70 mt-2 shadow-md text-sm">
                      {isCreating ? 'Provisioning...' : 'Create Invitation'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Tenants List Table */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs uppercase text-slate-500">
                    Store Directory & Access Links
                  </div>
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr><td colSpan={2} className="p-8 text-center text-slate-500">Loading tenants...</td></tr>
                      ) : tenants.length === 0 ? (
                        <tr><td colSpan={2} className="p-8 text-center text-slate-500">No stores created yet.</td></tr>
                      ) : (
                        tenants.map(tenant => (
                          <tr key={tenant.id} className="hover:bg-slate-50 transition">
                            <td className="p-4">
                              <div className="font-bold text-slate-900">{tenant.name || tenant.id}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-600">ID: {tenant.id}</span>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs text-slate-500">{tenant.email || 'No email'}</span>
                              </div>
                              <a href={'/' + tenant.id} target="_blank" className="text-xs text-blue-600 hover:underline mt-1.5 inline-flex items-center gap-1 font-medium">
                                <span>Visit Public Store: /{tenant.id}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <a 
                                  href={'/' + tenant.id + '/ecomsaas/register'}
                                  target="_blank"
                                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg hover:bg-emerald-100 transition text-xs border border-emerald-200"
                                  title="Send this URL to client to claim store"
                                >
                                  Client Claim
                                </a>
                                <a 
                                  href={'/' + tenant.id + '/ecomsaas'}
                                  target="_blank"
                                  className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition text-xs border border-blue-200"
                                  title="Merchant Login URL"
                                >
                                  Client Login (/ecomsaas)
                                </a>
                                <a 
                                  href={'/' + tenant.id + '/mahinsaas'}
                                  target="_blank"
                                  className="px-2.5 py-1 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition text-xs"
                                  title="Super Admin direct access"
                                >
                                  Super Admin (/mahinsaas)
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WEBSITE CUSTOMIZER */}
        {activeTab === 'customizer' && (
          <div className="max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Website Customizer</h1>
                <p className="text-slate-500 text-sm mt-1">
                  Customize the branding, hero slider, services, demo links and contact info on https://mahinecom.vercel.app/
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
              </div>
            </div>

            {settingsSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold text-sm flex items-center gap-2 shadow-sm">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>Website settings saved successfully! Live homepage is now updated.</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-8">
              
              {/* Section 1: Agency Branding */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
                  <Palette className="w-4 h-4 text-blue-600" /> Branding & Title
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
              </div>

              {/* Section 2: Live Demo Links */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
                  <Globe className="w-4 h-4 text-emerald-600" /> Demo Buttons URLs
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">E-Commerce Live Demo URL</label>
                    <input 
                      type="text" 
                      value={siteSettings.demos?.ecomUrl || ''}
                      onChange={e => setSiteSettings({
                        ...siteSettings,
                        demos: { ...siteSettings.demos, ecomUrl: e.target.value }
                      })}
                      className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                      placeholder="https://mahinecom.vercel.app/store1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">School ERP Demo URL</label>
                    <input 
                      type="text" 
                      value={siteSettings.demos?.schoolUrl || ''}
                      onChange={e => setSiteSettings({
                        ...siteSettings,
                        demos: { ...siteSettings.demos, schoolUrl: e.target.value }
                      })}
                      className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                      placeholder="https://mahinecom.vercel.app/store1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">POS Demo URL</label>
                    <input 
                      type="text" 
                      value={siteSettings.demos?.posUrl || ''}
                      onChange={e => setSiteSettings({
                        ...siteSettings,
                        demos: { ...siteSettings.demos, posUrl: e.target.value }
                      })}
                      className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                      placeholder="https://mahinecom.vercel.app/store1"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Contact & Social Info */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
                  <Phone className="w-4 h-4 text-purple-600" /> Contact & Social Links
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
                </div>
              </div>

              {/* Section 4: Footer */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
                  <Sliders className="w-4 h-4 text-slate-700" /> Footer Settings
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">About Text (Column 1)</label>
                  <textarea 
                    rows={2}
                    value={siteSettings.footer.aboutText}
                    onChange={e => setSiteSettings({
                      ...siteSettings,
                      footer: { ...siteSettings.footer, aboutText: e.target.value }
                    })}
                    className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Copyright Line</label>
                  <input 
                    type="text" 
                    value={siteSettings.footer.copyrightText}
                    onChange={e => setSiteSettings({
                      ...siteSettings,
                      footer: { ...siteSettings.footer, copyrightText: e.target.value }
                    })}
                    className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-70"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'Saving Settings...' : 'Save Website Settings'}</span>
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
