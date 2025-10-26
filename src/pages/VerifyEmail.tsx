import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowRight } from "lucide-react";

export default function VerifyEmail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-primary to-primary/70 rounded-full p-4">
              <Mail className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verification Link Sent!</CardTitle>
          <CardDescription className="text-base">
            We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
            <p className="font-medium">Next Steps:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the verification link in the email</li>
              <li>Return here and sign in</li>
            </ul>
          </div>

          <Button
            onClick={() => navigate("/login")}
            className="w-full"
            size="lg"
          >
            Go to Sign In
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
