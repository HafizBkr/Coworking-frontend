"use client"
import React, { createContext, useContext, useEffect, useState } from "react";
import { getSession } from "@/services/auth/session.service";
import { User } from "@/models/user.model";

type SessionContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string;
  refreshSession: () => Promise<boolean>;
};

const SessionContext = createContext<SessionContextType>({
  user: null,
  token: null,
  isLoading: true,
  error: "",
  refreshSession: async () => false,
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSession = async () => {
    try {
      setIsLoading(true);
      const data = await getSession();
      console.log("[SessionContext] Session loaded:", { 
        hasUser: !!data?.data, 
        hasToken: !!data?.token, 
        isAuth: data?.isAuthenticated 
      });
      
      setUser(data?.data);
      setToken(data?.token || "");
      return true;
    } catch (err) {
      console.error("[SessionContext] Failed to load session:", err);
      setError("Impossible de récupérer la session");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour rafraîchir manuellement la session
  const refreshSession = async () => {
    return await loadSession();
  };

  useEffect(() => {
    loadSession();
  }, []);

  return (
    <SessionContext.Provider value={{ user, token, isLoading, error, refreshSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => useContext(SessionContext); 