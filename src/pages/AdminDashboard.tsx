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
const ComplaintHeatmap = lazy(() => import("@/components/maps/ComplaintHeatmap"));

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🗺️</span>
                City Hotspot Map
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time visualization of complaint hotspots across the city
              </p>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                <Suspense fallback={<Skeleton className="h-[600px]" />}>
                  <ComplaintHeatmap height="600px" showControls={true} />
                </Suspense>
              </ErrorBoundary>
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
