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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      orders: {
        Row: {
          created_at: string
          customer_confirmation_date: string | null
          door_window: string | null
          fabric_color: string | null
          frame_color: string | null
          frame_count: number | null
          frame_type: string | null
          framing_completion_date: string | null
          height_mm: number | null
          id: string
          install_type: string | null
          location: string | null
          model: string | null
          order_date: string | null
          order_note: string | null
          order_number: string | null
          package_note: string | null
          packaging_completion_date: string | null
          pull_type: string | null
          scheduled_shipping_date: string | null
          sewing_completion_date: string | null
          shipping_date: string | null
          source_file: string | null
          source_month: string | null
          special_note: string | null
          status: string | null
          width_mm: number | null
        }
        Insert: {
          created_at?: string
          customer_confirmation_date?: string | null
          door_window?: string | null
          fabric_color?: string | null
          frame_color?: string | null
          frame_count?: number | null
          frame_type?: string | null
          framing_completion_date?: string | null
          height_mm?: number | null
          id?: string
          install_type?: string | null
          location?: string | null
          model?: string | null
          order_date?: string | null
          order_note?: string | null
          order_number?: string | null
          package_note?: string | null
          packaging_completion_date?: string | null
          pull_type?: string | null
          scheduled_shipping_date?: string | null
          sewing_completion_date?: string | null
          shipping_date?: string | null
          source_file?: string | null
          source_month?: string | null
          special_note?: string | null
          status?: string | null
          width_mm?: number | null
        }
        Update: {
          created_at?: string
          customer_confirmation_date?: string | null
          door_window?: string | null
          fabric_color?: string | null
          frame_color?: string | null
          frame_count?: number | null
          frame_type?: string | null
          framing_completion_date?: string | null
          height_mm?: number | null
          id?: string
          install_type?: string | null
          location?: string | null
          model?: string | null
          order_date?: string | null
          order_note?: string | null
          order_number?: string | null
          package_note?: string | null
          packaging_completion_date?: string | null
          pull_type?: string | null
          scheduled_shipping_date?: string | null
          sewing_completion_date?: string | null
          shipping_date?: string | null
          source_file?: string | null
          source_month?: string | null
          special_note?: string | null
          status?: string | null
          width_mm?: number | null
        }
        Relationships: []
      }
      search_stats: {
        Row: {
          count: number
          id: number
        }
        Insert: {
          count?: number
          id?: number
        }
        Update: {
          count?: number
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_search_count: { Args: never; Returns: number }
      search_orders_by_terms: {
        Args: { search_terms: string[] }
        Returns: {
          door_window: string
          fabric_color: string
          frame_color: string
          frame_type: string
          height_mm: number
          install_type: string
          location: string
          model: string
          package_note: string
          pull_type: string
          width_mm: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
