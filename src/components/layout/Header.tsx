import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Leaf, User, LogOut, Home, Trophy, Mail, LayoutDashboard, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
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
                          {getInitials(user?.name || "U")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="px-2 py-2 text-sm">
                      <p className="font-semibold">{user?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                    </div>
                    <DropdownMenuItem onClick={() => navigate(user?.role === 'admin' ? '/admin-dashboard' : '/citizen-dashboard')}>
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
              <Button variant="hero" onClick={() => navigate("/auth")}>
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}