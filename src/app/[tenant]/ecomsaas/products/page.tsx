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
  Tag,
  Star,
  Upload,
  Link as LinkIcon,
  X,
  Wand2,
  FolderPlus,
  Bookmark,
  ShieldCheck,
  Check
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

  // Quick Category Modal inside Product form
  const [showQuickCatModal, setShowQuickCatModal] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [quickCatImage, setQuickCatImage] = useState('');

  // Image URL input helper
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Product Form State
  const [productForm, setProductForm] = useState({
    title: '',
    sku: '',
    brand: '',
    category: '',
    regularPrice: 0,
    salePrice: 0,
    stock: 50,
    images: [] as string[],
    badge: 'HOT DEAL',
    shortDesc: '',
    longDesc: '',
    tags: '',
    seoDescription: '',
    seoKeywords: '',
    isFeatured: true
  });

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    imageUrl: ''
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

  // Handle Image Upload via Local File Picker (converts to base64 Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setProductForm(prev => ({
            ...prev,
            images: [...prev.images, reader.result as string]
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Add Image via URL input
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()]
    }));
    setImageUrlInput('');
  };

  // Set an image as Featured (move to index 0)
  const handleSetFeaturedImage = (index: number) => {
    setProductForm(prev => {
      const updated = [...prev.images];
      const [selected] = updated.splice(index, 1);
      return { ...prev, images: [selected, ...updated] };
    });
  };

  // Remove an image from gallery
  const handleRemoveImage = (index: number) => {
    setProductForm(prev => {
      const updated = [...prev.images];
      updated.splice(index, 1);
      return { ...prev, images: updated };
    });
  };

  // Auto Generate SKU
  const handleGenerateSKU = () => {
    const prefix = tenantId.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase() || 'PRD';
    const rand = Math.floor(1000 + Math.random() * 9000);
    setProductForm(prev => ({
      ...prev,
      sku: `${prefix}-${rand}`
    }));
  };

  // Auto Generate SEO Meta Description from Short Description
  const handleAutoGenerateSEO = () => {
    const source = productForm.shortDesc.trim() || productForm.title.trim();
    if (!source) {
      alert('দয়া করে আগে প্রোডাক্টের নাম বা শর্ট ডেসক্রিপশন লিখুন।');
      return;
    }
    const cleanSummary = source.length > 155 ? source.substring(0, 152) + '...' : source;
    const kw = [
      productForm.title,
      productForm.category,
      productForm.brand,
      'online shopping',
      'cash on delivery',
      'bangladesh'
    ].filter(Boolean).join(', ').toLowerCase();

    setProductForm(prev => ({
      ...prev,
      seoDescription: cleanSummary,
      seoKeywords: prev.seoKeywords || kw
    }));
  };

  // Quick Create Category
  const handleQuickCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCatName.trim()) return;
    const slug = quickCatName.trim().toLowerCase().replace(/\s+/g, '-');

    try {
      const docRef = await addDoc(collection(db, `tenants/${tenantId}/categories`), {
        name: quickCatName.trim(),
        slug,
        imageUrl: quickCatImage.trim() || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80',
        createdAt: Date.now()
      });

      const newCat = { id: docRef.id, name: quickCatName.trim(), slug };
      setCategories(prev => [...prev, newCat]);
      setProductForm(prev => ({ ...prev, category: quickCatName.trim() }));
      setShowQuickCatModal(false);
      setQuickCatName('');
      setQuickCatImage('');
      alert(`ক্যাটাগরি "${quickCatName}" সফলভাবে তৈরি ও নির্বাচিত হয়েছে!`);
    } catch (err: any) {
      alert('Error creating category: ' + err.message);
    }
  };

  // Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title.trim()) return alert('প্রোডাক্টের নাম লিখুন।');

    try {
      const payload = {
        title: productForm.title.trim(),
        sku: productForm.sku.trim(),
        brand: productForm.brand.trim(),
        category: productForm.category || (categories[0]?.name || 'সাধারণ'),
        regularPrice: Number(productForm.regularPrice),
        salePrice: Number(productForm.salePrice) || Number(productForm.regularPrice),
        stock: Number(productForm.stock) || 0,
        images: productForm.images,
        badge: productForm.badge.trim(),
        shortDesc: productForm.shortDesc.trim(),
        longDesc: productForm.longDesc.trim(),
        description: productForm.shortDesc.trim() || productForm.longDesc.trim(),
        tags: productForm.tags ? productForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        seo: {
          metaDescription: productForm.seoDescription.trim(),
          metaKeywords: productForm.seoKeywords.trim()
        },
        isFeatured: productForm.isFeatured,
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
    p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
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
            ইমেজ আপলোড, গ্যালারি, শর্ট/লং ডেসক্রিপশন, প্রোডাক্ট এসইও ও ক্যাটাগরি নিয়ন্ত্রণ করুন
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Add Category Button */}
          <button
            onClick={() => {
              setEditingCategory(null);
              setCategoryForm({ name: '', slug: '', imageUrl: '' });
              setShowCategoryModal(true);
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-sm transition flex items-center gap-2 cursor-pointer border border-slate-200"
          >
            <FolderPlus className="w-4 h-4 text-blue-600" />
            <span>Add Category (ক্যাটাগরি তৈরি)</span>
          </button>

          {/* Add Product Button */}
          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm({
                title: '',
                sku: `${tenantId.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
                brand: '',
                category: categories[0]?.name || 'সাধারণ',
                regularPrice: 0,
                salePrice: 0,
                stock: 50,
                images: [],
                badge: 'HOT DEAL',
                shortDesc: '',
                longDesc: '',
                tags: '',
                seoDescription: '',
                seoKeywords: '',
                isFeatured: true
              });
              setShowProductModal(true);
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 text-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন প্রোডাক্ট যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'products' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>সকল প্রোডাক্ট ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'categories' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>থাম্বনেইল ক্যাটাগরি সমূহ ({categories.length})</span>
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
            placeholder="পণ্য, ক্যাটাগরি বা SKU দিয়ে সার্চ করুন..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      )}

      {/* Products Table View */}
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
                    <th className="py-3.5 px-6">পণ্য ও ইমেজ</th>
                    <th className="py-3.5 px-4">SKU / ব্র্যান্ড</th>
                    <th className="py-3.5 px-4">ক্যাটাগরি</th>
                    <th className="py-3.5 px-4">মূল্য</th>
                    <th className="py-3.5 px-4">অফার মূল্য</th>
                    <th className="py-3.5 px-4">স্টক</th>
                    <th className="py-3.5 px-6 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden shrink-0 relative">
                            {p.images && p.images[0] ? (
                              <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                            {p.images?.length > 1 && (
                              <span className="absolute bottom-0.5 right-0.5 bg-slate-900/80 text-white text-[9px] px-1 rounded font-bold">
                                +{p.images.length - 1}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block line-clamp-1">{p.title}</span>
                            {p.badge && (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 mr-2">
                                {p.badge}
                              </span>
                            )}
                            <span className="text-xs text-slate-400 font-mono">ID: {p.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-xs font-bold text-slate-700 block">{p.sku || 'N/A'}</span>
                        {p.brand && <span className="text-xs text-slate-400">{p.brand}</span>}
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
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setProductForm({
                                title: p.title || '',
                                sku: p.sku || '',
                                brand: p.brand || '',
                                category: p.category || '',
                                regularPrice: p.regularPrice || 0,
                                salePrice: p.salePrice || 0,
                                stock: p.stock || 0,
                                images: p.images || [],
                                badge: p.badge || '',
                                shortDesc: p.shortDesc || '',
                                longDesc: p.longDesc || p.description || '',
                                tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
                                seoDescription: p.seo?.metaDescription || '',
                                seoKeywords: p.seo?.metaKeywords || '',
                                isFeatured: p.isFeatured ?? true
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
                      imageUrl: c.imageUrl || ''
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

      {/* ADVANCED PRODUCT ADD/EDIT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {editingProduct ? 'প্রোডাক্ট এডিট করুন' : 'নতুন প্রোডাক্ট যুক্ত করুন'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">ইমেজ, বিবরণ, এসইও এবং ইনভেন্টরি তথ্য সেট করুন</p>
              </div>
              <button 
                onClick={() => setShowProductModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              
              {/* 1. Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">প্রোডাক্টের নাম *</label>
                  <input 
                    required
                    type="text"
                    value={productForm.title}
                    onChange={e => setProductForm({ ...productForm, title: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-600 outline-none"
                    placeholder="যেমন: আল্ট্রা স্লিম স্মার্টওয়াচ সিরিজ ৯"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category Selection with Instant Add Category */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 uppercase">ক্যাটাগরি *</label>
                      <button
                        type="button"
                        onClick={() => setShowQuickCatModal(true)}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ নতুন ক্যাটাগরি তৈরি</span>
                      </button>
                    </div>

                    <select
                      value={productForm.category}
                      onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none"
                    >
                      {categories.length === 0 && <option value="সাধারণ">সাধারণ</option>}
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">ব্র্যান্ড (Brand)</label>
                    <input 
                      type="text"
                      value={productForm.brand}
                      onChange={e => setProductForm({ ...productForm, brand: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      placeholder="e.g. Apple / Apex"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 uppercase">SKU কোড</label>
                      <button
                        type="button"
                        onClick={handleGenerateSKU}
                        className="text-[10px] font-bold text-blue-600 hover:underline"
                        title="Auto Generate"
                      >
                        Auto
                      </button>
                    </div>
                    <input 
                      type="text"
                      value={productForm.sku}
                      onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                      placeholder="ST1-8761"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">রেগুলার মূল্য (৳) *</label>
                    <input 
                      required
                      type="number"
                      value={productForm.regularPrice}
                      onChange={e => setProductForm({ ...productForm, regularPrice: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">অফার মূল্য (৳)</label>
                    <input 
                      type="number"
                      value={productForm.salePrice}
                      onChange={e => setProductForm({ ...productForm, salePrice: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">স্টক সংখ্যা</label>
                    <input 
                      type="number"
                      value={productForm.stock}
                      onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 2. IMAGE UPLOAD & GALLERY MANAGEMENT */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span>প্রোডাক্ট ইমেজ (ফিচার ও গ্যালারি)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      ১ম ছবিটি হবে <strong>ফিচার ইমেজ</strong>, বাকিগুলো হবে <strong>গ্যালারি ইমেজ</strong>
                    </p>
                  </div>
                </div>

                {/* Upload & URL input controls */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {/* File Upload Button */}
                  <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-blue-400 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50/50 cursor-pointer transition">
                    <Upload className="w-4 h-4" />
                    <span>ডিভাইস থেকে ছবি আপলোড করুন</span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>

                  {/* URL Input */}
                  <div className="flex gap-2">
                    <input 
                      type="url"
                      value={imageUrlInput}
                      onChange={e => setImageUrlInput(e.target.value)}
                      placeholder="বা ইমেজ URL পেস্ট করুন..."
                      className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3.5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                    >
                      যোগ করুন
                    </button>
                  </div>
                </div>

                {/* Images Preview Grid */}
                {productForm.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {productForm.images.map((imgUrl, imgIdx) => (
                      <div key={imgIdx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white aspect-square flex flex-col">
                        <img 
                          src={imgUrl} 
                          alt="Product" 
                          className="w-full h-full object-cover" 
                        />

                        {/* Badge for Featured vs Gallery */}
                        <div className="absolute top-1.5 left-1.5">
                          {imgIdx === 0 ? (
                            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                              ⭐ ফিচার ইমেজ
                            </span>
                          ) : (
                            <span className="bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              গ্যালারি #{imgIdx}
                            </span>
                          )}
                        </div>

                        {/* Action Overlay */}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1.5 p-2 text-center">
                          {imgIdx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetFeaturedImage(imgIdx)}
                              className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded shadow hover:bg-emerald-700 transition w-full"
                            >
                              ফিচার্ড বানান
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(imgIdx)}
                            className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded shadow hover:bg-red-700 transition w-full"
                          >
                            মুছে ফেলুন
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-400 py-3">
                    এখনো কোনো ছবি যোগ করা হয়নি। উপরে ফাইল সিলেক্ট বা URL পেস্ট করুন।
                  </p>
                )}
              </div>

              {/* 3. DESCRIPTIONS (SHORT & LONG) */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    শর্ট ডেসক্রিপশন (Short Description)
                  </label>
                  <input 
                    type="text"
                    value={productForm.shortDesc}
                    onChange={e => setProductForm({ ...productForm, shortDesc: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="যেমন: AMOLED ডিসপ্লে, ব্লুটুথ কলিং ও ৪০ ঘণ্টা ব্যাটারি লাইফ।"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">কার্ডে ও পণ্য ওভারভিউতে সংক্ষিপ্ত পরিচিতি হিসেবে প্রদর্শিত হবে।</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    বিস্তারিত বিবরণ (Long Description)
                  </label>
                  <textarea 
                    rows={4}
                    value={productForm.longDesc}
                    onChange={e => setProductForm({ ...productForm, longDesc: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="পণ্যের বিস্তারিত বৈশিষ্ট্য, স্পেসিফিকেশন, ওয়ারেন্টি ও প্যাকেজের বিবরণ..."
                  />
                </div>
              </div>

              {/* 4. PRODUCT SEO & TAGS */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Product SEO & Tags</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAutoGenerateSEO}
                    className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>অটো তৈরি করুন (Auto Generate)</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    SEO Meta Description
                  </label>
                  <textarea 
                    rows={2}
                    value={productForm.seoDescription}
                    onChange={e => setProductForm({ ...productForm, seoDescription: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                    placeholder="গুগল সার্চ ইঞ্জিনে প্রদর্শনের জন্য মেটা ডেসক্রিপশন..."
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      SEO Keywords
                    </label>
                    <input 
                      type="text"
                      value={productForm.seoKeywords}
                      onChange={e => setProductForm({ ...productForm, seoKeywords: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                      placeholder="smartwatch, gadget, bluetooth calling"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      প্রোডাক্ট ট্যাগস (Tags)
                    </label>
                    <input 
                      type="text"
                      value={productForm.tags}
                      onChange={e => setProductForm({ ...productForm, tags: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                      placeholder="men, watch, premium, electronics"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/25 transition cursor-pointer"
                >
                  {editingProduct ? 'আপডেট করুন' : 'প্রোডাক্ট সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD CATEGORY MODAL (Accessible inside product form) */}
      {showQuickCatModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-blue-600" />
                <span>নতুন ক্যাটাগরি তৈরি</span>
              </h3>
              <button 
                onClick={() => setShowQuickCatModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">ক্যাটাগরির নাম *</label>
                <input 
                  required
                  type="text"
                  value={quickCatName}
                  onChange={e => setQuickCatName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  placeholder="যেমন: ইলেকট্রনিক্স / জুয়েলারি"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">থাম্বনেইল ইমেজ URL</label>
                <input 
                  type="url"
                  value={quickCatImage}
                  onChange={e => setQuickCatImage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickCatModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow transition"
                >
                  ক্যাটাগরি যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-xl font-black text-slate-900">
                {editingCategory ? 'ক্যাটাগরি এডিট' : 'নতুন থাম্বনেইল ক্যাটাগরি তৈরি'}
              </h2>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

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
