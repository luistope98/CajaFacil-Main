import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/useAuthStore";
import { authService } from "@/src/services/authService";
import Cookies from 'js-cookie';
import { UseFormSetError } from "react-hook-form";
import { LoginFormValues } from "@/src/schemas/auth";

export const useLogin = (setError: UseFormSetError<LoginFormValues>) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const performLogin = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const result = await authService.login(data.phone, data.password);
      const token = result.access_token;
      const refreshToken = result.refresh_token;
      const user = result.user;

      if (!token) throw new Error("No se recibió un token");

      setAuth(user, token, refreshToken);

      const cookieOptions = { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/'
      };

      Cookies.set('token', token, cookieOptions);
      Cookies.set('role', user.role, cookieOptions);
      Cookies.set('userName', user.name, cookieOptions);

      setTimeout(() => {
        if (user.role === 'ADMIN') {
          router.push('/user/admin/dashboard'); 
        } else {
          router.push('/user/dashboard');
        }
      }, 100);

    } catch {
      setError("password", {
        type: "manual",
        message: "Usuario o contraseña incorrecto",
      });
    } finally {
      setLoading(false);
    }
  };

  return { performLogin, loading };
};