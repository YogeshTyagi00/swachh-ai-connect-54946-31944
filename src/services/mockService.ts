// Mock API service for development

export interface GreenCoinsTransaction {
  id: string;
  action: string;
  coins: number;
  date: string;
  type: "earned" | "spent";
}

export interface Report {
  id: string;
  userId: string;
  description: string;
  location: string;
  imageUrl?: string;
  status: "pending" | "in-progress" | "resolved";
  date: string;
  coinsEarned: number;
  coordinates: [number, number];
}

export interface EcoAction {
  id: string;
  title: string;
  description: string;
  coins: number;
  icon: string;
  completed: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  greenCoins: number;
  rank: number;
  avatar?: string;
}

// Mock data
const mockTransactions: GreenCoinsTransaction[] = [
  { id: "1", action: "Reported waste issue", coins: 10, date: "2025-01-15", type: "earned" },
  { id: "2", action: "Segregated waste daily", coins: 5, date: "2025-01-14", type: "earned" },
  { id: "3", action: "Redeemed: Tree planting", coins: -50, date: "2025-01-13", type: "spent" },
  { id: "4", action: "Completed eco challenge", coins: 15, date: "2025-01-12", type: "earned" },
];

const mockReports: Report[] = [
  {
    id: "R001",
    userId: "citizen-123",
    description: "Overflowing garbage bin near MG Road",
    location: "MG Road, Sector 15",
    status: "resolved",
    date: "2025-01-15",
    coinsEarned: 10,
    coordinates: [28.5355, 77.3910],
  },
  {
    id: "R002",
    userId: "citizen-123",
    description: "Plastic waste dumped on street corner",
    location: "Park Street, Sector 22",
    status: "in-progress",
    date: "2025-01-14",
    coinsEarned: 10,
    coordinates: [28.5365, 77.3920],
  },
];

const mockEcoActions: EcoAction[] = [
  { id: "A1", title: "Used reusable bottle", description: "Avoid single-use plastic", coins: 2, icon: "Droplet", completed: false },
  { id: "A2", title: "Segregated waste", description: "Separate wet and dry waste", coins: 5, icon: "Trash2", completed: false },
  { id: "A3", title: "Walked instead of driving", description: "Reduce carbon footprint", coins: 3, icon: "Footprints", completed: false },
  { id: "A4", title: "Composted food waste", description: "Turn organic waste into fertilizer", coins: 5, icon: "Leaf", completed: false },
];

const mockLeaderboard: LeaderboardEntry[] = [
  { id: "1", name: "Rahul Sharma", greenCoins: 520, rank: 1 },
  { id: "2", name: "Priya Patel", greenCoins: 485, rank: 2 },
  { id: "3", name: "Amit Kumar", greenCoins: 420, rank: 3 },
  { id: "4", name: "Sneha Reddy", greenCoins: 390, rank: 4 },
  { id: "5", name: "Vikram Singh", greenCoins: 350, rank: 5 },
];

// Mock API functions
export const mockApi = {
  // Citizen endpoints
  getGreenCoinsHistory: async (userId: string): Promise<GreenCoinsTransaction[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTransactions;
  },

  getUserReports: async (userId: string): Promise<Report[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockReports.filter(r => r.userId === userId);
  },

  getEcoActions: async (): Promise<EcoAction[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockEcoActions;
  },

  completeEcoAction: async (actionId: string): Promise<EcoAction> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const action = mockEcoActions.find(a => a.id === actionId);
    if (action) {
      action.completed = true;
      return action;
    }
    throw new Error("Action not found");
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockLeaderboard;
  },

  submitReport: async (report: Omit<Report, "id" | "date" | "coinsEarned">): Promise<Report> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newReport: Report = {
      ...report,
      id: `R${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString().split('T')[0],
      coinsEarned: 10,
    };
    mockReports.push(newReport);
    return newReport;
  },

  // Admin endpoints
  getAllReports: async (): Promise<Report[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockReports;
  },

  updateReportStatus: async (reportId: string, status: Report["status"]): Promise<Report> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const report = mockReports.find(r => r.id === reportId);
    if (report) {
      report.status = status;
      return report;
    }
    throw new Error("Report not found");
  },

  getAllUsers: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: "U1", name: "Rahul Sharma", email: "rahul@example.com", greenCoins: 520, active: true },
      { id: "U2", name: "Priya Patel", email: "priya@example.com", greenCoins: 485, active: true },
      { id: "U3", name: "Amit Kumar", email: "amit@example.com", greenCoins: 420, active: true },
    ];
  },

  adjustUserCoins: async (userId: string, amount: number, reason: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: `Adjusted ${amount} coins for user ${userId}` };
  },
};
