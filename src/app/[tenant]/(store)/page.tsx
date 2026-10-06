'use client';
// @ts-nocheck

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones, 
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Eye,
  Award,
  Clock,
  Sparkles,
  Zap,
  Check,
  ShoppingCart
} from 'lucide-react';

export default function StorefrontHomePage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = (params?.tenant as string) || '';

  const { items: cartItems, addItem: addToCart, removeItem: removeFromCart, updateQuantity, getSubtotal } = useCartStore();

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active Slide Index for Cinematic HUD Slider
  const [activeSlide, setActiveSlide] = useState(0);
  const [clockTime, setClockTime] = useState('--:--:--');

  // Customizer Configuration State
  const [config, setConfig] = useState<any>(null);

  // Live Clock for HUD bar
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setClockTime(now.toTimeString().slice(0, 8));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Store Data (Categories, Products, Layout Config)
  useEffect(() => {
    if (!tenantId) return;

    const fetchStoreData = async () => {
      try {
        // 1. Fetch Categories
        const catSnap = await getDocs(collection(db, 'tenants/' + tenantId + '/categories'));
        const catList = catSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCategories(catList);

        // 2. Fetch Products
        const prodSnap = await getDocs(collection(db, 'tenants/' + tenantId + '/products'));
        const prodList = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProducts(prodList);

        // 3. Fetch Layout & General Settings
        const layoutSnap = await getDoc(doc(db, 'tenants/' + tenantId + '/settings/homepage_layout'));
        let layoutData = layoutSnap.exists() ? layoutSnap.data()?.storefrontConfig : null;

        const genSnap = await getDoc(doc(db, 'tenants/' + tenantId + '/settings/general'));
        const genData = genSnap.exists() ? genSnap.data() : null;

        // Default Rich Configuration if not customized yet
        const defaultSlides = [
          {
            id: '1',
            eyebrow: '📱 গ্যাজেট কর্নার',
            title: 'লেটেস্ট গ্যাজেট, হাতের নাগালে',
            subtitle: 'স্মার্টফোন এক্সেসরিজ, ইয়ারবাড, চার্জার ও ট্রেন্ডি সব গ্যাজেট — আসল মান, সেরা দামে।',
            giantWatermark: 'GADGET',
            themeColor: '#2FD4C8',
            skuCode: 'GDGT-01 · ইলেকট্রনিক্স',
            bgImage: 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?auto=format&fit=crop&w=1600&q=80',
            cameoImage: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=400&q=80',
            stat1Num: '৫০০+',
            stat1Lbl: 'প্রোডাক্ট',
            stat2Num: 'ওয়ারেন্টি',
            stat2Lbl: 'সহ পণ্য',
            ctaText: 'কিনুন →',
            ctaLink: '/' + tenantId + '/checkout',
            secondaryCtaText: 'সব দেখুন',
            secondaryCtaLink: '#'
          },
          {
            id: '2',
            eyebrow: '👗 ফ্যাশন হাউজ',
            title: 'ফ্যাশন ও পোশাক, আপনার স্টাইলে',
            subtitle: 'ছেলে ও মেয়েদের ট্রেন্ডি পোশাক, জুতা ও এক্সেসরিজ — মানসম্মত ও সাশ্রয়ী দামে।',
            giantWatermark: 'FASHION',
            themeColor: '#F0609B',
            skuCode: 'FASH-02 · ক্লথিং',
            bgImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80',
            cameoImage: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80',
            stat1Num: 'নতুন',
            stat1Lbl: 'কালেকশন',
            stat2Num: 'সব',
            stat2Lbl: 'সাইজ এভেইলেবল',
            ctaText: 'কিনুন →',
            ctaLink: '/' + tenantId + '/checkout',
            secondaryCtaText: 'নতুন কালেকশন',
            secondaryCtaLink: '#'
          },
          {
            id: '3',
            eyebrow: '🛒 ডেইলি নিডস',
            title: 'গ্রোসারি ও দৈনন্দিন প্রয়োজন',
            subtitle: 'চাল, ডাল, তেল থেকে শুরু করে ঘরের নিত্যপ্রয়োজনীয় সব পণ্য এক জায়গায়, কম দামে।',
            giantWatermark: 'GROCERY',
            themeColor: '#7CB518',
            skuCode: 'GROC-03 · নিত্যপণ্য',
            bgImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
            cameoImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
            stat1Num: '১০০০+',
            stat1Lbl: 'পণ্য স্টক',
            stat2Num: 'দ্রুত',
            stat2Lbl: 'ডেলিভারি সুবিধা',
            ctaText: 'কিনুন →',
            ctaLink: '/' + tenantId + '/checkout',
            secondaryCtaText: 'অফার দেখুন',
            secondaryCtaLink: '#'
          }
        ];

        const defaultSections = [
          {
            id: 'sec_cat_showcase',
            type: 'category_grid',
            enabled: true,
            title: 'জনপ্রিয় ক্যাটাগরি সমূহ',
            subtitle: 'পছন্দের ক্যাটাগরি নির্বাচন করে সহজে কেনাকাটা করুন',
            style: 'circle'
          },
          {
            id: 'sec_prod_hot',
            type: 'product_grid',
            enabled: true,
            title: '🔥 স্পেশাল অফার ও হট ডিলস',
            subtitle: 'গ্রাহকদের পছন্দের বাছাইকৃত সেরা পণ্যসমূহ আকর্ষণীয় মূল্যে',
            category: 'all',
            limit: 8,
            columns: 4,
            sortBy: 'featured',
            viewAllLink: '#'
          },
          {
            id: 'sec_promo_banners',
            type: 'banner_grid',
            enabled: true,
            title: 'এক্সক্লুসিভ অফার ও ক্যাম্পেইন',
            subtitle: 'সেরা ব্র্যান্ড ও প্রোডাক্টে সীমিত সময়ের বিশেষ ছাড়',
            columnsCount: 2,
            banners: [
              {
                id: 'b1',
                title: 'নতুন সিজন ফ্যাশন সেল',
                discount: '৪০% পর্যন্ত মূল্যছাড়',
                imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
                btnText: 'অর্ডার করুন',
                linkUrl: '#'
              },
              {
                id: 'b2',
                title: 'স্মার্ট লাইফস্টাইল গ্যাজেট',
                discount: 'সেরা দামে সেরা গ্যাজেট',
                imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
                btnText: 'কালেকশন দেখুন',
                linkUrl: '#'
              }
            ]
          },
          {
            id: 'sec_prod_gadgets',
            type: 'product_grid',
            enabled: true,
            title: '📱 গ্যাজেট ও ইলেকট্রনিক্স কর্নার',
            subtitle: 'স্মার্টফোন এক্সেসরিজ, ইয়ারবাড, চার্জার ও ট্রেন্ডি সব গ্যাজেট',
            category: 'ইলেকট্রনিক্স',
            limit: 8,
            columns: 4,
            sortBy: 'newest',
            viewAllLink: '#'
          },
          {
            id: 'sec_flash_cta',
            type: 'cta_banner',
            enabled: true,
            badge: '৫০% পর্যন্ত ছাড়',
            title: 'স্পেশাল ফ্ল্যাশ ডিল ২০২৬',
            subtitle: 'সীমিত সময়ের এই অফার উপভোগ করতে এখনই অর্ডার প্লেস করুন! ১০০% অরিজিনাল পণ্য ও ক্যাশ অন ডেলিভারি।',
            btnText: 'অর্ডার কনফার্ম করুন',
            btnLink: '/' + tenantId + '/checkout',
            gradient: 'from-amber-600 via-rose-600 to-indigo-900'
          },
          {
            id: 'sec_prod_fashion',
            type: 'product_grid',
            enabled: true,
            title: '👗 ট্রেন্ডি ফ্যাশন ও পোশাক কালেকশন',
            subtitle: 'ছেলে ও মেয়েদের মানসম্মত পোশাক ও জুতা সাশ্রয়ী দামে',
            category: 'ফ্যাশন',
            limit: 8,
            columns: 4,
            sortBy: 'newest',
            viewAllLink: '#'
          },
          {
            id: 'sec_services_grid',
            type: 'service_grid',
            enabled: true,
            title: 'আমাদের প্রফেশনাল সার্ভিস',
            subtitle: 'নির্ভরযোগ্য ও দ্রুত গতির আইটি, সফটওয়্যার ও কাস্টমার সার্ভিস',
            services: [
              {
                id: 's1',
                icon: '🌐',
                title: 'ওয়েবসাইট ও ই-কমার্স সল্যুশন',
                desc: 'আপনার ব্যবসার জন্য আধুনিক ও দ্রুতগতির অনলাইন শপ বা কাস্টম ওয়েবসাইট ডিজাইন।',
                btnText: 'বিস্তারিত জানুন',
                linkUrl: '#'
              },
              {
                id: 's2',
                icon: '🛒',
                title: 'দোকান POS ও ইনভেন্টরি',
                desc: 'যেকোনো দোকানের সেলস, স্টক ও ক্যাশ কালেকশন ম্যানেজ করার জন্য আধুনিক POS সফটওয়্যার।',
                btnText: 'বিস্তারিত জানুন',
                linkUrl: '#'
              },
              {
                id: 's3',
                icon: '🏫',
                title: 'স্কুল ও প্রতিষ্ঠান সফটওয়্যার',
                desc: 'রেজাল্ট প্রসেসিং, স্টুডেন্ট ডাটাবেস ও অনলাইন ফি কালেকশন সহ পূর্ণাঙ্গ সমাধান।',
                btnText: 'বিস্তারিত জানুন',
                linkUrl: '#'
              }
            ]
          },
          {
            id: 'sec_trust_strip',
            type: 'trust_strip',
            enabled: true,
            title: 'কেন আমাদের থেকে কেনাকাটা করবেন?'
          }
        ];

        const mergedConfig = {
          header: {
            topBarEnabled: layoutData?.header?.topBarEnabled ?? true,
            topBarText: layoutData?.header?.topBarText || '🎉 সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা! হটলাইন: ০১৭১১-০০০০০০',
            topBarPhone: layoutData?.header?.topBarPhone || genData?.phone || '০১৭১১-০০০০০০',
            topBarEmail: layoutData?.header?.topBarEmail || genData?.email || 'support@yourstore.com',
            storeName: layoutData?.header?.storeName || genData?.businessName || tenantId.toUpperCase(),
            tagline: layoutData?.header?.tagline || genData?.tagline || 'অফিসিয়াল অনলাইন শপ',
            logoUrl: layoutData?.header?.logoUrl || genData?.logoUrl || '',
            menuItems: layoutData?.header?.menuItems || [
              { id: '1', label: 'হোম', url: '/' + tenantId },
              { id: '2', label: 'সকল প্রোডাক্ট', url: '#' },
              { id: '3', label: 'হট ডিলস', url: '#' },
              { id: '4', label: 'যোগাযোগ', url: '#' }
            ]
          },
          heroSlider: {
            enabled: layoutData?.heroSlider?.enabled ?? true,
            autoplaySpeed: layoutData?.heroSlider?.autoplaySpeed || 6000,
            showLiveBadge: layoutData?.heroSlider?.showLiveBadge ?? true,
            slides: (layoutData?.heroSlider?.slides && layoutData.heroSlider.slides.length > 0)
              ? layoutData.heroSlider.slides
              : defaultSlides
          },
          sections: (layoutData?.sections && layoutData.sections.length > 0)
            ? layoutData.sections
            : defaultSections,
          footer: {
            col1About: layoutData?.footer?.col1About || 'আমরা দিচ্ছি সেরা মানের পণ্য, দ্রুততম হোম ডেলিভারি এবং সহজ রিটার্ন পলিসি। গ্রাহকের সন্তুষ্টিই আমাদের প্রথম অগ্রাধিকার।',
            hotline: layoutData?.footer?.hotline || genData?.phone || '০১৭১১-০০০০০০',
            email: layoutData?.footer?.email || genData?.email || 'support@yourstore.com',
            address: layoutData?.footer?.address || genData?.officeAddress || 'ঢাকা, বাংলাদেশ',
            dbid: genData?.compliance?.dbidNumber || 'DBID-198273645',
            bin: genData?.compliance?.binNumber || 'BIN: 002938475-0101',
            tradeLicense: genData?.compliance?.tradeLicenseNo || 'TRAD/DSCC/019283',
            col2Links: layoutData?.footer?.col2Links || [
              { label: 'হোম পেজ', url: '/' + tenantId },
              { label: 'সকল প্রোডাক্ট', url: '#' },
              { label: 'হট ডিলস', url: '#' },
              { label: 'অর্ডার ট্র্যাক করুন', url: '#' }
            ],
            col3Links: layoutData?.footer?.col3Links || [
              { label: 'ডেলিভারি পলিসি', url: '#' },
              { label: 'রিটার্ন ও রিফান্ড পলিসি', url: '#' },
              { label: 'প্রাইভেসি পলিসি', url: '#' },
              { label: 'শর্তাবলী', url: '#' }
            ]
          }
        };

        setConfig(mergedConfig);
      } catch (err) {
        console.error('Error fetching storefront data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [tenantId]);

  // Autoplay for Cinematic HUD Slider
  useEffect(() => {
    if (!config?.heroSlider?.enabled || !config?.heroSlider?.slides?.length) return;
    const slidesLen = config.heroSlider.slides.length;
    if (slidesLen <= 1) return;

    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slidesLen);
    }, config.heroSlider.autoplaySpeed || 6000);

    return () => clearInterval(interval);
  }, [config?.heroSlider]);

  // Rich Demo Products fallback if store has 0 products
  const displayProducts = useMemo(() => {
    if (products.length > 0) return products;

    return [
      {
        id: 'demo_1',
        title: 'ওয়্যারলেস ব্লুটুথ হেডফোন প্রো - বাসের জন্য পারফেক্ট',
        price: 1850,
        originalPrice: 2200,
        category: 'ইলেকট্রনিক্স',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'demo_2',
        title: 'স্মার্ট ফিটনেস ট্র্যাকার ওয়াচ উইথ হার্ট রেট সেন্সর',
        price: 2450,
        originalPrice: 2800,
        category: 'ইলেকট্রনিক্স',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'demo_3',
        title: 'প্রিমিয়াম লেদার ক্যাজুয়াল শু - ট্রেন্ডি ও আরামদায়ক',
        price: 3200,
        originalPrice: 3800,
        category: 'ফ্যাশন',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'demo_4',
        title: 'ক্লাসিক প্রিমিয়াম মেনস স্লিম ফিট কটন শার্ট',
        price: 1250,
        originalPrice: 1500,
        category: 'ফ্যাশন',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'demo_5',
        title: 'পোর্টেবল ডিজিটাল হ্যাঙ্গিং স্কেল (৫০ কেজি পর্যন্ত)',
        price: 260,
        originalPrice: 290,
        category: 'ইলেকট্রনিক্স',
        image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'demo_6',
        title: 'ফ্রেশ এ৪ সাইজ পেপার (৮০ জিএসএম) - ১ রিম ৫০০ শীট',
        price: 440,
        originalPrice: 480,
        category: 'অফিস স্টেশনারি',
        image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'demo_7',
        title: 'অর্গানিক খাঁটি মধু (সুন্দরবনের প্রাকৃতিক চাকের মধু)',
        price: 650,
        originalPrice: 750,
        category: 'গ্রোসারি',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'demo_8',
        title: 'এক্সক্লুসিভ উইমেনস হ্যান্ডব্যাগ - প্রিমিয়াম ফিনিশিং',
        price: 1950,
        originalPrice: 2400,
        category: 'ফ্যাশন',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'
      }
    ];
  }, [products]);

  // Demo Categories fallback
  const displayCategories = useMemo(() => {
    if (categories.length > 0) return categories;

    return [
      { id: 'c1', name: 'ইলেকট্রনিক্স', icon: '📱', image: 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?auto=format&fit=crop&w=400&q=80' },
      { id: 'c2', name: 'ফ্যাশন', icon: '👗', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80' },
      { id: 'c3', name: 'গ্রোসারি', icon: '🛒', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80' },
      { id: 'c4', name: 'কম্পিউটার', icon: '💻', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80' },
      { id: 'c5', name: 'অফিস স্টেশনারি', icon: '📝', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80' }
    ];
  }, [categories]);

  // Handle Add to Cart
  const handleAddToCart = (product: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart({
      productId: product.id,
      title: product.title || product.name,
      price: Number(product.price) || 0,
      image: product.image || product.images?.[0] || '',
      quantity: 1
    });
    setCartDrawerOpen(true);
  };

  const handleBuyNow = (product: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart({
      productId: product.id,
      title: product.title || product.name,
      price: Number(product.price) || 0,
      image: product.image || product.images?.[0] || '',
      quantity: 1
    });
    router.push('/' + tenantId + '/checkout');
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold tracking-wide">স্টোর লোড হচ্ছে...</p>
      </div>
    );
  }

  const currentSlide = config.heroSlider?.slides?.[activeSlide] || config.heroSlider?.slides?.[0];

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      
      {/* =========================================================================
          1. HEADER & TOP ANNOUNCEMENT BAR
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-2xs">
        
        {/* Top Announcement Bar */}
        {config.header.topBarEnabled && (
          <div className="bg-[#1a1a2e] text-slate-300 py-2 px-4 text-xs font-medium">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <a href={'tel:' + config.header.topBarPhone} className="flex items-center gap-1.5 hover:text-white transition">
                  <Phone className="w-3.5 h-3.5 text-red-500" />
                  <span>{config.header.topBarPhone}</span>
                </a>
                <span className="hidden sm:inline text-slate-600">|</span>
                <span className="hidden sm:flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  <span>শনি-বৃহস্পতি: সকাল ৯টা - রাত ৯টা</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden md:inline text-slate-400">{config.header.topBarText}</span>
                <a 
                  href={'/' + tenantId + '#contact'} 
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[11px] transition inline-flex items-center gap-1"
                >
                  <span>📋 সার্ভিস বুক</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo & Brand Info */}
          <Link href={'/' + tenantId} className="flex items-center gap-3 shrink-0">
            {config.header.logoUrl ? (
              <img 
                src={config.header.logoUrl} 
                alt={config.header.storeName} 
                className="h-10 sm:h-12 w-auto object-contain" 
              />
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-red-500/20">
                {tenantId.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <span className="text-xl sm:text-2xl font-black text-red-600 tracking-tight block leading-none">
                {config.header.storeName || tenantId.toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block mt-1">
                {config.header.tagline || 'দিনাজপুর শপ'}
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4 relative">
            <input
              type="text"
              placeholder="সার্চ গ্রোসারি, স্টেশনারি, ফ্যাশন, গ্যাজেট..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-5 pr-12 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-full text-xs font-medium focus:bg-white focus:border-red-600 outline-none transition"
            />
            <button className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition cursor-pointer">
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Header Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* Cart Trigger Button */}
            <button 
              onClick={() => setCartDrawerOpen(true)}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl text-slate-800 hover:bg-red-50 hover:text-red-600 transition cursor-pointer relative"
              title="কার্ট দেখুন"
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-slate-800" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <span className="text-[10px] text-slate-400 block uppercase font-bold leading-none">কার্ট</span>
                <span className="font-bold text-red-600">৳{getSubtotal().toLocaleString()}</span>
              </div>
            </button>

            {/* Checkout Quick Button */}
            <Link
              href={'/' + tenantId + '/checkout'}
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              <span>চেকআউট</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

          </div>

        </div>

        {/* Mobile Search Row */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="পণ্য সার্চ করুন..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. CINEMATIC HUD HERO SLIDER (DINAJPUR SHOP INSPIRED)
          ========================================================================= */}
      {config.heroSlider.enabled && config.heroSlider.slides.length > 0 && (
        <section 
          className="relative w-full h-[350px] sm:h-[400px] md:h-[450px] bg-[#05070A] overflow-hidden select-none"
          style={{ ['--theme-col' as any]: currentSlide.themeColor || '#2FD4C8' } as React.CSSProperties}
        >
          {/* Top HUD Bar */}
          {config.heroSlider.showLiveBadge && (
            <div className="absolute top-0 left-0 right-0 h-8 z-25 flex items-center gap-4 px-5 bg-black/40 border-b border-white/10 text-xs font-mono">
              <div className="flex items-center gap-2 font-bold text-white/80">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span>সরাসরি</span>
              </div>
              <div className="text-white/40 hidden sm:inline uppercase">
                {config.header.storeName || tenantId.toUpperCase()}
              </div>
              <div className="text-white/40 hidden sm:inline">·</div>
              <div className="text-white/60 font-mono text-[11px]">
                {currentSlide.skuCode || 'ONLINE SHOP'}
              </div>
              <div className="ml-auto text-white/70 font-mono tracking-widest text-[11px]">
                {clockTime}
              </div>
            </div>
          )}

          {/* Animated Progress Track */}
          <div className="absolute top-8 left-0 right-0 h-[2px] bg-white/10 z-25 overflow-hidden">
            <div 
              key={activeSlide} 
              className="h-full bg-[var(--theme-col)] shadow-[0_0_8px_var(--theme-col)] animate-[progress_6s_linear]"
            ></div>
          </div>

          {/* Slides Render */}
          {config.heroSlider.slides.map((slide: any, idx: number) => {
            const isActive = idx === activeSlide;
            return (
              <div 
                key={slide.id || idx}
                className={'absolute inset-0 transition-opacity duration-700 ' + (
                  isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 pointer-events-none'
                )}
              >
                {/* Background Image with Ken Burns zoom */}
                <div className="absolute inset-0 overflow-hidden">
                  <div 
                    className={'w-full h-full bg-cover bg-center ' + (isActive ? 'animate-[kenburns_10s_ease-out_forwards]' : '')}
                    style={{ backgroundImage: 'url(' + (slide.bgImage || '') + ')' }}
                  ></div>
                </div>

                {/* Dark Gradient Overlay & Scrim */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#050609]/95 via-[#050609]/75 to-[#050609]/40 z-2"></div>

                {/* Giant Backdrop Watermark Word */}
                {slide.giantWatermark && (
                  <div className="absolute right-4 bottom-[-10px] font-black italic tracking-widest text-transparent pointer-events-none select-none text-[80px] sm:text-[140px] md:text-[200px] leading-none z-3 font-mono opacity-25 [-webkit-text-stroke:1.5px_rgba(255,255,255,0.4)]">
                    {slide.giantWatermark}
                  </div>
                )}

                {/* Floating Cameo Circular Photo */}
                {slide.cameoImage && (
                  <div className="hidden md:block absolute right-[8%] top-[50px] w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-3 border-white/20 shadow-2xl z-10">
                    <img src={slide.cameoImage} alt={slide.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Floating Stat Chips */}
                {(slide.stat1Num || slide.stat2Num) && (
                  <div className="hidden lg:flex absolute right-6 bottom-12 z-20 flex-col gap-2">
                    {slide.stat1Num && (
                      <div className="bg-black/60 backdrop-blur-md border border-white/15 border-l-3 border-l-[var(--theme-col)] px-3.5 py-2 rounded">
                        <div className="text-lg font-black text-white leading-none">{slide.stat1Num}</div>
                        <div className="text-[10px] text-white/70 mt-0.5">{slide.stat1Lbl}</div>
                      </div>
                    )}
                    {slide.stat2Num && (
                      <div className="bg-black/60 backdrop-blur-md border border-white/15 border-l-3 border-l-[var(--theme-col)] px-3.5 py-2 rounded">
                        <div className="text-lg font-black text-white leading-none">{slide.stat2Num}</div>
                        <div className="text-[10px] text-white/70 mt-0.5">{slide.stat2Lbl}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Hanging Price Tag Content Box (Left) */}
                <div className="absolute inset-0 z-15 flex items-center pt-7 sm:pt-9 max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-[#F4EEE1] text-[#201B12] p-4 sm:p-6 md:p-7 rounded-xl sm:rounded-2xl shadow-2xl relative border-l-4 border-l-[var(--theme-col)]">
                    
                    {/* Eyebrow */}
                    <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase text-slate-800 mb-1 sm:mb-1.5">
                      <span>{slide.eyebrow || 'স্পেশাল অফার'}</span>
                    </div>

                    {/* Animated Heading */}
                    <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-[#1A1610] tracking-tight leading-tight mb-1.5 sm:mb-2 line-clamp-2">
                      {slide.title}
                    </h1>

                    {/* Description */}
                    <p className="text-[11px] sm:text-xs md:text-sm text-[#4a4335] leading-snug mb-3 sm:mb-4 max-w-md line-clamp-2">
                      {slide.subtitle}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2.5 sm:mb-3.5">
                      <Link
                        href={slide.ctaLink || ('/' + tenantId + '/checkout')}
                        className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[var(--theme-col)] hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm rounded shadow-lg transition"
                      >
                        {slide.ctaText || 'কিনুন →'}
                      </Link>

                      {slide.secondaryCtaText && (
                        <Link
                          href={slide.secondaryCtaLink || '#products'}
                          className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-transparent hover:bg-black/5 text-[#1A1610] border border-[#cabf9d] font-bold text-xs sm:text-sm rounded transition"
                        >
                          {slide.secondaryCtaText}
                        </Link>
                      )}
                    </div>

                    {/* Barcode & SKU Row */}
                    <div className="pt-2 sm:pt-2.5 border-t border-dashed border-[#cabf9d] flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-[#6b6250]">
                      <div className="font-mono tracking-[0.2em] font-black select-none text-slate-900">
                        |||| | || |||| | |||
                      </div>
                      <span>{slide.skuCode || 'PREMIUM PRODUCT'}</span>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}

          {/* Right Rail Navigation Tags */}
          <div className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 z-20 flex-col gap-2">
            {config.heroSlider.slides.map((s: any, dotIdx: number) => (
              <button
                key={dotIdx}
                onClick={() => setActiveSlide(dotIdx)}
                className={'px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ' + (
                  activeSlide === dotIdx 
                    ? 'bg-white text-slate-900 shadow-md translate-x-[-4px]' 
                    : 'bg-black/50 text-white/70 hover:bg-black/80'
                )}
              >
                <span className={'w-2 h-2 rounded-full ' + (activeSlide === dotIdx ? 'bg-red-600' : 'bg-white/40')}></span>
                <span>{s.eyebrow ? s.eyebrow.slice(0, 16) : ('Slide ' + (dotIdx + 1))}</span>
              </button>
            ))}
          </div>

          {/* Bottom Controls: Arrows & Counter */}
          <div className="absolute bottom-2.5 sm:bottom-3 left-4 sm:left-6 z-25 flex items-center gap-2.5">
            <button
              onClick={() => setActiveSlide(prev => (prev - 1 + config.heroSlider.slides.length) % config.heroSlider.slides.length)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveSlide(prev => (prev + 1) % config.heroSlider.slides.length)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-white/60 font-mono text-xs tracking-widest ml-2">
              {String(activeSlide + 1).padStart(2, '0')} / {String(config.heroSlider.slides.length).padStart(2, '0')}
            </span>
          </div>

        </section>
      )}

      {/* =========================================================================
          3. DYNAMIC SECTIONS SYSTEM (ELEMENTOR-STYLE HOMEPAGE BUILDER)
          ========================================================================= */}
      <main className="flex-1 w-full space-y-12 py-8">
        {config.sections.map((section: any, secIdx: number) => {
          if (!section.enabled) return null;

          // SECTION TYPE 1: CATEGORY SHOWCASE
          if (section.type === 'category_grid') {
            return (
              <section key={section.id || secIdx} className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {section.title || 'জনপ্রিয় ক্যাটাগরি সমূহ'}
                  </h2>
                  {section.subtitle && (
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">{section.subtitle}</p>
                  )}
                  <div className="w-12 h-1 bg-red-600 mx-auto mt-2.5 rounded-full"></div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {displayCategories.map((cat: any) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className="group bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-red-500 hover:shadow-lg transition text-center cursor-pointer flex flex-col items-center justify-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition duration-300">
                        {cat.icon || '🛍️'}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition">
                        {cat.name}
                      </h3>
                    </button>
                  ))}
                </div>
              </section>
            );
          }

          // SECTION TYPE 2: CATEGORY-WISE PRODUCT GRID
          if (section.type === 'product_grid') {
            const catFilter = section.category || 'all';
            let prods = displayProducts;

            if (catFilter !== 'all') {
              prods = prods.filter(p => p.category?.toLowerCase() === catFilter.toLowerCase());
            }

            if (searchQuery.trim()) {
              prods = prods.filter(p => (p.title || p.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
            }

            // Limit
            const limit = Number(section.limit) || 8;
            prods = prods.slice(0, limit);

            // Columns CSS
            const colCount = section.columns || 4;
            const gridColsClass = colCount === 5 
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' 
              : colCount === 3 
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' 
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';

            return (
              <section key={section.id || secIdx} className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200/80 pb-4 mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span>{section.title || 'প্রোডাক্ট কালেকশন'}</span>
                    </h2>
                    {section.subtitle && (
                      <p className="text-xs text-slate-500 mt-1">{section.subtitle}</p>
                    )}
                  </div>

                  <Link
                    href={'/' + tenantId + '#products'}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 self-start sm:self-auto hover:underline"
                  >
                    <span>সব দেখুন →</span>
                  </Link>
                </div>

                {prods.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 text-slate-400 text-sm">
                    এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য পাওয়া যায়নি।
                  </div>
                ) : (
                  <div className={'grid gap-4 ' + gridColsClass}>
                    {prods.map((prod: any) => {
                      const title = prod.title || prod.name || 'পণ্য';
                      const price = Number(prod.price || prod.salePrice || prod.regularPrice) || 0;
                      const origPrice = Number(prod.originalPrice || prod.regularPrice) || 0;
                      const hasDiscount = origPrice > price;
                      const img = prod.image || prod.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';
                      const productUrl = '/' + tenantId + '/product/' + prod.id;

                      return (
                        <div 
                          key={prod.id}
                          onClick={() => router.push(productUrl)}
                          className="group bg-white rounded-2xl border border-slate-200/80 hover:border-red-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
                        >
                          {/* Image Box (Clickable Link) */}
                          <Link 
                            href={productUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="relative aspect-square overflow-hidden bg-slate-100 block group-hover:opacity-95 transition"
                          >
                            <img 
                              src={img} 
                              alt={title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                            {hasDiscount && (
                              <span className="absolute top-2.5 left-2.5 bg-red-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded shadow">
                                Sale!
                              </span>
                            )}
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-white/90 text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs">
                                বিস্তারিত দেখুন
                              </span>
                            </div>
                          </Link>

                          {/* Info Box */}
                          <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                            <div>
                              <Link 
                                href={productUrl}
                                onClick={(e) => e.stopPropagation()}
                                className="block"
                              >
                                <h3 className="font-bold text-xs sm:text-sm text-slate-900 hover:text-red-600 transition leading-snug line-clamp-2 h-9">
                                  {title}
                                </h3>
                              </Link>
                              
                              <div className="flex items-baseline gap-2 mt-2">
                                <span className="font-black text-sm sm:text-base text-red-600 font-mono">
                                  ৳{price.toLocaleString()}
                                </span>
                                {hasDiscount && (
                                  <span className="text-[11px] text-slate-400 line-through font-mono">
                                    ৳{origPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => handleAddToCart(prod, e)}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>কার্টে যোগ</span>
                              </button>

                              <button
                                onClick={(e) => handleBuyNow(prod, e)}
                                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                                title="সরাসরি অর্ডার"
                              >
                                কিনুন
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          }

          // SECTION TYPE 3: MULTI-COLUMN BANNERS
          if (section.type === 'banner_grid') {
            const cols = Number(section.columnsCount) || 2;
            const bannerColClass = cols === 1 ? 'grid-cols-1' : cols === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';

            return (
              <section key={section.id || secIdx} className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className={'grid gap-5 ' + bannerColClass}>
                  {section.banners?.map((b: any, bIdx: number) => (
                    <div 
                      key={b.id || bIdx}
                      className="relative rounded-3xl overflow-hidden min-h-[220px] sm:min-h-[260px] p-6 sm:p-8 flex flex-col justify-end text-white shadow-lg group"
                    >
                      <div 
                        className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                        style={{ backgroundImage: 'url(' + (b.imageUrl || '') + ')' }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent"></div>

                      <div className="relative z-10 space-y-2">
                        {b.discount && (
                          <span className="inline-block bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-lg">
                            {b.discount}
                          </span>
                        )}
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight">{b.title}</h3>
                        <Link 
                          href={b.linkUrl || ('/' + tenantId + '#products')}
                          className="inline-flex items-center gap-1.5 font-bold text-xs text-white hover:text-red-400 transition underline underline-offset-4"
                        >
                          <span>{b.btnText || 'অর্ডার করুন'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // SECTION TYPE 4: FLASH SALE CTA BANNER
          if (section.type === 'cta_banner') {
            return (
              <section key={section.id || secIdx} className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className={'relative rounded-3xl overflow-hidden p-8 sm:p-12 text-white shadow-xl bg-gradient-to-r ' + (section.gradient || 'from-rose-600 via-red-600 to-indigo-950')}>
                  <div className="relative z-10 max-w-2xl space-y-3">
                    {section.badge && (
                      <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider">
                        {section.badge}
                      </span>
                    )}
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                      {section.title || 'স্পেশাল ফ্ল্যাশ ডিল ২০২৬'}
                    </h2>
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-lg">
                      {section.subtitle}
                    </p>
                    <div className="pt-2">
                      <Link
                        href={section.btnLink || ('/' + tenantId + '/checkout')}
                        className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-black text-sm rounded-xl shadow-lg transition inline-flex items-center gap-2"
                      >
                        <span>{section.btnText || 'অর্ডার করুন'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          // SECTION TYPE 5: SERVICES & FEATURES GRID (DINAJPUR SHOP STYLE)
          if (section.type === 'service_grid') {
            return (
              <section key={section.id || secIdx} className="bg-white py-12 border-y border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {section.title || 'আমাদের প্রফেশনাল সার্ভিস'}
                    </h2>
                    {section.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">{section.subtitle}</p>
                    )}
                    <div className="w-16 h-1 bg-gradient-to-r from-red-600 to-emerald-600 mx-auto mt-3 rounded-full"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {section.services?.map((srv: any, sIdx: number) => (
                      <div 
                        key={srv.id || sIdx}
                        className="group bg-white p-8 rounded-2xl border border-slate-200 border-b-4 border-b-slate-300 hover:border-b-red-600 shadow-sm hover:shadow-xl transition-all duration-300 text-center flex flex-col justify-between"
                      >
                        <div className="w-20 h-20 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-4xl mx-auto mb-6 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition duration-300">
                          {srv.icon || '🛠️'}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{srv.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed mb-6 flex-1">{srv.desc}</p>
                        <Link 
                          href={srv.linkUrl || '#'}
                          className="inline-block px-6 py-2 border-2 border-red-600 text-red-600 group-hover:bg-red-600 group-hover:text-white font-bold text-xs rounded-full transition self-center"
                        >
                          {srv.btnText || 'বিস্তারিত জানুন'}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          // SECTION TYPE 6: TRUST STRIP
          if (section.type === 'trust_strip') {
            return (
              <section key={section.id || secIdx} className="bg-slate-100 py-6 border-y border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="flex items-center justify-center gap-3 p-3">
                      <Truck className="w-6 h-6 text-red-600 shrink-0" />
                      <div className="text-left">
                        <div className="font-bold text-xs text-slate-900">দ্রুততম ডেলিভারি</div>
                        <div className="text-[10px] text-slate-500">সারা দেশে ক্যাশ অন ডেলিভারি</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3 p-3">
                      <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                      <div className="text-left">
                        <div className="font-bold text-xs text-slate-900">১০০% আসল পণ্য</div>
                        <div className="text-[10px] text-slate-500">কোয়ালিটি ও মান নিশ্চিত</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3 p-3">
                      <RotateCcw className="w-6 h-6 text-blue-600 shrink-0" />
                      <div className="text-left">
                        <div className="font-bold text-xs text-slate-900">সহজ রিটার্ন পলিসি</div>
                        <div className="text-[10px] text-slate-500">৭২ ঘণ্টার মধ্যে রিপ্লেসমেন্ট</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3 p-3">
                      <Headphones className="w-6 h-6 text-amber-600 shrink-0" />
                      <div className="text-left">
                        <div className="font-bold text-xs text-slate-900">২৪/৭ সাপোর্ট</div>
                        <div className="text-[10px] text-slate-500">সার্বক্ষণিক হেল্পলাইন সেবা</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          return null;
        })}
      </main>

      {/* =========================================================================
          4. 4-COLUMN RICH FOOTER
          ========================================================================= */}
      <footer className="bg-[#12131c] text-slate-300 pt-14 pb-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand story & Government compliance */}
          <div className="space-y-3">
            <h4 className="text-white font-black text-base uppercase tracking-wider">
              {config.header.storeName}
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              {config.footer.col1About}
            </p>
            <div className="space-y-1 text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800">
              <div>DBID: {config.footer.dbid}</div>
              <div>BIN: {config.footer.bin}</div>
              <div>Trade License: {config.footer.tradeLicense}</div>
            </div>
          </div>

          {/* Col 2: Useful links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">প্রয়োজনীয় লিংক</h4>
            <ul className="space-y-2">
              {config.footer.col2Links?.map((lnk: any, idx: number) => (
                <li key={idx}>
                  <Link href={lnk.url || '#'} className="hover:text-red-400 transition">
                    {lnk.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">কাস্টমার কেয়ার ও পলিসি</h4>
            <ul className="space-y-2">
              {config.footer.col3Links?.map((lnk: any, idx: number) => (
                <li key={idx}>
                  <Link href={lnk.url || '#'} className="hover:text-red-400 transition">
                    {lnk.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Hotline */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">যোগাযোগ ও সাপোর্ট</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-white font-bold">{config.footer.hotline}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <span>{config.footer.email}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{config.footer.address}</span>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 border-t border-slate-800/80 text-center text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} {config.header.storeName}. সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>

      {/* =========================================================================
          5. SLIDE-OVER CART DRAWER
          ========================================================================= */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShoppingCart className="w-5 h-5 text-red-600" />
                <span>আপনার শপিং কার্ট ({cartItems.length})</span>
              </div>
              <button 
                onClick={() => setCartDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="py-20 text-center text-slate-400 space-y-2">
                  <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="font-bold text-sm">আপনার কার্ট খালি রয়েছে</p>
                  <p className="text-xs">পণ্য কার্টে যোগ করতে শপিং শুরু করুন</p>
                </div>
              ) : (
                cartItems.map((item: any) => (
                  <div key={item.productId} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover bg-white shrink-0" />
                    <div className="flex-1 text-xs space-y-1">
                      <h4 className="font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                      <div className="font-black text-red-600 font-mono">৳{item.price}</div>
                      
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center border border-slate-300 rounded bg-white">
                          <button 
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold font-mono">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>

                        <button 
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-500 hover:underline text-[11px]"
                        >
                          মুছে ফেলুন
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer & Checkout */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-slate-200 space-y-3 bg-slate-50">
                <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>সর্বমোট মূল্য:</span>
                  <span className="text-lg font-black text-red-600 font-mono">৳{getSubtotal().toLocaleString()}</span>
                </div>
                <Link
                  href={'/' + tenantId + '/checkout'}
                  onClick={() => setCartDrawerOpen(false)}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl text-center block shadow-lg shadow-red-500/25 transition"
                >
                  চেকআউট করুন →
                </Link>
              </div>
            )}

          </div>
        </div>
      )}

      {/* =========================================================================
          6. MOBILE DRAWER MENU
          ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-72 bg-white h-full p-5 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="font-black text-lg text-red-600">{config.header.storeName}</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-1 text-sm font-bold text-slate-800">
                <Link 
                  href={'/' + tenantId} 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block py-2.5 px-3 rounded-lg hover:bg-red-50 hover:text-red-600"
                >
                  হোম
                </Link>
                {displayCategories.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => { setSelectedCategory(c.name); setMobileMenuOpen(false); }} 
                    className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-red-50 hover:text-red-600 flex items-center justify-between"
                  >
                    <span>{c.name}</span>
                    <span className="text-xs text-slate-400">{c.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-2">
              <div>হটলাইন: {config.header.topBarPhone}</div>
              <Link 
                href={'/' + tenantId + '/checkout'} 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-center block"
              >
                চেকআউট পেজ
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
