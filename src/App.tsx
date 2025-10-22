import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Leaderboard from "./pages/Leaderboard";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const CitizenDashboard = lazy(() => import("./pages/CitizenDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/citizen-dashboard"
            element={
              <ProtectedRoute allowedRoles={["citizen"]}>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                  <CitizenDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                  <AdminDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/contact" element={<Contact />} />
          {/* Legacy redirects */}
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<Navigate to="/citizen-dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
