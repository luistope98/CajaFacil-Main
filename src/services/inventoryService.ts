import api from "./api";
import type {
  PaginatedHistory,
  PaginatedStock,
} from "@/app/user/inventario/types/inventory.types";

const PAGE_SIZE = 20;

export const inventoryService = {
  // ── Worker ────────────────────────────────────────────────────────────────

  getStock: async (
    page = 1,
    limit = PAGE_SIZE,
    search?: string,
  ): Promise<PaginatedStock> => {
    const params: Record<string, any> = { page, limit };
    if (search) params.search = search;
    const { data } = await api.get<PaginatedStock>("/inventory-web/stock", { params });
    return data;
  },

  adjustStock: async (
    productId: number,
    quantity: number,
    description: string,
  ): Promise<void> => {
    await api.patch(`/inventory-web/stock/${productId}`, { quantity, description });
  },

  getHistory: async (
    page = 1,
    limit = PAGE_SIZE,
    filters: {
      startDate?: string;
      endDate?: string;
      productId?: number;
      type?: string;
    } = {},
  ): Promise<PaginatedHistory> => {
    const params: Record<string, any> = { page, limit };
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.productId) params.productId = filters.productId;
    if (filters.type) params.type = filters.type;
    const { data } = await api.get<PaginatedHistory>("/inventory-web/history", { params });
    return data;
  },

  // ── Admin ─────────────────────────────────────────────────────────────────

  getStockAdmin: async (
    posId: number,
    page = 1,
    limit = PAGE_SIZE,
    search?: string,
  ): Promise<PaginatedStock> => {
    const params: Record<string, any> = { page, limit, posId };
    if (search) params.search = search;
    const { data } = await api.get<PaginatedStock>("/inventory-web/admin/stock", { params });
    return data;
  },

  adjustStockAdmin: async (
    productId: number,
    quantity: number,
    description: string,
    posId: number,
  ): Promise<void> => {
    await api.patch(`/inventory-web/admin/stock/${productId}`, { quantity, description, posId });
  },

  getHistoryAdmin: async (
    posId: number,
    page = 1,
    limit = PAGE_SIZE,
    filters: {
      startDate?: string;
      endDate?: string;
      productId?: number;
      type?: string;
    } = {},
  ): Promise<PaginatedHistory> => {
    const params: Record<string, any> = { page, limit, posId };
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.productId) params.productId = filters.productId;
    if (filters.type) params.type = filters.type;
    const { data } = await api.get<PaginatedHistory>("/inventory-web/admin/history", { params });
    return data;
  },
};
