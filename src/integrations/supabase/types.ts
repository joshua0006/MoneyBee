export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          balance: number
          color: string | null
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          color?: string | null
          created_at?: string
          id?: string
          name: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      attendance_leaves: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          requested_at: string
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          end_date: string
          id?: string
          leave_type: string
          reason?: string | null
          requested_at?: string
          start_date: string
          status?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          requested_at?: string
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          date: string
          id: string
          notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      attendance_settings: {
        Row: {
          created_at: string
          id: string
          late_threshold_minutes: number
          required_work_hours: number
          updated_at: string
          work_end_time: string
          work_start_time: string
        }
        Insert: {
          created_at?: string
          id?: string
          late_threshold_minutes?: number
          required_work_hours?: number
          updated_at?: string
          work_end_time?: string
          work_start_time?: string
        }
        Update: {
          created_at?: string
          id?: string
          late_threshold_minutes?: number
          required_work_hours?: number
          updated_at?: string
          work_end_time?: string
          work_start_time?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          amount: number
          category: string
          created_at: string
          id: string
          period: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          id?: string
          period?: string
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          period?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      custom_roles: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_system_role: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_system_role?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_system_role?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          account_id: string | null
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category: string
          created_at?: string
          date?: string
          description: string
          id?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_expenses_accounts"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          name: string
          route: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          name: string
          route: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          name?: string
          route?: string
          updated_at?: string
        }
        Relationships: []
      }
      phone_verification_codes: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          phone_number: string
          user_id: string | null
          verification_code: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          phone_number: string
          user_id?: string | null
          verification_code: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          phone_number?: string
          user_id?: string | null
          verification_code?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      pledge_sheets: {
        Row: {
          average_case_size: number
          call_to_opening_rate: number
          closing_rate: number
          created_at: string
          id: string
          minimum_fyc: number
          name: string
          opening_to_closing_rate: number
          saved_by_name: string | null
          stretched_fyc: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          average_case_size: number
          call_to_opening_rate: number
          closing_rate: number
          created_at?: string
          id?: string
          minimum_fyc: number
          name: string
          opening_to_closing_rate: number
          saved_by_name?: string | null
          stretched_fyc: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          average_case_size?: number
          call_to_opening_rate?: number
          closing_rate?: number
          created_at?: string
          id?: string
          minimum_fyc?: number
          name?: string
          opening_to_closing_rate?: number
          saved_by_name?: string | null
          stretched_fyc?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      portfolio_templates: {
        Row: {
          created_at: string
          description: string | null
          fund_allocation: Json
          id: string
          name: string
          risk_profile: string
          strategic_asset_allocation: Json
          target_return: string | null
          updated_at: string
          volatility: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          fund_allocation: Json
          id?: string
          name: string
          risk_profile: string
          strategic_asset_allocation: Json
          target_return?: string | null
          updated_at?: string
          volatility?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          fund_allocation?: Json
          id?: string
          name?: string
          risk_profile?: string
          strategic_asset_allocation?: Json
          target_return?: string | null
          updated_at?: string
          volatility?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_approved: boolean | null
          phone_number: string | null
          phone_verified: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_approved?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_approved?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_transactions: {
        Row: {
          account_id: string | null
          amount: number
          category: string
          created_at: string
          description: string
          frequency: string
          id: string
          is_active: boolean
          next_due_date: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category: string
          created_at?: string
          description: string
          frequency: string
          id?: string
          is_active?: boolean
          next_due_date: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string
          created_at?: string
          description?: string
          frequency?: string
          id?: string
          is_active?: boolean
          next_due_date?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_recurring_accounts"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          page_id: string
          role_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_id: string
          role_name: string
        }
        Update: {
          created_at?: string
          id?: string
          page_id?: string
          role_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_assets: {
        Row: {
          asset_type: string
          created_at: string
          current_value: number
          growth_rate: number | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_type: string
          created_at?: string
          current_value: number
          growth_rate?: number | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          current_value?: number
          growth_rate?: number | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          end_age: number | null
          frequency: string
          growth_rate: number | null
          id: string
          name: string
          start_age: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          end_age?: number | null
          frequency?: string
          growth_rate?: number | null
          id?: string
          name: string
          start_age?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          end_age?: number | null
          frequency?: string
          growth_rate?: number | null
          id?: string
          name?: string
          start_age?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_financial_profiles: {
        Row: {
          created_at: string
          id: string
          metrics: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metrics?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metrics?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          category: string
          cost: number
          created_at: string
          details: Json | null
          id: string
          name: string
          priority: string | null
          target_age: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          cost: number
          created_at?: string
          details?: Json | null
          id?: string
          name: string
          priority?: string | null
          target_age: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          cost?: number
          created_at?: string
          details?: Json | null
          id?: string
          name?: string
          priority?: string | null
          target_age?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_incomes: {
        Row: {
          amount: number
          created_at: string
          end_age: number | null
          frequency: string
          growth_rate: number | null
          id: string
          name: string
          start_age: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          end_age?: number | null
          frequency?: string
          growth_rate?: number | null
          id?: string
          name: string
          start_age?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          end_age?: number | null
          frequency?: string
          growth_rate?: number | null
          id?: string
          name?: string
          start_age?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_investments: {
        Row: {
          created_at: string
          current_value: number
          expected_return: number | null
          id: string
          investment_type: string
          name: string
          risk_level: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value: number
          expected_return?: number | null
          id?: string
          investment_type: string
          name: string
          risk_level?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number
          expected_return?: number | null
          id?: string
          investment_type?: string
          name?: string
          risk_level?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_liabilities: {
        Row: {
          created_at: string
          current_balance: number
          id: string
          interest_rate: number | null
          liability_type: string
          minimum_payment: number | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_balance: number
          id?: string
          interest_rate?: number | null
          liability_type: string
          minimum_payment?: number | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_balance?: number
          id?: string
          interest_rate?: number | null
          liability_type?: string
          minimum_payment?: number | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_portfolios: {
        Row: {
          created_at: string
          custom_allocation: Json | null
          custom_name: string | null
          id: string
          notes: string | null
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_allocation?: Json | null
          custom_name?: string | null
          id?: string
          notes?: string | null
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_allocation?: Json | null
          custom_name?: string | null
          id?: string
          notes?: string | null
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_portfolios_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "portfolio_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          category: string
          created_at: string
          description: string
          expiry_date: string
          id: string
          logo_url: string | null
          name: string
          promo_code: string
          promo_description: string
          redemption_instructions: string
          updated_at: string
          website_url: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          expiry_date: string
          id?: string
          logo_url?: string | null
          name: string
          promo_code: string
          promo_description: string
          redemption_instructions: string
          updated_at?: string
          website_url: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          expiry_date?: string
          id?: string
          logo_url?: string | null
          name?: string
          promo_code?: string
          promo_description?: string
          redemption_instructions?: string
          updated_at?: string
          website_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_accessible_pages: {
        Args: { _user_id: string }
        Returns: {
          page_name: string
          display_name: string
          route: string
          description: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_user_approved: {
        Args: { _user_id: string }
        Returns: boolean
      }
      user_has_access: {
        Args: {
          _user_id: string
          _min_role?: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      user_has_any_role: {
        Args: { _user_id: string }
        Returns: boolean
      }
      user_has_page_permission: {
        Args: { _user_id: string; _page_route: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "consultant" | "manager" | "admin"
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
      app_role: ["consultant", "manager", "admin"],
    },
  },
} as const
