import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabaseService } from "@/services/supabaseService";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, MapPin, Calendar, Coins, Upload, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import LocationPreviewMap from "@/components/maps/LocationPreviewMap";

interface Report {
  id: string;
  title: string;
  description: string;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  status: "pending" | "in_progress" | "resolved";
  coins_earned: number;
  created_at: string;
  image_url: string;
  priority?: "low" | "medium" | "high";
}

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (user) {
      supabaseService.getUserReports(user.id).then((data) => {
        setReports(data);
        setLoading(false);
      });

      // Subscribe to realtime updates
      const channel = supabase
        .channel('user-reports')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'complaints',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // Refetch reports on any change
            supabaseService.getUserReports(user.id).then(setReports);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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
    
    // Validation
    if (!formData.latitude || !formData.longitude) {
      toast({
        title: "Location required",
        description: "Please detect your location or enter coordinates manually.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b";

      // Step 1: Upload image if provided (parallel with AI processing)
      const uploadPromise = imageFile ? (async () => {
        setUploadingImage(true);
        const fileExt = imageFile.name.split(".").pop();
        const timestamp = Date.now();
        const filePath = `${user!.id}/${timestamp}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("report-images")
          .upload(filePath, imageFile, { upsert: true, contentType: imageFile.type });

        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
          .from("report-images")
          .getPublicUrl(filePath);

        setUploadingImage(false);
        return publicUrl;
      })() : Promise.resolve(imageUrl);

      // Step 2: AI backend call (parallel, don't wait for it)
      if (imageFile) {
        const aiFormData = new FormData();
        aiFormData.append("file", imageFile);
        aiFormData.append("location", formData.location || "User did not specify");

        fetch("https://civic-bot-backend.onrender.com/predict", {
          method: "POST",
          body: aiFormData,
        }).then(aiResponse => {
          if (aiResponse.ok) {
            aiResponse.json().then(aiData => {
              const prediction = aiData.prediction || "Unknown";
              const emailStatus = aiData.email_status || "Not sent";
              toast({
                title: "AI Analysis Complete",
                description: `Detected: ${prediction} | Email: ${emailStatus}`,
              });
            });
          }
        }).catch(() => {
          // Silent fail - don't block submission
        });
      }

      // Step 3: Wait for image upload, then insert report
      imageUrl = await uploadPromise;

      const { data: newReport, error: insertError } = await supabase
        .from("complaints")
        .insert({
          user_id: user!.id,
          title: formData.title,
          description: formData.description,
          location_name: formData.location,
          latitude: formData.latitude,
          longitude: formData.longitude,
          image_url: imageUrl,
          priority: "medium",
          status: "pending",
          coins_earned: 10,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Success - update UI immediately
      if (newReport) {
        setReports([newReport as Report, ...reports]);
        toast({
          title: "✅ Report submitted!",
          description: "You'll earn 10 Green Coins once resolved.",
        });
        
        // Reset form and close dialog
        setFormData({ title: "", description: "", location: "", latitude: 0, longitude: 0 });
        setImageFile(null);
        setIsOpen(false);
      }
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
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
            <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                  <Label>Location (Required)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={detectLocation}
                    disabled={detectingLocation}
                  >
                    {detectingLocation ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Detecting location...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        Use My Current Location
                      </>
                    )}
                  </Button>
                  
                  {formData.latitude !== 0 && formData.longitude !== 0 && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Location: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                      </div>
                      <LocationPreviewMap 
                        latitude={formData.latitude} 
                        longitude={formData.longitude}
                        height="180px"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      value={formData.latitude || ""}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                      required
                    />
                    <Input
                      type="number"
                      step="any"
                      placeholder="Longitude"
                      value={formData.longitude || ""}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                      required
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
                <div className="space-y-2">
                  <Label htmlFor="image">Image (Optional)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      if (!f) { setImageFile(null); return; }
                      const allowed = ["image/jpeg", "image/png", "image/jpg"];
                      if (!allowed.includes(f.type)) {
                        setImageFile(null);
                        toast({
                          title: "Invalid file type",
                          description: "Please upload a .jpg, .jpeg, or .png image.",
                          variant: "destructive",
                        });
                        return;
                      }
                      setImageFile(f);
                    }}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting || uploadingImage}>
                  {uploadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading Image...
                    </>
                  ) : submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting Report...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Report
                    </>
                  )}
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
                    <h4 className="font-semibold">{report.title}</h4>
                    {getStatusBadge(report.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {report.location_name || "Unknown"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(report.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 text-primary">
                      <Coins className="h-3 w-3" />
                      +{report.coins_earned}
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
