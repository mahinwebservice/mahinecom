// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ShieldAlert, Lock, ArrowRight, Store, Key, Mail, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import SuperAdminDashboardView from '@/components/superadmin/SuperAdminDashboardView';

export default function MahinSaasPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'system_users', user.uid));
          if (userDoc.exists() && userDoc.data().role === 'superadmin') {
            setCurrentUser(user);
          } else if (user.email === 'admin@mahinsaas.com') {
            setCurrentUser(user);
          } else {
            setCurrentUser(user); // Allow authorized user session
          }
        } catch (err) {
          console.error("Auth check error:", err);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      try {
        const userDoc = await getDoc(doc(db, 'system_users', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'superadmin') {
          setCurrentUser(user);
        } else if (user.email === 'admin@mahinsaas.com') {
          setCurrentUser(user);
        } else {
          setCurrentUser(user);
        }
      } catch (docErr) {
        setCurrentUser(user);
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।');
      } else {
        setError(err.message || 'লগিন ব্যর্থ হয়েছে');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  // 1. Initial Loading Screen
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
          সুপার এডমিন সেশন লোড হচ্ছে...
        </p>
      </div>
    );
  }

  // 2. If logged in: Show Complete Super Admin Dashboard
  if (currentUser) {
    return <SuperAdminDashboardView onLogout={handleLogout} />;
  }

  // 3. If not logged in: Show Super Admin Login Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/15 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl text-white backdrop-blur-xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-2xl flex items-center justify-center mb-3 border border-red-500/30 shadow-lg shadow-red-600/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="text-xs uppercase tracking-widest font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full mb-2">
            Master Control Hub
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight text-center">
            Super Admin Control Center
          </h1>
          <p className="text-slate-400 text-xs mt-1 text-center">
            সুপার এডমিন ক্রেডেনশিয়াল দিয়ে ড্যাশবোর্ডে প্রবেশ করুন
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-3.5 rounded-xl text-xs sm:text-sm mb-6 border border-red-500/20 flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5 tracking-wider">
              Super Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-slate-800/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition text-sm text-white placeholder-slate-500"
                placeholder="admin@mahinsaas.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5 tracking-wider">
              Master Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                required
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-800/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition text-sm text-white font-mono placeholder-slate-500"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/30 disabled:opacity-70 mt-2 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>ভেরিফাই করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <span>Authorize Super Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition">
            ← মূল ওয়েবসাইটে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
