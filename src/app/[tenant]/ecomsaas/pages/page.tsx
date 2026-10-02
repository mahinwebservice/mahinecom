'use client';
// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { 
  FileText, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Sparkles, 
  ExternalLink,
  Upload,
  Link as LinkIcon,
  X,
  CheckCircle2,
  Globe,
  Eye,
  Copy,
  BookOpen,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

export default function MerchantPagesManager() {
  const params = useParams();
  const tenantId = (params?.tenant as string) || '';

  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Form State
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    content: '',
    bannerUrl: '',
    seoDescription: '',
    seoKeywords: '',
    status: 'published' // 'published' | 'draft'
  });

  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(false);
    try {
      const snap = await getDocs(collection(db, `tenants/${tenantId}/pages`));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPages(list);
    } catch (err) {
      console.error('Error fetching pages:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  // Auto generate slug from title
  const handleTitleChange = (title: string) => {
    setPageForm(prev => {
      if (!editingPage) {
        // Transliterate or clean simple slug
        const autoSlug = title
          .trim()
          .toLowerCase()
          .replace(/[^a-zA-Z0-9s-]/g, '')
          .replace(/s+/g, '-');
        return { ...prev, title, slug: autoSlug || prev.slug };
      }
      return { ...prev, title };
    });
  };

  // Image Upload to Cloudinary
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadToCloudinary(file, tenantId);
      setPageForm(prev => ({ ...prev, bannerUrl: uploadedUrl }));
      alert('ব্যানার ছবি সফলভাবে Cloudinary-তে আপলোড হয়েছে!');
    } catch (err: any) {
      alert(err.message || 'ক্লাউডিনারি আপলোড ব্যর্থ হয়েছে');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Save Page
  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageForm.title.trim() || !pageForm.slug.trim()) {
      alert('দয়া করে পেজের শিরোনাম ও Slug পূরণ করুন।');
      return;
    }

    const cleanSlug = pageForm.slug.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '-');

    try {
      const payload = {
        title: pageForm.title.trim(),
        slug: cleanSlug,
        content: pageForm.content.trim(),
        bannerUrl: pageForm.bannerUrl.trim(),
        seoDescription: pageForm.seoDescription.trim(),
        seoKeywords: pageForm.seoKeywords.trim(),
        status: pageForm.status,
        updatedAt: Date.now()
      };

      if (editingPage) {
        await setDoc(doc(db, `tenants/${tenantId}/pages/${editingPage.id}`), payload, { merge: true });
        alert('পেজ সফলভাবে আপডেট করা হয়েছে!');
      } else {
        await setDoc(doc(db, `tenants/${tenantId}/pages/${cleanSlug}`), {
          ...payload,
          createdAt: Date.now()
        });
        alert('নতুন পেজ সফলভাবে তৈরি করা হয়েছে!');
      }

      setShowModal(false);
      setEditingPage(null);
      fetchData();
    } catch (err: any) {
      alert('পেজ সংরক্ষণ করতে সমস্যা: ' + err.message);
    }
  };

  // Delete Page
  const handleDeletePage = async (id: string, title: string) => {
    if (!confirm(`আপনি কি "${title}" পেজটি মুছে ফেলতে চান?`)) return;
    try {
      await deleteDoc(doc(db, `tenants/${tenantId}/pages/${id}`));
      setPages(prev => prev.filter(p => p.id !== id));
      alert('পেজটি মুছে ফেলা হয়েছে!');
    } catch (err: any) {
      alert('Error deleting page: ' + err.message);
    }
  };

  // Quick generate standard policy pages
  const handleGenerateStandardPolicies = async () => {
    if (!confirm('আপনি কি সাধারণ পলিসি পেজসমূহ (প্রাইভেসি পলিসি, রিটার্ন পলিসি, শর্তাবলী, ডেলিভারি ইনফো ও আমাদের সম্পর্কে) স্বয়ংক্রিয়ভাবে তৈরি করতে চান?')) return;

    const templates = [
      {
        title: 'প্রাইভেসি পলিসি (Privacy Policy)',
        slug: 'privacy-policy',
        content: `আমাদের ওয়েবসাইটে আপনাকে স্বাগতম। গ্রাহকদের তথ্যের গোপনীয়তা রক্ষা করা আমাদের অন্যতম প্রধান দায়িত্ব।

১. তথ্য সংগ্রহ:
অর্ডার প্রক্রিয়াকরণ এবং দ্রুত ডেলিভারির স্বার্থে আমরা গ্রাহকের নাম, মোবাইল নম্বর, ডেলিভারি ঠিকানা সংগ্রহ করে থাকি।

২. তথ্যের নিরাপত্তা:
আপনার ব্যক্তিগত কোনো তথ্য তৃতীয় কোনো পক্ষের কাছে বিক্রি বা শেয়ার করা হয় না।

৩. পেমেন্ট ও লেনদেন:
ক্যাশ অন ডেলিভারি এবং অনলাইন পেমেন্টে গ্রাহকের আর্থিক তথ্যের সর্বোচ্চ নিরাপত্তা বজায় রাখা হয়।`,
        status: 'published'
      },
      {
        title: 'রিটার্ন ও রিফান্ড পলিসি (Return & Refund Policy)',
        slug: 'return-policy',
        content: `গ্রাহক সন্তুষ্টিই আমাদের প্রথম অগ্রাধিকার। পণ্য পাওয়ার পর কোনো সমস্যা থাকলে খুব সহজেই রিটার্ন করতে পারবেন।

১. রিটার্নের সময়সীমা:
পণ্য হাতে পাওয়ার ৭২ ঘণ্টার (৩ দিন) মধ্যে যেকোনো সমস্যা আমাদের হেল্পলাইনে জানাতে হবে।

২. রিটার্ন শর্তাবলী:
পণ্যটি অব্যবহৃত এবং মূল বক্স/প্যাকেজিংসহ থাকতে হবে। ত্রুটিযুক্ত পণ্যের ক্ষেত্রে আমরা সম্পূর্ণ ফ্রিতে রিপ্লেসমেন্ট প্রদান করে থাকি।

৩. রিফান্ড প্রক্রিয়া:
পণ্য রিটার্ন পাওয়ার পর ৩-৫ কার্যদিবসের মধ্যে আপনার প্রদত্ত বিকাশ/নগদ অ্যাকাউন্টে টাকা রিফান্ড করা হবে।`,
        status: 'published'
      },
      {
        title: 'শর্তাবলী ও নিয়ম (Terms & Conditions)',
        slug: 'terms',
        content: `আমাদের প্ল্যাটফর্ম ব্যবহার করার মাধ্যমে আপনি নিম্নলিখিত নিয়মাবলী মেনে নিতে সম্মত হচ্ছেন:

১. অর্ডার নিশ্চিতকরণ:
অর্ডার প্লেস করার পর আমাদের কাস্টমার রিপ্রেজেন্টেটিভ ফোন কলের মাধ্যমে অর্ডার নিশ্চিত করতে পারেন।

২. ডেলিভারি ও মূল্য:
ওয়েবসাইটে প্রদর্শিত মূল্য নির্ধারিত। ডেলিভারি চার্জ লোকেশন অনুযায়ী চেকআউটে যুক্ত হয়।

৩. স্টক লভ্যতা:
কখনো কোনো পণ্য স্টক আউট হয়ে গেলে গ্রাহককে দ্রুত অবগত করে বিকল্প অথবা অর্ডার বাতিল করা হতে পারে।`,
        status: 'published'
      },
      {
        title: 'ডেলিভারি তথ্য (Delivery Information)',
        slug: 'delivery-policy',
        content: `আমরা সারাদেশে দ্রুততম সময়ে হোম ডেলিভারি সেবা প্রদান করে থাকি।

১. ডেলিভারি সময়:
- ঢাকা সিটির ভিতরে: ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি।
- ঢাকা সিটির বাহিরে: ২ থেকে ৪ কার্যদিবসের মধ্যে ডেলিভারি।

২. ডেলিভারি চার্জ:
- ঢাকা সিটি: ৬০ টাকা।
- ঢাকা সিটির বাহিরে: ১২০ টাকা।

৩. ক্যাশ অন ডেলিভারি:
পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধের সুযোগ রয়েছে।`,
        status: 'published'
      },
      {
        title: 'আমাদের সম্পর্কে (About Us)',
        slug: 'about-us',
        content: `আমরা গ্রাহকদের জন্য সেরা ও প্রিমিয়াম কোয়ালিটির পণ্য সুলভ মূল্যে পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ।

আমাদের লক্ষ্য:
গ্রাহকদের ঝামেলাহীন ও নির্ভরযোগ্য অনলাইন শপিং অভিজ্ঞতা উপহার দেওয়া।

আমাদের বৈশিষ্ট্য:
- ১০০% খাঁটি ও গুণগত মানসম্পন্ন পণ্য
- দ্রুততম ডেলিভারি ও নিরাপদ প্যাকেজিং
- সার্বক্ষণিক কাস্টমার কেয়ার সাপোর্ট`,
        status: 'published'
      }
    ];

    try {
      for (const t of templates) {
        await setDoc(doc(db, `tenants/${tenantId}/pages/${t.slug}`), {
          ...t,
          bannerUrl: '',
          seoDescription: `${t.title} - অফিসিয়াল পলিসি ও তথ্য।`,
          seoKeywords: 'policy, terms, privacy, delivery',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }, { merge: true });
      }
      alert('৫টি প্রমিত পলিসি পেজ সফলভাবে তৈরি হয়েছে!');
      fetchData();
    } catch (err: any) {
      alert('Error creating policy pages: ' + err.message);
    }
  };

  const copyPageLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/${tenantId}/page/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 3000);
  };

  const filteredPages = pages.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>কাস্টম পেজ ম্যানেজমেন্ট (Custom Pages)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            আপনার স্টোরের জন্য নতুন পেজ (যেমন: আমাদের সম্পর্কে, প্রাইভেসি পলিসি, শর্তাবলী) তৈরি ও এডিট করুন
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleGenerateStandardPolicies}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition flex items-center gap-2 cursor-pointer border border-slate-200"
          >
            <BookOpen className="w-4 h-4 text-slate-600" />
            <span>কুইক পলিসি পেজ তৈরি (Quick Policies)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingPage(null);
              setPageForm({
                title: '',
                slug: '',
                content: '',
                bannerUrl: '',
                seoDescription: '',
                seoKeywords: '',
                status: 'published'
              });
              setShowModal(true);
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-md shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ নতুন পেজ তৈরি করুন</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input 
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="পেজের নাম বা URL দিয়ে সার্চ করুন..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
        />
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredPages.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-12 h-12 stroke-[1.5] mx-auto mb-3 text-slate-300" />
            <p className="font-bold text-slate-700 text-base mb-1">কোনো পেজ পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              আপনার স্টোরের জন্য পলিসি বা তথ্যমূলক পেজ যুক্ত করতে উপরের বাটনে চাপ দিন।
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition"
            >
              + নতুন পেজ যোগ করুন
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">পেজের নাম (Title)</th>
                  <th className="py-4 px-6">লিঙ্ক / Slug URL</th>
                  <th className="py-4 px-6">স্ট্যাটাস</th>
                  <th className="py-4 px-6">আপডেট সময়</th>
                  <th className="py-4 px-6 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPages.map(page => (
                  <tr key={page.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-sm">{page.title}</span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            {page.content ? `${page.content.substring(0, 50)}...` : 'কন্টেন্ট নেই'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
                          /page/{page.slug}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyPageLink(page.slug)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                          title="লিঙ্ক কপি করুন"
                        >
                          {copiedSlug === page.slug ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        page.status === 'published' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {page.status === 'published' ? 'প্রকাশিত (Live)' : 'ড্রাফট (Draft)'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString('bn-BD') : 'N/A'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${tenantId}/page/${page.slug}`}
                          target="_blank"
                          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                          title="লাইভ প্রিভিউ দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setEditingPage(page);
                            setPageForm({
                              title: page.title || '',
                              slug: page.slug || '',
                              content: page.content || '',
                              bannerUrl: page.bannerUrl || '',
                              seoDescription: page.seoDescription || '',
                              seoKeywords: page.seoKeywords || '',
                              status: page.status || 'published'
                            });
                            setShowModal(true);
                          }}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                          title="এডিট করুন"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePage(page.id, page.title)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Page Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingPage ? 'পেজ এডিট করুন' : 'নতুন পেজ তৈরি করুন'}
                </h3>
                <p className="text-xs text-slate-500">
                  পেজটি প্রকাশ করলে হেডার ও ফুটার অপরিবর্তিত রেখে মাঝখানে কন্টেন্ট প্রদর্শিত হবে
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePage} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    পেজের শিরোনাম (Page Title) *
                  </label>
                  <input 
                    required
                    type="text"
                    value={pageForm.title}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="যেমন: আমাদের সম্পর্কে / রিফান্ড পলিসি"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    URL Slug (যেমন: about-us) *
                  </label>
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                    <span className="text-xs text-slate-400 font-mono">/page/</span>
                    <input 
                      required
                      type="text"
                      value={pageForm.slug}
                      onChange={e => setPageForm({ ...pageForm, slug: e.target.value })}
                      placeholder="privacy-policy"
                      className="w-full py-1.5 bg-transparent text-xs font-mono font-bold text-blue-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Banner Image with Cloudinary */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>হেডার ব্যানার / ফিচার ইমেজ (Cloudinary)</span>
                  </label>
                  {isUploading && (
                    <span className="text-xs text-blue-600 font-bold flex items-center gap-1">
                      <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                      ক্লাউডিনারিতে আপলোড হচ্ছে...
                    </span>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-center gap-2 p-2.5 bg-white border border-dashed border-blue-400 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50/50 cursor-pointer transition">
                    <Upload className="w-4 h-4" />
                    <span>ছবি আপলোড করুন (Cloudinary)</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleBannerUpload} 
                      className="hidden" 
                      disabled={isUploading}
                    />
                  </label>

                  <input 
                    type="url"
                    value={pageForm.bannerUrl}
                    onChange={e => setPageForm({ ...pageForm, bannerUrl: e.target.value })}
                    placeholder="বা ছবির সরাসরি URL পেস্ট করুন..."
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                {pageForm.bannerUrl && (
                  <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-200">
                    <img src={pageForm.bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPageForm({ ...pageForm, bannerUrl: '' })}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-md text-xs shadow hover:bg-red-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Page Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  পেজের মূল কন্টেন্ট ও বিবরণ (Page Content) *
                </label>
                <textarea 
                  required
                  rows={9}
                  value={pageForm.content}
                  onChange={e => setPageForm({ ...pageForm, content: e.target.value })}
                  placeholder="পেজের বিস্তারিত তথ্য, প্যারাগ্রাফ বা পয়েন্ট আকারে লিখুন..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm leading-relaxed outline-none focus:ring-2 focus:ring-blue-600 font-normal"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  টিপস: প্যারাগ্রাফ তৈরির জন্য একটি লাইন ফাঁকা রাখুন। প্রতিটি পয়েন্ট আলাদা লাইনে লিখুন।
                </p>
              </div>

              {/* Status and SEO */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    পাবলিশ স্ট্যাটাস
                  </label>
                  <select
                    value={pageForm.status}
                    onChange={e => setPageForm({ ...pageForm, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="published">প্রকাশিত (Published - Live)</option>
                    <option value="draft">ড্রাফট (Draft - লুকানো)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    SEO Meta Description
                  </label>
                  <input 
                    type="text"
                    value={pageForm.seoDescription}
                    onChange={e => setPageForm({ ...pageForm, seoDescription: e.target.value })}
                    placeholder="গুগল সার্চ ইঞ্জিনে পেজের পরিচিতি..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/25 transition cursor-pointer disabled:opacity-50"
                >
                  {editingPage ? 'আপডেট করুন' : 'পেজ প্রকাশ করুন'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
