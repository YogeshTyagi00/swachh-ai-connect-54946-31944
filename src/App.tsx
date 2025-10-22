import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Leaderboard from "./pages/Leaderboard";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/citizen-dashboard"
            element={
              <ProtectedRoute requiredRole="citizen">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/citizen-dashboard" replace />} />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="authority">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
          <Route path="/authority-dashboard" element={<Navigate to="/admin-dashboard" replace />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/contact" element={<Contact />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
