import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle } from "lucide-react";

export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-primary to-primary/70 rounded-full p-3">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verification Link Sent!</CardTitle>
          <CardDescription>
            We've sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
            <Mail className="h-4 w-4" />
            <p>Please check your email and click the verification link</p>
          </div>
          
          <div className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Once verified, you can sign in to your account
            </p>
            <Link to="/login">
              <Button className="w-full">
                Go to Sign In
              </Button>
            </Link>
          </div>

          <div className="text-sm text-muted-foreground">
            Didn't receive the email?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Try signing up again
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
