"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const response = await api.post("/auth/login", { email, password });
      const { user: userData, token: authToken } = response.data.data;

      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      router.push("/dashboard");
    },
    [router]
  );

  const register = useCallback(
    async (fullName, email, password) => {
      const response = await api.post("/auth/register", {
        fullName,
        email,
        password,
      });
      const { user: userData, token: authToken } = response.data.data;

      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isAuthenticated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
