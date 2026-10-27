export type Pos = {
  id: number;
  name: string;
  description: string;
  address: string;
  taxId: string;
  phone: string;
  minStock?: number | null;
  minCash?: number | null;
  openingBalance: number;

  createdAt: string;
  updatedAt: string;
};

export type PosBalance = {
  posId: number;
  posName: string;
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalPurchase: number;
  currentBalance: number;
  minCash: number | null;
  isBelowMinCash: boolean;
};
