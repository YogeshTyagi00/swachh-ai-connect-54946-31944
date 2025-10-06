import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Leaf, User, LogOut, Home, Trophy, Mail, LayoutDashboard, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function Header() {
  const { isAuthenticated, userType, userName, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-primary rounded-full p-2">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-primary">SwachhAI</h1>
              <p className="text-xs text-muted-foreground">स्वच्छ भारत</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={cn(
                "text-foreground hover:text-primary transition-colors flex items-center gap-1",
                isActive("/") && "text-primary font-semibold"
              )}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            {isAuthenticated && userType === "citizen" && (
              <Link 
                to="/dashboard" 
                className={cn(
                  "text-foreground hover:text-primary transition-colors flex items-center gap-1",
                  isActive("/dashboard") && "text-primary font-semibold"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            )}
            {isAuthenticated && userType === "authority" && (
              <Link 
                to="/admin" 
                className={cn(
                  "text-foreground hover:text-primary transition-colors flex items-center gap-1",
                  isActive("/admin") && "text-primary font-semibold"
                )}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
            <Link 
              to="/leaderboard" 
              className={cn(
                "text-foreground hover:text-primary transition-colors flex items-center gap-1",
                isActive("/leaderboard") && "text-primary font-semibold"
              )}
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Link>
            <Link 
              to="/contact" 
              className={cn(
                "text-foreground hover:text-primary transition-colors flex items-center gap-1",
                isActive("/contact") && "text-primary font-semibold"
              )}
            >
              <Mail className="h-4 w-4" />
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(userName || "U")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="px-2 py-2 text-sm">
                      <p className="font-semibold">{userName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{userType}</p>
                    </div>
                    <DropdownMenuItem onClick={() => navigate(userType === 'authority' ? '/admin' : '/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate("/auth?type=citizen")}>
                  <User className="h-4 w-4 mr-2" />
                  Citizen Login
                </Button>
                <Button variant="hero" onClick={() => navigate("/auth?type=authority")}>
                  <Shield className="h-4 w-4 mr-2" />
                  Authority Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}