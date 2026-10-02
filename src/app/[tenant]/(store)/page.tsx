'use client';
// @ts-nocheck

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useCartStore } from '@/store/cartStore';
import { 
  Store, 
  ShoppingBag, 
  Phone, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Search, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Sparkles, 
  Flame, 
  Layers, 
  Check, 
  ExternalLink,
  Award,
  Globe,
  Tag
} from 'lucide-react';
import Link from 'next/link';

export default function TenantStorefrontPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = (params?.tenant as string) || '';

  // Language State: 'bn' | 'en'
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  // Cart State from Zustand
  const { items: cartItems, addItem, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartToast, setCartToast] = useState<string | null>(null);

  // Store Meta & Layout State
  const [generalSettings, setGeneralSettings] = useState<any>(null);
  const [customizerConfig, setCustomizerConfig] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Slider State
  const [activeSlide, setActiveSlide] = useState(0);

  // Flash Sale Countdown State
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 36, seconds: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Store Data
  useEffect(() => {
    if (!tenantId) return;

    const fetchAllData = async () => {
      try {
        // 1. General settings
        const genSnap = await getDoc(doc(db, `tenants/${tenantId}/settings/general`));
        if (genSnap.exists()) {
          const gData = genSnap.data();
          setGeneralSettings(gData);
          if (gData.defaultLanguage) setLang(gData.defaultLanguage);
        }

        // 2. Homepage customizer layout
        const layoutSnap = await getDoc(doc(db, `tenants/${tenantId}/settings/homepage_layout`));
        if (layoutSnap.exists() && layoutSnap.data().storefrontConfig) {
          setCustomizerConfig(layoutSnap.data().storefrontConfig);
        }

        // 3. Categories
        const catSnap = await getDocs(collection(db, `tenants/${tenantId}/categories`));
        const cList = catSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCategories(cList);

        // 4. Products
        const prodSnap = await getDocs(collection(db, `tenants/${tenantId}/products`));
        const pList = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProducts(pList);
      } catch (err) {
        console.error('Error fetching storefront data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [tenantId]);

  // Merge Config with Defaults
  const config = useMemo(() => {
    const defaultSlides = [
      {
        id: '1',
        badge: lang === 'bn' ? '🔥 মেগা সেল অফার' : '🔥 Mega Sale Offer',
        title: lang === 'bn' ? 'প্রিমিয়াম কোয়ালিটি লাইফস্টাইল ও গ্যাজেট কালেকশন' : 'Premium Lifestyle & Gadget Collections',
        subtitle: lang === 'bn' ? '১০০% অরিজিনাল পণ্য ও দ্রুততম সময়ে হোম ডেলিভারি নিশ্চয়তা।' : '100% genuine products with fast doorstep delivery nationwide.',
        bgImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80',
        ctaText: lang === 'bn' ? 'এখনই কিনুন' : 'Shop Now',
        ctaLink: `/${tenantId}#products`,
        secondaryCtaText: lang === 'bn' ? 'হট ডিলস' : 'Hot Deals',
        secondaryCtaLink: `/${tenantId}#offers`
      },
      {
        id: '2',
        badge: lang === 'bn' ? '✨ ট্রেন্ডিং কালেকশন ২০২৬' : '✨ Trending 2026 Collection',
        title: lang === 'bn' ? 'সেরা মূল্যে আকর্ষণীয় ও ইউনিক প্রডাক্টের সমাহার' : 'Discover Extraordinary Finds at Unbeatable Prices',
        subtitle: lang === 'bn' ? 'ক্যাশ অন ডেলিভারিতে ঝামেলাহীন কেনাকাটা করুন যেকোনো প্রান্তে।' : 'Enjoy safe Cash on Delivery shopping with instant support.',
        bgImage: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1920&q=80',
        ctaText: lang === 'bn' ? 'অর্ডার করুন' : 'Order Now',
        ctaLink: `/${tenantId}#products`,
        secondaryCtaText: lang === 'bn' ? 'অফার দেখুন' : 'View Offers',
        secondaryCtaLink: `/${tenantId}#offers`
      }
    ];

    const fallbackStoreName = generalSettings?.businessName || tenantId.toUpperCase();

    return {
      header: {
        topBarEnabled: customizerConfig?.header?.topBarEnabled ?? true,
        topBarText: customizerConfig?.header?.topBarText || (lang === 'bn' ? '🎉 সারাদেশে দ্রুততম ক্যাশ অন ডেলিভারি সুবিধা!' : '🎉 Fast Cash on Delivery Available Nationwide!'),
        topBarPhone: customizerConfig?.header?.topBarPhone || generalSettings?.phone || '01700-000000',
        topBarEmail: customizerConfig?.header?.topBarEmail || generalSettings?.email || 'support@yourstore.com',
        topBarBg: customizerConfig?.header?.topBarBg || '#0f172a',
        topBarTextCol: customizerConfig?.header?.topBarTextCol || '#f8fafc',
        headerBg: customizerConfig?.header?.headerBg || '#ffffff',
        headerTextCol: customizerConfig?.header?.headerTextCol || '#0f172a',
        sticky: customizerConfig?.header?.sticky ?? true,
        showStoreName: customizerConfig?.header?.showStoreName ?? true,
        showTagline: customizerConfig?.header?.showTagline ?? true,
        storeName: customizerConfig?.header?.storeName || fallbackStoreName,
        tagline: customizerConfig?.header?.tagline || (lang === 'bn' ? 'অফিসিয়াল অনলাইন স্টোর' : 'Official Online Store'),
        logoUrl: customizerConfig?.header?.logoUrl || generalSettings?.logoUrl || '',
        fontFamily: customizerConfig?.header?.fontFamily || 'Hind Siliguri',
        primaryColor: customizerConfig?.header?.primaryColor || '#2563eb',
        accentColor: customizerConfig?.header?.accentColor || '#f59e0b',
        menuItems: customizerConfig?.header?.menuItems || [
          { id: '1', label: lang === 'bn' ? 'হোম' : 'Home', url: `/${tenantId}` },
          { id: '2', label: lang === 'bn' ? 'সকল প্রোডাক্ট' : 'All Products', url: `/${tenantId}#products` },
          { id: '3', label: lang === 'bn' ? 'হট অফার' : 'Hot Offers', url: `/${tenantId}#offers` },
          { id: '4', label: lang === 'bn' ? 'যোগাযোগ' : 'Contact', url: `/${tenantId}#contact` }
        ]
      },
      heroSlider: {
        enabled: customizerConfig?.heroSlider?.enabled ?? true,
        autoplaySpeed: customizerConfig?.heroSlider?.autoplaySpeed || 5000,
        slides: customizerConfig?.heroSlider?.slides?.length > 0 ? customizerConfig.heroSlider.slides : defaultSlides
      },
      categories: {
        enabled: customizerConfig?.categories?.enabled ?? true,
        title: customizerConfig?.categories?.title || (lang === 'bn' ? 'জনপ্রিয় ক্যাটাগরি সমূহ' : 'Explore Top Categories'),
        subtitle: customizerConfig?.categories?.subtitle || (lang === 'bn' ? 'পছন্দের ক্যাটাগরি নির্বাচন করে সহজে কেনাকাটা করুন' : 'Browse our wide range of premium collections'),
        style: customizerConfig?.categories?.style || 'circle'
      },
      products: {
        showTrendingCarousel: customizerConfig?.products?.showTrendingCarousel ?? true,
        trendingTitle: customizerConfig?.products?.trendingTitle || (lang === 'bn' ? 'ট্রেন্ডিং ও সর্বাধিক বিক্রিত পণ্য' : 'Trending & Best Sellers'),
        showFeaturedGrid: customizerConfig?.products?.showFeaturedGrid ?? true,
        featuredTitle: customizerConfig?.products?.featuredTitle || (lang === 'bn' ? 'আমাদের বিশেষ কালেকশন' : 'Featured Products'),
        featuredSubtitle: customizerConfig?.products?.featuredSubtitle || (lang === 'bn' ? 'গ্রাহকদের পছন্দের বাছাইকৃত সেরা পণ্যসমূহ' : 'Curated premium items with verified reviews'),
        gridColumns: customizerConfig?.products?.gridColumns || 4
      },
      banners: {
        showPromoBanners: customizerConfig?.banners?.showPromoBanners ?? true,
        items: customizerConfig?.banners?.items || [
          {
            id: '1',
            title: lang === 'bn' ? 'নতুন সিজন ফ্যাশন সেল' : 'New Season Fashion Sale',
            discount: lang === 'bn' ? '৪০% পর্যন্ত মূল্যছাড়' : 'Up to 40% Off',
            imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
            btnText: lang === 'bn' ? 'অর্ডার করুন' : 'Shop Now',
            linkUrl: `/${tenantId}#products`
          },
          {
            id: '2',
            title: lang === 'bn' ? 'স্মার্ট লাইফস্টাইল গ্যাজেট' : 'Smart Lifestyle Gadgets',
            discount: lang === 'bn' ? 'সেরা দামে সেরা গ্যাজেট' : 'Best Quality Assured',
            imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
            btnText: lang === 'bn' ? 'কালেকশন দেখুন' : 'Explore Now',
            linkUrl: `/${tenantId}#products`
          }
        ],
        showFlashSale: customizerConfig?.banners?.showFlashSale ?? true,
        flashSaleTitle: customizerConfig?.banners?.flashSaleTitle || (lang === 'bn' ? 'স্পেশাল ফ্ল্যাশ ডিল ২০২৬' : 'Exclusive Flash Deal 2026'),
        flashSaleSubtitle: customizerConfig?.banners?.flashSaleSubtitle || (lang === 'bn' ? 'সীমিত সময়ের এই অফার উপভোগ করতে এখনই অর্ডার প্লেস করুন!' : 'Grab your favorite items before timer runs out!'),
        flashSaleDiscount: customizerConfig?.banners?.flashSaleDiscount || (lang === 'bn' ? '৫০% পর্যন্ত ছাড়' : 'Up to 50% Off'),
        flashSaleLink: customizerConfig?.banners?.flashSaleLink || `/${tenantId}/checkout`
      },
      footer: {
        bgColor: customizerConfig?.footer?.bgColor || '#0b1120',
        textColor: customizerConfig?.footer?.textColor || '#94a3b8',
        col1About: customizerConfig?.footer?.col1About || (lang === 'bn' ? 'আমরা দিচ্ছি সেরা মানের পণ্য, দ্রুততম হোম ডেলিভারি এবং সহজ রিটার্ন পলিসি। গ্রাহকের সন্তুষ্টিই আমাদের প্রথম অগ্রাধিকার।' : 'Delivering authentic premium products nationwide with fast delivery and easy returns.'),
        dbid: generalSettings?.compliance?.dbidNumber || customizerConfig?.footer?.dbid || 'DBID-198273645',
        bin: generalSettings?.compliance?.binNumber || customizerConfig?.footer?.bin || 'BIN: 002938475-0101',
        tradeLicense: generalSettings?.compliance?.tradeLicenseNo || customizerConfig?.footer?.tradeLicense || 'TRAD/DSCC/019283',
        facebook: customizerConfig?.footer?.facebook || '',
        whatsapp: customizerConfig?.footer?.whatsapp || '',
        youtube: customizerConfig?.footer?.youtube || '',
        instagram: customizerConfig?.footer?.instagram || '',
        col2Title: customizerConfig?.footer?.col2Title || (lang === 'bn' ? 'প্রয়োজনীয় লিঙ্ক' : 'Quick Links'),
        col2Links: customizerConfig?.footer?.col2Links || [
          { label: lang === 'bn' ? 'হোম পেজ' : 'Home', url: `/${tenantId}` },
          { label: lang === 'bn' ? 'সকল প্রোডাক্ট' : 'All Products', url: `/${tenantId}#products` },
          { label: lang === 'bn' ? 'হট অফার' : 'Hot Offers', url: `/${tenantId}#offers` },
          { label: lang === 'bn' ? 'চেকআউট' : 'Checkout', url: `/${tenantId}/checkout` }
        ],
        col3Title: customizerConfig?.footer?.col3Title || (lang === 'bn' ? 'কাস্টমার কেয়ার ও পলিসি' : 'Customer Care & Policies'),
        col3Links: customizerConfig?.footer?.col3Links || [
          { label: lang === 'bn' ? 'ডেলিভারি পলিসি' : 'Delivery Policy', url: '#' },
          { label: lang === 'bn' ? 'রিটার্ন ও রিফান্ড পলিসি' : 'Return & Refund Policy', url: '#' },
          { label: lang === 'bn' ? 'প্রাইভেসি পলিসি' : 'Privacy Policy', url: '#' },
          { label: lang === 'bn' ? 'শর্তাবলী' : 'Terms & Conditions', url: '#' }
        ],
        col4Title: customizerConfig?.footer?.col4Title || (lang === 'bn' ? 'যোগাযোগ ও হেল্পলাইন' : 'Contact & Helpline'),
        hotline: customizerConfig?.footer?.hotline || generalSettings?.phone || '01700-000000',
        email: customizerConfig?.footer?.email || generalSettings?.email || 'support@yourstore.com',
        address: customizerConfig?.footer?.address || generalSettings?.officeAddress || 'ঢাকা, বাংলাদেশ',
        workingHours: customizerConfig?.footer?.workingHours || (lang === 'bn' ? 'সকাল ১০টা - রাত ১০টা (প্রতিদিন)' : '10:00 AM - 10:00 PM (Daily)'),
        copyrightText: customizerConfig?.footer?.copyrightText || (lang === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'),
        showPaymentBadges: customizerConfig?.footer?.showPaymentBadges ?? true
      }
    };
  }, [customizerConfig, generalSettings, tenantId, lang]);

  // Auto Slider Effect
  useEffect(() => {
    if (!config.heroSlider.enabled || config.heroSlider.slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % config.heroSlider.slides.length);
    }, config.heroSlider.autoplaySpeed);
    return () => clearInterval(interval);
  }, [config.heroSlider]);

  // Display Products Filtered
  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    }
    return list;
  }, [products, selectedCategory, searchQuery]);

  // Fallback Sample Products if Store has 0 products
  const displayProducts = useMemo(() => {
    if (filteredProducts.length > 0) return filteredProducts;
    if (products.length > 0) return filteredProducts;

    // Rich initial demo products
    return [
      {
        id: 'sample-1',
        title: lang === 'bn' ? 'আল্ট্রা স্লিম স্মার্টওয়াচ সিরিজ ৯ (AMOLED HD Display)' : 'Ultra Slim Smartwatch Series 9 (AMOLED HD)',
        category: 'স্মার্ট গ্যাজেটস',
        regularPrice: 3800,
        salePrice: 2850,
        stock: 45,
        images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80'],
        badge: lang === 'bn' ? '২৫% ছাড়' : '25% OFF',
        rating: 5.0
      },
      {
        id: 'sample-2',
        title: lang === 'bn' ? 'নয়েজ ক্যানসেলিং ওয়্যারলেস ব্লুটুথ হেডফোন প্রো' : 'Active Noise Cancelling Wireless Headphones Pro',
        category: 'স্মার্ট গ্যাজেটস',
        regularPrice: 4500,
        salePrice: 3200,
        stock: 30,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'],
        badge: lang === 'bn' ? 'বেস্টসেলার' : 'BESTSELLER',
        rating: 4.9
      },
      {
        id: 'sample-3',
        title: lang === 'bn' ? 'প্রিমিয়াম জেনুইন লেদার ওয়ালেট ও বেল্ট এক্সক্লুসিভ কম্বো' : 'Premium Genuine Leather Wallet & Belt Combo Set',
        category: 'ফ্যাশন & ক্লথিং',
        regularPrice: 2200,
        salePrice: 1550,
        stock: 60,
        images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80'],
        badge: lang === 'bn' ? 'হট ডিল' : 'HOT DEAL',
        rating: 4.8
      },
      {
        id: 'sample-4',
        title: lang === 'bn' ? 'ক্লাসিক ক্রোনোগ্রাফ ওয়াটারপ্রুফ রিস্ট ওয়াচ ফর মেন' : 'Classic Waterproof Chronograph Wrist Watch for Men',
        category: 'লাক্সারি ঘড়ি',
        regularPrice: 5200,
        salePrice: 3950,
        stock: 25,
        images: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80'],
        badge: lang === 'bn' ? 'নিউ' : 'NEW',
        rating: 4.9
      },
      {
        id: 'sample-5',
        title: lang === 'bn' ? 'এয়ার কুশন লাইটওয়েট রানিং স্নিকার্স স্পোর্টস শু' : 'Air Cushion Lightweight Breathable Running Shoes',
        category: 'প্রিমিয়াম জুতা',
        regularPrice: 3200,
        salePrice: 2400,
        stock: 40,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'],
        badge: lang === 'bn' ? 'জনপ্রিয়' : 'POPULAR',
        rating: 4.7
      },
      {
        id: 'sample-6',
        title: lang === 'bn' ? 'মিনি পোর্টেবল ব্লুটুথ স্পিকার (হেভি মেগা বেস)' : 'Mini Portable Wireless Bluetooth Speaker with Bass',
        category: 'স্মার্ট গ্যাজেটস',
        regularPrice: 1800,
        salePrice: 1250,
        stock: 80,
        images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80'],
        badge: lang === 'bn' ? 'অফার' : 'SPECIAL',
        rating: 4.8
      }
    ];
  }, [filteredProducts, products, lang]);

  // Display Categories
  const displayCategories = useMemo(() => {
    if (categories.length > 0) return categories;
    return [
      { id: 'cat-fashion', name: lang === 'bn' ? 'ফ্যাশন & ক্লথিং' : 'Fashion & Apparel', slug: 'fashion', imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=300&q=80' },
      { id: 'cat-gadget', name: lang === 'bn' ? 'স্মার্ট গ্যাজেটস' : 'Smart Gadgets', slug: 'gadgets', imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80' },
      { id: 'cat-watch', name: lang === 'bn' ? 'লাক্সারি ঘড়ি' : 'Luxury Watches', slug: 'watches', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80' },
      { id: 'cat-shoes', name: lang === 'bn' ? 'প্রিমিয়াম জুতা' : 'Shoes & Footwear', slug: 'shoes', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' },
      { id: 'cat-home', name: lang === 'bn' ? 'হোম & লিভিং' : 'Home & Living', slug: 'home', imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=300&q=80' }
    ];
  }, [categories, lang]);

  // Add to Cart
  const handleAddToCart = (product: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addItem({
      productId: product.id,
      title: product.title,
      price: product.salePrice || product.regularPrice,
      quantity: 1,
      image: product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'
    });
    setCartToast(`"${product.title}" কার্টে যুক্ত হয়েছে!`);
    setTimeout(() => setCartToast(null), 3000);
  };

  // Direct Buy / Order Now
  const handleBuyNow = (product: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    handleAddToCart(product);
    router.push(`/${tenantId}/checkout`);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = getSubtotal();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">স্টোর লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white" style={{ fontFamily: config.header.fontFamily }}>
      
      {/* Toast Notification */}
      {cartToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-up text-sm">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{cartToast}</span>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="ml-2 text-xs font-bold text-blue-400 hover:underline"
          >
            কার্ট দেখুন
          </button>
        </div>
      )}

      {/* 1. TOP ANNOUNCEMENT BAR */}
      {config.header.topBarEnabled && (
        <div 
          className="text-xs py-2 px-4 border-b border-white/10 transition-colors z-40"
          style={{ backgroundColor: config.header.topBarBg, color: config.header.topBarTextCol }}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <span className="font-medium tracking-wide flex items-center gap-1.5 justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{config.header.topBarText}</span>
            </span>

            <div className="flex items-center gap-4 text-xs font-semibold">
              {config.header.topBarPhone && (
                <a href={`tel:${config.header.topBarPhone}`} className="hover:opacity-80 transition flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{config.header.topBarPhone}</span>
                </a>
              )}

              {/* Language Switcher */}
              <button
                onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
                className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center gap-1 cursor-pointer font-bold"
                title="Switch Language"
              >
                <Globe className="w-3 h-3" />
                <span>{lang === 'bn' ? 'ENGLISH' : 'বাংলা'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN HEADER */}
      <header 
        className={`w-full border-b border-slate-100 z-40 transition-all ${config.header.sticky ? 'sticky top-0 bg-white/95 backdrop-blur-md shadow-xs' : 'bg-white'}`}
        style={{ backgroundColor: config.header.headerBg, color: config.header.headerTextCol }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Store Identity */}
          <Link href={`/${tenantId}`} className="flex items-center gap-3 shrink-0 group">
            {config.header.logoUrl ? (
              <img 
                src={config.header.logoUrl} 
                alt={config.header.storeName} 
                className="h-11 w-auto max-w-[160px] object-contain"
              />
            ) : (
              <div 
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md font-black text-lg transition group-hover:scale-105"
                style={{ backgroundColor: config.header.primaryColor }}
              >
                <Store className="w-6 h-6" />
              </div>
            )}

            <div>
              {config.header.showStoreName && (
                <span className="text-xl md:text-2xl font-black tracking-tight block text-slate-900 leading-none">
                  {config.header.storeName}
                </span>
              )}
              {config.header.showTagline && (
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                  {config.header.tagline}
                </span>
              )}
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'পণ্য বা ক্যাটাগরি অনুসন্ধান করুন...' : 'Search products or categories...'}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border border-slate-200/80 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Nav Menu Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-slate-700">
            {config.header.menuItems.map((m: any) => (
              <Link 
                key={m.id} 
                href={m.url} 
                className="hover:text-blue-600 transition"
              >
                {m.label}
              </Link>
            ))}
          </nav>

          {/* Cart & Merchant Action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Interactive Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition flex items-center gap-2 cursor-pointer shadow-xs"
              title="শপিং ব্যাগ"
            >
              <ShoppingBag className="w-5 h-5 text-slate-800" />
              <span className="hidden sm:inline text-xs font-bold">
                {lang === 'bn' ? 'কার্ট' : 'Cart'}
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Merchant Login Button */}
            <Link 
              href={`/${tenantId}/ecomsaas`}
              className="text-xs font-bold px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              {lang === 'bn' ? 'মার্চেন্ট লগিন' : 'Merchant'}
            </Link>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'পণ্য সার্চ করুন...' : 'Search products...'}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm outline-none"
            />
          </div>
        </div>
      </header>

      {/* 3. VIDEO-LIKE HERO SLIDER */}
      {config.heroSlider.enabled && config.heroSlider.slides.length > 0 && (
        <section className="relative w-full h-[450px] sm:h-[550px] md:h-[620px] bg-slate-950 overflow-hidden select-none">
          {config.heroSlider.slides.map((slide: any, idx: number) => {
            const isActive = idx === activeSlide;
            return (
              <div
                key={slide.id || idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
              >
                {/* Simulated Video Ken-Burns Motion Slow Zoom Image */}
                <img 
                  src={slide.bgImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80'} 
                  alt={slide.title}
                  className={`w-full h-full object-cover transition-transform duration-[9000ms] ease-out pointer-events-none ${isActive ? 'scale-110 -translate-y-2' : 'scale-100'}`}
                />

                {/* Cinematic Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
                <div className="absolute inset-0 bg-slate-950/30" />

                {/* Ambient Radial Accent */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-30"
                  style={{ backgroundColor: config.header.primaryColor }}
                />

                {/* Content Overlay */}
                <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
                  
                  {/* Floating Animated Badge */}
                  {slide.badge && (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-bold uppercase tracking-wider mb-6 shadow-lg">
                      <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>{slide.badge}</span>
                    </div>
                  )}

                  {/* Headline */}
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-5 leading-tight max-w-4xl drop-shadow-md">
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  {slide.subtitle && (
                    <p className="text-sm sm:text-lg text-slate-200 mb-8 max-w-2xl font-normal drop-shadow">
                      {slide.subtitle}
                    </p>
                  )}

                  {/* Dual CTA Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    {slide.ctaText && (
                      <Link 
                        href={slide.ctaLink || `/${tenantId}#products`}
                        className="px-8 py-3.5 text-white font-bold rounded-2xl shadow-xl transition transform hover:scale-105 flex items-center gap-2 text-sm sm:text-base cursor-pointer"
                        style={{ backgroundColor: config.header.primaryColor }}
                      >
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}

                    {slide.secondaryCtaText && (
                      <Link 
                        href={slide.secondaryCtaLink || `/${tenantId}#products`}
                        className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-md border border-white/20 transition text-sm sm:text-base cursor-pointer"
                      >
                        {slide.secondaryCtaText}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Slider Left / Right Navigation */}
          {config.heroSlider.slides.length > 1 && (
            <>
              <button 
                onClick={() => setActiveSlide(prev => (prev - 1 + config.heroSlider.slides.length) % config.heroSlider.slides.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setActiveSlide(prev => (prev + 1) % config.heroSlider.slides.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Slider Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
                {config.heroSlider.slides.map((_: any, dotIdx: number) => (
                  <button
                    key={dotIdx}
                    onClick={() => setActiveSlide(dotIdx)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${dotIdx === activeSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* 4. VALUE PROPOSITION BADGES */}
      <section className="bg-white border-b border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{lang === 'bn' ? 'সারা দেশে ডেলিভারি' : 'Nationwide Delivery'}</h4>
              <p className="text-[11px] text-slate-500">{lang === 'bn' ? 'দ্রুততম হোম ডেলিভারি' : 'Reliable door-step'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{lang === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</h4>
              <p className="text-[11px] text-slate-500">{lang === 'bn' ? 'পণ্য পেয়ে টাকা দিন' : 'Pay after checking'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{lang === 'bn' ? '৭ দিনের রিপ্লেসমেন্ট' : '7 Days Return'}</h4>
              <p className="text-[11px] text-slate-500">{lang === 'bn' ? 'সহজ রিটার্ন সুবিধা' : 'Hassle-free exchange'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{lang === 'bn' ? '১০০% অরিজিনাল' : '100% Authentic'}</h4>
              <p className="text-[11px] text-slate-500">{lang === 'bn' ? 'কোয়ালিটি নিশ্চয়তা' : 'Verified products'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THUMBNAIL CATEGORIES SECTION */}
      {config.categories.enabled && displayCategories.length > 0 && (
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {config.categories.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {config.categories.subtitle}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-none">
            {/* All Products Pill */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex flex-col items-center gap-2 shrink-0 group cursor-pointer transition transform hover:scale-105 ${selectedCategory === 'all' ? 'opacity-100' : 'opacity-85'}`}
            >
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition border-2 ${
                selectedCategory === 'all' ? 'border-blue-600 bg-blue-600 text-white shadow-blue-500/25' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400'
              }`}>
                <Layers className="w-7 h-7" />
              </div>
              <span className={`text-xs font-bold ${selectedCategory === 'all' ? 'text-blue-600' : 'text-slate-700'}`}>
                {lang === 'bn' ? 'সব পণ্য' : 'All'}
              </span>
            </button>

            {/* Dynamic Category Circles */}
            {displayCategories.map(cat => {
              const isSelected = selectedCategory.toLowerCase() === (cat.name || cat.slug || '').toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name || cat.slug)}
                  className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer transition transform hover:scale-105"
                >
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-md transition border-2 ${
                    isSelected ? 'border-blue-600 ring-4 ring-blue-500/20' : 'border-slate-200 hover:border-blue-400'
                  }`}>
                    <img 
                      src={cat.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80'} 
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                  </div>
                  <span className={`text-xs font-bold max-w-[85px] truncate text-center ${isSelected ? 'text-blue-600' : 'text-slate-700'}`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. PROMOTIONAL 2-COLUMN BANNERS */}
      {config.banners.showPromoBanners && config.banners.items.length > 0 && (
        <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full" id="offers">
          <div className="grid md:grid-cols-2 gap-6">
            {config.banners.items.map((b: any) => (
              <div 
                key={b.id} 
                className="relative h-60 sm:h-72 rounded-3xl overflow-hidden shadow-lg group border border-slate-100 flex items-center p-8 text-white"
              >
                <img 
                  src={b.imageUrl} 
                  alt={b.title} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-transparent" />

                <div className="relative z-10 max-w-xs space-y-3">
                  <span className="px-3 py-1 bg-amber-500 text-slate-950 text-xs font-black rounded-lg uppercase tracking-wider">
                    {b.discount}
                  </span>
                  <h3 className="text-2xl font-black leading-tight text-white">{b.title}</h3>
                  <Link 
                    href={b.linkUrl || `/${tenantId}#products`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-950 rounded-xl text-xs font-bold hover:bg-slate-100 transition shadow"
                  >
                    <span>{b.btnText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. FLASH SALE COUNTDOWN CTA */}
      {config.banners.showFlashSale && (
        <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 text-white bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
            <div className="space-y-3 text-center md:text-left">
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-400/30 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-400" />
                <span>{config.banners.flashSaleDiscount}</span>
              </span>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight">{config.banners.flashSaleTitle}</h3>
              <p className="text-slate-300 text-sm max-w-md">{config.banners.flashSaleSubtitle}</p>
            </div>

            {/* Countdown Boxes */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-950/70 border border-white/10 px-4 py-3 rounded-2xl text-center min-w-[70px]">
                <span className="text-2xl sm:text-3xl font-black block">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'bn' ? 'ঘণ্টা' : 'Hours'}</span>
              </div>
              <span className="text-2xl font-bold">:</span>
              <div className="bg-slate-950/70 border border-white/10 px-4 py-3 rounded-2xl text-center min-w-[70px]">
                <span className="text-2xl sm:text-3xl font-black block">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'bn' ? 'মিনিট' : 'Mins'}</span>
              </div>
              <span className="text-2xl font-bold">:</span>
              <div className="bg-slate-950/70 border border-white/10 px-4 py-3 rounded-2xl text-center min-w-[70px]">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'bn' ? 'সেকেন্ড' : 'Secs'}</span>
              </div>
            </div>

            <Link
              href={config.banners.flashSaleLink || `/${tenantId}/checkout`}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl transition shadow-xl shrink-0"
            >
              {lang === 'bn' ? 'অফারটি লুফে নিন' : 'Claim Offer Now'}
            </Link>
          </div>
        </section>
      )}

      {/* 8. MAIN PRODUCT GRID */}
      {config.products.showFeaturedGrid && (
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full" id="products">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {config.products.featuredTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {config.products.featuredSubtitle}
              </p>
            </div>

            {/* Total Results Count */}
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-auto">
              {lang === 'bn' ? `মোট ${displayProducts.length}টি পণ্য` : `${displayProducts.length} Products Found`}
            </span>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayProducts.map(prod => (
              <div 
                key={prod.id} 
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Image Container with Badge */}
                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                  <img 
                    src={prod.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'} 
                    alt={prod.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {prod.badge && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-sm">
                      {prod.badge}
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1 block">
                    {prod.category || 'Special'}
                  </span>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2 leading-snug mb-2 group-hover:text-blue-600 transition">
                    {prod.title}
                  </h3>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400 text-xs mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                    <span className="text-[11px] font-bold text-slate-500 ml-1">5.0</span>
                  </div>

                  {/* Pricing */}
                  <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between mb-4">
                    <div>
                      <span className="text-lg sm:text-xl font-black text-slate-900 block leading-tight">
                        ৳{prod.salePrice || prod.regularPrice}
                      </span>
                      {prod.salePrice && prod.salePrice < prod.regularPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          ৳{prod.regularPrice}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                      ইন স্টক
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => handleAddToCart(prod, e)}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'কার্ট' : 'Add'}</span>
                    </button>
                    <button
                      onClick={(e) => handleBuyNow(prod, e)}
                      className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
                    >
                      <span>{lang === 'bn' ? 'অর্ডার' : 'Buy'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9. 4-COLUMN RICH FOOTER */}
      <footer 
        className="mt-auto border-t border-slate-800 pt-16 pb-12"
        style={{ backgroundColor: config.footer.bgColor, color: config.footer.textColor }}
        id="contact"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Store Logo & Compliance Badges */}
          <div className="space-y-4">
            <Link href={`/${tenantId}`} className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-md"
                style={{ backgroundColor: config.header.primaryColor }}
              >
                <Store className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                {config.header.storeName}
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-slate-400">
              {config.footer.col1About}
            </p>

            {/* Government Compliance Numbers */}
            <div className="pt-2 space-y-1.5 text-xs text-slate-400 font-mono">
              {config.footer.dbid && (
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">DBID:</span>
                  <span>{config.footer.dbid}</span>
                </div>
              )}
              {config.footer.bin && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">BIN:</span>
                  <span>{config.footer.bin}</span>
                </div>
              )}
              {config.footer.tradeLicense && (
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">Trade Lic:</span>
                  <span>{config.footer.tradeLicense}</span>
                </div>
              )}
            </div>

            {/* Social Media Links */}
            {(config.footer.facebook || config.footer.whatsapp || config.footer.youtube || config.footer.instagram) && (
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                {config.footer.facebook && (
                  <a href={config.footer.facebook} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-white/10 hover:bg-blue-600 rounded-lg text-[11px] font-bold text-white transition flex items-center gap-1.5" title="Facebook">
                    <span>Facebook</span>
                  </a>
                )}
                {config.footer.whatsapp && (
                  <a href={config.footer.whatsapp.startsWith('http') ? config.footer.whatsapp : `https://wa.me/${config.footer.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5" title="WhatsApp">
                    <span>WhatsApp</span>
                  </a>
                )}
                {config.footer.youtube && (
                  <a href={config.footer.youtube} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-white/10 hover:bg-red-600 rounded-lg text-[11px] font-bold text-white transition flex items-center gap-1.5" title="YouTube">
                    <span>YouTube</span>
                  </a>
                )}
                {config.footer.instagram && (
                  <a href={config.footer.instagram} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-white/10 hover:bg-pink-600 rounded-lg text-[11px] font-bold text-white transition flex items-center gap-1.5" title="Instagram">
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              {config.footer.col2Title}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {config.footer.col2Links.map((l: any, lIdx: number) => (
                <li key={lIdx}>
                  <Link href={l.url} className="hover:text-white transition flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care & Policies */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              {config.footer.col3Title}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {config.footer.col3Links.map((l: any, lIdx: number) => (
                <li key={lIdx}>
                  <Link href={l.url} className="hover:text-white transition flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Hotline */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              {config.footer.col4Title}
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block text-sm">{config.footer.hotline}</span>
                  <span className="text-[11px] text-slate-500">{config.footer.workingHours}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{config.footer.email}</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Store className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{config.footer.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {config.header.storeName}. {config.footer.copyrightText}
          </p>

          {/* Payment Method Badges */}
          {config.footer.showPaymentBadges && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 mr-1">{lang === 'bn' ? 'পেমেন্ট মেথড:' : 'We Accept:'}</span>
              <span className="px-2 py-1 bg-white/10 rounded-md text-white font-bold text-[10px]">bKash</span>
              <span className="px-2 py-1 bg-white/10 rounded-md text-white font-bold text-[10px]">Nagad</span>
              <span className="px-2 py-1 bg-white/10 rounded-md text-white font-bold text-[10px]">Rocket</span>
              <span className="px-2 py-1 bg-white/10 rounded-md text-white font-bold text-[10px]">VISA</span>
              <span className="px-2 py-1 bg-white/10 rounded-md text-white font-bold text-[10px]">MasterCard</span>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md font-bold text-[10px]">COD</span>
            </div>
          )}
        </div>
      </footer>

      {/* 10. SLIDE-OVER QUICK CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-lg">
                    {lang === 'bn' ? 'আপনার শপিং ব্যাগ' : 'Shopping Cart'} ({cartCount})
                  </h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <ShoppingBag className="w-16 h-16 opacity-30 mb-3" />
                    <p className="font-bold text-slate-700">{lang === 'bn' ? 'আপনার কার্ট এখন খালি' : 'Your cart is empty'}</p>
                    <p className="text-xs text-slate-400 mt-1">{lang === 'bn' ? 'পছন্দের পণ্য কার্টে যুক্ত করুন' : 'Add products to start shopping'}</p>
                  </div>
                ) : (
                  cartItems.map(item => (
                    <div key={item.productId} className="flex gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h4>
                          <span className="font-bold text-blue-600 text-xs">৳{item.price}</span>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="text-slate-500 hover:text-slate-900 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold px-1.5">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="text-slate-500 hover:text-slate-900 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {cartItems.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-bold">{lang === 'bn' ? 'সাবটোটাল:' : 'Subtotal:'}</span>
                    <span className="text-xl font-black text-slate-900">৳{cartSubtotal}</span>
                  </div>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push(`/${tenantId}/checkout`);
                    }}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{lang === 'bn' ? 'চেকআউট করুন (অর্ডার সম্পন্ন করুন)' : 'Proceed to Checkout'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
