import api from "./api";

export type UserRole = "ADMIN" | "USER";

export interface AdminUserDTO {
  id: number;
  name: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive?: boolean;
}

export type CreateUserDTO = {
  name: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  document: string;
  role: UserRole;
  password?: string;
  isActive?: boolean;
};

export type UpdateUserDTO = Partial<CreateUserDTO>;

export const userService = {
  // Listado (admin)
  findAll: async (): Promise<AdminUserDTO[]> => {
    const { data } = await api.get<AdminUserDTO[]>("/users");
    return data;
  },

  create: async (dto: CreateUserDTO): Promise<AdminUserDTO> => {
    const { data } = await api.post<AdminUserDTO>("/users", dto);
    return data;
  },

  update: async (id: number, dto: UpdateUserDTO): Promise<AdminUserDTO> => {
    const { data } = await api.patch<AdminUserDTO>(`/users/${id}`, dto);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },

  updateMe: async (dto: { name?: string; lastName?: string; phone?: string; email?: string }) => {
    const { data } = await api.patch("/users/me", dto);
    return data;
  },
};
