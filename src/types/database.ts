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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bakery: {
        Row: {
          created_at: string
          data: Json
          id: number
          parent_id: number | null
          slug: string | null
          sort_order: number
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: number
          parent_id?: number | null
          slug?: string | null
          sort_order?: number
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: number
          parent_id?: number | null
          slug?: string | null
          sort_order?: number
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "bakery"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          display_order: number
          id: string
          name: string
          slug: string
        }
        Insert: {
          display_order?: number
          id?: string
          name: string
          slug: string
        }
        Update: {
          display_order?: number
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      kho_iphone: {
        Row: {
          "Dung Lượng RAM/ROM": string | null
          Giá: string | null
          "Hình ảnh sản phẩm 1": string | null
          "Hình ảnh sản phẩm 2": string | null
          "Hình ảnh sản phẩm 3": string | null
          "Hình ảnh sản phẩm 4": string | null
          "Hình ảnh sản phẩm 5": string | null
          "Hình ảnh sản phẩm 6": string | null
          id: number
          "Mã sản phẩm": string | null
          "Mô tả": string | null
          stt: string | null
          "Tên sản phẩm": string | null
        }
        Insert: {
          "Dung Lượng RAM/ROM"?: string | null
          Giá?: string | null
          "Hình ảnh sản phẩm 1"?: string | null
          "Hình ảnh sản phẩm 2"?: string | null
          "Hình ảnh sản phẩm 3"?: string | null
          "Hình ảnh sản phẩm 4"?: string | null
          "Hình ảnh sản phẩm 5"?: string | null
          "Hình ảnh sản phẩm 6"?: string | null
          id: number
          "Mã sản phẩm"?: string | null
          "Mô tả"?: string | null
          stt?: string | null
          "Tên sản phẩm"?: string | null
        }
        Update: {
          "Dung Lượng RAM/ROM"?: string | null
          Giá?: string | null
          "Hình ảnh sản phẩm 1"?: string | null
          "Hình ảnh sản phẩm 2"?: string | null
          "Hình ảnh sản phẩm 3"?: string | null
          "Hình ảnh sản phẩm 4"?: string | null
          "Hình ảnh sản phẩm 5"?: string | null
          "Hình ảnh sản phẩm 6"?: string | null
          id?: number
          "Mã sản phẩm"?: string | null
          "Mô tả"?: string | null
          stt?: string | null
          "Tên sản phẩm"?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category_id: string
          created_at: string
          description: string
          display_order: number
          id: string
          image_url: string
          is_available: boolean
          is_featured: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          image_url?: string
          is_available?: boolean
          is_featured?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          image_url?: string
          is_available?: boolean
          is_featured?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      veloce_admins: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      veloce_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      veloce_orders: {
        Row: {
          address: string
          code: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          discount: number
          id: string
          items: Json
          note: string | null
          shipping_fee: number
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          address: string
          code: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          discount?: number
          id?: string
          items?: Json
          note?: string | null
          shipping_fee?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          address?: string
          code?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          discount?: number
          id?: string
          items?: Json
          note?: string | null
          shipping_fee?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      veloce_products: {
        Row: {
          badge: string | null
          brand: string
          category_id: string | null
          colors: Json
          created_at: string
          description: string
          features: string[]
          id: string
          images: string[]
          is_published: boolean
          name: string
          original_price: number | null
          price: number
          rating: number
          review_count: number
          sizes: number[]
          slug: string
          sort_order: number
          stock: number
          unsplash_id: string | null
          updated_at: string
        }
        Insert: {
          badge?: string | null
          brand?: string
          category_id?: string | null
          colors?: Json
          created_at?: string
          description?: string
          features?: string[]
          id?: string
          images?: string[]
          is_published?: boolean
          name: string
          original_price?: number | null
          price: number
          rating?: number
          review_count?: number
          sizes?: number[]
          slug: string
          sort_order?: number
          stock?: number
          unsplash_id?: string | null
          updated_at?: string
        }
        Update: {
          badge?: string | null
          brand?: string
          category_id?: string | null
          colors?: Json
          created_at?: string
          description?: string
          features?: string[]
          id?: string
          images?: string[]
          is_published?: boolean
          name?: string
          original_price?: number | null
          price?: number
          rating?: number
          review_count?: number
          sizes?: number[]
          slug?: string
          sort_order?: number
          stock?: number
          unsplash_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "veloce_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "veloce_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      veloce_settings: {
        Row: {
          address: string | null
          color_accent: string
          color_primary: string
          color_secondary: string
          coupon_code: string | null
          coupon_percent: number
          email: string | null
          facebook_url: string | null
          freeship_threshold: number
          hero_headline: string | null
          hero_image_url: string | null
          hero_subheadline: string | null
          id: number
          instagram_url: string | null
          logo_url: string | null
          phone: string | null
          shipping_fee: number
          slogan: string
          store_name: string
          updated_at: string
          zalo_url: string | null
        }
        Insert: {
          address?: string | null
          color_accent?: string
          color_primary?: string
          color_secondary?: string
          coupon_code?: string | null
          coupon_percent?: number
          email?: string | null
          facebook_url?: string | null
          freeship_threshold?: number
          hero_headline?: string | null
          hero_image_url?: string | null
          hero_subheadline?: string | null
          id?: number
          instagram_url?: string | null
          logo_url?: string | null
          phone?: string | null
          shipping_fee?: number
          slogan?: string
          store_name?: string
          updated_at?: string
          zalo_url?: string | null
        }
        Update: {
          address?: string | null
          color_accent?: string
          color_primary?: string
          color_secondary?: string
          coupon_code?: string | null
          coupon_percent?: number
          email?: string | null
          facebook_url?: string | null
          freeship_threshold?: number
          hero_headline?: string | null
          hero_image_url?: string | null
          hero_subheadline?: string | null
          id?: number
          instagram_url?: string | null
          logo_url?: string | null
          phone?: string | null
          shipping_fee?: number
          slogan?: string
          store_name?: string
          updated_at?: string
          zalo_url?: string | null
        }
        Relationships: []
      }
      veloce_testimonials: {
        Row: {
          avatar_url: string | null
          content: string
          created_at: string
          id: string
          is_published: boolean
          name: string
          rating: number
          role: string | null
          sort_order: number
        }
        Insert: {
          avatar_url?: string | null
          content: string
          created_at?: string
          id?: string
          is_published?: boolean
          name: string
          rating?: number
          role?: string | null
          sort_order?: number
        }
        Update: {
          avatar_url?: string | null
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean
          name?: string
          rating?: number
          role?: string | null
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: {
      v_categories: {
        Row: {
          created_at: string | null
          data: Json | null
          icon: string | null
          id: number | null
          name_i18n: Json | null
          parent_id: number | null
          slug: string | null
          sort_order: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          icon?: never
          id?: number | null
          name_i18n?: never
          parent_id?: number | null
          slug?: string | null
          sort_order?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          icon?: never
          id?: number | null
          name_i18n?: never
          parent_id?: number | null
          slug?: string | null
          sort_order?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "bakery"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      v_orders: {
        Row: {
          code: string | null
          created_at: string | null
          customer_name: string | null
          data: Json | null
          discount: number | null
          id: number | null
          payment_method: string | null
          phone: string | null
          shipping_fee: number | null
          status: string | null
          subtotal: number | null
          total: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          code?: never
          created_at?: string | null
          customer_name?: never
          data?: Json | null
          discount?: never
          id?: number | null
          payment_method?: never
          phone?: never
          shipping_fee?: never
          status?: string | null
          subtotal?: never
          total?: never
          updated_at?: string | null
          user_id?: never
        }
        Update: {
          code?: never
          created_at?: string | null
          customer_name?: never
          data?: Json | null
          discount?: never
          id?: number | null
          payment_method?: never
          phone?: never
          shipping_fee?: never
          status?: string | null
          subtotal?: never
          total?: never
          updated_at?: string | null
          user_id?: never
        }
        Relationships: []
      }
      v_products: {
        Row: {
          category_id: number | null
          created_at: string | null
          data: Json | null
          id: number | null
          images: Json | null
          is_featured: boolean | null
          name_i18n: Json | null
          price: number | null
          sale_price: number | null
          sku: string | null
          slug: string | null
          sort_order: number | null
          status: string | null
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          data?: Json | null
          id?: number | null
          images?: never
          is_featured?: never
          name_i18n?: never
          price?: never
          sale_price?: never
          sku?: never
          slug?: string | null
          sort_order?: number | null
          status?: string | null
          stock?: never
          updated_at?: string | null
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          data?: Json | null
          id?: number | null
          images?: never
          is_featured?: never
          name_i18n?: never
          price?: never
          sale_price?: never
          sku?: never
          slug?: string | null
          sort_order?: number | null
          status?: string | null
          stock?: never
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "bakery"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      v_revenue_daily: {
        Row: {
          day: string | null
          orders_count: number | null
          revenue: number | null
        }
        Relationships: []
      }
      v_reviews: {
        Row: {
          author: string | null
          content: string | null
          created_at: string | null
          data: Json | null
          id: number | null
          product_id: number | null
          rating: number | null
          status: string | null
        }
        Insert: {
          author?: never
          content?: never
          created_at?: string | null
          data?: Json | null
          id?: number | null
          product_id?: number | null
          rating?: never
          status?: string | null
        }
        Update: {
          author?: never
          content?: never
          created_at?: string | null
          data?: Json | null
          id?: number | null
          product_id?: number | null
          rating?: never
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "bakery"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      bakery_next_order_code: { Args: never; Returns: string }
      bakery_unaccent: { Args: { txt: string }; Returns: string }
      search_products: {
        Args: { result_limit?: number; search_query: string }
        Returns: {
          created_at: string
          data: Json
          id: number
          parent_id: number | null
          slug: string | null
          sort_order: number
          status: string
          type: string
          updated_at: string
        }[]
      }
      veloce_cancel_order: { Args: { p_order_id: string }; Returns: undefined }
      veloce_place_order: {
        Args: {
          p_address: string
          p_coupon_code?: string
          p_customer_email?: string
          p_customer_name: string
          p_customer_phone: string
          p_items: Json
          p_note?: string
        }
        Returns: {
          order_code: string
          order_id: string
          order_total: number
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
