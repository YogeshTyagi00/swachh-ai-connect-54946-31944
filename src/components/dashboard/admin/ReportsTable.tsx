import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabaseService } from "@/services/supabaseService";
import { MapPin, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Report {
  id: string;
  title: string;
  description: string;
  location_name: string | null;
  status: string;
  priority?: "low" | "medium" | "high";
  image_url: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export default function ReportsTable() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseService.getAllReports().then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, []);

  const handleStatusChange = async (reportId: string, newStatus: "pending" | "in_progress" | "resolved") => {
    try {
      await supabaseService.updateReportStatus(reportId, newStatus);
      setReports(reports.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r)));
      toast({
        title: "Status Updated ✅",
        description: newStatus === "resolved" ? "Green Coins awarded to citizen" : "Report status updated",
      });
    } catch (error) {
      toast({
        title: "Failed to update",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePriorityChange = async (reportId: string, newPriority: "low" | "medium" | "high") => {
    try {
      await supabaseService.updateReportPriority(reportId, newPriority);
      setReports(reports.map((r) => (r.id === reportId ? { ...r, priority: newPriority } : r)));
      toast({
        title: "Priority Updated",
        description: "Report priority has been changed",
      });
    } catch (error) {
      toast({
        title: "Failed to update",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <Badge className="bg-green-500/10 text-green-700">Resolved</Badge>;
      case "in_progress":
        return <Badge className="bg-orange-500/10 text-orange-700">In Progress</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-700">Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500/10 text-red-700">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500/10 text-yellow-700">Medium</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-700">Low</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Reports</CardTitle>
        <CardDescription>Manage waste management reports from citizens</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    {report.image_url && (
                      <img 
                        src={report.image_url} 
                        alt="Report" 
                        className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80"
                        onClick={() => window.open(report.image_url, '_blank')}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {report.location_name || "Unknown"}
                    </div>
                    {report.latitude && report.longitude && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="font-medium">{report.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{report.description}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(report.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <select
                      value={report.priority}
                      onChange={(e) => handlePriorityChange(report.id, e.target.value as "low" | "medium" | "high")}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <select
                      value={report.status}
                      onChange={(e) => handleStatusChange(report.id, e.target.value as "pending" | "in_progress" | "resolved")}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    {report.status !== "resolved" && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(report.id, "resolved")}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
