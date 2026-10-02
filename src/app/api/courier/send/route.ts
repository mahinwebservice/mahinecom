import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { createSteadfastOrder } from '@/lib/courier/steadfast';
import { getPathaoAccessToken, createPathaoOrder } from '@/lib/courier/pathao';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      tenantId, 
      orderId, 
      courierType, // 'steadfast' | 'pathao'
      recipientName, 
      recipientPhone, 
      recipientAddress, 
      codAmount, 
      note,
      city,
      zone
    } = body;

    if (!tenantId || !orderId || !courierType) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Fetch Tenant General Settings for Courier Credentials
    const genSnap = await getDoc(doc(db, `tenants/${tenantId}/settings/general`));
    if (!genSnap.exists()) {
      return NextResponse.json({ error: 'Tenant settings not found' }, { status: 404 });
    }
    const settings = genSnap.data();
    const courierSettings = settings.courier || {};

    let trackingCode = '';
    let consignmentId = '';

    // =========================================================
    // 2A. STEADFAST COURIER DISPATCH
    // =========================================================
    if (courierType === 'steadfast') {
      const sf = courierSettings.steadfast || {};
      const apiKey = sf.apiKey?.trim();
      const secretKey = sf.secretKey?.trim();

      if (!apiKey || !secretKey) {
        return NextResponse.json({ 
          error: 'SteadFast API Key বা Secret Key কনফিগার করা নেই। অনুগ্রহ করে সেটিংস > কুরিয়ার API এ কি প্রদান করুন।' 
        }, { status: 400 });
      }

      const payload = {
        invoice: orderId,
        recipient_name: recipientName || 'Customer',
        recipient_phone: recipientPhone,
        recipient_address: recipientAddress,
        cod_amount: Number(codAmount || 0),
        note: note || 'ই-কমার্স পার্সেল ডেলিভারি'
      };

      try {
        const sfRes = await createSteadfastOrder(apiKey, secretKey, payload);
        if (sfRes.status === 200 || sfRes.consignment) {
          trackingCode = sfRes.consignment?.tracking_code || sfRes.tracking_code || sfRes.consignment?.consignment_id || `SF-${Date.now()}`;
          consignmentId = sfRes.consignment?.consignment_id || sfRes.consignment_id || trackingCode;
        } else {
          throw new Error(sfRes.message || 'SteadFast order creation failed');
        }
      } catch (err: any) {
        return NextResponse.json({ error: `SteadFast API ত্রুটি: ${err.message}` }, { status: 502 });
      }
    } 
    // =========================================================
    // 2B. PATHAO COURIER DISPATCH
    // =========================================================
    else if (courierType === 'pathao') {
      const pt = courierSettings.pathao || {};
      const clientId = pt.clientId?.trim();
      const clientSecret = pt.clientSecret?.trim();
      const username = pt.username?.trim();
      const password = pt.password?.trim();
      const storeId = pt.storeId?.trim();

      if (!clientId || !clientSecret || !username || !password || !storeId) {
        return NextResponse.json({ 
          error: 'Pathao Courier এর প্রয়োজনীয় তথ্য (Client ID, Secret, Username, Password, Store ID) অসম্পূর্ণ।' 
        }, { status: 400 });
      }

      try {
        const tokenRes = await getPathaoAccessToken(clientId, clientSecret, username, password);
        const accessToken = tokenRes.access_token;
        if (!accessToken) throw new Error('Pathao authentication failed');

        const payload = {
          store_id: storeId,
          merchant_order_id: orderId,
          recipient_name: recipientName || 'Customer',
          recipient_phone: recipientPhone,
          recipient_address: recipientAddress,
          recipient_city: city || '1', // Dhaka city default id
          recipient_zone: zone || '1',
          delivery_type: 48,
          item_type: 2, // parcel
          item_quantity: 1,
          item_weight: 0.5,
          amount_to_collect: Number(codAmount || 0),
          item_description: note || 'ই-কমার্স পণ্য ডেলিভারি'
        };

        const ptRes = await createPathaoOrder(accessToken, payload);
        if (ptRes.data?.consignment_id) {
          trackingCode = ptRes.data.consignment_id;
          consignmentId = ptRes.data.consignment_id;
        } else {
          throw new Error(ptRes.message || 'Pathao order booking failed');
        }
      } catch (err: any) {
        return NextResponse.json({ error: `Pathao API ত্রুটি: ${err.message}` }, { status: 502 });
      }
    } else {
      return NextResponse.json({ error: 'Unsupported courier provider' }, { status: 400 });
    }

    // 3. Update Order in Firestore with tracking information
    await updateDoc(doc(db, `tenants/${tenantId}/orders/${orderId}`), {
      courierName: courierType === 'steadfast' ? 'SteadFast' : 'Pathao',
      courierTrackingCode: trackingCode,
      courierConsignmentId: consignmentId,
      status: 'processing',
      courierDispatchedAt: Date.now()
    });

    return NextResponse.json({
      success: true,
      courierName: courierType === 'steadfast' ? 'SteadFast' : 'Pathao',
      trackingCode,
      message: `অর্ডারটি সফলভাবে ${courierType === 'steadfast' ? 'SteadFast' : 'Pathao'}-এ বুকিং করা হয়েছে! ট্র্যাকিং কোড: ${trackingCode}`
    });

  } catch (error: any) {
    console.error('Courier API Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
