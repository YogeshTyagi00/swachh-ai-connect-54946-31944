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
  coins_earned: number | null;
  latitude: number;
  longitude: number;
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

export const submitReport = async (
  userId: string,
  title: string,
  description: string,
  locationName: string,
  latitude: number,
  longitude: number,
  imageFile: File
): Promise<Report> => {
  // Upload image to storage
  const fileExt = imageFile.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from("report-images")
    .upload(fileName, imageFile);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from("report-images")
    .getPublicUrl(fileName);

  // Create report
  const { data, error } = await supabase
    .from("complaints")
    .insert({
      user_id: userId,
      title,
      description,
      location_name: locationName,
      latitude,
      longitude,
      image_url: publicUrl,
      status: "pending",
      coins_earned: 10
    })
    .select()
    .single();

  if (error) throw error;
  return data as Report;
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("rank", { ascending: true })
    .limit(10);

  if (error) throw error;
  return (data || []) as LeaderboardEntry[];
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
  status: "pending" | "in_progress" | "resolved"
): Promise<Report> => {
  const { data, error } = await supabase
    .from("complaints")
    .update({ status })
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

