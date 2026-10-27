import { useAuthStore } from "@/src/store/useAuthStore";
import { useEffect, useState } from "react";

export const useUser = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [userData, setUserData] = useState<typeof user>(null);

  useEffect(() => {
    setUserData(user);
  }, [user]);

  const getRoleName = (role?: string) => {
    if (role === "ADMIN") return "Administrador";
    if (role === "USER") return "Usuario";
    return "Invitado";
  };

  return {
    user: userData,
    logout,
    isAdmin: userData?.role === 'ADMIN',
    hasPos: userData?.role === 'ADMIN' || !!userData?.posId,
    roleName: getRoleName(userData?.role) 
  };
};