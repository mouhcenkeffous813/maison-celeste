export interface ProductColor {
  name: string;
  hex: string;
  imageIndex?: number;
}

export interface ProductVariant {
  id: string;
  colorName: string;
  colorHex: string;
  size: string;
  stock: number;
  sku?: string;
  image?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  bulletPoints: string[];
  price: number;
  compareAtPrice: number;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  variants: ProductVariant[];
  totalStock: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  badge?: string;
  createdAt: string;
}

export type OrderStatus =
  | 'pending'     // En attente
  | 'confirmed'   // Confirmée
  | 'processing'  // En préparation
  | 'shipped'     // Expédiée
  | 'delivered'   // Livrée
  | 'cancelled';  // Annulée / Retour

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  selectedColor?: string;
  selectedSize?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CartItem {
  id: string; // unique key e.g. prodId-color-size
  productId: string;
  productTitle: string;
  productImage: string;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
  unitPrice: number;
  maxStock: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  wilayaId: number;
  wilayaName: string;
  commune: string;
  address: string;
  deliveryType: 'home' | 'desk';
  productId: string;
  productTitle: string;
  productImage: string;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
  unitPrice: number;
  productTotal: number;
  shippingFee: number;
  grandTotal: number;
  items?: OrderItem[];
  status: OrderStatus;
  trackingCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  wilaya: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface Wilaya {
  id: number;
  code: string;
  name: string;
  arName: string;
  communes: string[];
  homeDeliveryPrice: number;
  stopDeskPrice: number;
  isDeliverable: boolean;
}

export interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  secondary: string;
  bgBase: string;
  accent: string;
}

export interface StoreConfig {
  storeName: string;
  storeTagline: string;
  logoUrl: string;
  currency: string;
  phone: string;
  whatsappNumber: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  freeShippingThreshold: number;
  theme: ThemePreset;
  metaPixelId: string;
  tiktokPixelId: string;
  deliveryTimeEstimate: string;
  announcementText: string;
  adminPin: string;
}

