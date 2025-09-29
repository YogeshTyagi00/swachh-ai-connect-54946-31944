import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Leaf, Recycle, Shield, Trophy, Users, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  const stats = [
    { icon: Recycle, label: "Waste Reports", value: "10K+", color: "text-primary" },
    { icon: Users, label: "Active Citizens", value: "5K+", color: "text-secondary" },
    { icon: MapPin, label: "Collection Centers", value: "200+", color: "text-primary" },
    { icon: Trophy, label: "Green Coins Earned", value: "1M+", color: "text-secondary" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-hero min-h-[80vh] flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-16 h-16 bg-white rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Leaf className="w-4 h-4 mr-1" />
                स्वच्छ भारत मिशन
              </Badge>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="block">SwachhAI</span>
                <span className="block text-3xl lg:text-4xl font-normal opacity-90">
                  AI-Powered Waste Management
                </span>
              </h1>
              
              <p className="text-xl text-white/90 max-w-lg">
                Join millions of Indians in building a cleaner future. Upload waste photos, get AI-powered disposal guidance, and earn Green Coins for every eco-friendly action.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button 
                variant="saffron" 
                size="xl" 
                onClick={() => navigate("/auth")}
                className="group"
              >
                Start Your Green Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="xl" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Watch Demo
              </Button>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-2 gap-4 pt-8">
              <div className="flex items-center gap-3 text-white/90">
                <div className="bg-white/20 rounded-full p-2">
                  <Recycle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">AI Waste Classification</p>
                  <p className="text-sm opacity-75">Instant disposal guidance</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-white/90">
                <div className="bg-white/20 rounded-full p-2">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Report Dirty Areas</p>
                  <p className="text-sm opacity-75">Help authorities respond</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Stats Cards */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 animate-glow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`${stat.color}`}>
                        <stat.icon className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="text-white">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm opacity-90">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Card */}
            <Card className="bg-white/15 backdrop-blur-sm border-white/30 p-6">
              <div className="text-center text-white space-y-4">
                <h3 className="text-xl font-semibold">Ready to make a difference?</h3>
                <p className="text-white/90">
                  Join thousands of eco-warriors making India cleaner, one action at a time.
                </p>
                <Button variant="secondary" className="w-full" onClick={() => navigate("/auth")}>
                  Join the Movement
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}