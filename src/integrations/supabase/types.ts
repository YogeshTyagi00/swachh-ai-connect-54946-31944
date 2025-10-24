export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      collection_centers: {
        Row: {
          accepted_waste_types:
            | Database["public"]["Enums"]["waste_category"][]
            | null
          address: string
          created_at: string
          id: string
          latitude: number
          longitude: number
          name: string
          operating_hours: string | null
          phone: string | null
        }
        Insert: {
          accepted_waste_types?:
            | Database["public"]["Enums"]["waste_category"][]
            | null
          address: string
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          name: string
          operating_hours?: string | null
          phone?: string | null
        }
        Update: {
          accepted_waste_types?:
            | Database["public"]["Enums"]["waste_category"][]
            | null
          address?: string
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          operating_hours?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      complaints: {
        Row: {
          assigned_to: string | null
          coins_earned: number | null
          created_at: string
          description: string
          id: string
          image_url: string
          latitude: number
          location_name: string | null
          longitude: number
          status: Database["public"]["Enums"]["complaint_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          coins_earned?: number | null
          created_at?: string
          description: string
          id?: string
          image_url: string
          latitude: number
          location_name?: string | null
          longitude: number
          status?: Database["public"]["Enums"]["complaint_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          coins_earned?: number | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          latitude?: number
          location_name?: string | null
          longitude?: number
          status?: Database["public"]["Enums"]["complaint_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      green_coins_transactions: {
        Row: {
          action: string
          coins: number
          created_at: string | null
          id: string
          related_report_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          action: string
          coins: number
          created_at?: string | null
          id?: string
          related_report_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          action?: string
          coins?: number
          created_at?: string | null
          id?: string
          related_report_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "green_coins_transactions_related_report_id_fkey"
            columns: ["related_report_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          green_coins: number
          id: string
          phone: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          green_coins?: number
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          green_coins?: number
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          id: string
          redeemed_at: string | null
          reward_id: string
          user_id: string
        }
        Insert: {
          id?: string
          redeemed_at?: string | null
          reward_id: string
          user_id: string
        }
        Update: {
          id?: string
          redeemed_at?: string | null
          reward_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          available: boolean | null
          cost_in_coins: number
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          title: string
        }
        Insert: {
          available?: boolean | null
          cost_in_coins: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          title: string
        }
        Update: {
          available?: boolean | null
          cost_in_coins?: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waste_reports: {
        Row: {
          category: Database["public"]["Enums"]["waste_category"] | null
          coins_earned: number | null
          confidence_score: number | null
          created_at: string
          disposal_instructions: string | null
          id: string
          image_url: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["waste_category"] | null
          coins_earned?: number | null
          confidence_score?: number | null
          created_at?: string
          disposal_instructions?: string | null
          id?: string
          image_url: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["waste_category"] | null
          coins_earned?: number | null
          confidence_score?: number | null
          created_at?: string
          disposal_instructions?: string | null
          id?: string
          image_url?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: {
          full_name: string | null
          green_coins: number | null
          rank: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_user_coins: {
        Args: {
          _action: string
          _coins: number
          _report_id?: string
          _type: string
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "citizen" | "admin"
      complaint_status: "pending" | "in_progress" | "resolved"
      user_type: "citizen" | "authority"
      waste_category: "biodegradable" | "recyclable" | "hazardous" | "general"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["citizen", "admin"],
      complaint_status: ["pending", "in_progress", "resolved"],
      user_type: ["citizen", "authority"],
      waste_category: ["biodegradable", "recyclable", "hazardous", "general"],
    },
  },
} as const
