export type AdminUser = {
  id: number;
  username: string;
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  document?: string;
  role: "ADMIN" | "USER";
  isActive?: boolean;
  posId?: number | null;
  pos?: { id: number; name: string } | null;
  createdAt?: string;
};
