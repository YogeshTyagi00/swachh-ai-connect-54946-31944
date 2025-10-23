import { Suspense, lazy } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckCircle2, Clock } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const ReportsTable = lazy(() => import("@/components/dashboard/admin/ReportsTable"));
const GreenCoinsManager = lazy(() => import("@/components/dashboard/admin/GreenCoinsManager"));
const OverviewCharts = lazy(() => import("@/components/dashboard/admin/OverviewCharts"));
const AdminHeatmap = lazy(() => import("@/components/admin/AdminHeatmap"));

export default function AdminDashboard() {
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
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,543</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">486</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">70% resolution rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">144</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <ErrorBoundary>
            <Suspense fallback={<Skeleton className="h-96" />}>
              <AdminHeatmap />
            </Suspense>
          </ErrorBoundary>

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
