import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabaseService } from "@/services/supabaseService";
import { Coins, Plus, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  green_coins: number;
}

export default function GreenCoinsManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<"add" | "deduct">("add");

  useEffect(() => {
    supabaseService.getAllUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const handleAdjust = async () => {
    if (!selectedUser || !amount || !reason) return;

    const adjustAmount = adjustType === "add" ? parseInt(amount) : -parseInt(amount);

    try {
      await supabaseService.adjustUserCoins(selectedUser.user_id, adjustAmount, reason);
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, green_coins: u.green_coins + adjustAmount } : u
        )
      );
      toast({
        title: "Coins Adjusted ✅",
        description: `${adjustType === "add" ? "Added" : "Deducted"} ${Math.abs(adjustAmount)} coins ${adjustType === "add" ? "to" : "from"} ${selectedUser.full_name}`,
      });
      setIsOpen(false);
      setAmount("");
      setReason("");
    } catch (error) {
      toast({
        title: "Failed to adjust coins",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const openDialog = (user: User, type: "add" | "deduct") => {
    setSelectedUser(user);
    setAdjustType(type);
    setIsOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Green Coins Manager
        </CardTitle>
        <CardDescription>Manage user coin balances</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <p className="font-semibold">{user.full_name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-1 text-sm text-primary mt-1">
                  <Coins className="h-3 w-3" />
                  {user.green_coins} coins
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openDialog(user, "add")}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => openDialog(user, "deduct")}>
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {adjustType === "add" ? "Add" : "Deduct"} Green Coins
              </DialogTitle>
              <DialogDescription>
                {adjustType === "add" ? "Add coins to" : "Deduct coins from"} {selectedUser?.full_name}'s account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  placeholder="e.g., Bonus for exceptional contribution"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <Button onClick={handleAdjust} className="w-full" disabled={!amount || !reason}>
                {adjustType === "add" ? "Add" : "Deduct"} Coins
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
