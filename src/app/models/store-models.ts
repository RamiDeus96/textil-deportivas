export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Tarjeta';
export type ProductCategory =
  | 'Camisetas'
  | 'Uniformes completos'
  | 'Shorts'
  | 'Medias'
  | 'Balones'
  | 'Espinilleras'
  | 'Accesorios';

export interface Quality {
  id: string;
  name: string;
  code: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  country: string;
  league: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  qualityIds: string[];
}

export interface ProductVariant {
  id: string;
  qualityId: string;
  size: string;
  presentation: 'individual' | 'kit' | 'bundle' | 'short' | 'media' | 'accessory';
  supplierId: string;
  cost: number;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  teamId: string;
  league: string;
  season: string;
  category: ProductCategory;
  imageUrl: string;
  active: boolean;
  variants: ProductVariant[];
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  reason: string;
  type: 'entrada' | 'venta' | 'ajuste' | 'separacion' | 'armado';
  quantity: number;
  date: string;
  branchId: string;
  branchName: string;
  unitCost?: number;
}

export interface SaleItem {
  productId: string;
  variantId: string;
  productName: string;
  qualityName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Sale {
  id: string;
  folio: string;
  date: string;
  branchId: string;
  branchName: string;
  clientName: string;
  cashier: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discounts: number;
  total: number;
  items: SaleItem[];
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  kind: '2x1' | '3x2' | 'porcentaje' | 'fijo' | 'combo' | 'regalo';
  active: boolean;
  applicableTeams: string[];
  applicableCategories: string[];
  priority: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
}

export interface CartLine {
  productId: string;
  variantId: string;
  productName: string;
  qualityName: string;
  size: string;
  supplierName?: string;
  teamName?: string;
  quantity: number;
  unitPrice: number;
  originalUnitPrice: number;
  discount: number;
  discountPercentage: number;
  presentation: string;
  imageUrl: string;
}

export interface StoreState {
  teams: Team[];
  qualities: Quality[];
  suppliers: Supplier[];
  products: Product[];
  sales: Sale[];
  promotions: Promotion[];
  inventoryMovements: InventoryMovement[];
}
