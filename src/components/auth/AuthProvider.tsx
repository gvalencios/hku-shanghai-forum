"use client";

import { createContext, type ReactNode } from "react";
import type { UserRole } from "@/lib/types/user";

interface AuthContextValue {
  uid: string | null;
  email: string | null;
  role: UserRole | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  uid: null,
  email: null,
  role: null,
  loading: false,
});

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: { uid: string; email: string; role: UserRole };
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  return (
    <AuthContext.Provider
      value={{
        uid: initialUser?.uid ?? null,
        email: initialUser?.email ?? null,
        role: initialUser?.role ?? null,
        loading: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
