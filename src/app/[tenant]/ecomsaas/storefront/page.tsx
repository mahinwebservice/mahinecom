'use client';
// @ts-nocheck

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { 
  LayoutTemplate, 
  Save, 
  Palette, 
  Sliders, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Eye, 
  Layers, 
  ShoppingBag, 
  CheckCircle2, 
  Sparkles,
  Upload,
  Phone,
  Mail,
  ExternalLink,
  Award,
  ChevronRight,
  Clock,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  EyeOff,
  GripVertical,
  Grid,
  Zap,
  HelpCircle,
  Check,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default function StorefrontCustomizer() {
  const params = useParams();
  const tenantId = (params?.tenant as string) || '';

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [storeCategories, setStoreCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'builder' | 'slider' | 'header' | 'footer'>('builder');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Cloudinary image upload helper
  const handleCloudinaryUpload = async (file: File, callback: (url: string) => void, fieldId: string) => {
    if (!file) return;
    setUploadingField(fieldId);
    try {
      const url = await uploadToCloudinary(file, tenantId);
      callback(url);
      alert('ছবি সফলভাবে Cloudinary-তে আপলোড হয়েছে!');
    } catch (err: any) {
      alert(err.message || 'ক্লাউডিনারি আপলোড ত্রুটি');
    } finally {
      setUploadingField(null);
    }
  };

  // Default Sections Layout (Elementor Style)
  const defaultSections = [
    {
      id: 'sec_cat_showcase',
      type: 'category_grid',
      enabled: true,
      title: 'জনপ্রিয় ক্যাটাগরি সমূহ',
      subtitle: 'পছন্দের ক্যাটাগরি নির্বাচন করে সহজে কেনাকাটা করুন',
      style: 'circle' // 'circle' | 'card'
    },
    {
      id: 'sec_prod_hot',
      type: 'product_grid',
      enabled: true,
      title: '🔥 স্পেশাল অফার ও হট ডিলস',
      subtitle: 'গ্রাহকদের পছন্দের বাছাইকৃত সেরা পণ্যসমূহ আকর্ষণীয় মূল্যে',
      category: 'all',
      limit: 8,
      columns: 4, // 3, 4, 5
      sortBy: 'featured',
      viewAllLink: '#'
    },
    {
      id: 'sec_promo_banners',
      type: 'banner_grid',
      enabled: true,
      title: 'এক্সক্লুসিভ অফার ও ক্যাম্পেইন',
      subtitle: 'সেরা ব্র্যান্ড ও প্রোডাক্টে সীমিত সময়ের বিশেষ ছাড়',
      columnsCount: 2, // 1, 2, 3
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
      btnLink: '#',
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

  // Default Cinematic HUD Slider Slides (Dinajpur Shop style)
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
      ctaLink: '#',
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
      ctaLink: '#',
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
      ctaLink: '#',
      secondaryCtaText: 'অফার দেখুন',
      secondaryCtaLink: '#'
    }
  ];

  // Storefront Layout State
  const [layout, setLayout] = useState({
    header: {
      topBarEnabled: true,
      topBarText: '🎉 সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা! হটলাইন: ০১৭১১-০০০০০০',
      topBarPhone: '01711-000000',
      topBarEmail: 'support@yourstore.com',
      topBarBg: '#0f172a',
      topBarTextCol: '#f8fafc',
      headerBg: '#ffffff',
      headerTextCol: '#0f172a',
      sticky: true,
      showStoreName: true,
      showTagline: true,
      storeName: '',
      tagline: 'অফিসিয়াল অনলাইন শপ',
      logoUrl: '',
      primaryColor: '#2563eb',
      accentColor: '#CC0000',
      menuItems: [
        { id: '1', label: 'হোম', url: '' },
        { id: '2', label: 'সকল প্রোডাক্ট', url: '#products' },
        { id: '3', label: 'হট ডিলস', url: '#offers' },
        { id: '4', label: 'যোগাযোগ', url: '#contact' }
      ]
    },

    // Cinematic HUD Slider
    heroSlider: {
      enabled: true,
      autoplaySpeed: 6000,
      showLiveBadge: true,
      showProgressTrack: true,
      slides: defaultSlides
    },

    // Dynamic Elementor-style Reorderable Sections List
    sections: defaultSections,

    // 4-Column Footer
    footer: {
      bgColor: '#0b1120',
      textColor: '#94a3b8',
      col1About: 'আমরা দিচ্ছি সেরা মানের পণ্য, দ্রুততম হোম ডেলিভারি এবং সহজ রিটার্ন পলিসি। গ্রাহকের সন্তুষ্টিই আমাদের প্রথম অগ্রাধিকার।',
      dbid: 'DBID-198273645',
      bin: 'BIN: 002938475-0101',
      tradeLicense: 'TRAD/DSCC/019283',
      facebook: '',
      whatsapp: '',
      youtube: '',
      instagram: '',
      col2Title: 'প্রয়োজনীয় লিঙ্ক',
      col2Links: [
        { label: 'হোম পেজ', url: '' },
        { label: 'সকল প্রোডাক্ট', url: '#products' },
        { label: 'হট ডিলস', url: '#offers' },
        { label: 'অর্ডার ট্র্যাক করুন', url: '#orders' }
      ],
      col3Title: 'কাস্টমার কেয়ার ও পলিসি',
      col3Links: [
        { label: 'ডেলিভারি পলিসি', url: '#' },
        { label: 'রিটার্ন ও রিফান্ড পলিসি', url: '#' },
        { label: 'প্রাইভেসি পলিসি', url: '#' },
        { label: 'শর্তাবলী', url: '#' }
      ],
      col4Title: 'যোগাযোগ ও সাপোর্ট',
      hotline: '০১৭১১-০০০০০০',
      email: 'support@yourstore.com',
      address: 'উত্তরা, ঢাকা - ১২৩০, বাংলাদেশ',
      workingHours: 'সকাল ৯টা - রাত ১০টা (প্রতিদিন)',
      copyrightText: 'সর্বস্বত্ব সংরক্ষিত।',
      showPaymentBadges: true
    }
  });

  // Modal State for adding new section
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);

  useEffect(() => {
    if (!tenantId) return;

    const fetchStorefront = async () => {
      try {
        // 1. Fetch Storefront Layout
        const snap = await getDoc(doc(db, 'tenants/' + tenantId + '/settings/homepage_layout'));
        if (snap.exists()) {
          const data = snap.data();
          if (data.storefrontConfig) {
            setLayout(prev => ({
              ...prev,
              ...data.storefrontConfig,
              header: { ...prev.header, ...(data.storefrontConfig.header || {}) },
              heroSlider: { 
                ...prev.heroSlider, 
                ...(data.storefrontConfig.heroSlider || {}),
                slides: (data.storefrontConfig.heroSlider?.slides && data.storefrontConfig.heroSlider.slides.length > 0)
                  ? data.storefrontConfig.heroSlider.slides 
                  : defaultSlides
              },
              sections: (data.storefrontConfig.sections && data.storefrontConfig.sections.length > 0)
                ? data.storefrontConfig.sections 
                : defaultSections,
              footer: { ...prev.footer, ...(data.storefrontConfig.footer || {}) }
            }));
          }
        }

        // 2. Fetch General Brand Settings
        const genSnap = await getDoc(doc(db, 'tenants/' + tenantId + '/settings/general'));
        if (genSnap.exists()) {
          const genData = genSnap.data();
          setLayout(prev => ({
            ...prev,
            header: {
              ...prev.header,
              storeName: prev.header.storeName || genData.businessName || tenantId.toUpperCase(),
              logoUrl: prev.header.logoUrl || genData.logoUrl || '',
              topBarPhone: prev.header.topBarPhone || genData.phone || prev.header.topBarPhone,
              topBarEmail: prev.header.topBarEmail || genData.email || prev.header.topBarEmail
            },
            footer: {
              ...prev.footer,
              hotline: prev.footer.hotline || genData.phone || '০১৭০০-০০০০০০',
              email: prev.footer.email || genData.email || 'support@yourstore.com',
              address: prev.footer.address || genData.officeAddress || prev.footer.address,
              dbid: genData.compliance?.dbidNumber || prev.footer.dbid,
              bin: genData.compliance?.binNumber || prev.footer.bin,
              tradeLicense: genData.compliance?.tradeLicenseNo || prev.footer.tradeLicense
            }
          }));
        }

        // 3. Fetch Distinct Categories from store products
        const prodSnap = await getDocs(collection(db, 'tenants/' + tenantId + '/products'));
        const cats = new Set<string>();
        prodSnap.docs.forEach(d => {
          const p = d.data();
          if (p.category) cats.add(p.category);
        });
        if (cats.size === 0) {
          ['ইলেকট্রনিক্স', 'ফ্যাশন', 'গ্রোসারি', 'কম্পিউটার', 'অফিস স্টেশনারি'].forEach(c => cats.add(c));
        }
        setStoreCategories(Array.from(cats));

      } catch (err) {
        console.error("Error fetching storefront layout:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStorefront();
  }, [tenantId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await setDoc(doc(db, 'tenants/' + tenantId + '/settings/homepage_layout'), {
        storefrontConfig: layout,
        updatedAt: Date.now()
      }, { merge: true });

      // Sync brand details into general settings
      await setDoc(doc(db, 'tenants/' + tenantId + '/settings/general'), {
        businessName: layout.header.storeName,
        logoUrl: layout.header.logoUrl,
        tagline: layout.header.tagline,
        phone: layout.header.topBarPhone,
        email: layout.header.topBarEmail,
        updatedAt: Date.now()
      }, { merge: true });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error("Save error:", err);
      alert("Error saving storefront layout: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------
  // Section Reordering & Management Functions (Elementor Style)
  // -------------------------------------------------------------
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= layout.sections.length) return;
    const updated = [...layout.sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setLayout({ ...layout, sections: updated });
  };

  const toggleSectionEnabled = (index: number) => {
    const updated = [...layout.sections];
    updated[index] = { ...updated[index], enabled: !updated[index].enabled };
    setLayout({ ...layout, sections: updated });
  };

  const removeSection = (index: number) => {
    if (!confirm('আপনি কি এই সেকশনটি হোমপেজ থেকে মুছে ফেলতে চান?')) return;
    const updated = [...layout.sections];
    updated.splice(index, 1);
    setLayout({ ...layout, sections: updated });
  };

  const updateSectionField = (index: number, field: string, value: any) => {
    const updated = [...layout.sections];
    updated[index] = { ...updated[index], [field]: value };
    setLayout({ ...layout, sections: updated });
  };

  const addNewSection = (type: string) => {
    const id = 'sec_' + type + '_' + Date.now();
    let newSec: any = {
      id,
      type,
      enabled: true
    };

    if (type === 'product_grid') {
      newSec = {
        ...newSec,
        title: 'নতুন প্রোডাক্ট গ্রিড',
        subtitle: 'বাছাইকৃত পণ্যসমূহ সাশ্রয়ী মূল্যে',
        category: 'all',
        limit: 8,
        columns: 4,
        sortBy: 'newest',
        viewAllLink: '#'
      };
    } else if (type === 'category_grid') {
      newSec = {
        ...newSec,
        title: 'ক্যাটাগরি সমূহ',
        subtitle: 'পছন্দের ক্যাটাগরি ব্রাউজ করুন',
        style: 'circle'
      };
    } else if (type === 'banner_grid') {
      newSec = {
        ...newSec,
        title: 'প্রমোশনাল ব্যানার',
        subtitle: 'বিশেষ ছাড় ও অফার',
        columnsCount: 2,
        banners: [
          {
            id: 'b_' + Date.now(),
            title: 'মেগা ডিল অফার',
            discount: '৫০% পর্যন্ত ছাড়',
            imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
            btnText: 'অর্ডার করুন',
            linkUrl: '#'
          },
          {
            id: 'b2_' + Date.now(),
            title: 'নতুন কালেকশন',
            discount: 'সেরা কোয়ালিটি পণ্য',
            imageUrl: 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?auto=format&fit=crop&w=800&q=80',
            btnText: 'কালেকশন দেখুন',
            linkUrl: '#'
          }
        ]
      };
    } else if (type === 'cta_banner') {
      newSec = {
        ...newSec,
        badge: 'সীমিত সময়ের অফার',
        title: 'স্পেশাল আকর্ষণীয় ছাড়',
        subtitle: 'দেরি না করে আজই পছন্দের পণ্য ক্যাশ অন ডেলিভারিতে অর্ডার করুন!',
        btnText: 'এখনই কিনুন',
        btnLink: '#',
        gradient: 'from-blue-600 via-indigo-700 to-slate-900'
      };
    } else if (type === 'service_grid') {
      newSec = {
        ...newSec,
        title: 'আমাদের সেবাসমূহ',
        subtitle: 'গ্রাহকের বিশ্বস্ত সেবায় সার্বক্ষণিক নিয়োজিত',
        services: [
          { id: 's1', icon: '⚡', title: 'ফাস্ট সার্ভিস', desc: 'অর্ডার করার ২৪-৪৮ ঘণ্টার মধ্যে সারা দেশে নির্ভরযোগ্য ডেলিভারি।', btnText: 'বিস্তারিত', linkUrl: '#' },
          { id: 's2', icon: '🛡️', title: 'আসল পণ্য নিশ্চয়তা', desc: '১০০% অরিজিনাল ও ইনট্যাক্ট পণ্যের নিশ্চয়তা।', btnText: 'বিস্তারিত', linkUrl: '#' },
          { id: 's3', icon: '📞', title: '২৪/৭ সাপোর্ট', desc: 'যেকোনো জিজ্ঞাসা বা সমস্যায় আমাদের অভিজ্ঞ সাপোর্ট টিম সর্বদা প্রস্তুত।', btnText: 'যোগাযোগ', linkUrl: '#' }
        ]
      };
    } else if (type === 'trust_strip') {
      newSec = {
        ...newSec,
        title: 'আমাদের বিশেষ সুবিধাসমূহ'
      };
    }

    setLayout({
      ...layout,
      sections: [...layout.sections, newSec]
    });
    setShowAddSectionModal(false);
  };

  // Slider handlers
  const handleAddSlide = () => {
    const newSlide = {
      id: String(Date.now()),
      eyebrow: '✨ নতুন অফার',
      title: 'আকর্ষণীয় পণ্যের মেগা সমাহার',
      subtitle: 'সেরা ডিল ও আকর্ষণীয় ডিসকাউন্টে আপনার পছন্দের পণ্য বেছে নিন।',
      giantWatermark: 'OFFER',
      themeColor: '#3AA0FF',
      skuCode: 'OFFER-01',
      bgImage: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1600&q=80',
      cameoImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      stat1Num: '১০০%',
      stat1Lbl: 'অরিজিনাল',
      stat2Num: 'সেরা',
      stat2Lbl: 'মূল্যছাড়',
      ctaText: 'এখনই কিনুন →',
      ctaLink: '#',
      secondaryCtaText: 'কালেকশন দেখুন',
      secondaryCtaLink: '#'
    };
    setLayout({
      ...layout,
      heroSlider: {
        ...layout.heroSlider,
        slides: [...layout.heroSlider.slides, newSlide]
      }
    });
  };

  const handleRemoveSlide = (idx: number) => {
    const updated = [...layout.heroSlider.slides];
    updated.splice(idx, 1);
    setLayout({
      ...layout,
      heroSlider: { ...layout.heroSlider, slides: updated }
    });
  };

  const handleUpdateSlide = (idx: number, field: string, val: string) => {
    const updated = [...layout.heroSlider.slides];
    updated[idx] = { ...updated[idx], [field]: val };
    setLayout({
      ...layout,
      heroSlider: { ...layout.heroSlider, slides: updated }
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        হোমপেজ সেটিংস লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutTemplate className="w-7 h-7 text-blue-600" />
            হোমপেজ ও স্টোরফ্রন্ট কাস্টমাইজেশন
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Elementor-এর মতো স্বাধীনভাবে সেকশন যুক্ত করুন, সাজান এবং সিনেমাটিক স্লাইডার ডিজাইন করুন
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={'/' + tenantId}
            target="_blank"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm flex items-center gap-2 transition"
          >
            <Eye className="w-4 h-4" />
            <span>লাইভ স্টোর দেখুন</span>
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition cursor-pointer disabled:opacity-70 text-sm"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>পরিবর্তন সেভ করুন</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">হোমপেজ ও স্টোরফ্রন্টের সকল পরিবর্তন সফলভাবে সংরক্ষিত ও লাইভ হয়েছে!</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-sm font-semibold">
        {[
          { id: 'builder', label: '১. সেকশন বিল্ডার (Elementor-Style)', icon: Layers },
          { id: 'slider', label: '২. সিনেমাটিক HUD স্লাইডার', icon: Sparkles },
          { id: 'header', label: '৩. হেডার ও টপ বার', icon: Sliders },
          { id: 'footer', label: '৪. ৪-কলাম রিচ ফুটার', icon: Award }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={'px-5 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ' + (
              activeTab === tab.id 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* =========================================================================
          TAB 1: ELEMENTOR-STYLE HOMEPAGE SECTION BUILDER
          ========================================================================= */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>হোমপেজ সেকশন তালিকা ও অবস্থান</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {layout.sections.length}টি সেকশন
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  ⬆️ / ⬇️ বাটনে ক্লিক করে যেকোনো সেকশন উপরে-নিচে নিয়ে যান। যেকোনো ক্যাটাগরির প্রোডাক্ট গ্রিড, ব্যানার বা CTA যোগ করুন।
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddSectionModal(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition self-start cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ নতুন সেকশন যোগ করুন</span>
              </button>
            </div>

            {/* Sections Accordion List */}
            <div className="space-y-4">
              {layout.sections.map((section, idx) => {
                const getSectionBadge = () => {
                  switch (section.type) {
                    case 'product_grid': return { label: '🛍️ প্রোডাক্ট গ্রিড', bg: 'bg-purple-100 text-purple-800' };
                    case 'category_grid': return { label: '🏷️ ক্যাটাগরি শোকেস', bg: 'bg-emerald-100 text-emerald-800' };
                    case 'banner_grid': return { label: '🖼️ ব্যানার গ্রিড', bg: 'bg-amber-100 text-amber-800' };
                    case 'cta_banner': return { label: '⚡ ফ্ল্যাশ সেল CTA', bg: 'bg-rose-100 text-rose-800' };
                    case 'service_grid': return { label: '🛠️ সার্ভিস গ্রিড', bg: 'bg-blue-100 text-blue-800' };
                    case 'trust_strip': return { label: '🛡️ ট্রাস্ট ব্যাজ', bg: 'bg-slate-100 text-slate-800' };
                    default: return { label: 'সেকশন', bg: 'bg-slate-100 text-slate-800' };
                  }
                };
                const badge = getSectionBadge();

                return (
                  <div 
                    key={section.id || idx}
                    className={'border rounded-2xl p-5 transition ' + (
                      section.enabled ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50/70 border-slate-200/50 opacity-60'
                    )}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          #{idx + 1}
                        </span>
                        <span className={'text-[11px] font-bold px-2.5 py-1 rounded-lg ' + badge.bg}>
                          {badge.label}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {section.title || (section.type === 'cta_banner' ? section.badge : 'শিরোনামহীন সেকশন')}
                        </span>
                      </div>

                      {/* Controls: Move Up, Move Down, Toggle, Delete */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => moveSection(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition cursor-pointer"
                          title="উপরে নিন"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => moveSection(idx, 'down')}
                          disabled={idx === layout.sections.length - 1}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition cursor-pointer"
                          title="নিচে নিন"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleSectionEnabled(idx)}
                          className={'p-1.5 rounded-lg transition cursor-pointer ' + (
                            section.enabled ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-400 hover:bg-slate-100'
                          )}
                          title={section.enabled ? 'লুকিয়ে রাখুন' : 'দৃশ্যমান করুন'}
                        >
                          {section.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeSection(idx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer ml-1"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Section Configuration Fields */}
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                      
                      {/* Common Title & Subtitle */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">সেকশন টাইটেল (শিরোনাম)</label>
                        <input
                          type="text"
                          value={section.title || ''}
                          onChange={e => updateSectionField(idx, 'title', e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                        />
                      </div>

                      {section.subtitle !== undefined && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">সাবটাইটেল (বিবরণ)</label>
                          <input
                            type="text"
                            value={section.subtitle || ''}
                            onChange={e => updateSectionField(idx, 'subtitle', e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                          />
                        </div>
                      )}

                      {/* Specific Settings: PRODUCT GRID */}
                      {section.type === 'product_grid' && (
                        <>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">কোন ক্যাটাগরি দেখাবে?</label>
                            <select
                              value={section.category || 'all'}
                              onChange={e => updateSectionField(idx, 'category', e.target.value)}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                            >
                              <option value="all">সব প্রোডাক্ট (All Products)</option>
                              {storeCategories.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">প্রোডাক্ট সংখ্যা (Limit)</label>
                            <select
                              value={section.limit || 8}
                              onChange={e => updateSectionField(idx, 'limit', Number(e.target.value))}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                            >
                              <option value={4}>৪টি প্রোডাক্ট</option>
                              <option value={6}>৬টি প্রোডাক্ট</option>
                              <option value={8}>৮টি প্রোডাক্ট</option>
                              <option value={10}>১০টি প্রোডাক্ট</option>
                              <option value={12}>১২টি প্রোডাক্ট</option>
                              <option value={16}>১৬টি প্রোডাক্ট</option>
                              <option value={20}>২০টি প্রোডাক্ট</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">কলাম বিন্যাস (Grid Columns)</label>
                            <select
                              value={section.columns || 4}
                              onChange={e => updateSectionField(idx, 'columns', Number(e.target.value))}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                            >
                              <option value={3}>৩ কলাম</option>
                              <option value={4}>৪ কলাম (স্ট্যান্ডার্ড)</option>
                              <option value={5}>৫ কলাম (দিনাজপুর শপ স্টাইল)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">সর্টিং নিয়ম (Display Rules)</label>
                            <select
                              value={section.sortBy || 'newest'}
                              onChange={e => updateSectionField(idx, 'sortBy', e.target.value)}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                            >
                              <option value="newest">নতুন যোগ করা পণ্য আগে</option>
                              <option value="featured">ফিচার্ড / বাছাইকৃত পণ্য</option>
                              <option value="price_low">কম দাম থেকে বেশি</option>
                              <option value="price_high">বেশি দাম থেকে কম</option>
                            </select>
                          </div>
                        </>
                      )}

                      {/* Specific Settings: CATEGORY GRID */}
                      {section.type === 'category_grid' && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">ক্যাটাগরি ডিসপ্লে স্টাইল</label>
                          <select
                            value={section.style || 'circle'}
                            onChange={e => updateSectionField(idx, 'style', e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                          >
                            <option value="circle">সার্কুলার থাম্বনেইল (Circular Icons)</option>
                            <option value="card">মডার্ন কার্ড গ্রিড (Modern Cards)</option>
                          </select>
                        </div>
                      )}

                      {/* Specific Settings: BANNER GRID */}
                      {section.type === 'banner_grid' && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">কলাম সংখ্যা</label>
                          <select
                            value={section.columnsCount || 2}
                            onChange={e => updateSectionField(idx, 'columnsCount', Number(e.target.value))}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                          >
                            <option value={1}>১ কলাম (ফুল উইডথ)</option>
                            <option value={2}>২ কলাম ব্যানার</option>
                            <option value={3}>৩ কলাম ব্যানার</option>
                          </select>
                        </div>
                      )}

                      {/* Specific Settings: CTA BANNER */}
                      {section.type === 'cta_banner' && (
                        <>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">অফার ব্যাজ</label>
                            <input
                              type="text"
                              value={section.badge || ''}
                              onChange={e => updateSectionField(idx, 'badge', e.target.value)}
                              placeholder="যেমন: ৫০% পর্যন্ত ছাড়"
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-rose-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">বাটন টেক্সট</label>
                            <input
                              type="text"
                              value={section.btnText || ''}
                              onChange={e => updateSectionField(idx, 'btnText', e.target.value)}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">বাটন লিংক</label>
                            <input
                              type="text"
                              value={section.btnLink || ''}
                              onChange={e => updateSectionField(idx, 'btnLink', e.target.value)}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                            />
                          </div>
                        </>
                      )}

                    </div>

                    {/* Banner Grid Items Editor */}
                    {section.type === 'banner_grid' && section.banners && (
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-700">ব্যানার আইটেমসমূহ:</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newB = {
                                id: 'b_' + Date.now(),
                                title: 'নতুন অফার ব্যানার',
                                discount: 'বিশেষ মূল্যছাড়',
                                imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
                                btnText: 'অর্ডার করুন',
                                linkUrl: '#'
                              };
                              updateSectionField(idx, 'banners', [...section.banners, newB]);
                            }}
                            className="text-[11px] font-bold text-blue-600 hover:underline"
                          >
                            + ব্যানার যোগ করুন
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {section.banners.map((b, bIdx) => (
                            <div key={b.id || bIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-700">ব্যানার #{bIdx + 1}</span>
                                {section.banners.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const u = [...section.banners];
                                      u.splice(bIdx, 1);
                                      updateSectionField(idx, 'banners', u);
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              <input
                                type="text"
                                placeholder="ব্যানার টাইটেল"
                                value={b.title || ''}
                                onChange={e => {
                                  const u = [...section.banners];
                                  u[bIdx] = { ...u[bIdx], title: e.target.value };
                                  updateSectionField(idx, 'banners', u);
                                }}
                                className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                              />
                              <input
                                type="text"
                                placeholder="ডিসকাউন্ট বা ব্যাজ"
                                value={b.discount || ''}
                                onChange={e => {
                                  const u = [...section.banners];
                                  u[bIdx] = { ...u[bIdx], discount: e.target.value };
                                  updateSectionField(idx, 'banners', u);
                                }}
                                className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                              />
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="ছবি URL"
                                  value={b.imageUrl || ''}
                                  onChange={e => {
                                    const u = [...section.banners];
                                    u[bIdx] = { ...u[bIdx], imageUrl: e.target.value };
                                    updateSectionField(idx, 'banners', u);
                                  }}
                                  className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                                />
                                <label className="shrink-0 p-1.5 bg-slate-200 hover:bg-slate-300 rounded cursor-pointer text-xs flex items-center justify-center">
                                  <Upload className="w-3.5 h-3.5 text-slate-700" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => {
                                      if (e.target.files?.[0]) {
                                        handleCloudinaryUpload(e.target.files[0], url => {
                                          const u = [...section.banners];
                                          u[bIdx] = { ...u[bIdx], imageUrl: url };
                                          updateSectionField(idx, 'banners', u);
                                        }, 'sec_b_' + idx + '_' + bIdx);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          ADD NEW SECTION MODAL (ELEMENTOR STYLE SELECTION)
          ========================================================================= */}
      {showAddSectionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">নতুন সেকশন যোগ করুন</h3>
                <p className="text-xs text-slate-500">হোমপেজে যে ধরনের সেকশন যোগ করতে চান তা নির্বাচন করুন</p>
              </div>
              <button 
                onClick={() => setShowAddSectionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                {
                  type: 'product_grid',
                  icon: ShoppingBag,
                  title: 'ক্যাটাগরি প্রোডাক্ট গ্রিড',
                  desc: 'নির্দিষ্ট ক্যাটাগরির পণ্য, প্রোডাক্ট লিমিট ও কলাম সংখ্যা দিয়ে ডিসপ্লে করুন',
                  bg: 'hover:border-purple-500 hover:bg-purple-50/50'
                },
                {
                  type: 'category_grid',
                  icon: Layers,
                  title: 'ক্যাটাগরি শোকেস',
                  desc: 'সার্কুলার থাম্বনেইল বা মডার্ন কার্ড ফরম্যাটে ক্যাটাগরি মেনু',
                  bg: 'hover:border-emerald-500 hover:bg-emerald-50/50'
                },
                {
                  type: 'banner_grid',
                  icon: ImageIcon,
                  title: 'মাল্টি-কলাম ব্যানার',
                  desc: '১ কলাম, ২ কলাম বা ৩ কলাম আকর্ষণীয় অফার ও প্রমো ব্যানার',
                  bg: 'hover:border-amber-500 hover:bg-amber-50/50'
                },
                {
                  type: 'cta_banner',
                  icon: Zap,
                  title: 'ফ্ল্যাশ সেল CTA ব্যানার',
                  desc: 'উচ্চ কনভার্সন রেটের জন্য স্পেশাল অফার ও ফ্ল্যাশ সেল কাউন্টার',
                  bg: 'hover:border-rose-500 hover:bg-rose-50/50'
                },
                {
                  type: 'service_grid',
                  icon: Grid,
                  title: 'সার্ভিসেস ও ফিচার গ্রিড',
                  desc: 'দিনাজপুর শপের মতো ৩ কলাম প্রফেশনাল সার্ভিস বা শপ সুবিধা',
                  bg: 'hover:border-blue-500 hover:bg-blue-50/50'
                },
                {
                  type: 'trust_strip',
                  icon: Award,
                  title: 'ট্রাস্ট ও গ্যারান্টি ব্যাজ',
                  desc: 'ফাস্ট ডেলিভারি, ক্যাশ অন ডেলিভারি ও আসল পণ্যের নিশ্চয়তা স্ট্রিপ',
                  bg: 'hover:border-slate-500 hover:bg-slate-50'
                }
              ].map(secItem => (
                <button
                  key={secItem.type}
                  type="button"
                  onClick={() => addNewSection(secItem.type)}
                  className={'p-4 rounded-2xl border-2 border-slate-200 text-left transition flex items-start gap-3.5 cursor-pointer ' + secItem.bg}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                    <secItem.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{secItem.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{secItem.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddSectionModal(false)}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CINEMATIC HUD HERO SLIDER (DINAJPUR SHOP STYLE)
          ========================================================================= */}
      {activeTab === 'slider' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>সিনেমাটিক HUD স্লাইডার (Dinajpur Shop Style)</span>
                <span className="text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                  হ্যাংগিং ট্যাগ + লাইভ HUD
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                লাইভ ট্র্যাকার, হ্যাংগিং প্রাইস ট্যাগ, থিম কালার ও ব্যাকড্রপ ওয়াটারমার্ক সহ সম্পূর্ণ ডায়নামিক
              </p>
            </div>

            <label className="flex items-center gap-2 font-bold text-xs text-slate-900 cursor-pointer">
              <input 
                type="checkbox"
                checked={layout.heroSlider.enabled}
                onChange={e => setLayout({
                  ...layout,
                  heroSlider: { ...layout.heroSlider, enabled: e.target.checked }
                })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>স্লাইডার চালু রাখুন</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                অটোপ্লে স্পিড (মিলিসেকেন্ড)
              </label>
              <input
                type="number"
                value={layout.heroSlider.autoplaySpeed || 6000}
                onChange={e => setLayout({
                  ...layout,
                  heroSlider: { ...layout.heroSlider, autoplaySpeed: Number(e.target.value) }
                })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
              />
              <span className="text-[10px] text-slate-400">ডিফল্ট: 6000ms (৬ সেকেন্ড)</span>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={layout.heroSlider.showLiveBadge ?? true}
                  onChange={e => setLayout({
                    ...layout,
                    heroSlider: { ...layout.heroSlider, showLiveBadge: e.target.checked }
                  })}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span>টপ লাইভ (🔴 সরাসরি) HUD বার দেখাবে</span>
              </label>
            </div>
          </div>

          {/* Slides List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                স্লাইড সমূহের তালিকা ({layout.heroSlider.slides.length}টি স্লাইড)
              </h3>
              <button
                type="button"
                onClick={handleAddSlide}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ স্লাইড যোগ করুন</span>
              </button>
            </div>

            <div className="space-y-5">
              {layout.heroSlider.slides.map((slide, sIdx) => (
                <div key={slide.id || sIdx} className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/90 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                        {sIdx + 1}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{slide.eyebrow || 'স্লাইড'}</span>
                      <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: slide.themeColor || '#2FD4C8' }} title="থিম কালার"></span>
                    </div>

                    {layout.heroSlider.slides.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSlide(sIdx)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="স্লাইড মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">ক্যাটাগরি ব্যাজ (Eyebrow)</label>
                      <input
                        type="text"
                        value={slide.eyebrow || ''}
                        onChange={e => handleUpdateSlide(sIdx, 'eyebrow', e.target.value)}
                        placeholder="যেমন: 📱 গ্যাজেট কর্নার"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">স্লাইড প্রধান শিরোনাম</label>
                      <input
                        type="text"
                        value={slide.title || ''}
                        onChange={e => handleUpdateSlide(sIdx, 'title', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">ব্যাকড্রপ ওয়াটারমার্ক (Giant Word)</label>
                      <input
                        type="text"
                        value={slide.giantWatermark || ''}
                        onChange={e => handleUpdateSlide(sIdx, 'giantWatermark', e.target.value)}
                        placeholder="যেমন: GADGET, FASHION"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono uppercase"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">সাবটাইটেল / বিবরণ</label>
                      <input
                        type="text"
                        value={slide.subtitle || ''}
                        onChange={e => handleUpdateSlide(sIdx, 'subtitle', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">থিম অ্যাকসেন্ট কালার (Hex)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={slide.themeColor || '#2FD4C8'}
                          onChange={e => handleUpdateSlide(sIdx, 'themeColor', e.target.value)}
                          className="w-9 h-8 rounded border p-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={slide.themeColor || '#2FD4C8'}
                          onChange={e => handleUpdateSlide(sIdx, 'themeColor', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">SKU / বারকোড কোড</label>
                      <input
                        type="text"
                        value={slide.skuCode || ''}
                        onChange={e => handleUpdateSlide(sIdx, 'skuCode', e.target.value)}
                        placeholder="GDGT-01 · ইলেকট্রনিক্স"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">স্ট্যাট ১ (সংখ্যা ও বিবরণ)</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={slide.stat1Num || ''}
                          onChange={e => handleUpdateSlide(sIdx, 'stat1Num', e.target.value)}
                          placeholder="৫০০+"
                          className="w-1/2 p-2 bg-white border border-slate-200 rounded-lg font-bold"
                        />
                        <input
                          type="text"
                          value={slide.stat1Lbl || ''}
                          onChange={e => handleUpdateSlide(sIdx, 'stat1Lbl', e.target.value)}
                          placeholder="প্রোডাক্ট"
                          className="w-1/2 p-2 bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">স্ট্যাট ২ (সংখ্যা ও বিবরণ)</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={slide.stat2Num || ''}
                          onChange={e => handleUpdateSlide(sIdx, 'stat2Num', e.target.value)}
                          placeholder="ওয়ারেন্টি"
                          className="w-1/2 p-2 bg-white border border-slate-200 rounded-lg font-bold"
                        />
                        <input
                          type="text"
                          value={slide.stat2Lbl || ''}
                          onChange={e => handleUpdateSlide(sIdx, 'stat2Lbl', e.target.value)}
                          placeholder="সহ পণ্য"
                          className="w-1/2 p-2 bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Background Image */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">স্লাইড ব্যাকগ্রাউন্ড ছবি</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={slide.bgImage || ''}
                          onChange={e => handleUpdateSlide(sIdx, 'bgImage', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                        />
                        <label className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold cursor-pointer shrink-0 flex items-center gap-1">
                          <Upload className="w-3.5 h-3.5" />
                          <span>আপলোড</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              if (e.target.files?.[0]) {
                                handleCloudinaryUpload(e.target.files[0], url => handleUpdateSlide(sIdx, 'bgImage', url), 'slide_bg_' + sIdx);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Floating Cameo Circular Photo */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">ফ্লোটিং সার্কুলার ছবি (Cameo)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={slide.cameoImage || ''}
                          onChange={e => handleUpdateSlide(sIdx, 'cameoImage', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                        />
                        <label className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold cursor-pointer shrink-0 flex items-center justify-center">
                          <Upload className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              if (e.target.files?.[0]) {
                                handleCloudinaryUpload(e.target.files[0], url => handleUpdateSlide(sIdx, 'cameoImage', url), 'slide_cam_' + sIdx);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">বাটন ১ (Primary CTA)</label>
                      <input
                        type="text"
                        value={slide.ctaText || ''}
                        onChange={e => handleUpdateSlide(sIdx, 'ctaText', e.target.value)}
                        placeholder="কিনুন →"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">বাটন ২ (Outline CTA)</label>
                      <input
                        type="text"
                        value={slide.secondaryCtaText || ''}
                        onChange={e => handleUpdateSlide(sIdx, 'secondaryCtaText', e.target.value)}
                        placeholder="সব দেখুন"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: HEADER & TOP BAR
          ========================================================================= */}
      {activeTab === 'header' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">হেডার ও টপ বার সেটিংস</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">দোকানের নাম (Store Name)</label>
              <input
                type="text"
                value={layout.header.storeName}
                onChange={e => setLayout({ ...layout, header: { ...layout.header, storeName: e.target.value } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">দোকানের স্লোগান (Tagline)</label>
              <input
                type="text"
                value={layout.header.tagline}
                onChange={e => setLayout({ ...layout, header: { ...layout.header, tagline: e.target.value } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">টপ অ্যানাউন্সমেন্ট টেক্সট</label>
              <input
                type="text"
                value={layout.header.topBarText}
                onChange={e => setLayout({ ...layout, header: { ...layout.header, topBarText: e.target.value } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">টপ বার ফোন / হেল্পলাইন</label>
              <input
                type="text"
                value={layout.header.topBarPhone}
                onChange={e => setLayout({ ...layout, header: { ...layout.header, topBarPhone: e.target.value } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">লোগো ছবি (Logo URL)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={layout.header.logoUrl}
                  onChange={e => setLayout({ ...layout, header: { ...layout.header, logoUrl: e.target.value } })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
                <label className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold cursor-pointer shrink-0 flex items-center gap-1">
                  <Upload className="w-4 h-4" />
                  <span>আপলোড</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        handleCloudinaryUpload(e.target.files[0], url => setLayout({ ...layout, header: { ...layout.header, logoUrl: url } }), 'header_logo');
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: 4-COLUMN FOOTER
          ========================================================================= */}
      {activeTab === 'footer' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">৪-কলাম রিচ ফুটার সেটিংস</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">কলাম ১: শপ পরিচিতি / বিবরণ</label>
              <textarea
                rows={3}
                value={layout.footer.col1About}
                onChange={e => setLayout({ ...layout, footer: { ...layout.footer, col1About: e.target.value } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">হটলাইন নম্বর</label>
              <input
                type="text"
                value={layout.footer.hotline}
                onChange={e => setLayout({ ...layout, footer: { ...layout.footer, hotline: e.target.value } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">ইমেইল ঠিকানা</label>
              <input
                type="text"
                value={layout.footer.email}
                onChange={e => setLayout({ ...layout, footer: { ...layout.footer, email: e.target.value } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">অফিস / শপ ঠিকানা</label>
              <input
                type="text"
                value={layout.footer.address}
                onChange={e => setLayout({ ...layout, footer: { ...layout.footer, address: e.target.value } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
