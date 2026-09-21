// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LayoutTemplate, ShoppingBag, Package, Settings, LogOut, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function TenantAdminLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode, 
  params: any 
}) {
  const router = useRouter();
  const tenantId = params.tenantId;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push(`/${tenantId}/admin/login`);
        return;
      }

      const userDoc = await getDoc(doc(db, `system_users/${user.uid}`));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'superadmin' || userData.tenantId === tenantId) {
          setLoading(false);
        } else {
          router.push(`/${tenantId}/admin/login`);
        }
      } else {
        router.push(`/${tenantId}/admin/login`);
      }
    });

    return () => unsubscribe();
  }, [tenantId, router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push(`/${tenantId}/admin/login`);
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900 capitalize truncate">{tenantId}</h2>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
             <span className="w-2 h-2 bg-green-500 rounded-full"></span> Live Store
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <Link href={`/${tenantId}/admin/orders`} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-medium transition">
            <ShoppingBag className="w-5 h-5" /> Orders
          </Link>
          <Link href={`/${tenantId}/admin/products`} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-medium transition">
            <Package className="w-5 h-5" /> Products
          </Link>
          <Link href={`/${tenantId}/admin/storefront`} className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-medium transition">
            <LayoutTemplate className="w-5 h-5" /> Storefront Builder
          </Link>
          <Link href={`/${tenantId}/admin/settings`} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-medium transition">
            <Settings className="w-5 h-5" /> Settings
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-100 space-y-2">
          <a href={`http://${tenantId}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}`} target="_blank" className="flex items-center justify-center w-full gap-2 py-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition font-medium text-sm">
            <LinkIcon className="w-4 h-4" /> View Live Store
          </a>
          <button onClick={handleLogout} className="flex items-center justify-center w-full gap-2 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition font-medium text-sm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
