import type { User } from "../types/user.types";

export const mockCurrentUser: User = {
  id: 1,
  username: "luisa",
  name: "Luisa",
  lastName: "H",
  document: "123456789",
  phone: "300123456",
  email: "luisa@email.com",
  identifier: "A-01",
  role: "ADMIN",
  posId: 1,
  createdAt: "2025-02-15T10:15:00Z",
  updatedAt: "2025-02-15T10:15:00Z",
  pos: {
    id: 1,
    name: "Sede Principal",
    description: "POS principal",
    address: "Calle 12 # 34-56",
    taxId: 123456,
    phone: "300111222",
    minStock: 10,
    minCash: 50000,
  },
};
