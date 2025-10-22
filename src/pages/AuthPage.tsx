import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AuthForm from "@/components/auth/AuthForm";

export default function AuthPage() {
  const navigate = useNavigate();

  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // If using our app auth, redirect to the correct dashboard
    if (isAuthenticated && user) {
      navigate(user.role === "admin" ? "/admin-dashboard" : "/citizen-dashboard");
      return;
    }

    // Additionally, check backend session (if using backend auth elsewhere)
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Default to home if backend session exists but local auth not set
        navigate("/");
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [isAuthenticated, user, navigate]);

  return <AuthForm />;
}