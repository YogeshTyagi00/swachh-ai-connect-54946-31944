import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export type UserRole = "citizen" | "admin" | null;

export interface User {
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
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateGreenCoins: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile and role
  const fetchUserData = async (userId: string) => {
    try {
      const [profileResult, roleResult] = await Promise.all([
        supabase.from("profiles" as any).select("*").eq("user_id", userId).single(),
        supabase.from("user_roles" as any).select("role").eq("user_id", userId).single()
      ]);

      if (profileResult.data && roleResult.data) {
        const profile = profileResult.data as any;
        const role = roleResult.data as any;
        return {
          id: userId,
          name: profile.full_name,
          email: profile.email,
          role: role.role as UserRole,
          greenCoins: profile.green_coins
        };
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
    return null;
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer user data fetching
          setTimeout(async () => {
            const userData = await fetchUserData(session.user.id);
            setUser(userData);
            setLoading(false);
          }, 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const userData = await fetchUserData(session.user.id);
        setUser(userData);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Subscribe to green_coins changes for the current user
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Update user's green coins when profile changes
          if (payload.new && 'green_coins' in payload.new) {
            setUser(prev => prev ? { ...prev, greenCoins: (payload.new as any).green_coins } : null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const login = async (email: string, password: string, role: UserRole) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const userData = await fetchUserData(data.user.id);
      
      // Verify the user has the correct role
      if (userData && userData.role !== role) {
        await supabase.auth.signOut();
        throw new Error(`This account is not registered as ${role}`);
      }
      
      setUser(userData);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: name
        }
      }
    });

    if (error) throw error;

    if (data.user) {
      const userData = await fetchUserData(data.user.id);
      setUser(userData);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const updateGreenCoins = (amount: number) => {
    if (user) {
      setUser({ ...user, greenCoins: user.greenCoins + amount });
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
