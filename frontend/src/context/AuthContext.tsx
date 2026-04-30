import React, { createContext, useContext, useMemo, useState } from "react";
import { loginUser, registerUser } from "../api/auth";
import { User } from "../types";

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { fullName: string; email: string; password: string; role: "LEARNER" | "FACULTY" }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const storageKeys = {
  access: "accessToken",
  refresh: "refreshToken",
  user: "currentUser"
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(storageKeys.user);
    return raw ? (JSON.parse(raw) as User) : null;
  });

  const login = async (email: string, password: string) => {
    const response = await loginUser({ email, password });
    localStorage.setItem(storageKeys.access, response.accessToken);
    localStorage.setItem(storageKeys.refresh, response.refreshToken);
    localStorage.setItem(storageKeys.user, JSON.stringify(response.user));
    setUser(response.user);
  };

  const register = async (payload: { fullName: string; email: string; password: string; role: "LEARNER" | "FACULTY" }) => {
    const response = await registerUser(payload);
    localStorage.setItem(storageKeys.access, response.accessToken);
    localStorage.setItem(storageKeys.refresh, response.refreshToken);
    localStorage.setItem(storageKeys.user, JSON.stringify(response.user));
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem(storageKeys.access);
    localStorage.removeItem(storageKeys.refresh);
    localStorage.removeItem(storageKeys.user);
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, register, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
