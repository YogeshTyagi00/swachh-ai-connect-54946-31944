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
  status: "pending" | "in_progress" | "resolved";
  created_at: string;
  coins_earned: number;
  latitude: number | null;
  longitude: number | null;
  priority?: "low" | "medium" | "high";
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
    .from("green_coins_transactions" as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as GreenCoinsTransaction[];
};

export const getUserReports = async (userId: string): Promise<Report[]> => {
  const { data, error } = await supabase
    .from("complaints" as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as Report[];
};

export const submitReport = async (params: {
  userId: string;
  title: string;
  description: string;
  locationName: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  priority?: "low" | "medium" | "high";
  category?: string;
}): Promise<Report> => {
  // Create report in Supabase
  const { data, error } = await supabase
    .from("complaints" as any)
    .insert({
      user_id: params.userId,
      title: params.title,
      description: params.description,
      location_name: params.locationName,
      latitude: params.latitude,
      longitude: params.longitude,
      image_url: params.imageUrl,
      status: "pending",
      coins_earned: 10,
      priority: params.priority || "medium"
    })
    .select()
    .single();

  if (error) throw error;
  
  // Also send to external API
  try {
    await fetch("https://civic-bot-backend.onrender.com/api/reports/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: params.userId,
        title: params.title,
        description: params.description,
        category: params.category || "general",
        location: params.locationName,
        latitude: params.latitude,
        longitude: params.longitude,
        imageUrl: params.imageUrl,
        priority: params.priority || "medium",
        status: "pending"
      })
    });
  } catch (apiError) {
    console.error("External API error:", apiError);
    // Don't fail if external API is down
  }
  
  return data as unknown as Report;
};

export const getLeaderboard = async (): Promise<{ id: string; name: string; greenCoins: number; rank: number }[]> => {
  const { data, error } = await supabase
    .from("leaderboard" as any)
    .select("*")
    .order("rank", { ascending: true })
    .limit(10);

  if (error) throw error;
  
  // Transform database format to component format
  return (data || []).map((entry: any) => ({
    id: entry.user_id || "",
    name: entry.full_name || "Unknown",
    greenCoins: entry.green_coins || 0,
    rank: entry.rank || 0
  }));
};

// Admin endpoints
export const getAllReports = async (): Promise<Report[]> => {
  const { data, error } = await supabase
    .from("complaints" as any)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as Report[];
};

export const updateReportStatus = async (
  reportId: string,
  status: "pending" | "in_progress" | "resolved"
): Promise<Report> => {
  const { data, error } = await supabase
    .from("complaints" as any)
    .update({ status })
    .eq("id", reportId)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Report;
};

export const updateReportPriority = async (
  reportId: string,
  priority: "low" | "medium" | "high"
): Promise<Report> => {
  const { data, error } = await supabase
    .from("complaints" as any)
    .update({ priority })
    .eq("id", reportId)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Report;
};

export const getAllUsers = async () => {
  // Get only citizens (users without admin role)
  const { data: adminUsers, error: rolesError } = await supabase
    .from("user_roles" as any)
    .select("user_id")
    .eq("role", "admin");

  if (rolesError) throw rolesError;

  const adminIds = (adminUsers || []).map((u: any) => u.user_id);

  let query = supabase
    .from("profiles" as any)
    .select("*")
    .order("green_coins", { ascending: false });

  // Filter out admin users if there are any
  if (adminIds.length > 0) {
    query = query.not("user_id", "in", `(${adminIds.join(",")})`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const getAdminStats = async () => {
  const { data: reports, error: reportsError } = await supabase
    .from("complaints" as any)
    .select("status");

  if (reportsError) throw reportsError;

  const { data: users, error: usersError } = await supabase
    .from("profiles" as any)
    .select("user_id");

  if (usersError) throw usersError;

  const totalReports = reports?.length || 0;
  const resolved = reports?.filter((r: any) => r.status === "resolved").length || 0;
  const pending = reports?.filter((r: any) => r.status === "pending").length || 0;
  const totalUsers = users?.length || 0;

  return {
    totalUsers,
    totalReports,
    resolved,
    pending
  };
};

export const adjustUserCoins = async (
  userId: string,
  amount: number,
  reason: string
): Promise<void> => {
  // Call the database function to update coins
  const { error } = await supabase.rpc("update_user_coins" as any, {
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
  updateReportPriority,
  getAllUsers,
  adjustUserCoins,
  getAdminStats,
};

export default supabaseService;

