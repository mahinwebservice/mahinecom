// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ShieldAlert, Lock, ArrowRight, Store } from 'lucide-react';
import Link from 'next/link';

export default function TenantSuperAdminLogin() {
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

      const userDoc = await getDoc(doc(db, `system_users/${user.uid}`));
      
      if (userDoc.exists() && userDoc.data().role === 'superadmin') {
        router.push('/superadmin/dashboard');
      } else {
        await auth.signOut();
        setError('Access denied. You are not a Platform Super Admin.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-white">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-2xl flex items-center justify-center mb-3 border border-red-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="text-xs uppercase tracking-widest font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full mb-2">
            Super Admin Gateway
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight text-center">
            Platform Master Access
          </h1>
          <p className="text-slate-400 text-xs mt-1 text-center">
            Accessing via store: <span className="text-red-400 font-mono font-bold">/{tenantId}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-3.5 rounded-xl text-sm mb-6 border border-red-500/20 flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5">Super Admin Email</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition text-sm text-white"
              placeholder="admin@mahinsaas.com"
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5">Master Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition text-sm text-white"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/30 disabled:opacity-70 mt-2 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Authorize Super Admin'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <Link 
            href={`/${tenantId}`}
            className="text-xs text-slate-500 hover:text-slate-300 transition"
          >
            ← Return to store
          </Link>
        </div>
      </div>
    </div>
  );
}
