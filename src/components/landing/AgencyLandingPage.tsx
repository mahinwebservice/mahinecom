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
  Play,
  Pause,
  Award,
  BarChart3,
  Flame,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export const defaultSettings = {
  branding: {
    agencyName: 'Mahin Web Services',
    tagline: 'নেক্সট-জেন ক্লাউড ই-কমার্স, স্মার্ট স্কুল ইআরপি ও পিওএস সলিউশন',
    badgeText: '🚀 Next-Gen Digital Platform Solutions',
    logoUrl: '',
    faviconUrl: '/favicon.ico'
  },
  seo: {
    browserTitle: 'Mahin Web Services | E-Commerce, School ERP and POS Systems',
    metaDescription: 'High-performance Multi-Tenant E-Commerce Stores, Smart School Management ERP, and Cloud POS systems in Bangladesh.',
    keywords: 'ecommerce, saas, school erp, pos bangladesh, mahin web services'
  },
  hero: {
    slides: [
      {
        tag: 'ই-কমার্স বিপ্লব (E-Commerce SaaS)',
        title: 'আপনার ব্যবসার জন্য নিজস্ব ব্র্যান্ডের',
        highlight: 'সুপারফাস্ট ই-কমার্স প্ল্যাটফর্ম',
        description: 'কাস্টম স্টোরফ্রন্ট, অটোমেটিক কুরিয়ার (Steadfast, Pathao), বিকাশ-নগদ পেমেন্ট ও রিয়েলটাইম মার্চেন্ট ড্যাশবোর্ডসহ সম্পূর্ণ অনলাইন স্টোর।',
        bgImage: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1920&q=80',
        ctaText: 'ই-কমার্স ডেমো দেখুন',
        ctaLink: '#demos',
        secondaryCtaText: 'হোয়াটসঅ্যাপে যোগাযোগ',
        secondaryCtaLink: 'https://wa.me/8801700000000?text=Hello,%20I%20am%20interested%20in%20your%20E-Commerce%20solution'
      },
      {
        tag: 'ডিজিটাল স্কুল ম্যানেজমেন্ট (Smart Edu ERP)',
        title: 'শিক্ষাপ্রতিষ্ঠানের সকল কার্যক্রমের জন্য',
        highlight: 'অটোমেটেড স্মার্ট স্কুল ERP',
        description: 'অনলাইন ভর্তি, ডিজিটাল হাজিরা, অটোমেটিক রেজাল্ট ও গ্রেডিং শিট, এসএমএস নোটিফিকেশন এবং স্বয়ংক্রিয় ফি কালেকশন সিস্টেম।',
        bgImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80',
        ctaText: 'স্কুল ERP ডেমো দেখুন',
        ctaLink: '#demos',
        secondaryCtaText: 'পরামর্শ নিন',
        secondaryCtaLink: '#contact'
      },
      {
        tag: 'স্মার্ট বিজনেস পিওএস (Retail & Wholesale POS)',
        title: 'দোকান ও ব্যবসা পরিচালনার জন্য',
        highlight: 'ফুল-ফিচার্ড ক্লাউড POS সিস্টেম',
        description: 'বারকোড স্ক্যানিং, ইনভেন্টরি ট্র্যাকিং, ইনস্ট্যান্ট ক্যাশমেমো প্রিন্ট, লাভ-ক্ষতির লাইভ হিসাব এবং যেকোনো ডিভাইস থেকে পরিচালনা।',
        bgImage: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1920&q=80',
        ctaText: 'পিওএস ডেমো দেখুন',
        ctaLink: '#demos',
        secondaryCtaText: 'প্যাকেজসমূহ দেখুন',
        secondaryCtaLink: '#pricing'
      }
    ]
  },
  services: [
    {
      id: 'ecommerce',
      title: 'মাল্টি-টেন্যান্ট ই-কমার্স SaaS',
      tagline: 'E-Commerce Platform',
      description: 'নিজস্ব ডোমেইনে সম্পূর্ণ অনলাইন স্টোর। কাস্টমার অর্ডার করবে, মার্চেন্ট প্যানেল থেকে ইনভয়েস প্রিন্ট হবে এবং এক ক্লিকে কুরিয়ার বুকিং হবে।',
      features: [
        'ড্র্যাগ অ্যান্ড ড্রপ স্টোরফ্রন্ট বিল্ডার',
        'Steadfast ও Pathao কুরিয়ার API ইন্টিগ্রেশন',
        'বিকাশ, নগদ ও ক্যাশ অন ডেলিভারি',
        'রিয়েলটাইম সেলস অ্যানালিটিক্স ও প্রফিট রিপোর্ট'
      ],
      demoLink: 'https://mahinecom.vercel.app/store1',
      badgeColor: 'blue'
    },
    {
      id: 'school',
      title: 'স্মার্ট স্কুল ম্যানেজমেন্ট ERP',
      tagline: 'Education ERP System',
      description: 'স্কুল, কলেজ ও মাদ্রাসার জন্য পূর্ণাঙ্গ ডিজিটাল সফটওয়্যার। স্টুডেন্ট ডাটাবেস থেকে শুরু করে পরীক্ষা ও ফিন্যান্সের শতভাগ অটোমেশন।',
      features: [
        'অটোমেটিক গ্রেডিং ও মার্কশিট জেনারেশন',
        'বায়োমেট্রিক ও ডিজিটাল হাজিরা ট্র্যাকিং',
        'অভিভাবকদের জন্য ইনস্ট্যান্ট SMS এলার্ট',
        'বেতন ও ফি কালেকশন ভাউচার হিসাব'
      ],
      demoLink: '#contact',
      badgeColor: 'indigo'
    },
    {
      id: 'pos',
      title: 'রিটেইল ও হোলসেল ক্লাউড POS',
      tagline: 'Point of Sale System',
      description: 'সুপারশপ, ফ্যাশন শোরুম, ফার্মেসি ও পাইকারি ব্যবসার জন্য রিয়েলটাইম ইনভেন্টরি ও থার্মাল প্রিন্টিং সমর্থিত ক্যাশ রেজিস্টার।',
      features: [
        'দ্রুত বারকোড স্ক্যান ও ইনস্ট্যান্ট বিল প্রিন্ট',
        'লো-স্টক ও এক্সপায়ারি অটো-নোটিফিকেশন',
        'কাস্টমার বাকির খাতা ও লেজার ব্যালেন্স',
        'মোবাইল, ট্যাবলেট ও পিসিতে ব্যবহার উপযোগী'
      ],
      demoLink: '#contact',
      badgeColor: 'cyan'
    }
  ],
  pricing: [
    {
      name: 'ই-কমার্স বেসিক',
      badge: 'স্টার্টার বিজনেস',
      price: 'কাস্টম বাজেট',
      period: 'এককালীন / মাসিক',
      description: 'নতুন উদ্যোগ ও এফ-কমার্স উদ্যোক্তাদের জন্য আদর্শ।',
      features: [
        'সম্পূর্ণ অনলাইন স্টোরফ্রন্ট',
        'আনলিমিটেড প্রোডাক্ট আপলোড',
        'মার্চেন্ট সেলস ও অর্ডার ড্যাশবোর্ড',
        'ফ্রি SSL ও সুপারফাস্ট ক্লাউড হোস্টিং'
      ],
      isPopular: false,
      buttonText: 'বুকিং করুন',
      buttonLink: 'https://wa.me/8801700000000?text=I%20am%20interested%20in%20Starter%20Ecommerce%20Package'
    },
    {
      name: 'ই-কমার্স প্রো + কুরিয়ার',
      badge: 'ফুল পাওয়ারপ্যাক',
      price: 'বেস্ট ভ্যালু',
      period: 'বার্ষিক প্ল্যান',
      description: 'ব্র্যান্ডেড বিজনেস ও গ্রোইং স্টোরের পূর্ণাঙ্গ সমাধান।',
      features: [
        'নিজস্ব কাস্টম .com ডোমেইন সাপোর্ট',
        'অটোমেটেড Steadfast/Pathao API',
        'বিকাশ, নগদ ও কার্ড পেমেন্ট গেটওয়ে',
        'ইনভয়েস জেনারেশন ও থার্মাল প্রিন্ট',
        'প্রায়োরিটি ২৪/৭ ভিআইপি সাপোর্ট'
      ],
      isPopular: true,
      buttonText: 'আজই শুরু করুন',
      buttonLink: 'https://wa.me/8801700000000?text=I%20want%20to%20order%20Pro%20Ecommerce%20Package'
    },
    {
      name: 'স্কুল ERP / রিটেইল POS',
      badge: 'এন্টারপ্রাইজ সলিউশন',
      price: 'বার্ষিক / লাইফটাইম',
      period: 'কাস্টম কোটেশন',
      description: 'প্রতিষ্ঠান ও শোরুম পরিচালনার ফুল সফটওয়্যার।',
      features: [
        'সম্পূর্ণ কাস্টমাইজড ফিচার রিকোয়ারমেন্ট',
        'স্টাফ ট্রেনিং ও ফুল সেটআপ সহায়তা',
        'আনলিমিটেড ইউজার ও ব্রাঞ্চ সাপোর্ট',
        'অটোমেটেড ক্লাউড ব্যাকআপ সুরক্ষা'
      ],
      isPopular: false,
      buttonText: 'কোটেশন রিকোয়েস্ট করুন',
      buttonLink: '#contact'
    }
  ],
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
    copyrightText: '© ' + new Date().getFullYear() + ' Mahin Web Services. All rights reserved.',
    poweredBy: 'Mahin Web Services',
    poweredByLink: '/',
    col2Title: 'সফটওয়্যার সেবাসমূহ',
    col2Links: [
      { label: 'মাল্টি-টেন্যান্ট ই-কমার্স SaaS', url: '#services' },
      { label: 'স্মার্ট স্কুল ম্যানেজমেন্ট ERP', url: '#services' },
      { label: 'রিটেইল ও হোলসেল POS সিস্টেম', url: '#services' },
      { label: 'কাস্টম ওয়েব ও ক্লাউড অ্যাপ', url: '#services' },
      { label: 'কুরিয়ার ও পেমেন্ট গেটওয়ে সেটআপ', url: '#services' }
    ],
    col3Title: 'গুরুত্বপূর্ণ লিংক',
    col3Links: [
      { label: 'লাইভ প্রজেক্ট ডেমো', url: '#demos' },
      { label: 'প্যাকেজ ও বাজেট', url: '#pricing' },
      { label: 'মার্চেন্ট লগিন (/ecomsaas)', url: '/store1/ecomsaas' },
      { label: 'সুপার এডমিন লগিন (/mahinsaas)', url: '/mahinsaas' }
    ],
    col4Title: 'অফিস ও যোগাযোগ'
  }
};

export function AgencyLandingPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeDemoTab, setActiveDemoTab] = useState<'ecom' | 'school' | 'pos'>('ecom');
  const [inquiry, setInquiry] = useState({ name: '', phone: '', service: 'ecommerce', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch Firestore settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'platform_settings', 'landing_page'));
        if (snap.exists()) {
          const data = snap.data();
          setSettings({
            ...defaultSettings,
            ...data,
            branding: { ...defaultSettings.branding, ...(data.branding || {}) },
            seo: { ...defaultSettings.seo, ...(data.seo || {}) },
            hero: { ...defaultSettings.hero, ...(data.hero || {}) },
            services: data.services && data.services.length > 0 ? data.services : defaultSettings.services,
            pricing: data.pricing && data.pricing.length > 0 ? data.pricing : defaultSettings.pricing,
            demos: { ...defaultSettings.demos, ...(data.demos || {}) },
            contact: { ...defaultSettings.contact, ...(data.contact || {}) },
            footer: {
              ...defaultSettings.footer,
              ...(data.footer || {}),
              col2Links: (data.footer?.col2Links && data.footer.col2Links.length > 0) ? data.footer.col2Links : defaultSettings.footer.col2Links,
              col3Links: (data.footer?.col3Links && data.footer.col3Links.length > 0) ? data.footer.col3Links : defaultSettings.footer.col3Links
            }
          });
        }
      } catch (err) {
        console.error('Error fetching landing settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // Update document title and favicon dynamically
  useEffect(() => {
    if (settings.seo?.browserTitle) {
      document.title = settings.seo.browserTitle;
    }
    if (settings.branding?.faviconUrl) {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.branding.faviconUrl;
    }
  }, [settings.seo?.browserTitle, settings.branding?.faviconUrl]);

  // Video-like Auto Slider
  useEffect(() => {
    if (!isPlaying) return;
    const slidesCount = settings.hero?.slides?.length || 1;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesCount);
    }, 6500);
    return () => clearInterval(timer);
  }, [isPlaying, settings.hero?.slides?.length]);

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

  const slides = settings.hero?.slides || defaultSettings.hero.slides;
  const currentSlideData = slides[currentSlide] || slides[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {settings.branding.logoUrl ? (
              <img 
                src={settings.branding.logoUrl} 
                alt={settings.branding.agencyName} 
                className="h-10 w-auto rounded-xl object-contain shadow-md"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
                <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition" />
                </div>
              </div>
            )}
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-white block group-hover:text-blue-400 transition leading-tight">
                {settings.branding.agencyName}
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-blue-400 tracking-wider uppercase block">
                {settings.branding.tagline || 'Cloud Software Studio'}
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
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>পরামর্শ নিন</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. Super Cinematic Hero Slider with Video-Style Motion & Image Background */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden border-b border-slate-800/80">
        
        {/* Animated Background Slides (Ken Burns Drone Motion Effect) */}
        {slides.map((s, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'}`}
            >
              {/* Ken-Burns Slow Zoom Image */}
              <div 
                className={`w-full h-full bg-cover bg-center transition-transform duration-[7000ms] ease-out ${isActive ? 'scale-110 translate-y-[-1%]' : 'scale-100'}`}
                style={{
                  backgroundImage: `url('${s.bgImage || 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1920&q=80'}')`
                }}
              />
              {/* Dark Cinematic Vignette & Blur Gradient Overlay (Ensures Text is 100% Readable) */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/60" />
              <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px]" />
              {/* Radial Glowing Ambient Accent */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
            </div>
          );
        })}

        {/* Content Container (Carefully Proportionate Font Sizes) */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10 text-center">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-blue-500/40 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6 shadow-xl backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{currentSlideData.tag || settings.branding.badgeText}</span>
          </div>

          {/* Balanced, Proportional Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.2] mb-5">
            <span className="block text-white mb-1.5">{currentSlideData.title}</span>
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              {currentSlideData.highlight}
            </span>
          </h1>

          {/* Subtitle Description */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed mb-8 max-w-2xl mx-auto drop-shadow-sm">
            {currentSlideData.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <a 
              href={currentSlideData.ctaLink || '#demos'}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 transition flex items-center gap-2"
            >
              <span>{currentSlideData.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a 
              href={currentSlideData.secondaryCtaLink || '#contact'}
              className="px-7 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700/80 backdrop-blur-md hover:-translate-y-0.5 transition flex items-center gap-2"
            >
              <span>{currentSlideData.secondaryCtaText}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>

          {/* Video-Style Navigation Controls (Prev, Indicators, Next, Play/Pause) */}
          <div className="inline-flex items-center gap-4 bg-slate-900/80 border border-slate-800/90 rounded-2xl px-4 py-2 backdrop-blur-lg shadow-xl">
            <button
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
              className="p-1 text-slate-400 hover:text-white transition"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Slide Indicators with Progress Fill */}
            <div className="flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-blue-500 shadow-md shadow-blue-500/50' : 'w-2 bg-slate-700 hover:bg-slate-500'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="p-1 text-slate-400 hover:text-white transition"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-4 bg-slate-800 mx-1" />

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 font-mono"
              title={isPlaying ? 'Pause Auto-Play' : 'Resume Auto-Play'}
            >
              {isPlaying ? <Pause className="w-3 h-3 text-cyan-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
            </button>
          </div>

        </div>
      </section>

      {/* 3. Social Proof Stats Strip */}
      <section className="border-b border-slate-800/80 bg-slate-900/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">50+</div>
              <p className="text-xs font-medium text-slate-400 mt-1">সফল প্রতিষ্ঠান ও শপ</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-blue-400">৯৯.৯৯%</div>
              <p className="text-xs font-medium text-slate-400 mt-1">গ্লোবাল ক্লাউড আপটাইম</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-400">১০০%</div>
              <p className="text-xs font-medium text-slate-400 mt-1">কুরিয়ার ও পেমেন্ট ইন্টিগ্রেশন</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-400">২৪/৭</div>
              <p className="text-xs font-medium text-slate-400 mt-1">ডেডিকেটেড টেক সাপোর্ট</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Solutions Showcase */}
      <section id="services" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
            আমাদের সফটওয়্যার সেবা
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-3 mb-3">
            আপনার ব্যবসা ও প্রতিষ্ঠানের সম্পূর্ণ সমাধান
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            আধুনিক ক্লাউড আর্কিটেকচারে তৈরি উচ্চগতির সফটওয়্যার যা আপনার সময় বাঁচাবে এবং কাজের গতি বহুগুণ বাড়িয়ে দেবে।
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {(settings.services || defaultSettings.services).map((srv, idx) => (
            <div 
              key={srv.id || idx}
              className="bg-gradient-to-b from-slate-900 to-slate-950 p-7 rounded-3xl border border-slate-800 hover:border-blue-500/40 transition shadow-xl group flex flex-col"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition">
                {idx === 0 ? <ShoppingBag className="w-6 h-6" /> : idx === 1 ? <GraduationCap className="w-6 h-6" /> : <Store className="w-6 h-6" />}
              </div>
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-1">{srv.tagline}</span>
              <h3 className="text-xl font-bold text-white mb-2.5">{srv.title}</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                {srv.description}
              </p>
              
              {srv.features && (
                <ul className="space-y-2 text-xs text-slate-300 mb-8 mt-auto">
                  {srv.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              )}

              <a 
                href={srv.demoLink || '#contact'}
                target={srv.demoLink?.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white font-bold rounded-xl text-xs transition border border-blue-500/20 flex items-center justify-center gap-2"
              >
                <span>ডেমো বা বিস্তারিত দেখুন</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Interactive Live Demos Section */}
      <section id="demos" className="py-20 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              সরাসরি এক্সপেরিয়েন্স করুন
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-2.5">
              লাইভ ডেমো ও প্রজেক্ট প্রিভিউ
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
              আমাদের তৈরি করা প্ল্যাটফর্মগুলো নিজেই চালিয়ে দেখুন এবং এর কার্যকারিতা যাচাই করুন।
            </p>
          </div>

          {/* Interactive Demo Selector */}
          <div className="flex justify-center gap-3 mb-8">
            <button
              onClick={() => setActiveDemoTab('ecom')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${activeDemoTab === 'ecom' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>ই-কমার্স ডেমো</span>
            </button>
            <button
              onClick={() => setActiveDemoTab('school')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${activeDemoTab === 'school' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>স্কুল ERP ডেমো</span>
            </button>
            <button
              onClick={() => setActiveDemoTab('pos')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${activeDemoTab === 'pos' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>পিওএস সফটওয়্যার</span>
            </button>
          </div>

          {/* Active Demo Showcase Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-blue-400 mb-2 block">
                  {activeDemoTab === 'ecom' ? 'E-COMMERCE LIVE SYSTEM' : activeDemoTab === 'school' ? 'SCHOOL MANAGEMENT ERP' : 'CLOUD POS SYSTEM'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-3">
                  {activeDemoTab === 'ecom' 
                    ? 'ক্লাউড মাল্টি-টেন্যান্ট অনলাইন শপ ও মার্চেন্ট হাব' 
                    : activeDemoTab === 'school'
                    ? 'স্মার্ট ডিজিটাল স্কুল অ্যাডমিনিস্ট্রেশন'
                    : 'হাইপার-ফাস্ট পয়েন্ট অফ সেল রেজিস্টার'}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                  {activeDemoTab === 'ecom'
                    ? 'কাস্টমারদের জন্য রেসপন্সিভ ডিজাইন, ক্যাটাগরি ব্রাউজিং, চেকআউট এবং মার্চেন্টদের জন্য আলাদা কন্ট্রোল প্যানেল সম্বলিত আধুনিক শপ।'
                    : activeDemoTab === 'school'
                    ? 'শিক্ষক, অভিভাবক ও প্রশাসনের জন্য পৃথক সুবিধা। সহজ ইন্টারফেস এবং ১০০% নির্ভুল ফলাফল ও হিসাব ব্যবস্থাপনার প্ল্যাটফর্ম।'
                    : 'দ্রুত পণ্য বিক্রি, স্টক কন্ট্রোল, কাস্টমার লেজার এবং লাভ-ক্ষতির লাইভ গ্রাফ সহ যেকোনো আকারের দোকানের জন্য উপযুক্ত।'}
                </p>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={activeDemoTab === 'ecom' ? (settings.demos?.ecomUrl || 'https://mahinecom.vercel.app/store1') : '#contact'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
                  >
                    <span>ডেমো ওপেন করুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`https://wa.me/${settings.contact.whatsappNumber}?text=I%20want%20to%20test%20the%20${activeDemoTab}%20demo`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition flex items-center gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>লগিন আইডি ও পাসওয়ার্ড নিন</span>
                  </a>
                </div>
              </div>

              {/* Mockup Display Card */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-inner flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">live-preview.cloud</span>
                </div>
                <div className="py-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-500/20">
                    <Laptop className="w-7 h-7" />
                  </div>
                  <h4 className="text-white font-bold text-base">ডেমো রেডি রয়েছে</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    সরাসরি লাইভ সিস্টেমে ঢুকে অর্ডার করা এবং এডমিন প্যানেল ঘুরে দেখার জন্য নিচের বোতামে চাপ দিন।
                  </p>
                  <a
                    href={settings.demos?.ecomUrl || 'https://mahinecom.vercel.app/store1'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition shadow-md shadow-emerald-600/30"
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

      {/* 6. Pricing Packages */}
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
            স্বচ্ছ ও সাশ্রয়ী বাজেট
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-3 mb-3">
            আপনার পছন্দের প্ল্যান বেছে নিন
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            কোনো লুকায়িত চার্জ নেই। আপনার বাজেটের মধ্যেই সর্বোত্তম পারফরম্যান্স ও সাপোর্ট নিশ্চিত করা হয়।
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {(settings.pricing || defaultSettings.pricing).map((plan, idx) => (
            <div 
              key={idx}
              className={`p-7 rounded-3xl flex flex-col transition relative ${plan.isPopular ? 'bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 border-2 border-blue-500 shadow-2xl shadow-blue-500/10' : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                  মোস্ট পপুলার
                </div>
              )}
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{plan.badge}</span>
              <h3 className="text-xl font-bold text-white mt-1 mb-1.5">{plan.name}</h3>
              <p className="text-xs text-slate-400 mb-5">{plan.description}</p>
              
              <div className="mb-6">
                <div className="text-2xl sm:text-3xl font-black text-white">{plan.price}</div>
                <div className="text-[11px] text-slate-400 font-medium">{plan.period}</div>
              </div>

              {plan.features && (
                <ul className="space-y-2.5 text-xs text-slate-300 mb-8 mt-auto">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              )}

              <a 
                href={plan.buttonLink || '#contact'}
                className={`w-full py-3 rounded-xl text-xs font-bold transition text-center shadow-md ${plan.isPopular ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
              >
                {plan.buttonText || 'শুরু করুন'}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Contact & Lead Form */}
      <section id="contact" className="py-20 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20">
                আমাদের সাথে কথা বলুন
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-3 mb-3">
                আপনার কাঙ্ক্ষিত সফটওয়্যারের জন্য বার্তা পাঠান
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                আপনার ব্যবসা বা স্কুলের কী ধরনের সফটওয়্যার প্রয়োজন তা লিখে মেসেজ দিন। আমাদের টিম দ্রুত আপনার সাথে যোগাযোগ করবে।
              </p>

              <div className="space-y-3.5">
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">সরাসরি ফোন কল</span>
                    <span className="text-white font-bold text-sm">{settings.contact.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">হোয়াটসঅ্যাপ চ্যাট</span>
                    <span className="text-white font-bold text-sm">+{settings.contact.whatsappNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">অফিশিয়াল ইমেইল</span>
                    <span className="text-white font-bold text-sm">{settings.contact.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiry Form Card */}
            <div className="bg-slate-900 p-7 rounded-3xl border border-slate-800 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-1.5">ইনকোয়ারি বা পরামর্শ ফর্ম</h3>
              <p className="text-xs text-slate-400 mb-5">ফর্মটি পূরণ করুন, আমরা ৩০ মিনিটের মধ্যে রিপ্লাই দেব।</p>

              {submitted ? (
                <div className="p-6 text-center bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-white font-bold text-base">ধন্যবাদ! বার্তাটি সফলভাবে পাঠানো হয়েছে।</h4>
                  <p className="text-xs text-slate-400 mt-1">আমাদের প্রতিনিধি শীঘ্রই আপনার দেয়া ফোন নম্বরে যোগাযোগ করবেন।</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-4 py-1.5 bg-slate-800 text-xs font-semibold text-white rounded-lg hover:bg-slate-700"
                  >
                    আরেকটি বার্তা পাঠান
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">আপনার নাম *</label>
                    <input 
                      required
                      type="text"
                      value={inquiry.name}
                      onChange={e => setInquiry({ ...inquiry, name: e.target.value })}
                      placeholder="e.g. মোঃ মাহিন"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">কোন সার্ভিসটি প্রয়োজন? *</label>
                    <select
                      value={inquiry.service}
                      onChange={e => setInquiry({ ...inquiry, service: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                      rows={2}
                      value={inquiry.message}
                      onChange={e => setInquiry({ ...inquiry, message: e.target.value })}
                      placeholder="আপনার ব্যবসা বা প্রতিষ্ঠানের সংক্ষিপ্ত বিবরণ..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    <span>{submitting ? 'পাঠানো হচ্ছে...' : 'বার্তা পাঠান'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8. 4-Column Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
            {/* Col 1: Bio */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {settings.branding.logoUrl ? (
                  <img src={settings.branding.logoUrl} alt={settings.branding.agencyName} className="h-7 w-auto" />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                    M
                  </div>
                )}
                <span className="text-base font-black text-white">{settings.branding.agencyName}</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-5">
                {settings.footer?.aboutText}
              </p>
              <div className="flex items-center gap-2.5">
                <a href={settings.contact.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500 transition text-[11px] font-bold">
                  FB
                </a>
                <a href={settings.contact.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-red-400 hover:border-red-500 transition text-[11px] font-bold">
                  YT
                </a>
                <a href={`https://wa.me/${settings.contact.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500 transition text-[11px] font-bold">
                  WA
                </a>
              </div>
            </div>

            {/* Col 2: Solutions */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
                {settings.footer?.col2Title || 'সফটওয়্যার সেবাসমূহ'}
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {(settings.footer?.col2Links || defaultSettings.footer.col2Links).map((item, idx) => (
                  <li key={idx}>
                    <a href={item.url} className="hover:text-white transition">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Quick Links */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
                {settings.footer?.col3Title || 'গুরুত্বপূর্ণ লিংক'}
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {(settings.footer?.col3Links || defaultSettings.footer.col3Links).map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.url} className="hover:text-blue-400 transition">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Contact */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
                {settings.footer?.col4Title || 'অফিস ও যোগাযোগ'}
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>{settings.contact.address}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{settings.contact.phone}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{settings.contact.email}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>{settings.footer?.copyrightText}</p>
            <p className="flex items-center gap-1">
              Powered by <a href={settings.footer?.poweredByLink || '/'} className="text-slate-300 font-bold hover:text-white transition">{settings.footer?.poweredBy || 'Mahin Web Services'}</a>
            </p>
          </div>
        </div>
      </footer>

      {/* 9. Floating WhatsApp Quick Contact Button */}
      <a
        href={`https://wa.me/${settings.contact.whatsappNumber}?text=Hello!%20I%20want%20to%20know%20more%20about%20your%20services.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-2xl shadow-emerald-500/40 hover:scale-110 transition flex items-center justify-center group"
        aria-label="Chat on WhatsApp"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-xs pl-0 group-hover:pl-2">
          WhatsApp Chat
        </span>
      </a>
    </div>
  );
}
