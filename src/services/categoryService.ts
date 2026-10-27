import api from "./api"; // Tu instancia de axios configurada
import { ProductCategory } from "@/app/user/products/types/product.types";

interface CreateCategoryDto {
  name: string;
  description?: string;
  posId?: number;
}

export const categoryService = {
  getAll: async (): Promise<ProductCategory[]> => {
    const { data } = await api.get<ProductCategory[]>("/categories");
    return data;
  },

  getById: async (id: number | string): Promise<ProductCategory> => {
    const { data } = await api.get<ProductCategory>(`/categories/${id}`);
    return data;
  },

  create: async (category: CreateCategoryDto): Promise<ProductCategory> => {
    const { data } = await api.post<ProductCategory>("/categories", category);
    return data;
  },

  update: async (id: number | string, category: Partial<CreateCategoryDto>): Promise<ProductCategory> => {
    const { data } = await api.patch<ProductCategory>(`/categories/${id}`, category);
    return data;
  },

  delete: async (id: number | string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  getAllAdmin: async (posId: number): Promise<ProductCategory[]> => {
    const { data } = await api.get<ProductCategory[]>(`/categories/admin/${posId}`);
    return data;
  },

  createAdmin: async (category: CreateCategoryDto): Promise<ProductCategory> => {
    const { data } = await api.post<ProductCategory>("/categories/admin", category);
    return data;
  },

  updateAdmin: async (id: number | string, category: Partial<CreateCategoryDto>): Promise<ProductCategory> => {
    const { data } = await api.patch<ProductCategory>(`/categories/admin/${id}`, category);
    return data;
  },

  deleteAdmin: async (id: number | string, posId: number): Promise<void> => {
    await api.delete(`/categories/admin/${id}/${posId}`);
  },
};