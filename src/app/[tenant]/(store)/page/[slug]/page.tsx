// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import StorefrontLayout from '@/components/storefront/StorefrontLayout';
import { 
  ChevronRight, 
  FileText, 
  Calendar, 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Store 
} from 'lucide-react';
import Link from 'next/link';

export default function StorefrontCustomPageView() {
  const params = useParams();
  const router = useRouter();
  const tenantId = (params?.tenant as string) || '';
  const slug = (params?.slug as string) || '';

  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState<string>(tenantId.toUpperCase());

  useEffect(() => {
    if (!tenantId || !slug) return;

    const fetchPage = async () => {
      setLoading(true);
      try {
        // 1. Fetch Store General Settings for Store Name
        const genSnap = await getDoc(doc(db, `tenants/${tenantId}/settings/general`));
        const name = genSnap.exists() ? (genSnap.data().businessName || tenantId.toUpperCase()) : tenantId.toUpperCase();
        setStoreName(name);

        // 2. Fetch Page Doc (first by doc id = slug)
        const pageDocSnap = await getDoc(doc(db, `tenants/${tenantId}/pages/${slug}`));
        if (pageDocSnap.exists()) {
          const pData: any = { id: pageDocSnap.id, ...(pageDocSnap.data() as any) };
          setPage(pData);
          document.title = `${pData.title} | ${name}`;
        } else {
          // Fallback query where slug == slug
          const qSnap = await getDocs(query(collection(db, `tenants/${tenantId}/pages`), where('slug', '==', slug)));
          if (!qSnap.empty) {
            const pData: any = { id: qSnap.docs[0].id, ...(qSnap.docs[0].data() as any) };
            setPage(pData);
            document.title = `${pData.title} | ${name}`;
          }
        }
      } catch (err) {
        console.error('Error fetching custom page:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [tenantId, slug]);

  if (loading) {
    return (
      <StorefrontLayout tenantId={tenantId}>
        <div className="min-h-[50vh] flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold text-slate-500">পেজ লোড হচ্ছে...</p>
        </div>
      </StorefrontLayout>
    );
  }

  if (!page) {
    return (
      <StorefrontLayout tenantId={tenantId}>
        <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-black text-2xl mb-4">
            ?
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">পেজটি পাওয়া যায়নি</h1>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            আপনি যে পেজটি খুঁজছেন তা সম্ভবত সরানো হয়েছে অথবা লিঙ্কটি সঠিক নয়।
          </p>
          <Link
            href={`/${tenantId}`}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition shadow-md"
          >
            হোম পেজে ফিরে যান
          </Link>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout tenantId={tenantId}>
      {/* Breadcrumb Navigation */}
      <div className="bg-slate-100/70 border-b border-slate-200/80 py-3.5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
            <Link href={`/${tenantId}`} className="hover:text-blue-600 transition">হোম</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold truncate">{page.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area with Fixed Layout */}
      <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 w-full space-y-8">
        
        {/* Banner Header if available */}
        {page.bannerUrl && (
          <div className="w-full h-48 sm:h-72 rounded-3xl overflow-hidden border border-slate-200 shadow-md">
            <img 
              src={page.bannerUrl} 
              alt={page.title} 
              className="w-full h-full object-cover" 
            />
          </div>
        )}

        {/* Page Title & Meta Box */}
        <div className="border-b border-slate-200 pb-6 space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {page.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-blue-600" />
              <span>{storeName}</span>
            </span>
            {page.updatedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>সর্বশেষ আপডেট: {new Date(page.updatedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-4 font-normal whitespace-pre-line">
            {page.content}
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-4 flex items-center justify-between">
          <Link
            href={`/${tenantId}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোম পেজে ফিরে যান</span>
          </Link>
        </div>

      </div>
    </StorefrontLayout>
  );
}
