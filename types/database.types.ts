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
      addresses: {
        Row: {
          address: string
          area: string
          customer_id: string
          delivery_zone_id: string
          id: string
        }
        Insert: {
          address: string
          area: string
          customer_id: string
          delivery_zone_id: string
          id?: string
        }
        Update: {
          address?: string
          area?: string
          customer_id?: string
          delivery_zone_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addresses_delivery_zone_id_fkey"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          active: boolean
          areas: string[]
          fee_pesewas: number
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          areas?: string[]
          fee_pesewas: number
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          areas?: string[]
          fee_pesewas?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      kitchen_settings: {
        Row: {
          daily_capacity: number
          id: string
          open: boolean
          orders_date: string
          orders_today: number
        }
        Insert: {
          daily_capacity?: number
          id?: string
          open?: boolean
          orders_date?: string
          orders_today?: number
        }
        Update: {
          daily_capacity?: number
          id?: string
          open?: boolean
          orders_date?: string
          orders_today?: number
        }
        Relationships: []
      }
      meal_sizes: {
        Row: {
          base_price_pesewas: number
          id: string
          meal_id: string
          size: string
        }
        Insert: {
          base_price_pesewas: number
          id?: string
          meal_id: string
          size: string
        }
        Update: {
          base_price_pesewas?: number
          id?: string
          meal_id?: string
          size?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_sizes_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          available: boolean
          description: string | null
          id: string
          name: string
        }
        Insert: {
          available?: boolean
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          available?: boolean
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      order_item_proteins: {
        Row: {
          additional_price_pesewas: number
          id: string
          order_item_id: string
          protein_id: string
          quantity: number
        }
        Insert: {
          additional_price_pesewas?: number
          id?: string
          order_item_id: string
          protein_id: string
          quantity?: number
        }
        Update: {
          additional_price_pesewas?: number
          id?: string
          order_item_id?: string
          protein_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_item_proteins_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_proteins_protein_id_fkey"
            columns: ["protein_id"]
            isOneToOne: false
            referencedRelation: "protein_options"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          base_price_pesewas: number
          id: string
          included_protein_package_name: string
          meal_id: string
          order_id: string
          quantity: number
          size_id: string
        }
        Insert: {
          base_price_pesewas: number
          id?: string
          included_protein_package_name?: string
          meal_id: string
          order_id: string
          quantity?: number
          size_id: string
        }
        Update: {
          base_price_pesewas?: number
          id?: string
          included_protein_package_name?: string
          meal_id?: string
          order_id?: string
          quantity?: number
          size_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "meal_sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_id: string
          amount_paid_pesewas: number
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          customer_id: string
          delivery_fee_pesewas: number
          delivery_slot: string
          id: string
          order_status: string
          payment_method: string
          payment_status: string
          paystack_reference: string | null
          paystack_refund_reference: string | null
          refund_status: string
          subtotal_pesewas: number
          rider_id: string | null
          promo_code_id: string | null
          original_amount: number | null
          discount_amount: number | null
        }
        Insert: {
          address_id: string
          amount_paid_pesewas?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          customer_id: string
          delivery_fee_pesewas: number
          delivery_slot: string
          id?: string
          order_status?: string
          payment_method?: string
          payment_status?: string
          paystack_reference?: string | null
          paystack_refund_reference?: string | null
          refund_status?: string
          subtotal_pesewas: number
          rider_id?: string | null
          promo_code_id?: string | null
          original_amount?: number | null
          discount_amount?: number | null
        }
        Update: {
          address_id?: string
          amount_paid_pesewas?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          customer_id?: string
          delivery_fee_pesewas?: number
          delivery_slot?: string
          id?: string
          order_status?: string
          payment_method?: string
          payment_status?: string
          paystack_reference?: string | null
          paystack_refund_reference?: string | null
          refund_status?: string
          subtotal_pesewas?: number
          rider_id?: string | null
          promo_code_id?: string | null
          original_amount?: number | null
          discount_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      package_items: {
        Row: {
          package_id: string
          protein_id: string
          quantity: number
        }
        Insert: {
          package_id: string
          protein_id: string
          quantity?: number
        }
        Update: {
          package_id?: string
          protein_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "package_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "protein_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_items_protein_id_fkey"
            columns: ["protein_id"]
            isOneToOne: false
            referencedRelation: "protein_options"
            referencedColumns: ["id"]
          },
        ]
      }
      protein_options: {
        Row: {
          additional_price_pesewas: number
          available: boolean
          id: string
          name: string
        }
        Insert: {
          additional_price_pesewas?: number
          available?: boolean
          id?: string
          name: string
        }
        Update: {
          additional_price_pesewas?: number
          available?: boolean
          id?: string
          name?: string
        }
        Relationships: []
      }
      protein_packages: {
        Row: {
          id: string
          meal_size_id: string
          name: string
        }
        Insert: {
          id?: string
          meal_size_id: string
          name: string
        }
        Update: {
          id?: string
          meal_size_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "protein_packages_meal_size_id_fkey"
            columns: ["meal_size_id"]
            isOneToOne: false
            referencedRelation: "meal_sizes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_kitchen_orders: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_kitchen_accepting_orders: { Args: never; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
