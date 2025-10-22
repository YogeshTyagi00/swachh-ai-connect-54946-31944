import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { mockApi, Report } from "@/services/mockService";
import { MapPin, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsTable() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getAllReports().then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, []);

  const handleResolve = async (reportId: string) => {
    try {
      const updatedReport = await mockApi.updateReportStatus(reportId, "resolved");
      setReports(reports.map((r) => (r.id === reportId ? updatedReport : r)));
      toast({
        title: "Report Resolved ✅",
        description: `Green Coins awarded to citizen`,
      });
    } catch (error) {
      toast({
        title: "Failed to update",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Report["status"]) => {
    switch (status) {
      case "resolved":
        return <Badge className="bg-green-500/10 text-green-700">Resolved</Badge>;
      case "in-progress":
        return <Badge className="bg-orange-500/10 text-orange-700">In Progress</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-700">Pending</Badge>;
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
                <TableHead>Location</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {report.location}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{report.description}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{report.date}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    {report.status !== "resolved" && (
                      <Button size="sm" variant="outline" onClick={() => handleResolve(report.id)}>
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
