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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_change_log: {
        Row: {
          created_at: string
          id: string
          new_value: string | null
          old_value: string | null
          reverted: boolean
          summary: string | null
          target: string
          tool: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          reverted?: boolean
          summary?: string | null
          target: string
          tool: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          reverted?: boolean
          summary?: string | null
          target?: string
          tool?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_settings: {
        Row: {
          answer_style: string
          blocked_topics: string
          disabled_message: string
          enabled: boolean
          extra_rules: string
          fallback_model: string
          id: string
          max_messages: number
          model: string
          provider: string
          rate_limit_per_min: number
          temperature: number
          updated_at: string
        }
        Insert: {
          answer_style?: string
          blocked_topics?: string
          disabled_message?: string
          enabled?: boolean
          extra_rules?: string
          fallback_model?: string
          id?: string
          max_messages?: number
          model?: string
          provider?: string
          rate_limit_per_min?: number
          temperature?: number
          updated_at?: string
        }
        Update: {
          answer_style?: string
          blocked_topics?: string
          disabled_message?: string
          enabled?: boolean
          extra_rules?: string
          fallback_model?: string
          id?: string
          max_messages?: number
          model?: string
          provider?: string
          rate_limit_per_min?: number
          temperature?: number
          updated_at?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          description: string | null
          enabled: boolean
          key: string
          label: string
          page: string
          updated_at: string
        }
        Insert: {
          description?: string | null
          enabled?: boolean
          key: string
          label: string
          page: string
          updated_at?: string
        }
        Update: {
          description?: string | null
          enabled?: boolean
          key?: string
          label?: string
          page?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          country: string | null
          created_at: string
          id: string
          path: string
          referrer: string | null
          session_id: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
          path: string
          referrer?: string | null
          session_id?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          path?: string
          referrer?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      post_submissions: {
        Row: {
          admin_note: string | null
          body: string
          category: string | null
          contact: string | null
          created_at: string
          id: string
          pseudonym: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          body: string
          category?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          pseudonym?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          body?: string
          category?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          pseudonym?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content: string
          key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: string
          key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      site_theme: {
        Row: {
          category: string
          draft_value: string | null
          key: string
          label: string | null
          updated_at: string
          value: string
        }
        Insert: {
          category?: string
          draft_value?: string | null
          key: string
          label?: string | null
          updated_at?: string
          value?: string
        }
        Update: {
          category?: string
          draft_value?: string | null
          key?: string
          label?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      substance_overrides: {
        Row: {
          patch: Json
          slug: string
          updated_at: string
        }
        Insert: {
          patch?: Json
          slug: string
          updated_at?: string
        }
        Update: {
          patch?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      ui_texts: {
        Row: {
          category: string | null
          description: string | null
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          category?: string | null
          description?: string | null
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          category?: string | null
          description?: string | null
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          created_at: string
          detail: string | null
          event_type: string
          id: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          detail?: string | null
          event_type: string
          id?: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          detail?: string | null
          event_type?: string
          id?: string
          session_id?: string | null
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
