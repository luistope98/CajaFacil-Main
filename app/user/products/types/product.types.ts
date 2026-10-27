export type ProductCategory = {
  id: number;
  name: string;
  description: string;
};

export type ProductSku = {
  id: number;
  sku: string;
  notes?: string | null;
  isDefault: boolean;
  productId: number;
  createdAt: string;
};

export type InventoryProduct = {
  id: number;
  name: string;
  description: string;
  skus: ProductSku[];
  ceco?: string;
  posId: number;
  categoryId: number;
  stock: number;
  price: number;       // base price WITHOUT tax (stored in DB)
  taxRate: number;     // tax rate percentage, e.g. 19
  icoTaxAmount?: number | null;
  finalPrice?: number; // price WITH tax + ICO (computed by backend)
};

export type PaginatedProducts = {
  data: InventoryProduct[];
  total: number;
  pages: number;
  categoryCounts: { categoryId: number | null; count: number }[];
};
