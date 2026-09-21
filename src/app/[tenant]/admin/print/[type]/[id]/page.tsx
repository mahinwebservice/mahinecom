'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function PrintSuite({ params }: { params: { tenantId: string, type: string, id: string } }) {
  const { tenantId, type, id } = params;
  const [data, setData] = useState<any>(null);
  const [tenantInfo, setTenantInfo] = useState<any>(null);

  useEffect(() => {
    // Fetch data based on type
    const fetchData = async () => {
      // 1. Fetch Tenant Settings
      const tenantSnap = await getDoc(doc(db, `tenants/${tenantId}/settings/general`));
      if (tenantSnap.exists()) {
        setTenantInfo(tenantSnap.data());
      } else {
        setTenantInfo({ businessName: tenantId, phone: '', email: '', officeAddress: '' });
      }

      // 2. Fetch specific entity (Order, Quotation, etc.)
      if (type === 'invoice' || type === 'shipping-label') {
        const orderSnap = await getDoc(doc(db, `tenants/${tenantId}/orders/${id}`));
        if (orderSnap.exists()) {
          setData(orderSnap.data());
        }
      }
      
      // If type is 'pad', it's just the letterhead. No specific entity needed.
    };

    fetchData();
  }, [tenantId, type, id]);

  useEffect(() => {
    if (data || type === 'pad') {
      // Wait for images to load ideally, but for now set a small timeout before auto-print
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [data, type]);

  if (!data && type !== 'pad') return <div className="p-10 text-center">Loading Document...</div>;

  // --- RENDER INVOICE ---
  if (type === 'invoice') {
    return (
      <div className="bg-white text-black p-8 max-w-4xl mx-auto print:max-w-full print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8">
          <div>
            {tenantInfo?.logoUrl ? (
              <img src={tenantInfo.logoUrl} alt="Logo" className="h-16 mb-2" />
            ) : (
              <h1 className="text-4xl font-black uppercase tracking-tighter">{tenantInfo?.businessName}</h1>
            )}
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{tenantInfo?.officeAddress}</p>
            <p className="text-sm text-gray-600">Phone: {tenantInfo?.phone} | Email: {tenantInfo?.email}</p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-light text-gray-400 mb-2">INVOICE</h2>
            <p className="font-bold">INV-{id.substring(0, 8).toUpperCase()}</p>
            <p className="text-sm">Date: {new Date(data.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8">
          <h3 className="text-gray-500 font-bold text-sm uppercase mb-2">Bill To:</h3>
          <p className="font-bold text-lg">{data.customerInfo.name}</p>
          <p>{data.customerInfo.address}</p>
          <p>{data.customerInfo.city} - {data.customerInfo.zone === 'inside_city' ? 'Inside City' : 'Outside City'}</p>
          <p>Phone: {data.customerInfo.phone}</p>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8 text-left">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="py-2">Item Description</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item: any, index: number) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3">{item.title}</td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-right">৳{item.price}</td>
                <td className="py-3 text-right font-medium">৳{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-16">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span>৳{data.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery:</span>
              <span>৳{data.deliveryFee}</span>
            </div>
            <div className="flex justify-between border-t-2 border-gray-900 pt-2 font-bold text-lg">
              <span>Total:</span>
              <span>৳{data.total}</span>
            </div>
            <div className="flex justify-between text-sm pt-2">
              <span className="text-gray-500">Payment:</span>
              <span className="uppercase">{data.paymentMethod.replace('_', ' ')} ({data.paymentStatus})</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-gray-500 pt-8 border-t">
          Thank you for your business!
        </div>

        {/* CSS for print specifically */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body { background: white; margin: 0; padding: 0; }
            @page { size: A4; margin: 20mm; }
          }
        `}} />
      </div>
    );
  }

  // --- RENDER COMPANY PAD (LETTERHEAD) ---
  if (type === 'pad') {
    return (
      <div className="bg-white min-h-[297mm] max-w-[210mm] mx-auto relative print:m-0 print:w-full print:h-screen shadow-lg print:shadow-none">
        {/* Header */}
        <div className="p-10 border-b-[8px] border-blue-900 flex justify-between items-center bg-gray-50">
           {tenantInfo?.logoUrl ? (
              <img src={tenantInfo.logoUrl} alt="Logo" className="h-20" />
            ) : (
              <h1 className="text-5xl font-black uppercase text-blue-900">{tenantInfo?.businessName}</h1>
            )}
            <div className="text-right">
              <p className="font-bold text-blue-900 text-lg">Engineering & Services</p>
            </div>
        </div>
        
        {/* Content Area (Blank for handwriting or printing on top) */}
        <div className="p-10 text-right">
          <p className="text-gray-500">Date: _______________</p>
          <p className="text-gray-500 mt-2">Ref: ________________</p>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-8 border-t-[4px] border-blue-900 bg-gray-50 text-center flex flex-col items-center justify-center">
          <p className="font-bold text-gray-800">{tenantInfo?.officeAddress}</p>
          <div className="flex gap-4 mt-2 text-sm font-medium text-gray-600">
            <span>📞 {tenantInfo?.phone}</span>
            <span>✉️ {tenantInfo?.email}</span>
            <span>🌐 {tenantId}.com</span>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body { background: white; margin: 0; padding: 0; }
            @page { size: A4; margin: 0; }
          }
        `}} />
      </div>
    );
  }

  // --- RENDER SHIPPING LABEL ---
  if (type === 'shipping-label') {
    return (
      <div className="bg-white p-4 max-w-[4in] min-h-[6in] border-2 border-black mx-auto print:m-0 print:border-none print:w-[4in] print:h-[6in]">
        <div className="border-b-4 border-black pb-4 mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-black uppercase">{tenantInfo?.businessName}</h1>
          <div className="text-xs font-bold px-2 py-1 bg-black text-white rounded">STANDARD</div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase border-b border-black mb-2">Ship To:</h3>
          <p className="font-black text-2xl leading-none mb-1">{data.customerInfo.name}</p>
          <p className="text-lg font-bold">Ph: {data.customerInfo.phone}</p>
          <p className="text-sm mt-2 font-medium">{data.customerInfo.address}</p>
          <p className="text-sm font-bold mt-1">{data.customerInfo.city} - {data.customerInfo.zone === 'inside_city' ? 'Inside City' : 'Outside City'}</p>
        </div>

        <div className="border-t-4 border-b-4 border-black py-4 mb-6 text-center bg-gray-100">
           <h2 className="text-sm font-bold uppercase mb-1">Cash on Delivery Amount</h2>
           <p className="text-5xl font-black">৳{data.paymentMethod === 'cod' ? data.total : '0.00'}</p>
           {data.paymentMethod !== 'cod' && <p className="text-xs font-bold uppercase mt-1">PAID VIA {data.paymentMethod}</p>}
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase border-b border-black mb-1">Order Details:</h3>
          <p className="text-xs font-mono">Order ID: {id}</p>
          <p className="text-xs mt-2 text-gray-500">Items: {data.items.length} | Weight: Standard</p>
        </div>

        <div className="mt-8 text-center">
           {/* Placeholder for a Barcode generator */}
           <div className="w-full h-20 border-2 border-black flex items-center justify-center font-mono tracking-[0.5em] text-xl font-bold bg-stripes">
             *{id.substring(0, 10).toUpperCase()}*
           </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body { background: white; margin: 0; padding: 0; }
            @page { size: 4in 6in; margin: 0; }
          }
        `}} />
      </div>
    );
  }

  return <div>Unknown Print Type</div>;
}
