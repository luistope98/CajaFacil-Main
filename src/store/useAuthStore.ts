import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  posId: number | null;
  name: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  setToken: (token: string, refreshToken?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      setAuth: (user, token, refreshToken) =>
        set((state) => ({
          user,
          token,
          // Preserve existing refreshToken if a new one is not explicitly provided
          refreshToken: refreshToken !== undefined ? refreshToken : state.refreshToken,
        })),
      setToken: (token, refreshToken) =>
        set({ token, refreshToken: refreshToken ?? null }),
      logout: () => {
        set({ user: null, token: null, refreshToken: null });
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      },
    }),
    { name: 'auth-storage' }
  )
);