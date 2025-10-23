import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { mockApi, Report } from "@/services/mockService";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, MapPin, Calendar, Coins } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyReports() {
  const { user, updateGreenCoins } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    latitude: 0,
    longitude: 0,
  });
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    if (user) {
      mockApi.getUserReports(user.id).then((data) => {
        setReports(data);
        setLoading(false);
      });
    }
  }, [user]);

  const detectLocation = () => {
    setDetectingLocation(true);
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        toast({
          title: "Location detected!",
          description: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`,
        });
        setDetectingLocation(false);
      },
      (error) => {
        toast({
          title: "Location detection failed",
          description: "Please enter location manually.",
          variant: "destructive",
        });
        setDetectingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newReport = await mockApi.submitReport({
        userId: user!.id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        status: "pending",
        coordinates: [formData.latitude || 28.6139, formData.longitude || 77.209],
      });

      setReports([newReport, ...reports]);
      updateGreenCoins(10);
      toast({
        title: "Report Submitted! 🎉",
        description: "You earned 10 Green Coins for reporting!",
      });
      setFormData({ title: "", description: "", location: "", latitude: 0, longitude: 0 });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Reports</CardTitle>
            <CardDescription>Track your waste management reports</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit New Report</DialogTitle>
                <DialogDescription>Report a waste management issue and earn 10 Green Coins</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Overflowing garbage bin"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location Name</Label>
                  <Input
                    id="location"
                    placeholder="e.g., MG Road, Sector 15"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Coordinates</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={detectLocation}
                    disabled={detectingLocation}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {detectingLocation ? "Detecting..." : "Use My Current Location"}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      value={formData.latitude || ""}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    />
                    <Input
                      type="number"
                      step="any"
                      placeholder="Longitude"
                      value={formData.longitude || ""}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the waste issue..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Report"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No reports yet. Submit your first report to earn Green Coins!</p>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{report.description}</h4>
                    {getStatusBadge(report.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {report.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {report.date}
                    </div>
                    <div className="flex items-center gap-1 text-primary">
                      <Coins className="h-3 w-3" />
                      +{report.coinsEarned}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
