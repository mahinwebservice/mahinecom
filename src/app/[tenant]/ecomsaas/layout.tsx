// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ShoppingBag, Package, FileText, Settings, LayoutTemplate, Store, LogOut, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function TenantEcomsaasLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const tenantId = (params?.tenant as string) || '';
  const [loading, setLoading] = useState(true);

  // Skip auth check for login and register pages
  const isAuthPage = pathname?.endsWith('/ecomsaas') || pathname?.endsWith('/ecomsaas/register');

  useEffect(() => {
    if (isAuthPage) {
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push(`/saasecom?store=${tenantId}`);
        return;
      }

      try {
        // 1. Check system_users
        const userDoc = await getDoc(doc(db, `system_users/${user.uid}`));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === 'superadmin' || userData.tenantId === tenantId) {
            setLoading(false);
            return;
          }
        }

        // 2. Check tenant admin email
        const tenantSnap = await getDoc(doc(db, 'tenants', tenantId));
        if (tenantSnap.exists()) {
          const tData = tenantSnap.data();
          if (tData.email && tData.email.toLowerCase() === user.email?.toLowerCase()) {
            setLoading(false);
            return;
          }
        }

        // 3. Fallback: check localStorage merchant session
        if (typeof window !== 'undefined' && localStorage.getItem('merchant_tenant') === tenantId) {
          setLoading(false);
          return;
        }

        router.push(`/saasecom?store=${tenantId}`);
      } catch (err) {
        console.error("Auth verification error in layout:", err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [tenantId, router, isAuthPage]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push(`/${tenantId}/ecomsaas`);
  };

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 font-semibold text-sm">Verifying Merchant Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight capitalize truncate text-white">{tenantId}</h2>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Merchant Panel
              </span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <Link 
            href={`/${tenantId}/ecomsaas/orders`} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm ${pathname?.includes('/orders') ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <ShoppingBag className="w-4 h-4" /> 
            <span>Orders & Sales</span>
          </Link>

          <Link 
            href={`/${tenantId}/ecomsaas/storefront`} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm ${pathname?.includes('/storefront') ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutTemplate className="w-4 h-4" /> 
            <span>হোমপেজ কাস্টমাইজেশন</span>
          </Link>

          <Link 
            href={`/${tenantId}/ecomsaas/products`} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm ${pathname?.includes('/products') ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Package className="w-4 h-4" /> 
            <span>প্রোডাক্ট ও ক্যাটাগরি</span>
          </Link>

          <Link 
            href={`/${tenantId}/ecomsaas/pages`} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm ${pathname?.includes('/pages') ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <FileText className="w-4 h-4" /> 
            <span>পেজসমূহ (Pages)</span>
          </Link>

          <Link 
            href={`/${tenantId}/ecomsaas/settings`} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm ${pathname?.includes('/settings') ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Settings className="w-4 h-4" /> 
            <span>ওয়েবসাইট ও API সেটিংস</span>
          </Link>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <Link 
              href={`/${tenantId}`} 
              target="_blank"
              className="flex items-center justify-between px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition text-sm"
            >
              <span className="flex items-center gap-3">
                <Store className="w-4 h-4" /> View Storefront
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 w-full px-4 py-2.5 text-red-400 hover:bg-slate-800 rounded-xl transition text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
