import api from "./api";
import type {
  Period,
  RegisterType,
  PaymentMethod,
  RegisterState,
  RegisterItemDTO,
  Register,
  PurchaseItemDTO,
  CreateRegisterDTO,
  UpdateRegisterDTO,
} from "@/app/user/register/types/register.types";

/* ============================= */
/* ========   TYPES   ========= */
/* ============================= */

// Re-exported from the canonical source (register.types.ts) so existing
// imports of these names from this service keep working without a second,
// independent declaration that could drift out of sync.
export type {
  Period,
  RegisterType,
  PaymentMethod,
  RegisterState,
  RegisterItemDTO,
  PurchaseItemDTO,
  CreateRegisterDTO,
  UpdateRegisterDTO,
};

/** Alias kept for this file's own signatures — same shape as `Register`. */
export type RegisterDTO = Register;

/** Range-wide totals (not just the current page) computed by the backend. */
export type RegisterRangeSummary = {
  totalIncome: number;
  totalExpense: number;
  net: number;
  itemsSold: number;
};

export type RegisterPageDTO = {
  data: RegisterDTO[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  summary: RegisterRangeSummary;
};

const emptySummary: RegisterRangeSummary = { totalIncome: 0, totalExpense: 0, net: 0, itemsSold: 0 };

function normalizeSummary(s: any): RegisterRangeSummary {
  if (!s) return emptySummary;
  return {
    totalIncome: toNumber(s.totalIncome),
    totalExpense: toNumber(s.totalExpense),
    net: toNumber(s.net),
    itemsSold: toNumber(s.itemsSold),
  };
}

/* ============================= */
/* ===== NORMALIZADOR API ===== */
/* ============================= */

function toNumber(value: any, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeRegister(r: any): RegisterDTO {
  return {
    id: toNumber(r.id),
    type: r.type,
    description: r.description,
    paymentMethod: r.paymentMethod,

    total: toNumber(r.total),
    subtotal: toNumber(r.subtotal),
    tax: toNumber(r.tax),

    urlImage: r.urlImage ?? null,
    state: r.state,
    deleted: r.deleted ?? false,

    posId: toNumber(r.posId),
    userId: toNumber(r.userId),

    items: Array.isArray(r.items)
      ? r.items.map((it: any) => ({
          id: toNumber(it.id),
          productId: toNumber(it.productId),
          quantity: toNumber(it.quantity),
          price: toNumber(it.price),
          taxRate: toNumber(it.taxRate),
          totalItem: toNumber(it.totalItem),
          product: it.product ?? null,
        }))
      : [],

    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

/* ============================= */
/* ========= SERVICE =========== */
/* ============================= */

export const registerService = {
  create: async (dto: CreateRegisterDTO): Promise<RegisterDTO> => {
    const { data } = await api.post("/registers-web", dto);
    return normalizeRegister(data);
  },

  findByPeriod: async (period: Period): Promise<RegisterDTO[]> => {
    const { data } = await api.get("/registers-web", {
      params: { period },
    });

    // Tu backend devuelve array directo
    if (!Array.isArray(data)) return [];

    return data.map(normalizeRegister);
  },

  findByDateRange: async (
    startDate: string,
    endDate: string,
    page: number,
    limit: number,
  ): Promise<RegisterPageDTO> => {
    const { data } = await api.get("/registers-web/by-date", {
      params: { startDate, endDate, page, limit },
    });
    return {
      data: Array.isArray(data.data) ? data.data.map(normalizeRegister) : [],
      total: data.total ?? 0,
      page: data.page ?? page,
      limit: data.limit ?? limit,
      pages: data.pages ?? 1,
      summary: normalizeSummary(data.summary),
    };
  },

  update: async (id: number, dto: UpdateRegisterDTO): Promise<RegisterDTO> => {
    const { data } = await api.patch(`/registers-web/${id}`, dto);
    return normalizeRegister(data);
  },

  remove: async (id: number) => {
    const { data } = await api.delete(`/registers-web/${id}`);
    return data;
  },

  // ── Admin methods ────────────────────────────────────────────────────────────

  findByDateRangeAdmin: async (
    posId: number,
    startDate: string,
    endDate: string,
    page: number,
    limit: number,
  ): Promise<RegisterPageDTO> => {
    const { data } = await api.get("/registers-web/admin/by-date", {
      params: { posId, startDate, endDate, page, limit },
    });
    return {
      data: Array.isArray(data.data) ? data.data.map(normalizeRegister) : [],
      total: data.total ?? 0,
      page: data.page ?? page,
      limit: data.limit ?? limit,
      pages: data.pages ?? 1,
      summary: normalizeSummary(data.summary),
    };
  },

  createAdmin: async (posId: number, dto: CreateRegisterDTO): Promise<void> => {
    await api.post(`/registers-web/admin?posId=${posId}`, dto);
  },

  updateAdmin: async (id: number, dto: UpdateRegisterDTO): Promise<RegisterDTO> => {
    const { data } = await api.patch(`/registers-web/admin/${id}`, dto);
    return normalizeRegister(data);
  },

  removeAdmin: async (id: number): Promise<void> => {
    await api.delete(`/registers-web/admin/${id}`);
  },
};
