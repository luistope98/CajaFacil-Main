
export type UserRole = "ADMIN" | "USER";


export type UserPos = {
  id: number;
  name: string;
  description?: string;
  address?: string;
  taxId?: number;
  phone?: string;
  minStock?: number | null;
  minCash?: number | null;
};

export type User = {
  id: number;
  username: string;
  name: string;
  lastName: string;
  document: string;
  phone: string;
  email: string;
  identifier?: string | null;
  role: string;
  posId?: number | null;
  pos?: UserPos | null;
  createdAt: string;
  updatedAt: string;
};
