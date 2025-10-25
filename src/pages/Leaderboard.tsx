import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Coins, TrendingUp } from "lucide-react";
import { supabaseService } from "@/services/supabaseService";
import { useEffect } from "react";

interface LeaderboardEntry {
  id: string;
  name: string;
  greenCoins: number;
  rank: number;
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseService.getLeaderboard().then((data) => {
      setLeaders(data);
      setLoading(false);
    });
  }, []);

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-gradient-primary">Green Champions</h1>
            </div>
            <p className="text-muted-foreground">
              Top eco-warriors leading the change in waste management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading ? (
              <>
                <Card className="border-primary/20"><CardContent className="pt-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>
                <Card className="border-primary/20"><CardContent className="pt-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>
                <Card className="border-primary/20"><CardContent className="pt-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>
              </>
            ) : (
              <>
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Coins className="h-4 w-4 text-primary" />
                      Total Green Coins
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {leaders.reduce((sum, l) => sum + l.greenCoins, 0)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      Active Citizens
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{leaders.length}</div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Top Earner
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {leaders[0]?.greenCoins || 0}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Top 5 Citizens</CardTitle>
              <CardDescription>Most active contributors to clean India</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-center">Green Coins</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaders.map((leader) => (
                    <TableRow key={leader.rank} className="animate-fade-in">
                      <TableCell className="font-medium text-2xl">
                        {getMedalIcon(leader.rank)}
                      </TableCell>
                      <TableCell className="font-medium">{leader.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-primary-light/20 text-primary">
                          <Coins className="h-3 w-3 mr-1" />
                          {leader.greenCoins}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
