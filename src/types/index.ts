export interface Address {
  street: string;
  ward: string;
  district: string;
  province: string;
}

export type MemberTier = "bronze" | "silver" | "gold";
export type PharmacyStatus = "pending" | "active" | "suspended";

export interface Pharmacy {
  id: string;
  code: string;
  name: string;
  businessLicense: string;
  phone: string;
  email?: string;
  address: Address;
  memberTier: MemberTier;
  status: PharmacyStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TierPrice {
  minQuantity: number;
  price: number;
  discount?: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  manufacturer: string;
  unit: string;
  packagingInfo: string;
  expiryDate?: Date;
  images: string[];
  basePrice: number;
  currentPrice: number;
  previousPrice?: number;
  priceChangePercent?: number;
  isVAT: boolean;
  stockQuantity: number;
  isLimitedStock: boolean;
  tierPricing: TierPrice[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PromotionType = "buy_get_free" | "discount" | "flash_sale" | "bundle";

export interface PromotionProduct {
  productId: string;
  quantity: number;
  price: number;
  isFree: boolean;
}

export interface Promotion {
  id: string;
  type: PromotionType;
  manufacturerName: string;
  title: string;
  buyProducts: PromotionProduct[];
  giveProducts: PromotionProduct[];
  minOrderQuantity: number;
  maxOrderQuantity?: number;
  totalSaving: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  promotionId?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  pharmacyId: string;
  items: OrderItem[];
  deliveryAddress: Address;
  note?: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  addedPrice: number;
  currentPrice: number;
  hasPriceChanged: boolean;
}

export interface Cart {
  pharmacyId: string;
  items: CartItem[];
  deliveryAddressId: string;
  note?: string;
  updatedAt: Date;
}

export type NotificationType =
  | "order_placed"
  | "order_confirmed"
  | "order_shipping"
  | "order_delivered"
  | "order_cancelled"
  | "system";

export interface AppNotification {
  id: string;
  pharmacyId: string;
  type: NotificationType;
  title: string;
  body: string;
  orderId?: string;
  isRead: boolean;
  createdAt: Date;
}

export type ChatRoomType =
  | "general"
  | "merchandise"
  | "accounting"
  | "technical"
  | "product";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderType: "pharmacy" | "admin";
  content: string;
  attachments?: string[];
  sentAt: Date;
  isRead: boolean;
}

export interface ChatRoom {
  id: string;
  pharmacyId: string;
  type: ChatRoomType;
  productId?: string;
  messages: ChatMessage[];
  isActive: boolean;
  lastMessageAt: Date;
}
