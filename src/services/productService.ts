import api from "./api";
import type { InventoryProduct, PaginatedProducts, ProductSku } from "@/app/user/products/types/product.types";

const PAGE_SIZE = 20;

export const productService = {
  getProductsByPos: async (
    _posId: number | null,
    page = 1,
    limit = PAGE_SIZE,
    categoryId?: number,
    q?: string,
  ): Promise<PaginatedProducts> => {
    const params: Record<string, any> = { page, limit };
    if (categoryId) params.categoryId = categoryId;
    if (q) params.q = q;
    const { data } = await api.get<PaginatedProducts>(`/products-web`, { params });
    return data;
  },

  create: async (product: any): Promise<InventoryProduct> => {
    const { data } = await api.post<InventoryProduct>("/products-web", product);
    return data;
  },

  update: async (id: number, product: any): Promise<InventoryProduct> => {
    const { data } = await api.patch<InventoryProduct>(`/products-web/${id}`, product);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products-web/${id}`);
  },

  getProductsByPosAdmin: async (
    posId: number,
    page = 1,
    limit = PAGE_SIZE,
    categoryId?: number,
    q?: string,
  ): Promise<PaginatedProducts> => {
    const params: Record<string, any> = { page, limit };
    if (categoryId) params.categoryId = categoryId;
    if (q) params.q = q;
    const { data } = await api.get<PaginatedProducts>(`/products-web/admin/pos/${posId}`, { params });
    return data;
  },

  createAdmin: async (product: any): Promise<InventoryProduct> => {
    const { data } = await api.post<InventoryProduct>("/products-web/admin", product);
    return data;
  },

  updateAdmin: async (id: number, product: any): Promise<InventoryProduct> => {
    const { data } = await api.patch<InventoryProduct>(`/products-web/admin/${id}`, product);
    return data;
  },

  deleteAdmin: async (id: number, posId: number): Promise<void> => {
    await api.delete(`/products-web/admin/${id}/${posId}`);
  },

  bulkImport: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post("/products-web/bulk", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  bulkImportAdmin: async (file: File, posId: number): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post(`/products-web/admin/bulk/${posId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  searchProducts: async (q: string, limit = 20, ids?: number[]): Promise<InventoryProduct[]> => {
    const params: Record<string, any> = { q, limit };
    if (ids?.length) params.ids = ids.join(',');
    const { data } = await api.get<InventoryProduct[]>('/products-web/search', { params });
    return data;
  },

  searchProductsAdmin: async (posId: number, q: string, limit = 20, ids?: number[]): Promise<InventoryProduct[]> => {
    const params: Record<string, any> = { posId, q, limit };
    if (ids?.length) params.ids = ids.join(',');
    const { data } = await api.get<InventoryProduct[]>('/products-web/admin/search', { params });
    return data;
  },

  downloadTemplate: async (): Promise<void> => {
    const response = await api.get('/products-web/template', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template-productos.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  downloadTemplateAdmin: async (posId: number): Promise<void> => {
    const response = await api.get(`/products-web/admin/template/${posId}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template-productos.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  adjustStock: async (productId: number, quantity: number, description: string): Promise<void> => {
    await api.patch(`/inventory-web/stock/${productId}`, { quantity, description });
  },

  adjustStockAdmin: async (productId: number, quantity: number, description: string, posId: number): Promise<void> => {
    await api.patch(`/inventory-web/admin/stock/${productId}`, { quantity, description, posId });
  },

  // ── SKU management ──────────────────────────────────────────────────────────

  addSku: async (
    productId: number,
    dto: { sku: string; notes?: string; isDefault?: boolean },
  ): Promise<ProductSku> => {
    const { data } = await api.post<ProductSku>(`/products-web/${productId}/skus`, dto);
    return data;
  },

  updateSku: async (
    productId: number,
    skuId: number,
    dto: { notes?: string; isDefault?: boolean },
  ): Promise<ProductSku> => {
    const { data } = await api.patch<ProductSku>(`/products-web/${productId}/skus/${skuId}`, dto);
    return data;
  },

  removeSku: async (productId: number, skuId: number): Promise<void> => {
    await api.delete(`/products-web/${productId}/skus/${skuId}`);
  },

  // ── Admin SKU management (requires posId for ownership check) ────────────────

  addSkuAdmin: async (
    productId: number,
    posId: number,
    dto: { sku: string; notes?: string; isDefault?: boolean },
  ): Promise<ProductSku> => {
    const { data } = await api.post<ProductSku>(`/products-web/admin/${productId}/skus?posId=${posId}`, dto);
    return data;
  },

  updateSkuAdmin: async (
    productId: number,
    skuId: number,
    posId: number,
    dto: { notes?: string; isDefault?: boolean },
  ): Promise<ProductSku> => {
    const { data } = await api.patch<ProductSku>(`/products-web/admin/${productId}/skus/${skuId}?posId=${posId}`, dto);
    return data;
  },

  removeSkuAdmin: async (productId: number, skuId: number, posId: number): Promise<void> => {
    await api.delete(`/products-web/admin/${productId}/skus/${skuId}?posId=${posId}`);
  },
};
