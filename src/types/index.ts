// Firebase Multi-Tenant SaaS E-Commerce & Service Platform Types
// All data is stored under: tenants/{tenantId}/...

export type TenantId = string;

// 1. Settings & Layout
export interface GeneralSettings {
  businessName: string;
  logoUrl: string;
  faviconUrl?: string;
  phone: string;
  email: string;
  officeAddress: string;
  currency: string;
  customHeadScript?: string;
}

export interface Integrations {
  imgbbApiKey?: string;
  bulkSmsBd?: {
    apiKey: string;
    senderId: string;
  };
  couriers?: {
    steadfast?: {
      apiKey: string;
      secretKey: string;
    };
    pathao?: {
      clientId: string;
      clientSecret: string;
      storeId: string;
    };
  };
  payments?: {
    manual?: {
      bkash?: string;
      nagad?: string;
      rocket?: string;
      instructions?: string;
    };
    sslcommerz?: {
      storeId: string;
      storePassword: string;
      isLive: boolean;
    };
  };
}

export type LayoutBlockType = 'hero_slider' | 'product_grid' | 'service_cards' | 'banner_cta' | 'custom_html';

export interface LayoutBlock {
  id: string;
  type: LayoutBlockType;
  order: number;
  data: any; // Dynamic based on type
}

// 2. E-Commerce Entities
export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  brand: string;
  category: string;
  regularPrice: number;
  salePrice?: number;
  stock: number;
  images: string[]; // ImgBB URLs
  description: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  scopeOfWork: string;
  technicalSpecs: Record<string, string>;
  gallery: string[];
  allowsQuotation: boolean;
  createdAt: number;
}

// 3. Transactions
export interface Quotation {
  id: string;
  customerName: string;
  customerPhone: string;
  companyName?: string;
  serviceId?: string;
  projectScope: string;
  status: 'pending' | 'contacted' | 'quoted' | 'closed';
  createdAt: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  zone: 'inside_city' | 'outside_city';
}

export type PaymentMethod = 'cod' | 'manual_bkash' | 'manual_nagad' | 'manual_rocket' | 'merchant_gateway';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  customerInfo: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  senderNumber?: string;
  trxId?: string;
  courierPayload?: {
    provider: 'steadfast' | 'pathao';
    consignmentId: string;
    trackingCode: string;
    status: string;
  };
  createdAt: number;
}
