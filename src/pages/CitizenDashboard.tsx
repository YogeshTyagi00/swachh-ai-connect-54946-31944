import { Suspense, lazy } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import GreenCoinsCard from "@/components/dashboard/GreenCoinsCard";
import { Skeleton } from "@/components/ui/skeleton";

const MyReports = lazy(() => import("@/components/dashboard/citizen/MyReports"));
const EcoActions = lazy(() => import("@/components/dashboard/citizen/EcoActions"));
const LeaderboardWidget = lazy(() => import("@/components/dashboard/citizen/LeaderboardWidget"));

export default function CitizenDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Citizen Dashboard</h1>
          <p className="text-muted-foreground">Manage your eco-friendly actions and earn rewards</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GreenCoinsCard />
            
            <Suspense fallback={<Skeleton className="h-96" />}>
              <MyReports />
            </Suspense>
            
            <Suspense fallback={<Skeleton className="h-64" />}>
              <EcoActions />
            </Suspense>
          </div>

          <div className="space-y-6">
            <Suspense fallback={<Skeleton className="h-96" />}>
              <LeaderboardWidget />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
