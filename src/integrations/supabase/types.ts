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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          country: string | null
          created_at: string
          first_name: string
          id: string
          is_default: boolean | null
          last_name: string
          postal_code: string
          state: string | null
          street: string
          street2: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          city: string
          country?: string | null
          created_at?: string
          first_name: string
          id?: string
          is_default?: boolean | null
          last_name: string
          postal_code: string
          state?: string | null
          street: string
          street2?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          city?: string
          country?: string | null
          created_at?: string
          first_name?: string
          id?: string
          is_default?: boolean | null
          last_name?: string
          postal_code?: string
          state?: string | null
          street?: string
          street2?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          quantity: number
          updated_at: string
          user_id: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          quantity?: number
          updated_at?: string
          user_id: string
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          sender: string
          session_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          sender: string
          session_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          sender?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          last_message: string | null
          status: string | null
          unread_count: number | null
          updated_at: string | null
          visitor_email: string | null
          visitor_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          status?: string | null
          unread_count?: number | null
          updated_at?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          status?: string | null
          unread_count?: number | null
          updated_at?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Relationships: []
      }
      contest_entries: {
        Row: {
          birth_date: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          images: string[] | null
          is_winner: boolean | null
          last_name: string
          message: string | null
          phone: string | null
          winner_position: number | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          images?: string[] | null
          is_winner?: boolean | null
          last_name: string
          message?: string | null
          phone?: string | null
          winner_position?: number | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          images?: string[] | null
          is_winner?: boolean | null
          last_name?: string
          message?: string | null
          phone?: string | null
          winner_position?: number | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order_amount: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          recipient_name: string | null
          resend_id: string | null
          status: string
          subject: string
          type: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          recipient_name?: string | null
          resend_id?: string | null
          status?: string
          subject: string
          type: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          recipient_name?: string | null
          resend_id?: string | null
          status?: string
          subject?: string
          type?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          preferences: Json | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          preferences?: Json | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          preferences?: Json | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
          variant_id: string | null
          variant_size: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
          variant_id?: string | null
          variant_size: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          variant_id?: string | null
          variant_size?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address_id: string | null
          created_at: string
          discount: number | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          shipping_address_id: string | null
          shipping_cost: number | null
          status: string | null
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_address_id?: string | null
          created_at?: string
          discount?: number | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address_id?: string | null
          shipping_cost?: number | null
          status?: string | null
          subtotal: number
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_address_id?: string | null
          created_at?: string
          discount?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address_id?: string | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_billing_address_id_fkey"
            columns: ["billing_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          application_data: Json | null
          approved_at: string | null
          bank_details: Json | null
          commission_rate: number | null
          created_at: string | null
          id: string
          partner_code: string
          status: string | null
          total_commission: number | null
          total_paid_out: number | null
          total_sales: number | null
          user_id: string
        }
        Insert: {
          application_data?: Json | null
          approved_at?: string | null
          bank_details?: Json | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          partner_code: string
          status?: string | null
          total_commission?: number | null
          total_paid_out?: number | null
          total_sales?: number | null
          user_id: string
        }
        Update: {
          application_data?: Json | null
          approved_at?: string | null
          bank_details?: Json | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          partner_code?: string
          status?: string | null
          total_commission?: number | null
          total_paid_out?: number | null
          total_sales?: number | null
          user_id?: string
        }
        Relationships: []
      }
      payback_earnings: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          order_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payback_earnings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payback_payouts: {
        Row: {
          amount: number
          bank_details: Json | null
          created_at: string | null
          id: string
          processed_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          bank_details?: Json | null
          created_at?: string | null
          id?: string
          processed_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bank_details?: Json | null
          created_at?: string | null
          id?: string
          processed_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          ai_description: string | null
          base_notes: string[] | null
          created_at: string
          description: string | null
          id: string
          image: string | null
          in_stock: boolean | null
          ingredients: string[] | null
          inspired_by_fragrance: string | null
          middle_notes: string[] | null
          name: string | null
          original_price: number | null
          price: number
          product_id: string
          size: string
          sku: string | null
          stock: number | null
          top_notes: string[] | null
        }
        Insert: {
          ai_description?: string | null
          base_notes?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          in_stock?: boolean | null
          ingredients?: string[] | null
          inspired_by_fragrance?: string | null
          middle_notes?: string[] | null
          name?: string | null
          original_price?: number | null
          price: number
          product_id: string
          size: string
          sku?: string | null
          stock?: number | null
          top_notes?: string[] | null
        }
        Update: {
          ai_description?: string | null
          base_notes?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          in_stock?: boolean | null
          ingredients?: string[] | null
          inspired_by_fragrance?: string | null
          middle_notes?: string[] | null
          name?: string | null
          original_price?: number | null
          price?: number
          product_id?: string
          size?: string
          sku?: string | null
          stock?: number | null
          top_notes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          ai_description: string | null
          base_notes: string[] | null
          base_price: number
          brand: string | null
          category_id: string | null
          created_at: string
          description: string | null
          gender: string | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          inspired_by: string | null
          is_active: boolean | null
          middle_notes: string[] | null
          name: string
          occasions: string[] | null
          original_price: number | null
          rating: number | null
          review_count: number | null
          scent_notes: string[] | null
          seasons: string[] | null
          size: string | null
          slug: string
          top_notes: string[] | null
          updated_at: string
        }
        Insert: {
          ai_description?: string | null
          base_notes?: string[] | null
          base_price: number
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          inspired_by?: string | null
          is_active?: boolean | null
          middle_notes?: string[] | null
          name: string
          occasions?: string[] | null
          original_price?: number | null
          rating?: number | null
          review_count?: number | null
          scent_notes?: string[] | null
          seasons?: string[] | null
          size?: string | null
          slug: string
          top_notes?: string[] | null
          updated_at?: string
        }
        Update: {
          ai_description?: string | null
          base_notes?: string[] | null
          base_price?: number
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          inspired_by?: string | null
          is_active?: boolean | null
          middle_notes?: string[] | null
          name?: string
          occasions?: string[] | null
          original_price?: number | null
          rating?: number | null
          review_count?: number | null
          scent_notes?: string[] | null
          seasons?: string[] | null
          size?: string | null
          slug?: string
          top_notes?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          payback_balance: number | null
          phone: string | null
          tier: string | null
          total_spent: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          payback_balance?: number | null
          phone?: string | null
          tier?: string | null
          total_spent?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          payback_balance?: number | null
          phone?: string | null
          tier?: string | null
          total_spent?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      returns: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_id: string | null
          reason: string
          refund_amount: number | null
          status: string
          tracking_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          reason: string
          refund_amount?: number | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          reason?: string
          refund_amount?: number | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          delivery_count: number | null
          discount_percent: number | null
          frequency: string
          id: string
          last_delivery: string | null
          next_delivery: string | null
          product_id: string | null
          status: string
          updated_at: string
          user_id: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          delivery_count?: number | null
          discount_percent?: number | null
          frequency?: string
          id?: string
          last_delivery?: string | null
          next_delivery?: string | null
          product_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          delivery_count?: number | null
          discount_percent?: number | null
          frequency?: string
          id?: string
          last_delivery?: string | null
          next_delivery?: string | null
          product_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_replies: {
        Row: {
          created_at: string
          id: string
          is_internal: boolean | null
          message: string
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message: string
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message?: string
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          message: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          id?: string
          message: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          message?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
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
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { _user_id: string }; Returns: string }
      has_admin_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer" | "manager" | "support"
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
      app_role: ["admin", "customer", "manager", "support"],
    },
  },
} as const
