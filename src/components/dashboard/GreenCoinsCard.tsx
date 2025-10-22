import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Coins, TrendingUp, TrendingDown } from "lucide-react";
import { mockApi, GreenCoinsTransaction } from "@/services/mockService";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function GreenCoinsCard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<GreenCoinsTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      mockApi.getGreenCoinsHistory(user.id).then((data) => {
        setTransactions(data);
        setLoading(false);
      });
    }
  }, [user]);

  const totalEarned = transactions
    .filter((t) => t.type === "earned")
    .reduce((sum, t) => sum + t.coins, 0);
  
  const totalSpent = Math.abs(
    transactions.filter((t) => t.type === "spent").reduce((sum, t) => sum + t.coins, 0)
  );

  const rewardLevels = [
    { name: "Bronze", min: 0, max: 100, color: "bg-orange-500" },
    { name: "Silver", min: 100, max: 300, color: "bg-gray-400" },
    { name: "Gold", min: 300, max: 500, color: "bg-yellow-500" },
    { name: "Platinum", min: 500, max: 1000, color: "bg-blue-500" },
  ];

  const currentLevel = rewardLevels.find(
    (level) => (user?.greenCoins || 0) >= level.min && (user?.greenCoins || 0) < level.max
  ) || rewardLevels[rewardLevels.length - 1];

  const nextLevel = rewardLevels[rewardLevels.indexOf(currentLevel) + 1];
  const progress = nextLevel
    ? ((user?.greenCoins || 0) - currentLevel.min) / (nextLevel.min - currentLevel.min) * 100
    : 100;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Green Coins Balance
        </CardTitle>
        <CardDescription>Track your environmental impact rewards</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold text-primary">{user?.greenCoins}</p>
            <p className="text-sm text-muted-foreground">Total Coins</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{currentLevel.name}</p>
            <p className="text-xs text-muted-foreground">Current Level</p>
          </div>
        </div>

        {nextLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {nextLevel.name}</span>
              <span className="text-muted-foreground">
                {user?.greenCoins}/{nextLevel.min}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Earned</span>
            </div>
            <p className="text-2xl font-bold text-green-600">+{totalEarned}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-red-600">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium">Spent</span>
            </div>
            <p className="text-2xl font-bold text-red-600">-{totalSpent}</p>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <h4 className="text-sm font-semibold">Recent Transactions</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{transaction.action}</p>
                  <p className="text-xs text-muted-foreground">{transaction.date}</p>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    transaction.type === "earned" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {transaction.coins > 0 ? "+" : ""}
                  {transaction.coins}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
