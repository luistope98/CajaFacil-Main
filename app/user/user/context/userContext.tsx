"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { User } from "../types/user.types";
import { mockCurrentUser } from "../mock/currentUser";

type UserContextValue = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(mockCurrentUser);

  const value = useMemo(() => ({ user, setUser }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider />");
  return ctx;
}
