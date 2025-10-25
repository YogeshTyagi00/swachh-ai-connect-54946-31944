import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabaseService } from "@/services/supabaseService";
import { MapPin, CheckCircle, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Report {
  id: string;
  title: string;
  description: string;
  location_name: string | null;
  status: string;
  priority: string;
  created_at: string;
  user_id: string;
  image_url: string;
  latitude: number | null;
  longitude: number | null;
}

export default function ReportsTable() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await supabaseService.getAllReports();
      setReports(data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading reports:", error);
      setLoading(false);
    }
  };

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setEditStatus(report.status);
    setEditPriority(report.priority || "medium");
    setIsDetailsOpen(true);
  };

  const handleUpdateReport = async () => {
    if (!selectedReport) return;

    try {
      await supabaseService.updateReportStatus(selectedReport.id, editStatus as any);
      
      // Update priority if changed
      if (editPriority !== selectedReport.priority) {
        await supabaseService.updateReportPriority(selectedReport.id, editPriority);
      }

      setReports(reports.map((r) => 
        r.id === selectedReport.id 
          ? { ...r, status: editStatus, priority: editPriority } 
          : r
      ));
      
      toast({
        title: "Report Updated ✅",
        description: "Report status and priority have been updated",
      });
      setIsDetailsOpen(false);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <Badge className="bg-green-500/10 text-green-700">Resolved</Badge>;
      case "in-progress":
      case "in_progress":
        return <Badge className="bg-orange-500/10 text-orange-700">In Progress</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-700">Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge className="bg-red-500/10 text-red-700">High</Badge>;
      case "low":
        return <Badge className="bg-blue-500/10 text-blue-700">Low</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-700">Medium</Badge>;
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
    <>
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
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {report.location_name || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="font-medium">{report.title}</div>
                      <div className="text-sm text-muted-foreground truncate">{report.description}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getPriorityBadge(report.priority || "medium")}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleViewDetails(report)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>View and edit report information</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Report ID</Label>
                  <p className="font-medium">{selectedReport.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Date Submitted</Label>
                  <p className="font-medium">{new Date(selectedReport.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Title</Label>
                <p className="font-medium">{selectedReport.title}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Description</Label>
                <p className="text-sm">{selectedReport.description}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Location</Label>
                <p className="text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {selectedReport.location_name || "Unknown"}
                  {selectedReport.latitude && selectedReport.longitude && (
                    <span className="text-muted-foreground">
                      ({selectedReport.latitude.toFixed(4)}, {selectedReport.longitude.toFixed(4)})
                    </span>
                  )}
                </p>
              </div>

              {selectedReport.image_url && (
                <div>
                  <Label className="text-sm text-muted-foreground">Image</Label>
                  <img 
                    src={selectedReport.image_url} 
                    alt="Report" 
                    className="w-full h-48 object-cover rounded-lg mt-2"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={editPriority} onValueChange={setEditPriority}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdateReport} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update Report
                </Button>
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
