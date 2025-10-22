import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "citizen" | "admin" | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  greenCoins: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateGreenCoins: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem("swachhaiUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("swachhaiUser");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    // Mock authentication - in production, this would call your backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: `${role}-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
      greenCoins: role === "citizen" ? 150 : 0,
    };

    setUser(mockUser);
    localStorage.setItem("swachhaiUser", JSON.stringify(mockUser));
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    // Mock signup - in production, this would call your backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: `${role}-${Date.now()}`,
      name,
      email,
      role,
      greenCoins: role === "citizen" ? 50 : 0,
    };

    setUser(mockUser);
    localStorage.setItem("swachhaiUser", JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("swachhaiUser");
  };

  const updateGreenCoins = (amount: number) => {
    if (user) {
      const updatedUser = { ...user, greenCoins: user.greenCoins + amount };
      setUser(updatedUser);
      localStorage.setItem("swachhaiUser", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        loading,
        login, 
        signup,
        logout,
        updateGreenCoins 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
