import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type UserType = "citizen" | "authority" | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userType: UserType;
  userName: string;
  login: (type: UserType, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedAuth = localStorage.getItem("swachhaiAuth");
    if (storedAuth) {
      const { type, name } = JSON.parse(storedAuth);
      setIsAuthenticated(true);
      setUserType(type);
      setUserName(name);
    }
  }, []);

  const login = (type: UserType, name: string) => {
    setIsAuthenticated(true);
    setUserType(type);
    setUserName(name);
    localStorage.setItem("swachhaiAuth", JSON.stringify({ type, name }));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserType(null);
    setUserName("");
    localStorage.removeItem("swachhaiAuth");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, userName, login, logout }}>
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
