import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Leaf, Mail } from "lucide-react";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pendingSignup = sessionStorage.getItem("pendingSignup");
      
      if (!pendingSignup) {
        toast({
          title: "Session expired",
          description: "Please sign up again.",
          variant: "destructive",
        });
        navigate("/signup");
        return;
      }

      const { name, email, password } = JSON.parse(pendingSignup);

      // Simulate verification (in production, verify with backend)
      if (verificationCode.length === 6) {
        await signup(name, email, password);
        sessionStorage.removeItem("pendingSignup");
        
        toast({
          title: "Account verified! 🎉",
          description: "Welcome to SwachhAI! You've earned 50 Green Coins!",
        });
        navigate("/citizen-dashboard");
      } else {
        throw new Error("Invalid code");
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Please check your code and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    toast({
      title: "Code resent!",
      description: "Check your email for a new verification code.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-primary to-primary/70 rounded-full p-3">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || verificationCode.length !== 6}>
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="mt-4 text-center space-y-2">
            <button
              type="button"
              onClick={handleResend}
              className="text-sm text-primary hover:underline"
            >
              Resend verification code
            </button>
            <div className="text-sm">
              Wrong email?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Go back
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
