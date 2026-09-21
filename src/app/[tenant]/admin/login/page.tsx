// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Store } from 'lucide-react';

export default function TenantAdminLogin({ params }: { params: any }) {
  const router = useRouter();
  const tenantId = params.tenantId;
  
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

      // Verify if user is an admin for this SPECIFIC tenant
      const userDoc = await getDoc(doc(db, `system_users/${user.uid}`));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'superadmin' || userData.tenantId === tenantId) {
          router.push(`/${tenantId}/admin/storefront`);
        } else {
          await auth.signOut();
          setError(`Access denied. You are not an admin for store: ${tenantId}`);
        }
      } else {
        await auth.signOut();
        setError('Access denied. No admin record found.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Store className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl font-black text-center mb-1 text-gray-900 capitalize">{tenantId} Admin</h1>
        <p className="text-center text-gray-500 mb-8">Login to manage your store.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-70 mt-2 shadow-sm"
          >
            {loading ? 'Authenticating...' : 'Login to Store'}
          </button>
        </form>
      </div>
    </div>
  );
}
