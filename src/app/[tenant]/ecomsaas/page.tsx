// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Store, Lock, ArrowRight, ShieldCheck, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function TenantMerchantLogin() {
  const router = useRouter();
  const params = useParams();
  const tenantId = (params?.tenant as string) || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 1. Check if user is superadmin or assigned to this tenant in system_users
      const userDoc = await getDoc(doc(db, `system_users/${user.uid}`));
      let isAuthorized = false;

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'superadmin' || userData.tenantId === tenantId) {
          isAuthorized = true;
        }
      }

      // 2. Also check if tenant document has matching admin email
      if (!isAuthorized) {
        const tenantSnap = await getDoc(doc(db, 'tenants', tenantId));
        if (tenantSnap.exists()) {
          const tData = tenantSnap.data();
          if (tData.email && tData.email.toLowerCase() === user.email?.toLowerCase()) {
            isAuthorized = true;
            try {
              await setDoc(doc(db, `system_users/${user.uid}`), {
                email: user.email,
                role: 'admin',
                tenantId: tenantId,
                updatedAt: Date.now()
              }, { merge: true });
            } catch (e) {}
          }
        }
      }

      if (isAuthorized) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('merchant_tenant', tenantId);
        }
        router.push(`/${tenantId}/ecomsaas/orders`);
      } else {
        await auth.signOut();
        setError(`Access denied. You are not an authorized admin for store: ${tenantId}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3 text-white">
            <Store className="w-8 h-8" />
          </div>
          <span className="text-xs uppercase tracking-widest font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-2">
            Store Administration
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">
            {tenantId} Merchant Login
          </h1>
          <p className="text-slate-500 text-sm mt-1 text-center">
            Sign in to manage your orders, products, and online store.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm mb-6 border border-red-100 flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Admin Email</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition text-sm text-slate-900"
              placeholder="admin@yourstore.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition text-sm text-slate-900"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-500/20 disabled:opacity-70 mt-2 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Signing In...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-3">
          <p className="text-xs text-slate-500">
            First time setting up this store?
          </p>
          <Link 
            href={`/${tenantId}/ecomsaas/register`}
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Claim Store & Set Password</span>
          </Link>

          <div className="pt-2">
            <Link 
              href={`/${tenantId}`}
              className="text-xs text-slate-400 hover:text-slate-600 transition"
            >
              ← Back to public storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
