// Steadfast Courier API Integration

const STEADFAST_BASE_URL = 'https://portal.packzy.com/api/v1';

export interface SteadfastOrderPayload {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
}

export const createSteadfastOrder = async (apiKey: string, secretKey: string, payload: SteadfastOrderPayload) => {
  try {
    const response = await fetch(`${STEADFAST_BASE_URL}/create_order`, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Secret-Key': secretKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error('Steadfast API error');
    return await response.json();
  } catch (error) {
    console.error('Steadfast Create Order Error:', error);
    throw error;
  }
};

export const checkSteadfastDeliveryStatus = async (apiKey: string, secretKey: string, trackingCode: string) => {
  try {
    const response = await fetch(`${STEADFAST_BASE_URL}/status_by_trackingcode/${trackingCode}`, {
      method: 'GET',
      headers: {
        'Api-Key': apiKey,
        'Secret-Key': secretKey,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) throw new Error('Steadfast API error');
    return await response.json();
  } catch (error) {
    console.error('Steadfast Status Check Error:', error);
    throw error;
  }
};
