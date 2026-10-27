// Canonical Register domain types — this is the single source of truth.
// Other modules (e.g. src/services/registerService.ts) re-export from here
// instead of redeclaring their own copies, so the shapes can't drift apart.

export type Period = "day" | "week" | "month";

export type RegisterType = "INCOME" | "EXPENSE" | "PURCHASE";
export type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "NEQUI" | "DAVIPLATA" | "BREB" | "OTHER";
export type RegisterState = "PENDING" | "COMPLETED" | "CANCELLED";

/** Draft line item held in form state before/while building a register (INCOME). */
export type RegisterItem = {
  productId: number;
  quantity: number;
  price: number;      // base price per unit WITHOUT tax
  taxRate?: number;   // tax rate percentage, e.g. 19
  totalItem: number;  // quantity × final price (with tax) — for display
  name?: string;
};

/** Line item as returned by the backend for an already-persisted register. */
export type RegisterItemDTO = {
  id?: number;
  productId: number;
  quantity: number;
  price: number;
  taxRate?: number;
  totalItem: number;
  product?: { id: number; name: string } | null;
};

export type PurchaseItemDTO = {
  productId: number;
  quantity: number;
  purchasePrice: number;
  taxRate?: number;
};

export type RegisterPos = {
  name: string;
  address: string;
  taxId: string;
  phone: string;
};

export type RegisterUser = {
  name: string;
  lastName: string;
};

export type Register = {
  id: number;
  type: RegisterType;
  description: string;
  paymentMethod: PaymentMethod;

  total: number | string;
  subtotal: number | string;
  tax: number | string;

  urlImage?: string | null;
  state: RegisterState;
  deleted?: boolean;

  posId: number;
  userId: number;

  items: RegisterItemDTO[];

  pos?: RegisterPos | null;
  user?: RegisterUser | null;

  createdAt: string;
  updatedAt: string;
};

export type RegisterPageDTO = {
  data: Register[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type CreateRegisterDTO = {
  type: RegisterType;
  description: string;
  paymentMethod: PaymentMethod;
  state: RegisterState;
  urlImage?: string | null;
  subtotal?: number;
  tax?: number;
  total?: number;
  items?: Array<{ productId: number; quantity: number }>;
  purchaseItems?: PurchaseItemDTO[];
};

export type UpdateRegisterDTO = Partial<CreateRegisterDTO>;
