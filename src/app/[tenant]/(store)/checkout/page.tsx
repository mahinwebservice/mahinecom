// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function CheckoutPage({ params }: { params: any }) {
  const router = useRouter();
  const tenantId = params.tenantId;
  const { items, getSubtotal, clearCart } = useCartStore();

  const [shippingZone, setShippingZone] = useState<'inside_city' | 'outside_city'>('inside_city');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'manual_bkash' | 'manual_nagad' | 'merchant_gateway'>('cod');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    senderNumber: '',
    trxId: ''
  });

  const subtotal = getSubtotal();
  const deliveryFee = shippingZone === 'inside_city' ? 60 : 120;
  const total = subtotal + deliveryFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert('Your cart is empty');

    try {
      const orderRef = await addDoc(collection(db, `tenants/${tenantId}/orders`), {
        customerInfo: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zone: shippingZone
        },
        items: items.map(item => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        paymentStatus: 'pending',
        senderNumber: formData.senderNumber || null,
        trxId: formData.trxId || null,
        createdAt: Date.now()
      });

      clearCart();
      router.push(`/${tenantId}/checkout/success?orderId=${orderRef.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order.');
    }
  };

  if (items.length === 0) {
    return <div className="text-center py-20">Your cart is empty. Please add items before checking out.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <form onSubmit={handlePlaceOrder} className="grid md:grid-cols-12 gap-8">
        
        {/* Left Column: Customer & Shipping */}
        <div className="md:col-span-7 space-y-8">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Shipping Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <label className="text-sm font-medium">Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Phone Number</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">City/Area</label>
                <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-sm font-medium">Full Address</label>
                <textarea required name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              </div>
              
              <div className="col-span-2 mt-2">
                <label className="text-sm font-medium block mb-2">Delivery Zone</label>
                <div className="flex gap-4">
                  <label className={`flex-1 border p-4 rounded-xl cursor-pointer transition ${shippingZone === 'inside_city' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input type="radio" name="shippingZone" checked={shippingZone === 'inside_city'} onChange={() => setShippingZone('inside_city')} className="hidden" />
                    <div className="font-semibold">Inside City</div>
                    <div className="text-sm text-gray-500">৳60 Delivery</div>
                  </label>
                  <label className={`flex-1 border p-4 rounded-xl cursor-pointer transition ${shippingZone === 'outside_city' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input type="radio" name="shippingZone" checked={shippingZone === 'outside_city'} onChange={() => setShippingZone('outside_city')} className="hidden" />
                    <div className="font-semibold">Outside City</div>
                    <div className="text-sm text-gray-500">৳120 Delivery</div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className={`block border p-4 rounded-xl cursor-pointer transition ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <input type="radio" name="paymentMethod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden" />
                <div className="font-semibold">Cash on Delivery (COD)</div>
                <div className="text-sm text-gray-500">Pay when you receive the product.</div>
              </label>

              <label className={`block border p-4 rounded-xl cursor-pointer transition ${paymentMethod === 'manual_bkash' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}>
                <input type="radio" name="paymentMethod" checked={paymentMethod === 'manual_bkash'} onChange={() => setPaymentMethod('manual_bkash')} className="hidden" />
                <div className="font-semibold">bKash Payment</div>
                <div className="text-sm text-gray-500">Send money to our bKash account and provide the TrxID.</div>
              </label>

              {paymentMethod === 'manual_bkash' && (
                <div className="p-4 bg-pink-100 rounded-lg text-pink-900 border border-pink-200 mt-2">
                  <p className="font-semibold mb-2">Please Send Money to: 017XXXXXXXX</p>
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="text" name="senderNumber" value={formData.senderNumber} onChange={handleChange} placeholder="Sender bKash Number" className="p-2 border border-pink-300 rounded outline-none" />
                    <input required type="text" name="trxId" value={formData.trxId} onChange={handleChange} placeholder="Transaction ID (TrxID)" className="p-2 border border-pink-300 rounded outline-none" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="md:col-span-5">
          <div className="bg-slate-50 p-6 rounded-2xl border border-gray-200 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.productId} className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-white rounded overflow-hidden border flex-shrink-0">
                    {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100"></div>}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium line-clamp-2">{item.title}</p>
                    <p className="text-gray-500">Qty: {item.quantity} x ৳{item.price}</p>
                  </div>
                  <div className="font-semibold">৳{item.price * item.quantity}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span>৳{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>৳{total}</span>
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg">
              Place Order
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
