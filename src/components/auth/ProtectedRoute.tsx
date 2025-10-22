import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "citizen" | "authority";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, userType, initialized } = useAuth();
  const location = useLocation();

  // Show a simple skeleton while we initialize auth from localStorage
  if (!initialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to auth page with role hint if available
    const type = requiredRole ?? (userType ?? "citizen");
    return <Navigate to={`/auth?type=${type}`} state={{ from: location }} replace />;
  }

  if (requiredRole && userType !== requiredRole) {
    // If role mismatch, send to correct dashboard based on stored role
    return (
      <Navigate
        to={userType === "authority" ? "/admin-dashboard" : "/citizen-dashboard"}
        replace
      />
    );
  }

  return <>{children}</>;
}
