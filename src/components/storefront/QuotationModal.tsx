'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Service } from '@/types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  service?: Service;
  tenantId: string;
}

export const QuotationModal = ({ isOpen, onClose, service, tenantId }: Props) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    companyName: '',
    projectScope: ''
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addDoc(collection(db, `tenants/${tenantId}/quotations`), {
        ...formData,
        serviceId: service?.id || null,
        serviceName: service?.title || 'General Inquiry',
        status: 'pending',
        createdAt: Date.now()
      });
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setFormData({ customerName: '', customerPhone: '', companyName: '', projectScope: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting quotation:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold">Request Quotation</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-2">Request Submitted!</h4>
              <p className="text-gray-600">Our engineering team will contact you shortly to discuss your requirements.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {service && (
                <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm mb-4">
                  Requesting quotation for: <strong>{service.title}</strong>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Full Name *</label>
                  <input 
                    required 
                    type="text" 
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                  <input 
                    required 
                    type="tel" 
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                    placeholder="e.g. 01XXXXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Company Name (Optional)</label>
                <input 
                  type="text" 
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                  placeholder="e.g. Acme Industries Ltd."
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Project Scope / Requirements *</label>
                <textarea 
                  required 
                  name="projectScope"
                  value={formData.projectScope}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" 
                  placeholder="Describe your technical requirements, site location, capacity needs, etc."
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
