// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { useCartStore } from '@/store/cartStore';
import StorefrontLayout from '@/components/storefront/StorefrontLayout';
import { 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Phone, 
  Share2, 
  Tag, 
  Layers, 
  Check, 
  Minus, 
  Plus, 
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function SingleProductPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = (params?.tenant as string) || '';
  const productId = (params?.id as string) || '';

  const [product, setProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { addItem } = useCartStore();

  useEffect(() => {
    if (!tenantId || !productId) return;

    const fetchProductData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Store Settings for Store Name
        let storeName = tenantId.toUpperCase();
        try {
          const genSnap = await getDoc(doc(db, 'tenants/' + tenantId + '/settings/general'));
          if (genSnap.exists()) {
            storeName = genSnap.data().businessName || tenantId.toUpperCase();
            setStoreSettings(genSnap.data());
          }
        } catch (e) {
          console.warn('Error fetching general settings:', e);
        }

        // 2. Fetch Product from Firestore
        let pData: any = null;
        try {
          const prodSnap = await getDoc(doc(db, 'tenants/' + tenantId + '/products/' + productId));
          if (prodSnap.exists()) {
            pData = { id: prodSnap.id, ...(prodSnap.data() as any) };
          }
        } catch (e) {
          console.warn('Error fetching from Firestore, checking fallback catalog:', e);
        }

        // Demo Products Catalog (matches homepage demo items & sample items)
        const demoCatalog = [
          {
            id: 'demo_1',
            title: 'ওয়্যারলেস ব্লুটুথ হেডফোন প্রো - বাসের জন্য পারফেক্ট',
            price: 1850,
            salePrice: 1850,
            regularPrice: 2200,
            category: 'ইলেকট্রনিক্স',
            brand: 'SoundCore',
            sku: 'ELEC-HP01',
            stock: 35,
            badge: 'হট ডিল',
            images: [
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80'
            ],
            shortDesc: 'উচ্চমানের বেস সাউন্ড, ৩০ ঘণ্টার দীর্ঘ ব্যাটারি লাইফ এবং সফট ইয়ারপ্যাডের আরামদায়ক ডিজাইন।',
            longDesc: 'ওয়্যারলেস ব্লুটুথ হেডফোন প্রো দিয়ে উপভোগ করুন স্ফটিক-স্বচ্ছ অডিও ও গভীর মেগা বেস। এতে রয়েছে লেটেস্ট ব্লুটুথ ৫.৩ প্রযুক্তি, অ্যাক্টিভ নয়েজ ক্যান্সেলেশন এবং দ্রুত চার্জিং সুবিধা। দীর্ঘ ভ্রমণের সময় ব্যবহারের জন্য এটি অত্যন্ত সুবিধাজনক।'
          },
          {
            id: 'demo_2',
            title: 'স্মার্ট ফিটনেস ট্র্যাকার ওয়াচ উইথ হার্ট রেট সেন্সর',
            price: 1450,
            salePrice: 1450,
            regularPrice: 1800,
            category: 'ইলেকট্রনিক্স',
            brand: 'FitPro',
            sku: 'ELEC-WT02',
            stock: 45,
            badge: 'জনপ্রিয়',
            images: [
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
            ],
            shortDesc: 'রিয়েল-টাইম হার্টরেট মনিটর, স্লিপ ট্র্যাকার এবং আইপি৬৮ ওয়াটারপ্রুফ স্পোর্টস ওয়াচ।',
            longDesc: 'দৈনন্দিন স্বাস্থ্য ও ফিটনেস ট্র্যাক করার সেরা পরিধেয় প্রযুক্তি। একাধিক স্পোর্টস মোড, স্টেপ কাউন্টার, ক্যালোরি ট্র্যাকার এবং স্মার্ট নোটিফিকেশন ফিচার সম্বলিত।'
          },
          {
            id: 'demo_3',
            title: 'প্রিমিয়াম ম্যানস ক্যাজুয়াল কটন স্নিকার্স',
            price: 2150,
            salePrice: 2150,
            regularPrice: 2600,
            category: 'ফ্যাশন',
            brand: 'UrbanStep',
            sku: 'FASH-SN03',
            stock: 20,
            badge: 'এক্সক্লুসিভ',
            images: [
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
            ],
            shortDesc: 'হালকা ও টেকসই গ্রিপ সোল, সারাদিন হাঁটার জন্য অত্যন্ত আরামদায়ক কটন স্নিকার্স।',
            longDesc: 'স্টাইলিশ লুক এবং প্রিমিয়াম রাবার ও কটন মেটেরিয়াল দিয়ে তৈরি স্নিকার্স। ক্যাজুয়াল আউটিং এবং পার্টি উভয়ের জন্যই শতভাগ মানানসই।'
          },
          {
            id: 'demo_4',
            title: 'আল্ট্রা-কমফোর্ট কটন হাফ হাতা টি-শার্ট',
            price: 490,
            salePrice: 490,
            regularPrice: 550,
            category: 'ফ্যাশন',
            brand: 'PureCotton',
            sku: 'FASH-TS04',
            stock: 60,
            badge: 'বেস্টসেলার',
            images: [
              'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
            ],
            shortDesc: '১০০% পিওর কটন ফেব্রিক, শ্বাসপ্রশ্বাস উপযোগী এবং প্রিমিয়াম ডাবল স্টিচিং।',
            longDesc: 'গরমের দিনে সর্বোচ্চ স্বস্তির জন্য ১০০% চিরুনি কটন টি-শার্ট। রঙ চটে না এবং ধোয়ার পরেও কাপড়ের কোমলতা অক্ষুণ্ণ থাকে।'
          },
          {
            id: 'demo_5',
            title: 'পোর্টেবল ডিজিটাল হ্যাঙ্গিং স্কেল (৫০ কেজি পর্যন্ত)',
            price: 260,
            salePrice: 260,
            regularPrice: 290,
            category: 'ইলেকট্রনিক্স',
            brand: 'ScaleTech',
            sku: 'ELEC-SC05',
            stock: 80,
            badge: 'অফার',
            images: [
              'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80'
            ],
            shortDesc: 'বাজার বা ভ্রমণের লাগেজের ওজন মাপার জন্য নিখুঁত ডিজিটাল হ্যাঙ্গিং স্কেল।',
            longDesc: 'এলসিডি নীল ব্যাকলাইট ডিসপ্লে সহ ৫০ কেজি পর্যন্ত নিখুঁত পরিমাপক ডিজিটাল স্কেল। কম্প্যাক্ট সাইজ তাই সহজে পকেটে বা ব্যাগে বহন করা যায়।'
          },
          {
            id: 'demo_6',
            title: 'ফ্রেশ এ৪ সাইজ পেপার (৮০ জিএসএম) - ১ রিম ৫০০ শীট',
            price: 440,
            salePrice: 440,
            regularPrice: 480,
            category: 'অফিস স্টেশনারি',
            brand: 'PaperCo',
            sku: 'STAT-P06',
            stock: 50,
            badge: 'অফিস চয়েস',
            images: [
              'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80'
            ],
            shortDesc: 'হাই-ব্রাইটনেস স্মুথ পেপার, নিখুঁত প্রিন্টিং এবং ফটোকপির জন্য সেরা।',
            longDesc: '৮০ জিএসএম প্রিমিয়াম পেপার, জ্যাম-ফ্রি আল্ট্রা-হোয়াইট প্রিন্টিংয়ের নিশ্চয়তা। যেকোনো লেজার বা ইংকজেট প্রিন্টারে সহজে ব্যবহারযোগ্য।'
          },
          {
            id: 'demo_7',
            title: 'অর্গানিক খাঁটি মধু (সুন্দরবনের প্রাকৃতিক চাকের মধু)',
            price: 650,
            salePrice: 650,
            regularPrice: 750,
            category: 'গ্রোসারি',
            brand: 'NatureHoney',
            sku: 'GROC-H07',
            stock: 30,
            badge: '১০০% খাঁটি',
            images: [
              'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80'
            ],
            shortDesc: 'সুন্দরবনের প্রাকৃতিক চাকের খাঁটি কাঁচা মধু, কোনো প্রকার কৃত্রিম মিষ্টি বা প্রিজারভেটিভ ছাড়া।',
            longDesc: 'প্রাকৃতিক রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি এবং শারীরিক শক্তি অর্জনে আসল চাকের মধু অতুলনীয়। আমাদের মধু সম্পূর্ণ র’ এবং কোনো প্রসেসিং ছাড়া সরাসরি সংগৃহীত।'
          },
          {
            id: 'demo_8',
            title: 'এক্সক্লুসিভ উইমেনস হ্যান্ডব্যাগ - প্রিমিয়াম ফিনিশিং',
            price: 1950,
            salePrice: 1950,
            regularPrice: 2400,
            category: 'ফ্যাশন',
            brand: 'Elegance',
            sku: 'FASH-HB08',
            stock: 25,
            badge: 'নতুন কালেকশন',
            images: [
              'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
            ],
            shortDesc: 'লাক্সারি লেদার ফিনিশ হ্যান্ডব্যাগ, পর্যাপ্ত জায়গা ও ক্লাসিক স্টাইলিশ লুক।',
            longDesc: 'যেকোনো পার্টি বা অফিসিয়াল ব্যবহারের জন্য আদর্শ মার্জিত ডিজাইনের লেডিস ব্যাগ। এতে রয়েছে টেকসই চেইন ও মসৃণ মেটাল অ্যাকসেন্ট।'
          },
          {
            id: 'sample-1',
            title: 'আল্ট্রা স্লিম স্মার্টওয়াচ সিরিজ ৯ (AMOLED HD Display)',
            price: 2850,
            salePrice: 2850,
            regularPrice: 3800,
            category: 'স্মার্ট গ্যাজেটস',
            brand: 'ApexTech',
            sku: 'APX-9001',
            stock: 45,
            badge: '২৫% ছাড়',
            images: [
              'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
            ],
            shortDesc: 'প্রিমিয়াম AMOLED HD ডিসপ্লে, ব্লুটুথ কলিং, হেলথ ও স্লিপ ট্র্যাকিং এবং ৪০ ঘণ্টা ব্যাটারি ব্যাকআপ।',
            longDesc: 'স্মার্টওয়াচ সিরিজ ৯ একটি অত্যাধুনিক পরিধেয় প্রযুক্তি। আল্ট্রা-শার্প উজ্জ্বল ডিসপ্লে ও একাধিক স্পোর্টস মোড সম্বলিত।'
          },
          {
            id: 'sample-2',
            title: 'নয়েজ ক্যানসেলিং ওয়্যারলেস ব্লুটুথ হেডফোন প্রো',
            price: 3200,
            salePrice: 3200,
            regularPrice: 4500,
            category: 'স্মার্ট গ্যাজেটস',
            brand: 'SonicWave',
            sku: 'SNW-2040',
            stock: 30,
            badge: 'বেস্টসেলার',
            images: [
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
            ],
            shortDesc: 'অ্যাক্টিভ নয়েজ ক্যান্সেলেশন (ANC) ও ডিপ মেগা বেস স্টুডিও সাউন্ড কোয়ালিটি।',
            longDesc: 'উচ্চমানের মিউজিক ও কলিংয়ের জন্য ডিজাইন করা হয়েছে এই হেডফোনটি।'
          }
        ];

        if (!pData) {
          pData = demoCatalog.find(p => p.id === productId);
        }

        // Graceful fallback for any unknown or test ID
        if (!pData) {
          const fallbackTemplate = demoCatalog[0];
          pData = {
            ...fallbackTemplate,
            id: productId,
            title: 'প্রিমিয়াম প্রোডাক্ট (আইডি: ' + productId + ')'
          };
        }

        // Normalize Product Properties for robust UI rendering
        const finalRegularPrice = Number(pData.regularPrice || pData.originalPrice || pData.price || pData.salePrice) || 0;
        const finalSalePrice = Number(pData.salePrice || pData.price || finalRegularPrice) || finalRegularPrice;
        const finalImages = (Array.isArray(pData.images) && pData.images.length > 0)
          ? pData.images
          : (pData.image ? [pData.image] : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80']);

        const normalized = {
          ...pData,
          title: pData.title || pData.name || 'পণ্য',
          regularPrice: Math.max(finalRegularPrice, finalSalePrice),
          salePrice: finalSalePrice,
          price: finalSalePrice,
          images: finalImages,
          image: finalImages[0],
          stock: pData.stock !== undefined ? Number(pData.stock) : 35,
          shortDesc: pData.shortDesc || pData.description || 'সেরা মানের পণ্য, দ্রুততম হোম ডেলিভারি ও সহজ রিটার্ন পলিসি।',
          longDesc: pData.longDesc || pData.description || pData.shortDesc || 'সেরা মানের পণ্য, দ্রুততম হোম ডেলিভারি ও ১০০% ক্যাশ অন ডেলিভারি সুবিধা।'
        };

        setProduct(normalized);
        setActiveImage(finalImages[0]);

        // Browser Document Title Update with Product Title
        document.title = normalized.title + ' | ' + storeName;

        // 3. Fetch Related Products
        try {
          const allProdsSnap = await getDocs(query(collection(db, 'tenants/' + tenantId + '/products'), limit(6)));
          let others = allProdsSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(p => p.id !== productId)
            .slice(0, 4);

          if (others.length === 0) {
            others = demoCatalog
              .filter(p => p.id !== productId)
              .slice(0, 4);
          }
          setRelatedProducts(others);
        } catch (e) {
          setRelatedProducts(demoCatalog.filter(p => p.id !== productId).slice(0, 4));
        }

      } catch (err) {
        console.error('Error in fetchProductData:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [tenantId, productId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      title: product.title,
      price: product.salePrice || product.regularPrice,
      quantity,
      image: product.images?.[0] || activeImage
    });
    showToast('"' + product.title + '" কার্টে যুক্ত হয়েছে!');
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      title: product.title,
      price: product.salePrice || product.regularPrice,
      quantity,
      image: product.images?.[0] || activeImage
    });
    router.push('/' + tenantId + '/checkout');
  };

  if (loading) {
    return (
      <StorefrontLayout tenantId={tenantId}>
        <div className="min-h-[60vh] flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold text-slate-500">প্রোডাক্টের বিবরণ লোড হচ্ছে...</p>
        </div>
      </StorefrontLayout>
    );
  }

  if (!product) {
    return (
      <StorefrontLayout tenantId={tenantId}>
        <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-black text-2xl mb-4">
            !
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">প্রোডাক্টটি খুঁজে পাওয়া যায়নি</h2>
          <p className="text-slate-500 text-sm mb-6">সম্ভবত পণ্যটি মুছে ফেলা হয়েছে অথবা লিঙ্কটি পরিবর্তিত হয়েছে।</p>
          <Link
            href={'/' + tenantId}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition shadow-md"
          >
            হোম পেজে ফিরে যান
          </Link>
        </div>
      </StorefrontLayout>
    );
  }

  const discountAmount = product.regularPrice && product.salePrice && product.regularPrice > product.salePrice 
    ? product.regularPrice - product.salePrice 
    : 0;

  const discountPercent = discountAmount > 0 
    ? Math.round((discountAmount / product.regularPrice) * 100) 
    : 0;

  const hotline = storeSettings?.phone || '01700-000000';
  const whatsappNumber = hotline.replace(/[^0-9]/g, '');
  const whatsappUrl = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent('হ্যালো, আমি "' + product.title + '" পণ্যটি অর্ডার করতে চাই। মূল্য: ৳' + (product.salePrice || product.regularPrice) + '। প্রোডাক্ট আইডি: ' + product.id);

  return (
    <StorefrontLayout tenantId={tenantId}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="bg-slate-100/70 border-b border-slate-200/80 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
            <Link href={'/' + tenantId} className="hover:text-blue-600 transition">হোম</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href={'/' + tenantId + '#products'} className="hover:text-blue-600 transition">সকল প্রোডাক্ট</Link>
            {product.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-700">{product.category}</span>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-none">{product.title}</span>
          </div>
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <section className="py-10 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Image Gallery (Span 6) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Featured Display */}
            <div className="relative aspect-square rounded-3xl bg-white border border-slate-200/80 shadow-md overflow-hidden flex items-center justify-center group">
              <img 
                src={activeImage} 
                alt={product.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.badge && (
                  <span className="bg-red-600 text-white text-[11px] font-black uppercase px-3 py-1 rounded-xl shadow-md">
                    {product.badge}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-xl shadow-md">
                    {discountPercent}% ছাড়
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={'w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 cursor-pointer ' + (
                      activeImage === img ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                    )}
                  >
                    <img src={img} alt={'Thumbnail ' + (idx + 1)} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Buy Box (Span 6) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Category, Brand & SKU Tags */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-xl border border-blue-200/60">
                {product.category || 'সাধারণ'}
              </span>
              {product.brand && (
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-xl border border-slate-200">
                  ব্র্যান্ড: {product.brand}
                </span>
              )}
              {product.sku && (
                <span className="bg-slate-100 text-slate-600 font-mono text-xs font-semibold px-3 py-1 rounded-xl border border-slate-200">
                  SKU: {product.sku}
                </span>
              )}
            </div>

            {/* Product Title (NO STAR RATING) */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {product.title}
              </h1>
            </div>

            {/* Pricing Section */}
            <div className="p-5 rounded-2xl bg-slate-100/70 border border-slate-200 flex items-baseline gap-4 flex-wrap">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-blue-600">
                  ৳{(product.salePrice || product.regularPrice).toLocaleString()}
                </span>
                {product.regularPrice && product.salePrice && product.regularPrice > product.salePrice && (
                  <span className="text-lg sm:text-xl text-slate-400 line-through font-bold">
                    ৳{product.regularPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {discountAmount > 0 && (
                <span className="text-xs font-black bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-lg">
                  ৳{discountAmount.toLocaleString()} সাশ্রয়
                </span>
              )}

              <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>ইন স্টক ({product.stock || 25} পিস অবশিষ্ট)</span>
              </span>
            </div>

            {/* Short Description */}
            {product.shortDesc && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {product.shortDesc}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">পরিমাণ:</span>
              <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-black text-sm text-slate-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-blue-400" />
                <span>কার্টে যোগ করুন</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>এখনই অর্ডার করুন</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* WhatsApp Order Button */}
            {hotline && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>হোয়াটসঅ্যাপে সরাসরি অর্ডার করুন ({hotline})</span>
              </a>
            )}

            {/* Trust & Guarantee Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80">
                <Truck className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-slate-900 leading-tight">হোম ডেলিভারি</span>
                  <span className="text-[10px] text-slate-400">ক্যাশ অন ডেলিভারি</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80">
                <RotateCcw className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-slate-900 leading-tight">সহজ রিটার্ন</span>
                  <span className="text-[10px] text-slate-400">৭ দিনের পলিসি</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 col-span-2 sm:col-span-1">
                <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-slate-900 leading-tight">১০০% আসল পণ্য</span>
                  <span className="text-[10px] text-slate-400">কোয়ালিটি অ্যাসিউরেন্স</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Detailed Description & Specifications Section */}
        <div className="mt-16 pt-12 border-t border-slate-200 space-y-8">
          <div className="border-b border-slate-200 pb-3 flex items-center gap-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 pb-2 border-b-2 border-blue-600 -mb-3.5">
              পণ্যের বিস্তারিত বিবরণ (Full Description)
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs prose max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-4">
            {product.longDesc ? (
              <div className="whitespace-pre-line font-normal">
                {product.longDesc}
              </div>
            ) : product.description ? (
              <div className="whitespace-pre-line font-normal">
                {product.description}
              </div>
            ) : (
              <p className="text-slate-400">এই পণ্যের বিস্তারিত বিবরণ শীঘ্রই আপডেট করা হবে।</p>
            )}
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">সম্পর্কিত অন্যান্য পণ্য</h3>
                <p className="text-xs text-slate-500 mt-0.5">আপনার পছন্দের সাথে মিল রেখে নির্বাচিত পণ্য</p>
              </div>
              <Link 
                href={'/' + tenantId + '#products'} 
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>সব পণ্য দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map(rel => {
                const relImg = rel.images?.[0] || rel.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';
                const relPrice = Number(rel.salePrice || rel.regularPrice || rel.price || 0);

                return (
                  <div key={rel.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
                    <Link href={'/' + tenantId + '/product/' + rel.id} className="aspect-square bg-slate-100 relative overflow-hidden block">
                      <img 
                        src={relImg} 
                        alt={rel.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                      />
                    </Link>

                    <div className="p-4 flex flex-col flex-1">
                      <span className="text-[10px] font-bold text-blue-600 uppercase mb-1 block">{rel.category || 'Special'}</span>
                      <Link href={'/' + tenantId + '/product/' + rel.id}>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug mb-3 hover:text-blue-600 transition">
                          {rel.title}
                        </h4>
                      </Link>

                      <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-base font-black text-slate-900">৳{relPrice.toLocaleString()}</span>
                        <Link 
                          href={'/' + tenantId + '/product/' + rel.id}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition text-xs font-bold"
                          title="দেখুন"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </section>
    </StorefrontLayout>
  );
}
