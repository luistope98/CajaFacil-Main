import api from './api';
import type { Pos } from '@/app/user/admin/pos/types/pos.types';

export const posService = {
  getPos: async () => {
    const { data } = await api.get<Pos[]>('/pos');
    return data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<Pos>(`/pos/${id}`);
    return data;
  },

  create: async (dto: Partial<Pos>) => {
    const { data } = await api.post<Pos>('/pos', dto);
    return data;
  },

  update: async (id: number, dto: Partial<Pos>) => {
    const { data } = await api.patch<Pos>(`/pos/${id}`, dto);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await api.delete(`/pos/${id}`);
    return data;
  },
};