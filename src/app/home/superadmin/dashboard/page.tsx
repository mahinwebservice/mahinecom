'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Store, Plus, Users, LayoutDashboard, LogOut, Link as LinkIcon } from 'lucide-react';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
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
        createdAt: Date.now()
      });

      alert('Store created successfully! Ask the client to register at /' + newStore.subdomain + '/admin/register');
      setNewStore({ storeName: '', subdomain: '', domainType: 'sub-id', adminEmail: '', expireDate: '' });
      fetchTenants();

    } catch (error: any) {
      console.error("Failed to create store:", error);
      alert("Error: " + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" /> SaaS Hub
          </h2>
          <p className="text-slate-400 text-sm mt-1">Super Admin Panel</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-xl font-medium transition shadow">
            <Store className="w-5 h-5" /> All Stores
          </a>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center justify-center w-full gap-2 py-3 text-red-400 hover:bg-slate-800 rounded-xl transition font-medium">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-10">Registered Tenants</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Create New Store Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Provision New Store
              </h3>
              <form onSubmit={handleCreateStore} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Store Name</label>
                  <input required type="text" value={newStore.storeName} onChange={e => setNewStore({...newStore, storeName: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. MahinPOS Store" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Domain Type</label>
                  <select value={newStore.domainType} onChange={e => setNewStore({...newStore, domainType: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="sub-id">Sub-ID (mahinsaas.web.app/store1)</option>
                    <option value="subdomain">Subdomain (store1.mahinsaas.web.app)</option>
                    <option value="custom">Custom Domain (client.com)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Store ID / Path</label>
                  <input required type="text" pattern="[a-z0-9-]+" value={newStore.subdomain} onChange={e => setNewStore({...newStore, subdomain: e.target.value.toLowerCase()})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" placeholder="e.g. mahinpos" />
                </div>
                <div className="pt-2 border-t">
                  <label className="block text-sm font-semibold mb-1">Client Admin Email</label>
                  <input required type="email" value={newStore.adminEmail} onChange={e => setNewStore({...newStore, adminEmail: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="client@email.com" />
                  <p className="text-xs text-gray-500 mt-1">Client will use this email to register their own password.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Expire Date</label>
                  <input required type="date" value={newStore.expireDate} onChange={e => setNewStore({...newStore, expireDate: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <button type="submit" disabled={isCreating} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-70 mt-2 shadow-md">
                  {isCreating ? 'Provisioning...' : 'Create Invitation'}
                </button>
              </form>
            </div>
          </div>

          {/* Tenants List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 font-semibold text-slate-600">Store ID / Client</th>
                    <th className="p-4 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                     <tr><td colSpan={2} className="p-8 text-center text-slate-500">Loading tenants...</td></tr>
                  ) : tenants.length === 0 ? (
                     <tr><td colSpan={2} className="p-8 text-center text-slate-500">No stores created yet.</td></tr>
                  ) : (
                    tenants.map(tenant => (
                      <tr key={tenant.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{tenant.id}</div>
                          <a href={'/' + tenant.id} target="_blank" className="text-sm text-blue-600 hover:underline">
                            / {tenant.id}
                          </a>
                        </td>
                        <td className="p-4">
                          <a 
                            href={'/' + tenant.id + '/admin/register'}
                            target="_blank"
                            className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition text-sm"
                          >
                            Registration Link
                          </a>
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
    </div>
  );
}
