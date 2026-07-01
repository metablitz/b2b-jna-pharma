import { Address, ChatRoomType, NotificationType, Product, Promotion } from "@/types";

export const MOCK_ADDRESS: Address = {
  street: "123 Đường ABC",
  ward: "Phường 1",
  district: "Quận 1",
  province: "TP. Hồ Chí Minh",
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    name: "Panadol 500mg, Xanh, GSK, H/120v",
    sku: "SKU-001",
    category: "Giảm đau - Hạ sốt",
    manufacturer: "GSK",
    unit: "chai",
    packagingInfo: "H/120v",
    expiryDate: new Date("2031-03-01"),
    images: [],
    basePrice: 89000,
    currentPrice: 92000,
    previousPrice: 89000,
    priceChangePercent: 3,
    isVAT: true,
    stockQuantity: 500,
    isLimitedStock: false,
    tierPricing: [
      { minQuantity: 5, price: 90000 },
      { minQuantity: 10, price: 88000 },
      { minQuantity: 20, price: 85000 },
    ],
    isFeatured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "prod-002",
    name: "Concor 5mg, Vàng, Merck, H/30v",
    sku: "SKU-002",
    category: "Tim mạch & Huyết áp",
    manufacturer: "Merck",
    unit: "hộp",
    packagingInfo: "H/30v",
    expiryDate: new Date("2030-11-01"),
    images: [],
    basePrice: 145000,
    currentPrice: 136000,
    previousPrice: 145000,
    priceChangePercent: -6,
    isVAT: true,
    stockQuantity: 120,
    isLimitedStock: false,
    tierPricing: [
      { minQuantity: 5, price: 133000 },
      { minQuantity: 10, price: 130000 },
    ],
    isFeatured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "prod-003",
    name: "Augmentin 1g, Trắng, GSK, H/14v",
    sku: "SKU-003",
    category: "Kháng sinh",
    manufacturer: "GSK",
    unit: "hộp",
    packagingInfo: "H/14v",
    images: [],
    basePrice: 178000,
    currentPrice: 178000,
    isVAT: true,
    stockQuantity: 80,
    isLimitedStock: true,
    tierPricing: [{ minQuantity: 5, price: 172000 }],
    isFeatured: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "prod-004",
    name: "Vitamin C 1000mg, Cam, DHG, Lốc/10 ống",
    sku: "SKU-004",
    category: "Vitamin & Khoáng chất",
    manufacturer: "DHG Pharma",
    unit: "lốc",
    packagingInfo: "Lốc/10 ống",
    images: [],
    basePrice: 45000,
    currentPrice: 45000,
    isVAT: true,
    stockQuantity: 300,
    isLimitedStock: false,
    tierPricing: [
      { minQuantity: 10, price: 43000 },
      { minQuantity: 20, price: 41000 },
    ],
    isFeatured: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function getProductById(productId: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === productId);
}

export interface FlashSaleItem {
  product: Product;
  flashPrice: number;
  endsAt: Date;
}

export const MOCK_FLASH_SALE_ITEMS: FlashSaleItem[] = [
  {
    product: MOCK_PRODUCTS[1],
    flashPrice: 119000,
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 3),
  },
  {
    product: MOCK_PRODUCTS[2],
    flashPrice: 159000,
    endsAt: new Date(Date.now() + 1000 * 60 * 45),
  },
];

export const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: "promo-001",
    type: "buy_get_free",
    manufacturerName: "GSK",
    title: "Mua 10 hộp Panadol tặng 1 hộp",
    buyProducts: [{ productId: "prod-001", quantity: 10, price: 92000, isFree: false }],
    giveProducts: [{ productId: "prod-001", quantity: 1, price: 92000, isFree: true }],
    minOrderQuantity: 1,
    totalSaving: 92000,
    startDate: new Date(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    isActive: true,
  },
  {
    id: "promo-002",
    type: "buy_get_free",
    manufacturerName: "Merck",
    title: "Mua 5 hộp Concor tặng 1 lốc Vitamin C",
    buyProducts: [{ productId: "prod-002", quantity: 5, price: 136000, isFree: false }],
    giveProducts: [{ productId: "prod-004", quantity: 1, price: 45000, isFree: true }],
    minOrderQuantity: 1,
    totalSaving: 45000,
    startDate: new Date(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    isActive: true,
  },
];

export const SUPPORT_ROOMS: { type: ChatRoomType; icon: string; label: string }[] = [
  { type: "general", icon: "🎧", label: "Hỗ trợ chung" },
  { type: "merchandise", icon: "📦", label: "Hỗ trợ hàng hóa" },
  { type: "accounting", icon: "🧾", label: "Hóa đơn / Kế toán" },
  { type: "technical", icon: "🔧", label: "Kỹ thuật" },
];

export interface SeedNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

export const MOCK_NOTIFICATIONS: SeedNotification[] = [
  {
    id: "notif-001",
    type: "order_shipping",
    title: "Đơn hàng #DH20260612-00010 đang giao",
    body: "Đơn hàng của bạn đang trên đường vận chuyển, dự kiến giao trong hôm nay.",
    isRead: false,
    createdAt: "2026-06-12T09:30:00.000Z",
  },
  {
    id: "notif-002",
    type: "order_confirmed",
    title: "Đơn hàng #DH20260612-00010 đã xác nhận",
    body: "Nhà phân phối đã xác nhận đơn hàng và đang chuẩn bị hàng.",
    isRead: true,
    createdAt: "2026-06-12T08:05:00.000Z",
  },
  {
    id: "notif-003",
    type: "order_delivered",
    title: "Đơn hàng #DH20260520-00004 đã giao",
    body: "Đơn hàng đã giao thành công. Cảm ơn bạn đã mua hàng.",
    isRead: true,
    createdAt: "2026-05-20T14:15:00.000Z",
  },
];
