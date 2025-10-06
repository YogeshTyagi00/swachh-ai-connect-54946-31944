import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle, CheckCircle, Clock, MapPin } from "lucide-react";
import { mockComplaints } from "@/data/mockData";
import ComplaintMap from "@/components/maps/ComplaintMap";

export default function AdminDashboard() {
  const { userType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState(mockComplaints);

  if (userType !== "authority") {
    navigate("/");
    return null;
  }

  const handleStatusUpdate = (id: string) => {
    setComplaints(complaints.map(c => 
      c.id === id ? { ...c, status: "Resolved" } : c
    ));
    toast({
      title: "Status Updated ✅",
      description: `Complaint ${id} has been marked as resolved.`,
    });
  };

  const pendingCount = complaints.filter(c => c.status === "Pending").length;
  const inProgressCount = complaints.filter(c => c.status === "In Progress").length;
  const resolvedCount = complaints.filter(c => c.status === "Resolved").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Resolved":
        return <Badge className="bg-green-500/10 text-green-700 border-green-200">Resolved</Badge>;
      case "In Progress":
        return <Badge className="bg-orange-500/10 text-orange-700 border-orange-200">In Progress</Badge>;
      default:
        return <Badge className="bg-red-500/10 text-red-700 border-red-200">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary mb-2">Authority Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage waste complaints</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Pending Complaints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{pendingCount}</div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{inProgressCount}</div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Resolved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{resolvedCount}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Complaints List</CardTitle>
              <CardDescription>All waste management complaints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaints.map((complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell className="font-medium">{complaint.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {complaint.location}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{complaint.description}</TableCell>
                        <TableCell className="text-sm">{complaint.reportedBy}</TableCell>
                        <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                        <TableCell>
                          {complaint.status !== "Resolved" && (
                            <Button
                              size="sm"
                              variant="eco"
                              onClick={() => handleStatusUpdate(complaint.id)}
                            >
                              Mark Resolved
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

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Complaints Map</CardTitle>
              <CardDescription>Geographic view of all complaints</CardDescription>
            </CardHeader>
            <CardContent>
              <ComplaintMap complaints={complaints} />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
