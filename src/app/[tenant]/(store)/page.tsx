// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { HomepageRenderer } from '@/components/storefront/HomepageRenderer';
import { Store, ShoppingBag, Phone, Mail, ArrowRight, ShieldCheck, Truck, Clock } from 'lucide-react';
import Link from 'next/link';

export default function TenantStorefrontPage() {
  const params = useParams();
  const tenantId = (params?.tenant as string) || '';

  const [tenantMeta, setTenantMeta] = useState<any>(null);
  const [layoutBlocks, setLayoutBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;

    const fetchStore = async () => {
      try {
        // 1. Fetch general settings
        const genSnap = await getDoc(doc(db, `tenants/${tenantId}/settings/general`));
        if (genSnap.exists()) {
          setTenantMeta(genSnap.data());
        }

        // 2. Fetch homepage layout
        const layoutSnap = await getDoc(doc(db, `tenants/${tenantId}/settings/homepage_layout`));
        if (layoutSnap.exists() && layoutSnap.data().blocks && layoutSnap.data().blocks.length > 0) {
          setLayoutBlocks(layoutSnap.data().blocks);
        }
      } catch (err) {
        console.error('Error fetching store data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [tenantId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading store details...</p>
        </div>
      </div>
    );
  }

  const storeTitle = tenantMeta?.businessName || tenantId.toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Banner / Store Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href={`/${tenantId}`} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight block">{storeTitle}</span>
              <span className="text-xs text-slate-400 font-medium">Official Online Store</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link 
              href={`/${tenantId}/checkout`} 
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart / Checkout</span>
            </Link>
            <Link 
              href={`/${tenantId}/admin/login`} 
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition px-2 py-1"
            >
              Merchant Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content: Render Blocks or Default Hero */}
      <main className="flex-1">
        {layoutBlocks.length > 0 ? (
          <HomepageRenderer blocks={layoutBlocks} tenantId={tenantId} />
        ) : (
          <div>
            {/* Sleek Hero Section */}
            <section className="bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <span className="inline-block py-1.5 px-4 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold uppercase tracking-wider mb-6">
                  Welcome to {storeTitle}
                </span>
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6 leading-tight">
                  Your Destination for Premium Products & Exceptional Service.
                </h1>
                <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
                  Browse our curated collections, place your order online with Cash on Delivery or Mobile Banking, and get fast door-step delivery nationwide.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link 
                    href={`/${tenantId}/checkout`}
                    className="px-8 py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition shadow-lg flex items-center gap-2"
                  >
                    <span>Start Shopping</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link 
                    href={`/${tenantId}/admin/storefront`}
                    className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl backdrop-blur-md transition border border-white/20"
                  >
                    Customize Storefront
                  </Link>
                </div>
              </div>
            </section>

            {/* Feature Highlights */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">Fast Delivery</h3>
                    <p className="text-slate-500 text-sm">Nationwide delivery with reliable courier tracking.</p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">Cash on Delivery</h3>
                    <p className="text-slate-500 text-sm">Pay securely upon receiving your verified parcel.</p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">24/7 Support</h3>
                    <p className="text-slate-500 text-sm">Reach out to our customer care anytime via phone or chat.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} {storeTitle}. Powered by <span className="font-bold text-slate-800">SaaS Commerce</span>.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href={`/${tenantId}/admin/login`} className="hover:text-blue-600">Store Admin</Link>
            <Link href={`/${tenantId}/checkout`} className="hover:text-blue-600">Checkout</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
