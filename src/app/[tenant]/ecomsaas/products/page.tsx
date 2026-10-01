'use client';
// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { 
  Package, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Layers, 
  Sparkles, 
  Image as ImageIcon, 
  CheckCircle2, 
  ExternalLink,
  DollarSign,
  Tag
} from 'lucide-react';
import Link from 'next/link';

export default function TenantProductsPage() {
  const params = useParams();
  const tenantId = (params?.tenant as string) || '';

  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Form State
  const [productForm, setProductForm] = useState({
    title: '',
    category: '',
    regularPrice: 0,
    salePrice: 0,
    stock: 50,
    imageUrl: '',
    description: '',
    isFeatured: true,
    badge: 'HOT DEAL'
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    imageUrl: '',
    icon: 'ShoppingBag'
  });

  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      // 1. Fetch Products
      const pSnap = await getDocs(collection(db, `tenants/${tenantId}/products`));
      const pList = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(pList);

      // 2. Fetch Categories
      const cSnap = await getDocs(collection(db, `tenants/${tenantId}/categories`));
      const cList = cSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCategories(cList);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  // Seed Demo Catalog
  const handleSeedDemoData = async () => {
    if (!confirm('আপনি কি টেস্ট করার জন্য কিছু প্রফেশনাল ডেমো ক্যাটাগরি ও প্রোডাক্ট এই স্টোরে যোগ করতে চান?')) return;
    setLoading(true);

    try {
      const demoCategories = [
        { id: 'cat-fashion', name: 'ফ্যাশন & ক্লথিং', slug: 'fashion', imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=300&q=80' },
        { id: 'cat-gadget', name: 'স্মার্ট গ্যাজেটস', slug: 'gadgets', imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80' },
        { id: 'cat-watch', name: 'লাক্সারি ঘড়ি', slug: 'watches', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80' },
        { id: 'cat-shoes', name: 'প্রিমিয়াম জুতা', slug: 'shoes', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' },
        { id: 'cat-home', name: 'হোম & লিভিং', slug: 'home', imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=300&q=80' }
      ];

      for (const cat of demoCategories) {
        await setDoc(doc(db, `tenants/${tenantId}/categories/${cat.id}`), {
          name: cat.name,
          slug: cat.slug,
          imageUrl: cat.imageUrl,
          createdAt: Date.now()
        });
      }

      const demoProducts = [
        {
          title: 'আল্ট্রা স্লিম স্মার্টওয়াচ সিরিজ ৯ (AMOLED Display)',
          category: 'স্মার্ট গ্যাজেটস',
          regularPrice: 3800,
          salePrice: 2850,
          stock: 45,
          images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80'],
          badge: '২৫% ছাড়',
          rating: 4.9,
          description: 'ব্লুটুথ কলিং, হার্ট রেট ও স্লিপ ট্র্যাকারসহ ওয়াটারপ্রুফ প্রিমিয়াম স্মার্টওয়াচ।'
        },
        {
          title: 'নয়েজ ক্যানসেলিং ওয়্যারলেস হেডফোন প্রো',
          category: 'স্মার্ট গ্যাজেটস',
          regularPrice: 4500,
          salePrice: 3200,
          stock: 30,
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'],
          badge: 'বেস্টসেলার',
          rating: 4.8,
          description: 'হাই-ফাই স্টুডিও সাউন্ড এবং ৪০ ঘণ্টার দীর্ঘ ব্যাটারি ব্যাকআপ।'
        },
        {
          title: 'প্রিমিয়াম জেনুইন লেদার ওয়ালেট ও বেল্ট কম্বো',
          category: 'ফ্যাশন & ক্লথিং',
          regularPrice: 2200,
          salePrice: 1550,
          stock: 60,
          images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80'],
          badge: 'হট ডিল',
          rating: 5.0,
          description: '১০০% খাঁটি চামড়ার তৈরি আধুনিক ডিজাইনের মানিব্যাগ ও বেল্ট গিফট বক্স।'
        },
        {
          title: 'ক্লাসিক ক্রোনোগ্রাফ ওয়াটারপ্রুফ রিস্ট ওয়াচ',
          category: 'লাক্সারি ঘড়ি',
          regularPrice: 5200,
          salePrice: 3950,
          stock: 25,
          images: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80'],
          badge: 'নিউ অ্যারাইভাল',
          rating: 4.9,
          description: 'স্টেইনলেস স্টিল চেইন ও স্ক্র্যাচপ্রুফ স্যাফায়ার গ্লাস ঘড়ি।'
        },
        {
          title: 'এয়ার কুশন লাইটওয়েট রানিং স্নিকার্স',
          category: 'প্রিমিয়াম জুতা',
          regularPrice: 3200,
          salePrice: 2400,
          stock: 40,
          images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'],
          badge: 'জনপ্রিয়',
          rating: 4.7,
          description: 'প্রতিদিনের হাঁটাচলা ও দৌড়ানোর জন্য অত্যন্ত আরামদায়ক ও নরম সোলের জুতো।'
        },
        {
          title: 'মিনি পোর্টেবল ব্লুটুথ স্পিকার (হেভি বেস)',
          category: 'স্মার্ট গ্যাজেটস',
          regularPrice: 1800,
          salePrice: 1250,
          stock: 80,
          images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80'],
          badge: 'অফার',
          rating: 4.8,
          description: '৩৬০ ডিগ্রি সারাউন্ড সাউন্ড এবং আরজিবি অ্যাম্বিয়েন্ট লাইটিংযুক্ত স্পিকার।'
        }
      ];

      for (const prod of demoProducts) {
        await addDoc(collection(db, `tenants/${tenantId}/products`), {
          title: prod.title,
          category: prod.category,
          regularPrice: prod.regularPrice,
          salePrice: prod.salePrice,
          stock: prod.stock,
          images: prod.images,
          badge: prod.badge,
          rating: prod.rating,
          description: prod.description,
          createdAt: Date.now()
        });
      }

      alert('সফলভাবে ডেমো ক্যাটাগরি ও প্রোডাক্ট আপনার স্টোরে যুক্ত করা হয়েছে!');
      fetchData();
    } catch (err: any) {
      alert('Error seeding demo catalog: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: productForm.title.trim(),
        category: productForm.category,
        regularPrice: Number(productForm.regularPrice),
        salePrice: Number(productForm.salePrice) || Number(productForm.regularPrice),
        stock: Number(productForm.stock) || 0,
        images: productForm.imageUrl ? [productForm.imageUrl.trim()] : [],
        description: productForm.description,
        badge: productForm.badge,
        updatedAt: Date.now()
      };

      if (editingProduct) {
        await setDoc(doc(db, `tenants/${tenantId}/products/${editingProduct.id}`), payload, { merge: true });
        alert('প্রোডাক্ট সফলভাবে আপডেট করা হয়েছে!');
      } else {
        await addDoc(collection(db, `tenants/${tenantId}/products`), {
          ...payload,
          createdAt: Date.now()
        });
        alert('নতুন প্রোডাক্ট সফলভাবে যুক্ত করা হয়েছে!');
      }

      setShowProductModal(false);
      setEditingProduct(null);
      fetchData();
    } catch (err: any) {
      alert('Error saving product: ' + err.message);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`আপনি কি "${name}" প্রোডাক্টটি ডিলিট করতে নিশ্চিত?`)) return;
    try {
      await deleteDoc(doc(db, `tenants/${tenantId}/products/${id}`));
      setProducts(products.filter(p => p.id !== id));
    } catch (err: any) {
      alert('Error deleting product: ' + err.message);
    }
  };

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = categoryForm.slug.trim().toLowerCase() || categoryForm.name.toLowerCase().replace(/\s+/g, '-');
      const payload = {
        name: categoryForm.name.trim(),
        slug,
        imageUrl: categoryForm.imageUrl.trim(),
        updatedAt: Date.now()
      };

      if (editingCategory) {
        await setDoc(doc(db, `tenants/${tenantId}/categories/${editingCategory.id}`), payload, { merge: true });
      } else {
        await addDoc(collection(db, `tenants/${tenantId}/categories`), {
          ...payload,
          createdAt: Date.now()
        });
      }

      setShowCategoryModal(false);
      setEditingCategory(null);
      fetchData();
    } catch (err: any) {
      alert('Error saving category: ' + err.message);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`ক্যাটাগরি "${name}" ডিলিট করতে চান?`)) return;
    try {
      await deleteDoc(doc(db, `tenants/${tenantId}/categories/${id}`));
      setCategories(categories.filter(c => c.id !== id));
    } catch (err: any) {
      alert('Error deleting category: ' + err.message);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Package className="w-7 h-7 text-blue-600" />
            প্রোডাক্ট ও ক্যাটাগরি ম্যানেজমেন্ট
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            আপনার অনলাইন স্টোরের পণ্য তালিকা, স্টক এবং থাম্বনেইল ক্যাটাগরি নিয়ন্ত্রণ করুন
          </p>
        </div>

        <div className="flex items-center gap-3">
          {products.length === 0 && (
            <button
              onClick={handleSeedDemoData}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow flex items-center gap-2 text-sm transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>ডেমো পণ্য ও ক্যাটাগরি লোড করুন</span>
            </button>
          )}

          {activeTab === 'products' ? (
            <button
              onClick={() => {
                setEditingProduct(null);
                setProductForm({
                  title: '',
                  category: categories[0]?.name || 'সাধারণ',
                  regularPrice: 0,
                  salePrice: 0,
                  stock: 50,
                  imageUrl: '',
                  description: '',
                  isFeatured: true,
                  badge: 'HOT DEAL'
                });
                setShowProductModal(true);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 text-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন প্রোডাক্ট যোগ করুন</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryForm({ name: '', slug: '', imageUrl: '', icon: 'ShoppingBag' });
                setShowCategoryModal(true);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 text-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ক্যাটাগরি যোগ করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'products' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>সকল প্রোডাক্ট ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'categories' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>থাম্বনেইল ক্যাটাগরি ({categories.length})</span>
        </button>
      </div>

      {/* Search Input for Products */}
      {activeTab === 'products' && (
        <div className="relative mb-6">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="পণ্য বা ক্যাটাগরি দিয়ে সার্চ করুন..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      )}

      {/* Products Tab View */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-semibold text-slate-600">কোন প্রোডাক্ট পাওয়া যায়নি</p>
              <p className="text-xs text-slate-400 mt-1">উপরে "নতুন প্রোডাক্ট যোগ করুন" বাটনে ক্লিক করে পণ্য তৈরি করুন।</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">পণ্য</th>
                    <th className="py-3.5 px-4">ক্যাটাগরি</th>
                    <th className="py-3.5 px-4">মূল্য</th>
                    <th className="py-3.5 px-4">অফার মূল্য</th>
                    <th className="py-3.5 px-4">স্টক</th>
                    <th className="py-3.5 px-4">ব্যাজ</th>
                    <th className="py-3.5 px-6 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden shrink-0">
                            {p.images && p.images[0] ? (
                              <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block line-clamp-1">{p.title}</span>
                            <span className="text-xs text-slate-400">ID: {p.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-600">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          {p.category || 'সাধারণ'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">৳{p.regularPrice}</td>
                      <td className="py-4 px-4 font-bold text-emerald-600">৳{p.salePrice || p.regularPrice}</td>
                      <td className="py-4 px-4">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          (p.stock || 0) > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {p.stock || 0} পিস
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {p.badge && (
                          <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-200/50">
                            {p.badge}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setProductForm({
                                title: p.title || '',
                                category: p.category || '',
                                regularPrice: p.regularPrice || 0,
                                salePrice: p.salePrice || 0,
                                stock: p.stock || 0,
                                imageUrl: p.images?.[0] || '',
                                description: p.description || '',
                                isFeatured: p.isFeatured ?? true,
                                badge: p.badge || ''
                              });
                              setShowProductModal(true);
                            }}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="এডিট করুন"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.title)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="ডিলিট করুন"
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
      )}

      {/* Categories Tab View */}
      {activeTab === 'categories' && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map(c => (
            <div key={c.id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Layers className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{c.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">/{c.slug}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setEditingCategory(c);
                    setCategoryForm({
                      name: c.name || '',
                      slug: c.slug || '',
                      imageUrl: c.imageUrl || '',
                      icon: c.icon || 'ShoppingBag'
                    });
                    setShowCategoryModal(true);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                >
                  এডিট
                </button>
                <button
                  onClick={() => handleDeleteCategory(c.id, c.name)}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                >
                  ডিলিট
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black text-slate-900 mb-4">
              {editingProduct ? 'প্রোডাক্ট এডিট করুন' : 'নতুন প্রোডাক্ট যুক্ত করুন'}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">প্রোডাক্টের নাম *</label>
                <input 
                  required
                  type="text"
                  value={productForm.title}
                  onChange={e => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  placeholder="যেমন: স্মার্টওয়াচ সিরিজ ৯"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ক্যাটাগরি</label>
                  <input 
                    type="text"
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="যেমন: গ্যাজেটস"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ব্যাজ / ট্যাগ</label>
                  <input 
                    type="text"
                    value={productForm.badge}
                    onChange={e => setProductForm({ ...productForm, badge: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="যেমন: ২৫% ছাড় / হট ডিল"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">রেগুলার মূল্য (৳)</label>
                  <input 
                    required
                    type="number"
                    value={productForm.regularPrice}
                    onChange={e => setProductForm({ ...productForm, regularPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">অফার মূল্য (৳)</label>
                  <input 
                    type="number"
                    value={productForm.salePrice}
                    onChange={e => setProductForm({ ...productForm, salePrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">স্টক সংখ্যা</label>
                  <input 
                    type="number"
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ইমেজ লিঙ্ক (Image URL)</label>
                <input 
                  type="text"
                  value={productForm.imageUrl}
                  onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">বিবরণ (Description)</label>
                <textarea 
                  rows={3}
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  placeholder="পণ্যের বৈশিষ্ট্য ও বর্ণনা..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-black text-slate-900 mb-4">
              {editingCategory ? 'ক্যাটাগরি এডিট' : 'নতুন থাম্বনেইল ক্যাটাগরি'}
            </h2>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ক্যাটাগরির নাম *</label>
                <input 
                  required
                  type="text"
                  value={categoryForm.name}
                  onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  placeholder="যেমন: স্মার্ট গ্যাজেটস"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">স্লাগ (Slug)</label>
                <input 
                  type="text"
                  value={categoryForm.slug}
                  onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                  placeholder="যেমন: gadgets"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">থাম্বনেইল ইমেজ URL</label>
                <input 
                  type="text"
                  value={categoryForm.imageUrl}
                  onChange={e => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition cursor-pointer"
                >
                  ক্যাটাগরি সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
