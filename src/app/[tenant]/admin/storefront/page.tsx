// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { LayoutTemplate, GripVertical, Plus, Save, Trash2 } from 'lucide-react';
import type { LayoutBlock, LayoutBlockType } from '@/types';

export default function StorefrontBuilder({ params }: { params: any }) {
  const tenantId = params.tenantId;
  const [blocks, setBlocks] = useState<LayoutBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const docRef = doc(db, `tenants/${tenantId}/settings/homepage_layout`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBlocks(docSnap.data().blocks || []);
        } else {
          // Default block if nothing exists
          setBlocks([
            { id: '1', type: 'hero_slider', order: 1, data: { title: 'Welcome to our store', subtitle: '', ctaText: 'Shop Now', ctaLink: '/products' } }
          ]);
        }
      } catch (error) {
        console.error("Error fetching layout:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLayout();
  }, [tenantId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, `tenants/${tenantId}/settings/homepage_layout`), { blocks });
      alert('Storefront layout saved successfully!');
    } catch (error) {
      console.error("Error saving layout:", error);
      alert('Failed to save layout.');
    } finally {
      setSaving(false);
    }
  };

  const addBlock = (type: LayoutBlockType) => {
    const newBlock: LayoutBlock = {
      id: Date.now().toString(),
      type,
      order: blocks.length + 1,
      data: {}
    };

    if (type === 'hero_slider') newBlock.data = { title: 'New Hero', subtitle: '', ctaText: 'Shop Now', ctaLink: '/' };
    if (type === 'product_grid') newBlock.data = { title: 'Featured Products', viewAllLink: '/products' };
    if (type === 'service_cards') newBlock.data = { title: 'Our Services' };
    if (type === 'banner_cta') newBlock.data = { title: 'Promo Banner', subtitle: '50% Off', ctaText: 'Claim', ctaLink: '/' };
    if (type === 'custom_html') newBlock.data = { htmlContent: '<div>Your HTML here</div>' };

    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const updateBlockData = (id: string, key: string, value: any) => {
    setBlocks(blocks.map(b => {
      if (b.id === id) {
        return { ...b, data: { ...b.data, [key]: value } };
      }
      return b;
    }));
  };

  if (loading) return <div className="p-10">Loading builder...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutTemplate className="w-8 h-8 text-blue-600" /> Storefront Builder
          </h1>
          <p className="text-gray-500 mt-1">Design your homepage layout by adding and configuring blocks.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow disabled:opacity-70"
        >
          <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Layout'}
        </button>
      </div>

      <div className="space-y-6">
        {blocks.map((block, index) => (
          <div key={block.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden group">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                <span className="font-bold text-gray-700 capitalize px-3 py-1 bg-white rounded-md border text-sm shadow-sm">
                  {block.type.replace('_', ' ')}
                </span>
              </div>
              <button onClick={() => removeBlock(block.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Dynamic Form fields based on block type */}
              {block.type === 'hero_slider' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Headline</label>
                    <input type="text" value={block.data.title || ''} onChange={e => updateBlockData(block.id, 'title', e.target.value)} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Subtitle</label>
                    <input type="text" value={block.data.subtitle || ''} onChange={e => updateBlockData(block.id, 'subtitle', e.target.value)} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Image URL</label>
                    <input type="text" value={block.data.imageUrl || ''} onChange={e => updateBlockData(block.id, 'imageUrl', e.target.value)} placeholder="https://..." className="w-full p-2 border rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Button Text</label>
                      <input type="text" value={block.data.ctaText || ''} onChange={e => updateBlockData(block.id, 'ctaText', e.target.value)} className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Button Link</label>
                      <input type="text" value={block.data.ctaLink || ''} onChange={e => updateBlockData(block.id, 'ctaLink', e.target.value)} className="w-full p-2 border rounded-lg" />
                    </div>
                  </div>
                </div>
              )}

              {block.type === 'product_grid' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Section Title</label>
                    <input type="text" value={block.data.title || ''} onChange={e => updateBlockData(block.id, 'title', e.target.value)} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">View All Link</label>
                    <input type="text" value={block.data.viewAllLink || ''} onChange={e => updateBlockData(block.id, 'viewAllLink', e.target.value)} className="w-full p-2 border rounded-lg" />
                  </div>
                </div>
              )}

              {block.type === 'custom_html' && (
                <div>
                  <label className="block text-sm font-semibold mb-1">Raw HTML/iFrame</label>
                  <textarea rows={4} value={block.data.htmlContent || ''} onChange={e => updateBlockData(block.id, 'htmlContent', e.target.value)} className="w-full p-2 border rounded-lg font-mono text-sm" placeholder="<div>Hello World</div>" />
                </div>
              )}

              {/* Add form handling for other block types similarly... */}
              
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 border-2 border-dashed border-gray-300 rounded-2xl text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Add a new layout block</h3>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => addBlock('hero_slider')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-blue-300 transition shadow-sm">
            <Plus className="w-4 h-4 text-blue-500" /> Hero Slider
          </button>
          <button onClick={() => addBlock('product_grid')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-blue-300 transition shadow-sm">
            <Plus className="w-4 h-4 text-blue-500" /> Product Grid
          </button>
          <button onClick={() => addBlock('service_cards')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-blue-300 transition shadow-sm">
            <Plus className="w-4 h-4 text-blue-500" /> Service Cards
          </button>
          <button onClick={() => addBlock('banner_cta')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-blue-300 transition shadow-sm">
            <Plus className="w-4 h-4 text-blue-500" /> Promo Banner
          </button>
          <button onClick={() => addBlock('custom_html')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-blue-300 transition shadow-sm">
            <Plus className="w-4 h-4 text-blue-500" /> Custom HTML
          </button>
        </div>
      </div>
    </div>
  );
}
