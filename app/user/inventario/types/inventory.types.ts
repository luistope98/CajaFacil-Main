export type InventoryType = 'IN' | 'OUT' | 'RETURN';
export type InventoryState = 'DONE' | 'ADJUSTMENT';

export type StockItem = {
  id: number;
  name: string;
  description: string | null;
  ceco: string | null;
  skus: { sku: string }[];
  stock: number;
  price: number;
  taxRate: number;
  icoTaxAmount: number | null;
  posId: number;
  isActive: boolean;
};

export type InventoryMovement = {
  id: number;
  type: InventoryType;
  state: InventoryState;
  quantity: number;
  description: string;
  productId: number;
  posId: number;
  createdAt: string;
  product: {
    id: number;
    name: string;
    skus: { sku: string }[];
  };
};

export type PaginatedStock = {
  data: StockItem[];
  total: number;
  page: number;
  pages: number;
};

export type PaginatedHistory = {
  data: InventoryMovement[];
  total: number;
  page: number;
  pages: number;
};
