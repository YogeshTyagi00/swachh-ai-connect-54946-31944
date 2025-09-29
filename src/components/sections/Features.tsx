import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, Coins, BarChart3, Shield, Smartphone, Brain, Award } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Camera,
      title: "AI Waste Classification",
      description: "Upload a photo of waste and get instant AI-powered classification with proper disposal instructions.",
      badge: "AI Powered",
      gradient: "from-primary to-primary-dark"
    },
    {
      icon: MapPin,
      title: "Smart Location Tracking",
      description: "Automatically detect your location and find the nearest appropriate waste collection centers.",
      badge: "GPS Enabled",
      gradient: "from-secondary to-secondary-dark"
    },
    {
      icon: Coins,
      title: "Green Coins Rewards",
      description: "Earn Green Coins for every proper waste disposal and eco-friendly action you take.",
      badge: "Gamified",
      gradient: "from-primary to-accent"
    },
    {
      icon: BarChart3,
      title: "Authority Dashboard",
      description: "Municipal authorities can track complaints, monitor waste patterns, and manage resources efficiently.",
      badge: "Analytics",
      gradient: "from-secondary to-primary"
    },
    {
      icon: Shield,
      title: "Community Reporting",
      description: "Report dirty areas with photo evidence and GPS coordinates for quick authority response.",
      badge: "Community",
      gradient: "from-primary-dark to-primary"
    },
    {
      icon: Smartphone,
      title: "QR Code Integration",
      description: "Scan QR codes on waste bins to log your disposal activities and earn extra rewards.",
      badge: "Smart Tech",
      gradient: "from-accent to-secondary"
    }
  ];

  const benefits = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Advanced machine learning algorithms provide accurate waste classification and disposal guidance.",
      stats: "95% Accuracy"
    },
    {
      icon: Award,
      title: "Gamification System",
      description: "Engage citizens with rewards, leaderboards, and achievements for sustainable behavior.",
      stats: "10K+ Active Users"
    },
    {
      icon: MapPin,
      title: "Real-time Mapping",
      description: "Interactive maps showing collection centers, complaint hotspots, and optimal disposal routes.",
      stats: "200+ Locations"
    }
  ];

  return (
    <section id="features" className="py-16 bg-gradient-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary-light/20 text-primary border-primary/30">
            Platform Features
          </Badge>
          <h2 className="text-4xl font-bold text-gradient-primary mb-4">
            Revolutionizing Waste Management
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering citizens and authorities with cutting-edge AI technology for a cleaner, more sustainable India.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="card-eco group hover:shadow-green transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`bg-gradient-to-r ${feature.gradient} p-3 rounded-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl p-8 shadow-green">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gradient-primary mb-4">
              Why Choose SwachhAI?
            </h3>
            <p className="text-muted-foreground text-lg">
              Built for India, powered by innovation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-primary rounded-full p-4 w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {benefit.title}
                </h4>
                <p className="text-muted-foreground mb-3">
                  {benefit.description}
                </p>
                <Badge className="bg-secondary/10 text-secondary border-secondary/30">
                  {benefit.stats}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}