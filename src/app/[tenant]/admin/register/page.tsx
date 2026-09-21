// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserPlus } from 'lucide-react';

export default function TenantAdminRegister({ params }: { params: any }) {
  const router = useRouter();
  const tenantId = params.tenantId;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
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
      router.push('/' + tenantId + '/admin/storefront');

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
            <UserPlus className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl font-black text-center mb-1 text-gray-900 capitalize">Claim {tenantId} Store</h1>
        <p className="text-center text-gray-500 mb-8">Register with your invited email to gain admin access.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Invited Email</label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-1">Create Password</label>
            <input 
              required
              type="password" 
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="????????"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-70 mt-2 shadow-sm"
          >
            {loading ? 'Registering...' : 'Register & Claim Store'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-gray-500">
          Already registered? <a href={'/' + tenantId + '/admin/login'} className="text-blue-600 hover:underline">Login here</a>
        </p>
      </div>
    </div>
  );
}
