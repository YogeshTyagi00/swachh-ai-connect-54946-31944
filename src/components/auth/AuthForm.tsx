import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { User, Shield } from "lucide-react";

export default function AuthForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") || "citizen";
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<"citizen" | "authority">(initialType as "citizen" | "authority");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      login(userType, fullName || email.split('@')[0]);
      toast({
        title: "Success! 🎉",
        description: "Signed in successfully!",
      });
      
      if (userType === "authority") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
      setLoading(false);
    }, 1000);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      login(userType, fullName);
      toast({
        title: "Account Created! 🎉",
        description: "Welcome to SwachhAI!",
      });
      
      if (userType === "authority") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light/20 to-background p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-green">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-gradient-primary">
            Welcome to SwachhAI
          </CardTitle>
          <CardDescription className="text-center">
            स्वच्छ भारत - Clean & Green India
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label className="mb-3 block">Login As:</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={userType === "citizen" ? "hero" : "outline"}
                onClick={() => setUserType("citizen")}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Citizen
              </Button>
              <Button
                type="button"
                variant={userType === "authority" ? "hero" : "outline"}
                onClick={() => setUserType("authority")}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Authority
              </Button>
            </div>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  variant="hero"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  variant="hero"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
