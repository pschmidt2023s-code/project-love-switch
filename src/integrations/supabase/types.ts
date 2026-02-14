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
      ab_experiment_events: {
        Row: {
          created_at: string
          event_type: string
          experiment_id: string
          id: string
          metadata: Json | null
          session_id: string | null
          user_id: string | null
          variant: string
        }
        Insert: {
          created_at?: string
          event_type?: string
          experiment_id: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
          variant: string
        }
        Update: {
          created_at?: string
          event_type?: string
          experiment_id?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_experiment_events_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "ab_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_experiments: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          start_date: string | null
          target_element: string | null
          variant_a_label: string | null
          variant_b_label: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          start_date?: string | null
          target_element?: string | null
          variant_a_label?: string | null
          variant_b_label?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string | null
          target_element?: string | null
          variant_a_label?: string | null
          variant_b_label?: string | null
        }
        Relationships: []
      }
      abandoned_carts: {
        Row: {
          cart_data: Json
          created_at: string
          guest_email: string | null
          id: string
          last_reminder_at: string | null
          recovered: boolean | null
          recovered_at: string | null
          reminder_sent_count: number | null
          total_amount: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cart_data?: Json
          created_at?: string
          guest_email?: string | null
          id?: string
          last_reminder_at?: string | null
          recovered?: boolean | null
          recovered_at?: string | null
          reminder_sent_count?: number | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cart_data?: Json
          created_at?: string
          guest_email?: string | null
          id?: string
          last_reminder_at?: string | null
          recovered?: boolean | null
          recovered_at?: string | null
          reminder_sent_count?: number | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
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
      audit_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          session_id: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string
          category: string | null
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          read_time_minutes: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string
          category?: string | null
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          category?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
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
      csat_surveys: {
        Row: {
          category: string | null
          created_at: string
          feedback: string | null
          id: string
          order_id: string | null
          rating: number
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          order_id?: string | null
          rating: number
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          order_id?: string | null
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "csat_surveys_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
      email_sequence_logs: {
        Row: {
          created_at: string
          email: string
          id: string
          sequence_id: string | null
          status: string | null
          step_index: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          sequence_id?: string | null
          status?: string | null
          step_index?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          sequence_id?: string | null
          status?: string | null
          step_index?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_logs_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequences: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          steps: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          steps?: Json
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          steps?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      fraud_scores: {
        Row: {
          created_at: string
          factors: Json | null
          flagged: boolean | null
          id: string
          order_id: string | null
          reviewed: boolean | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string | null
          score: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          factors?: Json | null
          flagged?: boolean | null
          id?: string
          order_id?: string | null
          reviewed?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          score?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          factors?: Json | null
          flagged?: boolean | null
          id?: string
          order_id?: string | null
          reviewed?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_scores_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_events: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          page: string | null
          session_id: string
          step: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          page?: string | null
          session_id: string
          step: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          page?: string | null
          session_id?: string
          step?: string
          user_id?: string | null
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
      playlist_tracks: {
        Row: {
          created_at: string
          crossfade_duration: number | null
          id: string
          playlist_id: string
          position: number
          track_id: string
          transition_type: string | null
        }
        Insert: {
          created_at?: string
          crossfade_duration?: number | null
          id?: string
          playlist_id: string
          position?: number
          track_id: string
          transition_type?: string | null
        }
        Update: {
          created_at?: string
          crossfade_duration?: number | null
          id?: string
          playlist_id?: string
          position?: number
          track_id?: string
          transition_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          automix_config: Json | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_automix: boolean | null
          is_public: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          automix_config?: Json | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_automix?: boolean | null
          is_public?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          automix_config?: Json | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_automix?: boolean | null
          is_public?: boolean | null
          name?: string
          updated_at?: string
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
      radio_config: {
        Row: {
          created_at: string
          id: string
          is_live: boolean
          loop_start_epoch: number
          mode: string
          playlist_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_live?: boolean
          loop_start_epoch?: number
          mode?: string
          playlist_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_live?: boolean
          loop_start_epoch?: number
          mode?: string
          playlist_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "radio_config_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      radio_schedule: {
        Row: {
          created_at: string
          day_of_week: number | null
          end_time: string
          id: string
          is_active: boolean
          priority: number
          start_time: string
          track_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          end_time: string
          id?: string
          is_active?: boolean
          priority?: number
          start_time: string
          track_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          end_time?: string
          id?: string
          is_active?: boolean
          priority?: number
          start_time?: string
          track_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "radio_schedule_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          current_uses: number | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          referee_reward_value: number
          reward_type: string
          reward_value: number
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          referee_reward_value?: number
          reward_type?: string
          reward_value?: number
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          referee_reward_value?: number
          reward_type?: string
          reward_value?: number
          user_id?: string
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          referee_email: string | null
          referee_id: string
          referee_reward: number | null
          referral_code_id: string
          referrer_id: string
          referrer_reward: number | null
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          referee_email?: string | null
          referee_id: string
          referee_reward?: number | null
          referral_code_id: string
          referrer_id: string
          referrer_reward?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          referee_email?: string | null
          referee_id?: string
          referee_reward?: number | null
          referral_code_id?: string
          referrer_id?: string
          referrer_reward?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
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
      reviews: {
        Row: {
          author_name: string
          content: string | null
          created_at: string
          helpful_count: number | null
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          author_name?: string
          content?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          author_name?: string
          content?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          allow_guest_checkout: boolean | null
          announce_bar_enabled: boolean | null
          announce_bar_link: string | null
          announce_bar_message: string | null
          created_at: string | null
          email_notifications: boolean | null
          express_shipping_cost: number | null
          free_shipping_threshold: number | null
          id: string
          low_stock_alerts: boolean | null
          low_stock_threshold: number | null
          maintenance_message: string | null
          maintenance_mode: boolean | null
          order_alerts: boolean | null
          standard_shipping_cost: number | null
          updated_at: string | null
        }
        Insert: {
          allow_guest_checkout?: boolean | null
          announce_bar_enabled?: boolean | null
          announce_bar_link?: string | null
          announce_bar_message?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          express_shipping_cost?: number | null
          free_shipping_threshold?: number | null
          id?: string
          low_stock_alerts?: boolean | null
          low_stock_threshold?: number | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          order_alerts?: boolean | null
          standard_shipping_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          allow_guest_checkout?: boolean | null
          announce_bar_enabled?: boolean | null
          announce_bar_link?: string | null
          announce_bar_message?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          express_shipping_cost?: number | null
          free_shipping_threshold?: number | null
          id?: string
          low_stock_alerts?: boolean | null
          low_stock_threshold?: number | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          order_alerts?: boolean | null
          standard_shipping_cost?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shipment_tracking: {
        Row: {
          carrier: string
          created_at: string
          estimated_delivery: string | null
          events: Json | null
          id: string
          order_id: string
          status: string | null
          tracking_number: string
          tracking_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          carrier?: string
          created_at?: string
          estimated_delivery?: string | null
          events?: Json | null
          id?: string
          order_id: string
          status?: string | null
          tracking_number: string
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          carrier?: string
          created_at?: string
          estimated_delivery?: string | null
          events?: Json | null
          id?: string
          order_id?: string
          status?: string | null
          tracking_number?: string
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipment_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      spin_prizes: {
        Row: {
          color: string | null
          created_at: string
          discount_type: string | null
          discount_value: number | null
          id: string
          is_active: boolean | null
          label: string
          probability: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          is_active?: boolean | null
          label: string
          probability?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          is_active?: boolean | null
          label?: string
          probability?: number
        }
        Relationships: []
      }
      spin_results: {
        Row: {
          coupon_code: string | null
          created_at: string
          email: string
          id: string
          prize_id: string | null
          prize_label: string
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          email: string
          id?: string
          prize_id?: string | null
          prize_label: string
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          email?: string
          id?: string
          prize_id?: string | null
          prize_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "spin_results_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "spin_prizes"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_notifications: {
        Row: {
          created_at: string
          email: string
          id: string
          notified: boolean | null
          product_id: string
          user_id: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notified?: boolean | null
          product_id: string
          user_id?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notified?: boolean | null
          product_id?: string
          user_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_notifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_notifications_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
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
          guest_email: string | null
          guest_name: string | null
          id: string
          last_delivery: string | null
          next_delivery: string | null
          product_id: string | null
          status: string
          updated_at: string
          user_id: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          delivery_count?: number | null
          discount_percent?: number | null
          frequency?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          last_delivery?: string | null
          next_delivery?: string | null
          product_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          delivery_count?: number | null
          discount_percent?: number | null
          frequency?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          last_delivery?: string | null
          next_delivery?: string | null
          product_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
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
      tracks: {
        Row: {
          album: string | null
          artist: string
          audio_url: string
          bpm: number | null
          cover_url: string | null
          created_at: string
          duration_seconds: number | null
          energy: string | null
          genre: string | null
          id: string
          is_active: boolean | null
          is_external: boolean
          is_hidden: boolean
          key_signature: string | null
          mood: string | null
          play_count: number | null
          scheduled_end: string | null
          scheduled_start: string | null
          sort_order: number | null
          title: string
          updated_at: string
          waveform_data: Json | null
          youtube_url: string | null
        }
        Insert: {
          album?: string | null
          artist?: string
          audio_url: string
          bpm?: number | null
          cover_url?: string | null
          created_at?: string
          duration_seconds?: number | null
          energy?: string | null
          genre?: string | null
          id?: string
          is_active?: boolean | null
          is_external?: boolean
          is_hidden?: boolean
          key_signature?: string | null
          mood?: string | null
          play_count?: number | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string
          waveform_data?: Json | null
          youtube_url?: string | null
        }
        Update: {
          album?: string | null
          artist?: string
          audio_url?: string
          bpm?: number | null
          cover_url?: string | null
          created_at?: string
          duration_seconds?: number | null
          energy?: string | null
          genre?: string | null
          id?: string
          is_active?: boolean | null
          is_external?: boolean
          is_hidden?: boolean
          key_signature?: string | null
          mood?: string | null
          play_count?: number | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string
          waveform_data?: Json | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      unboxing_gallery: {
        Row: {
          caption: string | null
          created_at: string
          customer_name: string
          id: string
          image_url: string
          is_approved: boolean | null
          product_name: string | null
          user_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          image_url: string
          is_approved?: boolean | null
          product_name?: string | null
          user_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          image_url?: string
          is_approved?: boolean | null
          product_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_name: string
          badge_type: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_name: string
          badge_type: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_name?: string
          badge_type?: string
          earned_at?: string
          id?: string
          user_id?: string
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
      vip_drops: {
        Row: {
          created_at: string
          description: string | null
          drop_date: string
          id: string
          image_url: string | null
          is_active: boolean | null
          product_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          drop_date: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          product_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          drop_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          product_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "vip_drops_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      vip_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
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
