import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Leaf, User, Shield } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"citizen" | "admin">("citizen");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signup(formData.name, formData.email, formData.password, role);
      toast({
        title: "Account created! 🎉",
        description: `Welcome to SwachhAI${role === "citizen" ? "! You've earned 50 Green Coins!" : "!"}`,
      });
      navigate(role === "admin" ? "/admin-dashboard" : "/citizen-dashboard");
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-primary to-primary/70 rounded-full p-3">
              <Leaf className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Join SwachhAI</CardTitle>
          <CardDescription>Create your account and start earning Green Coins</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label className="mb-3 block">Sign up as:</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={role === "citizen" ? "default" : "outline"}
                onClick={() => setRole("citizen")}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Citizen
              </Button>
              <Button
                type="button"
                variant={role === "admin" ? "default" : "outline"}
                onClick={() => setRole("admin")}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
