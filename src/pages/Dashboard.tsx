import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Coins, MapPin, Award, Camera } from "lucide-react";
import CollectionCentersMap from "@/components/maps/CollectionCentersMap";
import { wasteCategories } from "@/data/mockData";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { userType, userName, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [greenCoins, setGreenCoins] = useState(50);
  const [classification, setClassification] = useState<string | null>(null);
  const [reportData, setReportData] = useState({
    location: "",
    description: "",
  });

  // Simulate loading of mock data to avoid blank screen
  const [loadingData, setLoadingData] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoadingData(false), 600);
    return () => clearTimeout(t);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const categories = ["Biodegradable", "Recyclable", "Hazardous"];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      setTimeout(() => {
        setClassification(randomCategory);
        setGreenCoins(prev => prev + 10);
        toast({
          title: "Classification Complete! 🎯",
          description: `Waste classified as ${randomCategory}. +10 Green Coins earned!`,
        });
      }, 1000);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGreenCoins(prev => prev + 10);
    toast({
      title: "Report Submitted Successfully! 📍",
      description: "Thank you for keeping our city clean. +10 Green Coins earned!",
    });
    setReportData({ location: "", description: "" });
  };

  const categoryInfo = classification ? wasteCategories.find(c => c.name === classification) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {loadingData ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-20 w-40" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-72" />
              <Skeleton className="h-72" />
            </div>
            <Skeleton className="h-96" />
          </div>
        ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gradient-primary mb-2">Welcome, {userName || "Citizen"}!</h1>
              <p className="text-muted-foreground">Manage waste smartly, earn rewards!</p>
            </div>
            <Card className="border-primary/20">
              <CardContent className="pt-6 flex items-center gap-3">
                <Coins className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Green Coins</p>
                  <p className="text-3xl font-bold text-primary">{greenCoins}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Upload Waste Image
                </CardTitle>
                <CardDescription>
                  Let AI classify your waste and get disposal tips
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="waste-image">Upload Image</Label>
                  <Input
                    id="waste-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>

                {classification && categoryInfo && (
                  <div className="p-4 bg-primary-light/10 rounded-lg space-y-2 animate-fade-in">
                    <h4 className={`font-semibold ${categoryInfo.color}`}>
                      Classification: {classification}
                    </h4>
                    <p className="text-sm text-muted-foreground">{categoryInfo.tips}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Report Dirty Area
                </CardTitle>
                <CardDescription>
                  Help us keep the city clean
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., MG Road, Sector 15"
                      value={reportData.location}
                      onChange={(e) => setReportData({ ...reportData, location: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the issue..."
                      rows={3}
                      value={reportData.description}
                      onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report-image">Upload Image (Optional)</Label>
                    <Input
                      id="report-image"
                      type="file"
                      accept="image/*"
                    />
                  </div>

                  <Button type="submit" className="w-full" variant="hero">
                    Submit Report
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Nearby Collection Centers
              </CardTitle>
              <CardDescription>
                Find the nearest waste collection facility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CollectionCentersMap />
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button variant="eco" size="lg" onClick={() => navigate("/leaderboard")}>
              <Award className="h-5 w-5 mr-2" />
              View Leaderboard
            </Button>
          </div>
        </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
