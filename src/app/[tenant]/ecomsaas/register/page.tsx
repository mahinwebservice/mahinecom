// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserPlus, Lock, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function TenantMerchantRegister() {
  const router = useRouter();
  const params = useParams();
  const tenantId = (params?.tenant as string) || '';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'system_users/' + user.uid), {
        email: user.email,
        role: 'admin',
        tenantId: tenantId,
        createdAt: Date.now()
      });

      alert('Registration successful! Welcome to your store dashboard.');
      router.push(`/${tenantId}/ecomsaas/orders`);

    } catch (err: any) {
      if (err.code === 'permission-denied') {
         setError('Registration Denied: Your email does not match the invited Admin email for this store.');
      } else if (err.code === 'auth/email-already-in-use') {
         setError('Email is already registered. Please go to Login.');
      } else {
         setError(err.message || 'Failed to register');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-3 text-white">
            <UserPlus className="w-8 h-8" />
          </div>
          <span className="text-xs uppercase tracking-widest font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-2">
            First-Time Setup
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">
            Claim {tenantId} Store
          </h1>
          <p className="text-slate-500 text-sm mt-1 text-center">
            Enter the invited email address to set your password and activate your store.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm mb-6 border border-red-100 flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Invited Email Address</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none transition text-sm text-slate-900"
              placeholder="email@example.com"
            />
            <p className="text-xs text-slate-400 mt-1">Must match the email assigned by Super Admin.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Create Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none transition text-sm text-slate-900"
              placeholder="Minimum 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
            <input 
              required
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none transition text-sm text-slate-900"
              placeholder="Re-enter password"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-70 mt-2 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Activating Store...' : 'Activate Store & Continue'}</span>
            <CheckCircle className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link 
            href={`/${tenantId}/ecomsaas`}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Already have a password? Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
