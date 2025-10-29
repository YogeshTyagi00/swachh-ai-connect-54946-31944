import { Suspense, lazy, useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckCircle2, Clock } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { supabaseService } from "@/services/supabaseService";

const ReportsTable = lazy(() => import("@/components/dashboard/admin/ReportsTable"));
const GreenCoinsManager = lazy(() => import("@/components/dashboard/admin/GreenCoinsManager"));
const OverviewCharts = lazy(() => import("@/components/dashboard/admin/OverviewCharts"));
const AdminHeatmap = lazy(() => import("@/components/admin/AdminHeatmap"));

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    resolved: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await supabaseService.getAdminStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage reports, users, and green coins distribution</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Citizens</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Active citizens</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.totalReports}</div>
                  <p className="text-xs text-muted-foreground">All submissions</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.resolved}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalReports > 0 ? Math.round((stats.resolved / stats.totalReports) * 100) : 0}% resolution rate
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">Needs attention</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="relative overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ 
                backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80')",
                filter: "blur(2px)"
              }}
            />
            <CardContent className="relative z-10 flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
              <div className="text-6xl">🗺️</div>
              <h3 className="text-2xl font-bold">Heatmap Coming Soon...</h3>
              <p className="text-muted-foreground max-w-md">
                We're working on an interactive heatmap to visualize waste reports across your city. Stay tuned!
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ErrorBoundary>
                <Suspense fallback={<Skeleton className="h-96" />}>
                  <ReportsTable />
                </Suspense>
              </ErrorBoundary>
              
              <ErrorBoundary>
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <OverviewCharts />
                </Suspense>
              </ErrorBoundary>
            </div>

            <div className="space-y-6">
              <ErrorBoundary>
                <Suspense fallback={<Skeleton className="h-96" />}>
                  <GreenCoinsManager />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
