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
      audit_log: {
        Row: {
          action: string
          id: string
          target: string
          timestamp: string
          user_name: string
        }
        Insert: {
          action: string
          id?: string
          target?: string
          timestamp?: string
          user_name?: string
        }
        Update: {
          action?: string
          id?: string
          target?: string
          timestamp?: string
          user_name?: string
        }
        Relationships: []
      }
      correspondence: {
        Row: {
          created_at: string
          created_by: string | null
          date: string
          from: string
          id: string
          number: string
          status: string
          subject: string
          summary: string
          to: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date?: string
          from?: string
          id?: string
          number?: string
          status?: string
          subject: string
          summary?: string
          to?: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string
          from?: string
          id?: string
          number?: string
          status?: string
          subject?: string
          summary?: string
          to?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_trainees: {
        Row: {
          certificate_issued: boolean
          course_id: string
          created_at: string
          employee_id: string | null
          id: string
          name: string
          status: string
        }
        Insert: {
          certificate_issued?: boolean
          course_id: string
          created_at?: string
          employee_id?: string | null
          id?: string
          name: string
          status?: string
        }
        Update: {
          certificate_issued?: boolean
          course_id?: string
          created_at?: string
          employee_id?: string | null
          id?: string
          name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_trainees_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_trainees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          actual_cost: number
          code: string
          created_at: string
          created_by: string | null
          end_date: string | null
          estimated_budget: number
          id: string
          sponsor: string
          start_date: string | null
          status: string
          supervisor: string
          supervisor_id: string | null
          title: string
          trainer: string
          trainer_id: string | null
          training_type: string
          type: string
          updated_at: string
          venue: string
        }
        Insert: {
          actual_cost?: number
          code?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          estimated_budget?: number
          id?: string
          sponsor?: string
          start_date?: string | null
          status?: string
          supervisor?: string
          supervisor_id?: string | null
          title: string
          trainer?: string
          trainer_id?: string | null
          training_type?: string
          type?: string
          updated_at?: string
          venue?: string
        }
        Update: {
          actual_cost?: number
          code?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          estimated_budget?: number
          id?: string
          sponsor?: string
          start_date?: string | null
          status?: string
          supervisor?: string
          supervisor_id?: string | null
          title?: string
          trainer?: string
          trainer_id?: string | null
          training_type?: string
          type?: string
          updated_at?: string
          venue?: string
        }
        Relationships: []
      }
      curriculum_items: {
        Row: {
          applied: boolean
          assigned_to: string | null
          audience_count: number
          audit_status: string
          count: number
          created_at: string
          created_by: string | null
          current_stage: string
          executor_name: string
          executor_type: string
          file_type: string
          file_url: string
          form_type: string
          goals: string
          handed_over_at: string | null
          handed_over_by: string | null
          hard_copy_printed: boolean
          hours: number
          id: string
          location: string
          ppt_type: string
          presentation_uploaded: boolean
          printed: boolean
          report_uploaded: boolean
          status: string
          target_audience: string
          title: string
          trainer_name: string
          training_style: string
          type: string
          updated_at: string
        }
        Insert: {
          applied?: boolean
          assigned_to?: string | null
          audience_count?: number
          audit_status?: string
          count?: number
          created_at?: string
          created_by?: string | null
          current_stage?: string
          executor_name?: string
          executor_type?: string
          file_type?: string
          file_url?: string
          form_type?: string
          goals?: string
          handed_over_at?: string | null
          handed_over_by?: string | null
          hard_copy_printed?: boolean
          hours?: number
          id?: string
          location?: string
          ppt_type?: string
          presentation_uploaded?: boolean
          printed?: boolean
          report_uploaded?: boolean
          status?: string
          target_audience?: string
          title: string
          trainer_name?: string
          training_style?: string
          type?: string
          updated_at?: string
        }
        Update: {
          applied?: boolean
          assigned_to?: string | null
          audience_count?: number
          audit_status?: string
          count?: number
          created_at?: string
          created_by?: string | null
          current_stage?: string
          executor_name?: string
          executor_type?: string
          file_type?: string
          file_url?: string
          form_type?: string
          goals?: string
          handed_over_at?: string | null
          handed_over_by?: string | null
          hard_copy_printed?: boolean
          hours?: number
          id?: string
          location?: string
          ppt_type?: string
          presentation_uploaded?: boolean
          printed?: boolean
          report_uploaded?: boolean
          status?: string
          target_audience?: string
          title?: string
          trainer_name?: string
          training_style?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          department: string
          id: string
          name: string
          phone: string
          position: string
          section: string
          updated_at: string
          work_schedule: string
        }
        Insert: {
          created_at?: string
          department?: string
          id?: string
          name: string
          phone?: string
          position?: string
          section?: string
          updated_at?: string
          work_schedule?: string
        }
        Update: {
          created_at?: string
          department?: string
          id?: string
          name?: string
          phone?: string
          position?: string
          section?: string
          updated_at?: string
          work_schedule?: string
        }
        Relationships: []
      }
      hr_requests: {
        Row: {
          approval_status: string
          created_at: string
          created_by: string | null
          date: string
          department: string
          dept_manager_at: string | null
          dept_manager_by: string | null
          dept_manager_status: string
          employee_name: string
          id: string
          notes: string
          type: string
          unit_head_at: string | null
          unit_head_by: string | null
          unit_head_status: string
          updated_at: string
        }
        Insert: {
          approval_status?: string
          created_at?: string
          created_by?: string | null
          date?: string
          department?: string
          dept_manager_at?: string | null
          dept_manager_by?: string | null
          dept_manager_status?: string
          employee_name: string
          id?: string
          notes?: string
          type: string
          unit_head_at?: string | null
          unit_head_by?: string | null
          unit_head_status?: string
          updated_at?: string
        }
        Update: {
          approval_status?: string
          created_at?: string
          created_by?: string | null
          date?: string
          department?: string
          dept_manager_at?: string | null
          dept_manager_by?: string | null
          dept_manager_status?: string
          employee_name?: string
          id?: string
          notes?: string
          type?: string
          unit_head_at?: string | null
          unit_head_by?: string | null
          unit_head_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          date: string
          id: string
          is_read: boolean
          message: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          is_read?: boolean
          message: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_read?: boolean
          message?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          department: string
          id: string
          name: string
          phone: string
          position: string
          section: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string
          id: string
          name?: string
          phone?: string
          position?: string
          section?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          id?: string
          name?: string
          phone?: string
          position?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_handovers: {
        Row: {
          created_at: string
          from_user_id: string | null
          from_user_name: string
          id: string
          notes: string
          stage: string
          task_id: string
          to_user_id: string | null
          to_user_name: string
        }
        Insert: {
          created_at?: string
          from_user_id?: string | null
          from_user_name?: string
          id?: string
          notes?: string
          stage?: string
          task_id: string
          to_user_id?: string | null
          to_user_name?: string
        }
        Update: {
          created_at?: string
          from_user_id?: string | null
          from_user_name?: string
          id?: string
          notes?: string
          stage?: string
          task_id?: string
          to_user_id?: string | null
          to_user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_handovers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          achievement_points: number
          assigned_by: string | null
          assigned_to: string | null
          created_at: string
          created_by: string | null
          curriculum_item_id: string | null
          description: string
          estimated_hours: number
          handed_over: boolean
          handed_over_at: string | null
          id: string
          is_routine: boolean
          previous_owner: string | null
          stage: string
          status: string
          title: string
          unit: string
          updated_at: string
        }
        Insert: {
          achievement_points?: number
          assigned_by?: string | null
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          curriculum_item_id?: string | null
          description?: string
          estimated_hours?: number
          handed_over?: boolean
          handed_over_at?: string | null
          id?: string
          is_routine?: boolean
          previous_owner?: string | null
          stage?: string
          status?: string
          title: string
          unit?: string
          updated_at?: string
        }
        Update: {
          achievement_points?: number
          assigned_by?: string | null
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          curriculum_item_id?: string | null
          description?: string
          estimated_hours?: number
          handed_over?: boolean
          handed_over_at?: string | null
          id?: string
          is_routine?: boolean
          previous_owner?: string | null
          stage?: string
          status?: string
          title?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_curriculum_item_id_fkey"
            columns: ["curriculum_item_id"]
            isOneToOne: false
            referencedRelation: "curriculum_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
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
      is_manager: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "super_user"
        | "unit_head"
        | "trainer"
        | "supervisor"
        | "training_admin"
        | "general_admin"
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
      app_role: [
        "admin",
        "super_user",
        "unit_head",
        "trainer",
        "supervisor",
        "training_admin",
        "general_admin",
      ],
    },
  },
} as const
