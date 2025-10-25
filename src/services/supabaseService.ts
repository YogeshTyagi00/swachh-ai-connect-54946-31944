import { supabase } from "@/integrations/supabase/client";

export interface GreenCoinsTransaction {
  id: string;
  action: string;
  coins: number;
  created_at: string;
  transaction_type: "earned" | "spent";
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  description: string;
  location_name: string | null;
  image_url: string;
  status: "pending" | "in-progress" | "resolved";
  created_at: string;
  coins_earned: number;
  latitude: number | null;
  longitude: number | null;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  green_coins: number;
  rank: number;
}

// Citizen endpoints
export const getGreenCoinsHistory = async (userId: string): Promise<GreenCoinsTransaction[]> => {
  const { data, error } = await supabase
    .from("green_coins_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as GreenCoinsTransaction[];
};

export const getUserReports = async (userId: string): Promise<Report[]> => {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Report[];
};

export const submitReport = async (params: {
  userId: string;
  title: string;
  description: string;
  locationName: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
}): Promise<Report> => {
  // Create report
  const { data, error } = await supabase
    .from("complaints")
    .insert({
      user_id: params.userId,
      title: params.title,
      description: params.description,
      location_name: params.locationName,
      latitude: params.latitude,
      longitude: params.longitude,
      image_url: params.imageUrl,
      status: "pending",
      coins_earned: 10
    })
    .select()
    .single();

  if (error) throw error;
  return data as Report;
};

export const getLeaderboard = async (): Promise<{ id: string; name: string; greenCoins: number; rank: number }[]> => {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("rank", { ascending: true })
    .limit(10);

  if (error) throw error;
  
  // Transform database format to component format
  return (data || []).map(entry => ({
    id: entry.user_id || "",
    name: entry.full_name || "Unknown",
    greenCoins: entry.green_coins || 0,
    rank: entry.rank || 0
  }));
};

// Admin endpoints
export const getAllReports = async (): Promise<Report[]> => {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Report[];
};

export const updateReportStatus = async (
  reportId: string,
  status: "pending" | "in-progress" | "resolved"
): Promise<Report> => {
  // Map hyphenated status to underscore for database
  const dbStatus = status === "in-progress" ? "in_progress" : status;
  
  const { data, error } = await supabase
    .from("complaints")
    .update({ status: dbStatus })
    .eq("id", reportId)
    .select()
    .single();

  if (error) throw error;
  return data as Report;
};

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("green_coins", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const adjustUserCoins = async (
  userId: string,
  amount: number,
  reason: string
): Promise<void> => {
  // Call the database function to update coins
  const { error } = await supabase.rpc("update_user_coins", {
    _user_id: userId,
    _coins: amount,
    _action: reason,
    _type: amount > 0 ? "earned" : "spent"
  });

  if (error) throw error;
};

// Export as a service object
export const supabaseService = {
  getGreenCoinsHistory,
  getUserReports,
  submitReport,
  getLeaderboard,
  getAllReports,
  updateReportStatus,
  getAllUsers,
  adjustUserCoins,
};

export default supabaseService;

