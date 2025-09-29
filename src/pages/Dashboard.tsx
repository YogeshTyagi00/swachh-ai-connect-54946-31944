import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Camera, MapPin, Coins, Upload, Send, Trophy, Clock, CheckCircle } from "lucide-react";
import Header from "@/components/layout/Header";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wasteReports, setWasteReports] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form states
  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    location: "",
    imageFile: null as File | null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      setProfile(profileData);

      // Redirect authorities to admin dashboard
      if (profileData?.user_type === 'authority') {
        navigate('/admin');
        return;
      }

      // Fetch user's waste reports
      const { data: reportsData } = await supabase
        .from('waste_reports')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setWasteReports(reportsData || []);

      // Fetch user's complaints
      const { data: complaintsData } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setComplaints(complaintsData || []);

      // Fetch leaderboard
      const { data: leaderboardData } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(10);
      
      setLeaderboard(leaderboardData || []);
    };

    checkAuth();
  }, [navigate]);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // For now, we'll create a complaint without image upload
      // In a real app, you'd upload the image to Supabase Storage first
      const { error } = await supabase
        .from('complaints')
        .insert({
          user_id: user.id,
          title: reportForm.title,
          description: reportForm.description,
          location_name: reportForm.location,
          latitude: 28.6139, // Mock coordinates for Delhi
          longitude: 77.2090,
          image_url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500", // Placeholder
        });

      if (error) throw error;

      toast({
        title: "Report submitted successfully!",
        description: "Municipal authorities have been notified. You earned 10 Green Coins!",
      });

      setReportForm({
        title: "",
        description: "",
        location: "",
        imageFile: null,
      });

      // Refresh data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning border-warning/30';
      case 'in_progress': return 'bg-primary/10 text-primary border-primary/30';
      case 'resolved': return 'bg-success/10 text-success border-success/30';
      default: return 'bg-muted/10 text-muted-foreground border-muted/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'in_progress': return Upload;
      case 'resolved': return CheckCircle;
      default: return Clock;
    }
  };

  if (!user || !profile) {
    return <div className="min-h-screen bg-background">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient-primary mb-2">
            Welcome back, {profile.full_name}!
          </h1>
          <p className="text-muted-foreground">
            Continue your journey towards a cleaner India
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="card-eco">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-primary rounded-full p-3">
                      <Coins className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{profile.green_coins}</p>
                      <p className="text-sm text-muted-foreground">Green Coins</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-eco">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-secondary rounded-full p-3">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-secondary">{wasteReports.length}</p>
                      <p className="text-sm text-muted-foreground">Waste Reports</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-eco">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-primary rounded-full p-3">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{complaints.length}</p>
                      <p className="text-sm text-muted-foreground">Area Reports</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Take action to make your community cleaner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button variant="hero" className="h-24 flex-col gap-2">
                    <Upload className="h-6 w-6" />
                    Upload Waste Photo
                  </Button>
                  <Button variant="eco" className="h-24 flex-col gap-2">
                    <MapPin className="h-6 w-6" />
                    Find Collection Centers
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Report Dirty Area Form */}
            <Card>
              <CardHeader>
                <CardTitle>Report Dirty Area</CardTitle>
                <CardDescription>
                  Help authorities by reporting areas that need attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Garbage dump near bus stop"
                      value={reportForm.title}
                      onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Connaught Place, New Delhi"
                      value={reportForm.location}
                      onChange={(e) => setReportForm({...reportForm, location: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the issue in detail..."
                      value={reportForm.description}
                      onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                      required
                    />
                  </div>

                  <Button type="submit" variant="hero" disabled={isLoading} className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    {isLoading ? "Submitting..." : "Submit Report (+10 Green Coins)"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Your Recent Reports</CardTitle>
                <CardDescription>
                  Track the status of your submitted reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {complaints.length > 0 ? (
                  <div className="space-y-3">
                    {complaints.map((complaint: any) => {
                      const StatusIcon = getStatusIcon(complaint.status);
                      return (
                        <div key={complaint.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <StatusIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{complaint.title}</p>
                              <p className="text-sm text-muted-foreground">{complaint.location_name}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(complaint.status)}>
                            {complaint.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No reports yet. Submit your first report to help your community!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-secondary" />
                  Leaderboard
                </CardTitle>
                <CardDescription>
                  Top eco-warriors in your community
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((user: any, index) => (
                      <div key={user.user_id} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-gradient-secondary text-white' :
                          index === 1 ? 'bg-primary/20 text-primary' :
                          index === 2 ? 'bg-secondary/20 text-secondary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground">{user.green_coins} coins</p>
                        </div>
                        {index < 3 && <Trophy className="h-4 w-4 text-secondary" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Be the first on the leaderboard!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="card-eco">
              <CardHeader>
                <CardTitle className="text-primary">💡 Eco Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-primary">Did you know?</p>
                  <p className="text-muted-foreground">
                    Properly segregating waste can reduce landfill burden by up to 60%!
                  </p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-primary">Pro Tip:</p>
                  <p className="text-muted-foreground">
                    Upload clear photos for better AI classification accuracy.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}