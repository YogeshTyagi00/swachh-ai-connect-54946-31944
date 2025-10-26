import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface ReportStats {
  reportsByStatus: { name: string; value: number }[];
  monthlyTrends: { month: string; reports: number; resolved: number }[];
}

export default function OverviewCharts() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all reports
        const { data: reports, error } = await supabase
          .from("complaints" as any)
          .select("status, created_at");

        if (error) throw error;

        // Calculate reports by status
        const statusCounts: Record<string, number> = {
          pending: 0,
          in_progress: 0,
          resolved: 0,
        };

        reports?.forEach((report: any) => {
          statusCounts[report.status] = (statusCounts[report.status] || 0) + 1;
        });

        const reportsByStatus = [
          { name: "Pending", value: statusCounts.pending },
          { name: "In Progress", value: statusCounts.in_progress },
          { name: "Resolved", value: statusCounts.resolved },
        ];

        // Calculate monthly trends (last 6 months)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();
        const monthlyData: Record<string, { reports: number; resolved: number }> = {};

        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
          monthlyData[monthKey] = { reports: 0, resolved: 0 };
        }

        reports?.forEach((report: any) => {
          const date = new Date(report.created_at);
          const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
          
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].reports++;
            if (report.status === "resolved") {
              monthlyData[monthKey].resolved++;
            }
          }
        });

        const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => ({
          month: month.split(" ")[0], // Just the month name
          reports: data.reports,
          resolved: data.resolved,
        }));

        setStats({ reportsByStatus, monthlyTrends });
      } catch (error) {
        console.error("Failed to fetch chart stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('chart-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px]" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Reports by Status</CardTitle>
          <CardDescription>Current distribution of report statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.reportsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.reportsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4 text-xs">
            {stats.reportsByStatus.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index] }} />
                <span>{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
          <CardDescription>Reports submitted vs resolved (Last 6 months)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="reports" fill="#6366f1" name="Submitted" />
              <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
