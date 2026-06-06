import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: "github" | "google") => Promise<void>;
  updateUser: (fields: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = "devpulse_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistUser = (u: User) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    setUser(u);
  };

  /**
   * Update the current user's profile fields in both context and localStorage.
   * Call this from Settings after saving the form so the topbar updates instantly.
   */
  const updateUser = (fields: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...fields };
    persistUser(updated);
  };

  /**
   * Email/password login.
   * TODO: replace with Firebase signInWithEmailAndPassword, Supabase signIn, etc.
   */
  const login = async (email: string, _password: string) => {
    if (!email) throw new Error("Email is required");
    persistUser({ name: email.split("@")[0], email });
  };

  /**
   * OAuth provider login.
   * TODO: replace with real OAuth flow (Firebase, Auth0, etc.)
   */
  const loginWithProvider = async (provider: "github" | "google") => {
    persistUser({
      name: provider === "github" ? "GitHub User" : "Google User",
      email: `user@${provider}.com`,
    });
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithProvider, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
