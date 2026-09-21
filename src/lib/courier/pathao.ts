// Pathao Courier API Integration
// Requires an access token obtained via Client ID and Client Secret

const PATHAO_BASE_URL = 'https://api-hermes.pathao.com/aladdin/api/v1';

export const getPathaoAccessToken = async (clientId: string, clientSecret: string, username: string, password: string) => {
  try {
    const response = await fetch(`${PATHAO_BASE_URL}/issue-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        username,
        password,
        grant_type: "password"
      })
    });
    
    if (!response.ok) throw new Error('Pathao Auth API error');
    return await response.json(); // returns { access_token, refresh_token, ... }
  } catch (error) {
    console.error('Pathao Auth Error:', error);
    throw error;
  }
};

export interface PathaoOrderPayload {
  store_id: string;
  merchant_order_id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: string;
  recipient_zone: string;
  delivery_type: number; // 48 for normal delivery, 12 for on-demand
  item_type: number; // 1 for document, 2 for parcel
  item_quantity: number;
  item_weight: number;
  amount_to_collect: number;
  item_description?: string;
}

export const createPathaoOrder = async (accessToken: string, payload: PathaoOrderPayload) => {
  try {
    const response = await fetch(`${PATHAO_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error('Pathao Create Order API error');
    return await response.json();
  } catch (error) {
    console.error('Pathao Create Order Error:', error);
    throw error;
  }
};
