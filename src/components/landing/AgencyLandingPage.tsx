// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { 
  ShoppingBag, 
  GraduationCap, 
  Store, 
  Laptop, 
  ArrowRight, 
  CheckCircle2, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  ChevronLeft, 
  ExternalLink, 
  Send,
  Layers,
  BarChart3,
  Award,
  Users
} from 'lucide-react';
import Link from 'next/link';

export const defaultSettings = {
  branding: {
    agencyName: 'Mahin Web Services',
    tagline: 'নেক্সট-জেন ক্লাউড ই-কমার্স, স্মার্ট স্কুল ইআরপি ও পিওএস সলিউশন',
    badgeText: '🚀 Modern SaaS & Enterprise Solutions',
    logoIcon: 'Store'
  },
  hero: {
    slides: [
      {
        tag: 'ই-কমার্স বিপ্লব (E-Commerce SaaS)',
        title: 'আপনার ব্যবসার জন্য নিজস্ব ব্র্যান্ডের',
        highlight: 'সুপারফাস্ট ই-কমার্স প্ল্যাটফর্ম',
        description: 'কাস্টম স্টোরফ্রন্ট, অটোমেটিক কুরিয়ার (Steadfast, Pathao), বিকাশ-নগদ পেমেন্ট ও রিয়েলটাইম মার্চেন্ট ড্যাশবোর্ডসহ সম্পূর্ণ অনলাইন স্টোর।',
        ctaText: 'ই-কমার্স ডেমো দেখুন',
        ctaLink: '#demos',
        secondaryCtaText: 'হোয়াটসঅ্যাপে যোগাযোগ',
        secondaryCtaLink: 'https://wa.me/8801700000000?text=Hello,%20I%20am%20interested%20in%20your%20E-Commerce%20solution'
      },
      {
        tag: 'ডিজিটাল স্কুল ম্যানেজমেন্ট (Smart Edu)',
        title: 'শিক্ষাপ্রতিষ্ঠানের সকল কার্যক্রমের জন্য',
        highlight: 'অটোমেটেড স্কুল ম্যানেজমেন্ট ERP',
        description: 'অনলাইন ভর্তি, ডিজিটাল হাজিরা, অটোমেটিক রেজাল্ট ও গ্রেডিং শিট, এসএমএস নোটিফিকেশন এবং স্বয়ংক্রিয় ফি কালেকশন সিস্টেম।',
        ctaText: 'স্কুল ERP ডেমো দেখুন',
        ctaLink: '#demos',
        secondaryCtaText: 'বিস্তারিত পরামর্শ নিন',
        secondaryCtaLink: '#contact'
      },
      {
        tag: 'স্মার্ট বিজনেস পিওএস (Retail & Wholesale POS)',
        title: 'দোকান ও ব্যবসা পরিচালনার জন্য',
        highlight: 'ফুল-ফিচার্ড ক্লাউড POS সিস্টেম',
        description: 'বারকোড স্ক্যানিং, ইনভেন্টরি ট্র্যাকিং, ইনস্ট্যান্ট ক্যাশমেমো প্রিন্ট, লাভ-ক্ষতির লাইভ হিসাব এবং যেকোনো ডিভাইস থেকে পরিচালনা।',
        ctaText: 'পিওএস ডেমো দেখুন',
        ctaLink: '#demos',
        secondaryCtaText: 'প্যাকেজসমূহ দেখুন',
        secondaryCtaLink: '#pricing'
      }
    ]
  },
  demos: {
    ecomUrl: 'https://mahinecom.vercel.app/store1',
    schoolUrl: 'https://mahinecom.vercel.app/store1',
    posUrl: 'https://mahinecom.vercel.app/store1'
  },
  contact: {
    whatsappNumber: '8801700000000',
    phone: '+880 1700-000000',
    email: 'contact@mahinecom.com',
    address: 'Dhaka, Bangladesh',
    facebookUrl: 'https://facebook.com',
    youtubeUrl: 'https://youtube.com'
  },
  footer: {
    aboutText: 'আমরা আধুনিক ক্লাউড টেকনোলজি ব্যবহার করে ব্যবসা ও শিক্ষাপ্রতিষ্ঠানের জন্য বিশ্বমানের ডিজিটাল সমাধান এবং সফটওয়্যার সরবরাহ করি।',
    copyrightText: '© ' + new Date().getFullYear() + ' Mahin Web Services. All rights reserved.'
  }
};

export function AgencyLandingPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeDemoTab, setActiveDemoTab] = useState<'ecom' | 'school' | 'pos'>('ecom');
  const [inquiry, setInquiry] = useState({ name: '', phone: '', service: 'ecommerce', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'platform_settings', 'landing_page'));
        if (snap.exists()) {
          setSettings({ ...defaultSettings, ...snap.data() });
        }
      } catch (err) {
        console.error('Error fetching landing settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // Auto-play hero slider every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % settings.hero.slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [settings.hero.slides.length]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        ...inquiry,
        createdAt: Date.now()
      });
      setSubmitted(true);
      setInquiry({ name: '', phone: '', service: 'ecommerce', message: '' });
    } catch (err: any) {
      alert('Error submitting inquiry: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const slide = settings.hero.slides[currentSlide] || settings.hero.slides[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
                <Store className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block group-hover:text-blue-400 transition">
                {settings.branding.agencyName}
              </span>
              <span className="text-[11px] font-semibold text-blue-400 tracking-wider uppercase block">
                Cloud Software Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#services" className="hover:text-white transition">সার্ভিসসমূহ</a>
            <a href="#demos" className="hover:text-white transition">লাইভ ডেমো</a>
            <a href="#features" className="hover:text-white transition">সুবিধাসমূহ</a>
            <a href="#pricing" className="hover:text-white transition">প্যাকেজ</a>
            <a href="#contact" className="hover:text-white transition">যোগাযোগ</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link 
              href="/store1/ecomsaas"
              className="text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition"
            >
              ক্লায়েন্ট লগিন
            </Link>
            <a 
              href={`https://wa.me/${settings.contact.whatsappNumber}?text=Hello,%20I%20am%20interested%20in%20your%20software%20solutions`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>পরামর্শ নিন</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Animated Slider */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-8 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{slide.tag || settings.branding.badgeText}</span>
            </div>

            {/* Headline with vibrant gradient */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.15] mb-6">
              <span className="block text-white mb-2">{slide.title}</span>
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                {slide.highlight}
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed mb-10 max-w-3xl mx-auto">
              {slide.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a 
                href={slide.ctaLink || '#demos'}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition flex items-center gap-2"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a 
                href={slide.secondaryCtaLink || '#contact'}
                className="px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-base border border-slate-700/80 backdrop-blur-md hover:-translate-y-0.5 transition flex items-center gap-2"
              >
                <span>{slide.secondaryCtaText}</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Slider Navigation Indicators */}
            <div className="flex items-center justify-center gap-3 mt-12">
              {settings.hero.slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all ${idx === currentSlide ? 'w-10 bg-blue-500 shadow-md shadow-blue-500/50' : 'w-2.5 bg-slate-700 hover:bg-slate-600'}`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Social Proof Stats Strip */}
      <section className="border-y border-slate-800/80 bg-slate-900/40 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white">50+</div>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">সফল প্রতিষ্ঠান ও শপ</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-blue-400">৯৯.৯৯%</div>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">গ্লোবাল ক্লাউড আপটাইম</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-indigo-400">১০০%</div>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">কুরিয়ার ও পেমেন্ট ইন্টিগ্রেশন</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-cyan-400">২৪/৭</div>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">ডেডিকেটেড টেক সাপোর্ট</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Solutions Showcase */}
      <section id="services" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/20">
            আমাদের সফটওয়্যার সেবা
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4 mb-4">
            আপনার ব্যবসা ও প্রতিষ্ঠানের সম্পূর্ণ সমাধান
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            আধুনিক ক্লাউড আর্কিটেকচারে তৈরি উচ্চগতির সফটওয়্যার যা আপনার সময় বাঁচাবে এবং কাজের গতি বহুগুণ বাড়িয়ে দেবে।
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Service 1: E-Commerce */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-blue-500/40 transition shadow-xl group flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">E-Commerce SaaS</span>
            <h3 className="text-2xl font-bold text-white mb-3">মাল্টি-টেন্যান্ট ই-কমার্স</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              নিজস্ব ডোমেইনে সম্পূর্ণ অনলাইন স্টোর। কাস্টমার অর্ডার করবে, মার্চেন্ট প্যানেল থেকে ইনভয়েস প্রিন্ট হবে এবং এক ক্লিকে কুরিয়ার বুকিং হবে।
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 mb-8 mt-auto">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> ড্র্যাগ অ্যান্ড ড্রপ স্টোরফ্রন্ট বিল্ডার</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Steadfast ও Pathao কুরিয়ার API</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> বিকাশ, নগদ ও ক্যাশ অন ডেলিভারি</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> সেলস অ্যানালিটিক্স ও প্রফিট রিপোর্ট</li>
            </ul>
            <a 
              href={settings.demos.ecomUrl || 'https://mahinecom.vercel.app/store1'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white font-bold rounded-xl text-xs transition border border-blue-500/20 flex items-center justify-center gap-2"
            >
              <span>লাইভ স্টোর ডেমো দেখুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Service 2: School ERP */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-indigo-500/40 transition shadow-xl group flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition">
              <GraduationCap className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Education ERP</span>
            <h3 className="text-2xl font-bold text-white mb-3">স্মার্ট স্কুল ম্যানেজমেন্ট</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              স্কুল, কলেজ ও মাদ্রাসার জন্য পূর্ণাঙ্গ ডিজিটাল সফটওয়্যার। স্টুডেন্ট ডাটাবেস থেকে শুরু করে পরীক্ষা ও ফিন্যান্সের শতভাগ অটোমেশন।
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 mb-8 mt-auto">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> অটোমেটিক গ্রেডিং ও মার্কশিট জেনারেশন</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> বায়োমেট্রিক ও ডিজিটাল হাজিরা</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> অভিভাবকদের জন্য ইনস্ট্যান্ট SMS এলার্ট</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> বেতন ও ফি কালেকশন ভাউচার</li>
            </ul>
            <a 
              href="#contact"
              className="w-full py-3 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white font-bold rounded-xl text-xs transition border border-indigo-500/20 flex items-center justify-center gap-2"
            >
              <span>স্কুল ERP বিস্তারিত জানুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Service 3: POS & Inventory */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-cyan-500/40 transition shadow-xl group flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition">
              <Store className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">Point of Sale</span>
            <h3 className="text-2xl font-bold text-white mb-3">রিটেইল ও হোলসেল POS</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              সুপারশপ, ফ্যাশন শোরুম, ফার্মেসি ও যেকোনো পাইকারি ব্যবসার জন্য রিয়েলটাইম ইনভেন্টরি ও থার্মাল প্রিন্টিং সমর্থিত ক্যাশ রেজিস্টার।
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 mb-8 mt-auto">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> দ্রুত বারকোড স্ক্যান ও ইনস্ট্যান্ট বিল</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> লো-স্টক ও এক্সপায়ারি অটো-নোটিফিকেশন</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> কাস্টমার বাকির খাতা ও লেজার হিসাব</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> মোবাইল, ট্যাবলেট ও পিসিতে ব্যবহার উপযোগী</li>
            </ul>
            <a 
              href="#contact"
              className="w-full py-3 bg-cyan-600/10 hover:bg-cyan-600 text-cyan-400 hover:text-white font-bold rounded-xl text-xs transition border border-cyan-500/20 flex items-center justify-center gap-2"
            >
              <span>পিওএস ডেমো রিকোয়েস্ট করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 5. Interactive Live Demos Section */}
      <section id="demos" className="py-20 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
              সরাসরি এক্সপেরিয়েন্স করুন
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
              লাইভ ডেমো ও প্রজেক্ট প্রিভিউ
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              আমাদের তৈরি করা প্ল্যাটফর্মগুলো নিজেই চালিয়ে দেখুন এবং এর কার্যকারিতা যাচাই করুন।
            </p>
          </div>

          {/* Interactive Demo Selector */}
          <div className="flex justify-center gap-3 mb-10">
            <button
              onClick={() => setActiveDemoTab('ecom')}
              className={`px-6 py-3 rounded-xl font-bold text-xs transition flex items-center gap-2 ${activeDemoTab === 'ecom' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ই-কমার্স ডেমো</span>
            </button>
            <button
              onClick={() => setActiveDemoTab('school')}
              className={`px-6 py-3 rounded-xl font-bold text-xs transition flex items-center gap-2 ${activeDemoTab === 'school' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>স্কুল ERP ডেমো</span>
            </button>
            <button
              onClick={() => setActiveDemoTab('pos')}
              className={`px-6 py-3 rounded-xl font-bold text-xs transition flex items-center gap-2 ${activeDemoTab === 'pos' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <Store className="w-4 h-4" />
              <span>পিওএস সফটওয়্যার</span>
            </button>
          </div>

          {/* Active Demo Showcase Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-blue-400 mb-2 block">
                  {activeDemoTab === 'ecom' ? 'E-COMMERCE LIVE SYSTEM' : activeDemoTab === 'school' ? 'SCHOOL MANAGEMENT ERP' : 'CLOUD POS SYSTEM'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">
                  {activeDemoTab === 'ecom' 
                    ? 'ক্লাউড মাল্টি-টেন্যান্ট অনলাইন শপ ও মার্চেন্ট হাব' 
                    : activeDemoTab === 'school'
                    ? 'স্মার্ট ডিজিটাল স্কুল অ্যাডমিনিস্ট্রেশন'
                    : 'হাইপার-ফাস্ট পয়েন্ট অফ সেল রেজিস্টার'}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  {activeDemoTab === 'ecom'
                    ? 'কাস্টমারদের জন্য রেসপন্সিভ ডিজাইন, ক্যাটাগরি ব্রাউজিং, চেকআউট এবং মার্চেন্টদের জন্য আলাদা কন্ট্রোল প্যানেল সম্বলিত আধুনিক শপ।'
                    : activeDemoTab === 'school'
                    ? 'শিক্ষক, অভিভাবক ও প্রশাসনের জন্য পৃথক সুবিধা। সহজ ইন্টারফেস এবং ১০০% নির্ভুল ফলাফল ও হিসাব ব্যবস্থাপনার প্ল্যাটফর্ম।'
                    : 'দ্রুত পণ্য বিক্রি, স্টক কন্ট্রোল, কাস্টমার লেজার এবং লাভ-ক্ষতির লাইভ গ্রাফ সহ যেকোনো আকারের দোকানের জন্য উপযুক্ত।'}
                </p>

                <div className="flex flex-wrap gap-4">
                  <a
                    href={activeDemoTab === 'ecom' ? settings.demos.ecomUrl : '#contact'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
                  >
                    <span>ডেমো ওপেন করুন</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://wa.me/${settings.contact.whatsappNumber}?text=I%20want%20to%20test%20the%20${activeDemoTab}%20demo`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>লগিন আইডি ও পাসওয়ার্ড নিন</span>
                  </a>
                </div>
              </div>

              {/* Mockup Display Card */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-inner flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">live-preview.cloud</span>
                </div>
                <div className="py-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                    <Laptop className="w-8 h-8" />
                  </div>
                  <h4 className="text-white font-bold text-lg">ডেমো রেডি রয়েছে</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    সরাসরি লাইভ সিস্টেমে ঢুকে অর্ডার করা এবং এডমিন প্যানেল ঘুরে দেখার জন্য নিচের বোতামে চাপ দিন।
                  </p>
                  <a
                    href={settings.demos.ecomUrl || 'https://mahinecom.vercel.app/store1'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition shadow-md shadow-emerald-600/30"
                  >
                    <span>ভিজিট করুন: /store1</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing Packages Overview */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3.5 py-1.5 rounded-full border border-purple-500/20">
            স্বচ্ছ ও সাশ্রয়ী বাজেট
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4 mb-4">
            আপনার পছন্দের প্ল্যান বেছে নিন
          </h2>
          <p className="text-slate-400 text-base">
            কোনো লুকায়িত চার্জ নেই। আপনার বাজেটের মধ্যেই সর্বোত্তম পারফরম্যান্স ও সাপোর্ট নিশ্চিত করা হয়।
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">স্টার্টার বিজনেস</span>
            <h3 className="text-2xl font-bold text-white mt-1 mb-2">ই-কমার্স বেসিক</h3>
            <p className="text-xs text-slate-400 mb-6">নতুন উদ্যোগ ও এফ-কমার্স উদ্যোক্তাদের জন্য আদর্শ।</p>
            <div className="text-3xl font-black text-white mb-6">কাস্টম বাজেট</div>
            <ul className="space-y-3 text-xs text-slate-300 mb-8 mt-auto">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> সম্পূর্ণ অনলাইন স্টোরফ্রন্ট</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> আনলিমিটেড প্রোডাক্ট আপলোড</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> মার্চেন্ট সেলস ও অর্ডার ড্যাশবোর্ড</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> ফ্রি SSL ও সুপারফাস্ট হোস্টিং</li>
            </ul>
            <a 
              href={`https://wa.me/${settings.contact.whatsappNumber}?text=I%20am%20interested%20in%20Starter%20Ecommerce%20Package`}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition text-center"
            >
              বুকিং করুন
            </a>
          </div>

          {/* Pro Plan (Highlighted) */}
          <div className="bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 p-8 rounded-3xl border-2 border-blue-500 shadow-2xl shadow-blue-500/10 flex flex-col relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
              মোস্ট পপুলার
            </div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">ফুল পাওয়ারপ্যাক</span>
            <h3 className="text-2xl font-bold text-white mt-1 mb-2">ই-কমার্স প্রো + কুরিয়ার</h3>
            <p className="text-xs text-slate-400 mb-6">ব্র্যান্ডেড বিজনেস ও গ্রোইং স্টোরের পূর্ণাঙ্গ সমাধান।</p>
            <div className="text-3xl font-black text-white mb-6">বেস্ট ভ্যালু</div>
            <ul className="space-y-3 text-xs text-slate-300 mb-8 mt-auto">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> নিজস্ব কাস্টম .com ডোমেইন সাপোর্ট</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> অটোমেটেড Steadfast/Pathao API</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> বিকাশ, নগদ ও কার্ড পেমেন্ট গেটওয়ে</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> ইনভয়েস জেনারেশন ও থার্মাল প্রিন্ট</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> প্রায়োরিটি ২৪/৭ ভিআইপি সাপোর্ট</li>
            </ul>
            <a 
              href={`https://wa.me/${settings.contact.whatsappNumber}?text=I%20want%20to%20order%20Pro%20Ecommerce%20Package`}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition text-center shadow-lg shadow-blue-600/30"
            >
              আজই শুরু করুন
            </a>
          </div>

          {/* School/POS Enterprise */}
          <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">এন্টারপ্রাইজ সলিউশন</span>
            <h3 className="text-2xl font-bold text-white mt-1 mb-2">স্কুল ERP / রিটেইল POS</h3>
            <p className="text-xs text-slate-400 mb-6">প্রতিষ্ঠান ও শোরুম পরিচালনার ফুল সফটওয়্যার।</p>
            <div className="text-3xl font-black text-white mb-6">বার্ষিক / লাইফটাইম</div>
            <ul className="space-y-3 text-xs text-slate-300 mb-8 mt-auto">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> সম্পূর্ণ কাস্টমাইজড ফিচার</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> স্টাফ ট্রেনিং ও ফুল সেটআপ সহায়তা</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> আনলিমিটেড ইউজার ও ব্রাঞ্চ সাপোর্ট</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> অটোমেটেড ক্লাউড ব্যাকআপ সুরক্ষা</li>
            </ul>
            <a 
              href="#contact"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition text-center"
            >
              কোটেশন রিকোয়েস্ট করুন
            </a>
          </div>
        </div>
      </section>

      {/* 7. Contact & Quote Request Form */}
      <section id="contact" className="py-20 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3.5 py-1.5 rounded-full border border-cyan-500/20">
                আমাদের সাথে কথা বলুন
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-4 mb-4">
                আপনার কাঙ্ক্ষিত সফটওয়্যারের জন্য বার্তা পাঠান
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                আপনার ব্যবসা বা স্কুলের কী ধরনের সফটওয়্যার প্রয়োজন তা লিখে মেসেজ দিন। আমাদের টিম দ্রুত আপনার সাথে যোগাযোগ করবে।
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">সরাসরি ফোন কল</span>
                    <span className="text-white font-bold text-sm">{settings.contact.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">হোয়াটসঅ্যাপ চ্যাট</span>
                    <span className="text-white font-bold text-sm">+{settings.contact.whatsappNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">অফিশিয়াল ইমেইল</span>
                    <span className="text-white font-bold text-sm">{settings.contact.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiry Form Card */}
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">ইনকোয়ারি বা পরামর্শ ফর্ম</h3>
              <p className="text-xs text-slate-400 mb-6">ফর্মটি পূরণ করুন, আমরা ৩০ মিনিটের মধ্যে রিপ্লাই দেব।</p>

              {submitted ? (
                <div className="p-8 text-center bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h4 className="text-white font-bold text-lg">ধন্যবাদ! বার্তাটি সফলভাবে পাঠানো হয়েছে।</h4>
                  <p className="text-xs text-slate-400 mt-1">আমাদের প্রতিনিধি শীঘ্রই আপনার দেয়া ফোন নম্বরে যোগাযোগ করবেন।</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-6 px-4 py-2 bg-slate-800 text-xs font-semibold text-white rounded-lg hover:bg-slate-700"
                  >
                    আরেকটি বার্তা পাঠান
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">আপনার নাম *</label>
                    <input 
                      required
                      type="text"
                      value={inquiry.name}
                      onChange={e => setInquiry({ ...inquiry, name: e.target.value })}
                      placeholder="e.g. মোঃ মাহিন"
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">ফোন বা হোয়াটসঅ্যাপ নম্বর *</label>
                    <input 
                      required
                      type="text"
                      value={inquiry.phone}
                      onChange={e => setInquiry({ ...inquiry, phone: e.target.value })}
                      placeholder="01XXXXXXXXX"
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">কোন সার্ভিসটি প্রয়োজন? *</label>
                    <select
                      value={inquiry.service}
                      onChange={e => setInquiry({ ...inquiry, service: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    >
                      <option value="ecommerce">ই-কমার্স ওয়েবসাইট ও মার্চেন্ট প্যানেল</option>
                      <option value="school_erp">স্কুল / কলেজ ম্যানেজমেন্ট ERP</option>
                      <option value="pos">শপ ও রিটেইল POS সফটওয়্যার</option>
                      <option value="custom">কাস্টম ওয়েব ও সফটওয়্যার ডেভেলপমেন্ট</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">আপনার মেসেজ বা রিকোয়ারমেন্ট</label>
                    <textarea 
                      rows={3}
                      value={inquiry.message}
                      onChange={e => setInquiry({ ...inquiry, message: e.target.value })}
                      placeholder="আপনার ব্যবসা বা প্রতিষ্ঠানের সংক্ষিপ্ত বিবরণ..."
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    <span>{submitting ? 'পাঠানো হচ্ছে...' : 'বার্তা পাঠান'}</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Modern 4-Column Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
            {/* Col 1: Bio */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                  M
                </div>
                <span className="text-lg font-black text-white">{settings.branding.agencyName}</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                {settings.footer.aboutText}
              </p>
              <div className="flex items-center gap-3">
                <a href={settings.contact.facebookUrl} target="_blank" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500 transition text-xs">
                  FB
                </a>
                <a href={settings.contact.youtubeUrl} target="_blank" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-red-400 hover:border-red-500 transition text-xs">
                  YT
                </a>
                <a href={`https://wa.me/${settings.contact.whatsappNumber}`} target="_blank" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500 transition text-xs">
                  WA
                </a>
              </div>
            </div>

            {/* Col 2: Solutions */}
            <div>
              <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">সফটওয়্যার সেবাসমূহ</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#services" className="hover:text-white transition">মাল্টি-টেন্যান্ট ই-কমার্স SaaS</a></li>
                <li><a href="#services" className="hover:text-white transition">স্মার্ট স্কুল ম্যানেজমেন্ট ERP</a></li>
                <li><a href="#services" className="hover:text-white transition">রিটেইল ও হোলসেল POS সিস্টেম</a></li>
                <li><a href="#services" className="hover:text-white transition">কাস্টম ওয়েব ও ক্লাউড অ্যাপ</a></li>
                <li><a href="#services" className="hover:text-white transition">কুরিয়ার ও পেমেন্ট গেটওয়ে সেটআপ</a></li>
              </ul>
            </div>

            {/* Col 3: Quick Links */}
            <div>
              <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">গুরুত্বপূর্ণ লিংক</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#demos" className="hover:text-white transition">লাইভ প্রজেক্ট ডেমো</a></li>
                <li><a href="#pricing" className="hover:text-white transition">প্যাকেজ ও বাজেট</a></li>
                <li><Link href="/store1/ecomsaas" className="hover:text-blue-400 transition">মার্চেন্ট লগিন (/ecomsaas)</Link></li>
                <li><Link href="/mahinsaas" className="hover:text-red-400 transition">সুপার এডমিন লগিন (/mahinsaas)</Link></li>
              </ul>
            </div>

            {/* Col 4: Contact */}
            <div>
              <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">অফিস ও যোগাযোগ</h4>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>{settings.contact.address}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{settings.contact.phone}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{settings.contact.email}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>{settings.footer.copyrightText}</p>
            <p className="flex items-center gap-1">
              Powered by <span className="text-slate-300 font-bold">Cloud Next & Firebase</span>
            </p>
          </div>
        </div>
      </footer>

      {/* 9. Floating WhatsApp Quick Contact Button */}
      <a
        href={`https://wa.me/${settings.contact.whatsappNumber}?text=Hello!%20I%20want%20to%20know%20more%20about%20your%20services.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-2xl shadow-emerald-500/40 hover:scale-110 transition flex items-center justify-center group"
        aria-label="Chat on WhatsApp"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-xs pl-0 group-hover:pl-2">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
}
