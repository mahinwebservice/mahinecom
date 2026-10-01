// @ts-nocheck
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { 
  Store, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Globe
} from 'lucide-react';
import Link from 'next/link';

function MerchantLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [storeId, setStoreId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [detectingStore, setDetectingStore] = useState(true);
  const [detectedStore, setDetectedStore] = useState<any>(null);
  const [error, setError] = useState('');

  // 1. Detect if accessed via custom domain or query parameter (?store= or ?customDomain=)
  useEffect(() => {
    const detectTenant = async () => {
      try {
        const queryStore = searchParams?.get('store') || searchParams?.get('tenant');
        const queryCustomDomain = searchParams?.get('customDomain');
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

        // If explicitly provided via URL parameter
        if (queryStore) {
          const docSnap = await getDoc(doc(db, 'tenants', queryStore.toLowerCase()));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setDetectedStore({ id: docSnap.id, ...data });
            setStoreId(docSnap.id);
            setDetectingStore(false);
            return;
          }
        }

        // Check if hostname is a custom domain
        const isRootHost = 
          hostname === 'localhost' || 
          hostname.includes('vercel.app') || 
          hostname === 'mahinsaas.web.app' || 
          hostname === 'mahinsaas.firebaseapp.com';

        const domainToCheck = queryCustomDomain || (!isRootHost ? hostname : null);

        if (domainToCheck) {
          // Query tenants matching custom domain
          const q = query(collection(db, 'tenants'), where('customDomain', '==', domainToCheck));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const docData = snap.docs[0].data();
            setDetectedStore({ id: snap.docs[0].id, ...docData });
            setStoreId(snap.docs[0].id);
          } else {
            // Also check general settings general.customDomain
            const allTenantsSnap = await getDocs(collection(db, 'tenants'));
            for (const tDoc of allTenantsSnap.docs) {
              const tData = tDoc.data();
              if (tData.customDomain === domainToCheck || tData.id === domainToCheck.split('.')[0]) {
                setDetectedStore({ id: tDoc.id, ...tData });
                setStoreId(tDoc.id);
                break;
              }
            }
          }
        }
      } catch (err) {
        console.error('Error detecting store domain:', err);
      } finally {
        setDetectingStore(false);
      }
    };

    detectTenant();
  }, [searchParams]);

  // 2. Handle Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const targetStoreId = (detectedStore?.id || storeId).trim().toLowerCase();

    if (!targetStoreId) {
      setError('অনুগ্রহ করে আপনার স্টোর আইডি (Store ID) লিখুন।');
      setLoading(false);
      return;
    }

    try {
      // Step A: Fetch and verify tenant document
      const tenantDocRef = doc(db, 'tenants', targetStoreId);
      const tenantSnap = await getDoc(tenantDocRef);

      if (!tenantSnap.exists()) {
        setError(`স্টোর আইডি "${targetStoreId}" সিস্টেমে খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক আইডি দিন।`);
        setLoading(false);
        return;
      }

      const tenantData = tenantSnap.data();

      // Check store status
      if (tenantData.status === 'suspended') {
        setError('আপনার স্টোরটি সাময়িকভাবে স্থগিত (Suspended) করা হয়েছে। দয়া করে সুপার এডমিনের সাথে যোগাযোগ করুন।');
        setLoading(false);
        return;
      }

      // Check expire date if set
      if (tenantData.expireDate) {
        const expireTime = new Date(tenantData.expireDate).getTime();
        if (!isNaN(expireTime) && Date.now() > expireTime + 86400000) {
          setError(`আপনার স্টোরের সাবস্ক্রিপশনের মেয়াদ (${tenantData.expireDate}) শেষ হয়ে গেছে। অনুগ্রহ করে রিনিউ করুন।`);
          setLoading(false);
          return;
        }
      }

      // Step B: Authenticate user
      let authUser = null;
      try {
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        authUser = userCred.user;
      } catch (authErr: any) {
        // If Firebase Auth fails, check if the credentials match the tenant document saved by Super Admin
        const emailMatches = tenantData.email && tenantData.email.toLowerCase() === email.trim().toLowerCase();
        const passMatches = tenantData.password && tenantData.password === password;

        if (emailMatches && passMatches) {
          // Register the Firebase user automatically if not existing yet
          try {
            const newCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
            authUser = newCred.user;
          } catch (createErr: any) {
            if (createErr.code === 'auth/email-already-in-use') {
              setError('পাসওয়ার্ডটি সঠিক নয়। অনুগ্রহ করে আপনার সঠিক পাসওয়ার্ড দিন।');
              setLoading(false);
              return;
            }
            throw authErr;
          }
        } else {
          if (authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/wrong-password' || authErr.code === 'auth/user-not-found') {
            setError('ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
          } else {
            setError(authErr.message || 'লগিন ব্যর্থ হয়েছে।');
          }
          setLoading(false);
          return;
        }
      }

      // Step C: Ensure system_users mapping exists
      if (authUser) {
        const userDocRef = doc(db, 'system_users', authUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
          await setDoc(userDocRef, {
            email: authUser.email,
            role: 'admin',
            tenantId: targetStoreId,
            updatedAt: Date.now()
          });
        } else {
          const uData = userSnap.data();
          if (uData.role !== 'superadmin' && uData.tenantId !== targetStoreId) {
            // Update to this tenant if admin
            await setDoc(userDocRef, {
              ...uData,
              tenantId: targetStoreId,
              updatedAt: Date.now()
            }, { merge: true });
          }
        }

        // Store session in localStorage for merchant
        if (typeof window !== 'undefined') {
          localStorage.setItem('merchant_tenant', targetStoreId);
        }

        // Redirect to merchant dashboard
        router.push(`/${targetStoreId}/ecomsaas/orders`);
      }

    } catch (err: any) {
      console.error('Login process error:', err);
      setError(err.message || 'লগিন করার সময় ত্রুটি হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        
        {/* Top Branding / Logo Header */}
        <div className="text-center mb-8">
          {detectedStore ? (
            /* Custom Domain / Store Branded Header */
            <div className="flex flex-col items-center">
              {detectedStore.logoUrl ? (
                <img 
                  src={detectedStore.logoUrl} 
                  alt={detectedStore.name || detectedStore.id} 
                  className="h-16 w-auto max-w-[180px] object-contain mb-4 rounded-xl shadow-lg border border-slate-800 bg-slate-900 p-2" 
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20 mb-4 border border-blue-400/30">
                  {(detectedStore.name || detectedStore.id).charAt(0).toUpperCase()}
                </div>
              )}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Store className="w-3.5 h-3.5" />
                <span>মার্চেন্ট কন্ট্রোল প্যানেল</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {detectedStore.name || detectedStore.id}
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                আপনার স্টোর পরিচালনা করতে অ্যাডমিন ক্রেডেনশিয়াল দিন
              </p>
            </div>
          ) : (
            /* Universal SaaS Portal Header */
            <div className="flex flex-col items-center">
              <Link href="/" className="group flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] shadow-xl shadow-blue-600/20 group-hover:scale-105 transition">
                  <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
                    <Store className="w-7 h-7 text-blue-400 group-hover:text-blue-300 transition" />
                  </div>
                </div>
              </Link>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>ক্লাউড মার্চেন্ট হাব (E-Commerce SaaS)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ক্লায়েন্ট মার্চেন্ট লগিন
              </h1>
              <p className="text-slate-400 text-xs mt-1.5 max-w-xs mx-auto">
                আপনার স্টোর আইডি, অ্যাডমিন ইমেইল ও পাসওয়ার্ড দিয়ে ড্যাশবোর্ডে প্রবেশ করুন
              </p>
            </div>
          )}
        </div>

        {/* Card Form */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Store ID (Hidden if custom domain or detected tenant) */}
            {!detectedStore ? (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  স্টোর আইডি (Store ID) *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    required
                    type="text"
                    value={storeId}
                    onChange={e => setStoreId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="যেমন: fashionhub বা store1"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  সুপার এডমিন থেকে পাওয়া আপনার নির্ধারিত স্টোর আইডি লিখুন।
                </p>
              </div>
            ) : (
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <Store className="w-3.5 h-3.5 text-blue-400" /> স্টোর: <strong className="text-white">{detectedStore.name || detectedStore.id}</strong>
                </span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-[11px] text-blue-300">
                  {detectedStore.id}
                </span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                অ্যাডমিন ইমেইল (Admin Email) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@yourbusiness.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  পাসওয়ার্ড (Password) *
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>ভেরিফাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <span>মার্চেন্ট ড্যাশবোর্ডে প্রবেশ করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Help & Support Footer */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
            <span>পাসওয়ার্ড ভুলে গেছেন বা নতুন স্টোর খুলতে চান?</span>
            <a 
              href="https://wa.me/8801700000000?text=Hello,%20I%20need%20help%20with%20my%20Merchant%20Login%20credentials" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>সরাসরি হোয়াটসঅ্যাপে সাহায্য নিন</span>
            </a>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition inline-flex items-center gap-1">
            <span>← মূল ওয়েবসাইটে ফিরে যান</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


export default function UniversalMerchantLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <MerchantLoginForm />
    </Suspense>
  );
}
