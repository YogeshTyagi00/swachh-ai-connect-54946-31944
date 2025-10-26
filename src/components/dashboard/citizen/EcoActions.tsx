import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabaseService, EcoAction } from "@/services/supabaseService";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import * as LucideIcons from "lucide-react";

export default function EcoActions() {
  const { user } = useAuth();
  const [actions, setActions] = useState<EcoAction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActions = async () => {
    if (!user) return;
    try {
      const data = await supabaseService.getEcoActions(user.id);
      setActions(data);
    } catch (error) {
      console.error("Failed to fetch eco actions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [user]);

  const handleComplete = async (actionId: string) => {
    if (!user) return;
    
    const action = actions.find((a) => a.id === actionId);
    if (!action) return;

    try {
      await supabaseService.completeEcoAction(user.id, actionId, action.coins);
      
      // Refresh actions to show updated completion status
      await fetchActions();
      
      toast({
        title: "Action Completed! 🌱",
        description: `You earned ${action.coins} Green Coins!`,
      });
    } catch (error: any) {
      const message = error.message?.includes("duplicate key") 
        ? "You've already completed this action today!"
        : "Please try again.";
      
      toast({
        title: "Failed to complete action",
        description: message,
        variant: "destructive",
      });
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || Sparkles;
    return <Icon className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Daily Eco Actions
        </CardTitle>
        <CardDescription>Complete actions to earn Green Coins</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action) => (
            <div
              key={action.id}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={`p-2 rounded-full ${action.completed ? "bg-green-500/10 text-green-600" : "bg-primary/10 text-primary"}`}>
                {getIcon(action.icon)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{action.title}</h4>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">+{action.coins}</p>
                <p className="text-xs text-muted-foreground">coins</p>
              </div>
              <Button
                size="sm"
                variant={action.completed ? "outline" : "default"}
                onClick={() => handleComplete(action.id)}
                disabled={action.completed}
              >
                {action.completed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Done
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4 mr-1" />
                    Mark Done
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
