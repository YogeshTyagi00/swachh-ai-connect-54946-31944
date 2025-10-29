import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
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

      // Simulate sending email (replace this with actual backend call)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await signup(name, email, password);
      sessionStorage.removeItem("pendingSignup");

      toast({
        title: "Verification email sent! 📧",
        description: "Please check your inbox to verify your email address.",
      });

      navigate("/citizen-dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to send verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    toast({
      title: "Verification email resent! ✉",
      description: "Check your inbox again for the verification link.",
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
            Click the button below to send a verification email to your inbox.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={handleVerify}
              className="w-full"
              disabled={loading}
            >
              {loading ? "Sending..." : "Verify Email"}
            </Button>

            <div className="mt-4 text-center space-y-2">
              <button
                type="button"
                onClick={handleResend}
                className="text-sm text-primary hover:underline"
              >
                Resend verification email
              </button>
              <div className="text-sm">
                Wrong email?{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Go back
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}