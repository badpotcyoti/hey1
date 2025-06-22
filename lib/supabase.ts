import { createClient } from "@supabase/supabase-js"

// Use environment variables if available, otherwise fall back to hardcoded values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uzjtdkemuuwwtwgtlxoq.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6anRka2VtdXV3d3R3Z3RseG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NjQzNzQsImV4cCI6MjA2NjE0MDM3NH0.A46Y0cY27VGvaPh8V3ufmx7IVHnjELFY3PmGyKZxOcM"

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase configuration. Please check your environment variables or hardcoded values.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          phone_number: string | null
          address: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          phone_number?: string | null
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone_number?: string | null
          address?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      treks: {
        Row: {
          id: number
          title: string
          description: string | null
          image_url: string | null
          duration: string | null
          difficulty: string | null
          price: number | null
          overview: string | null
          highlights: string[] | null
          who_can_participate: string | null
          itinerary: any | null
          how_to_reach: string | null
          cost_terms: string | null
          trek_essentials: string[] | null
          created_at: string
        }
      }
      bookings: {
        Row: {
          id: number
          user_id: string | null
          trek_id: number | null
          booking_date: string
          trek_date: string | null
          total_participants: number | null
          total_amount: number | null
          status: string | null
          created_at: string
        }
        Insert: {
          user_id?: string | null
          trek_id?: number | null
          trek_date?: string | null
          total_participants?: number | null
          total_amount?: number | null
          status?: string | null
        }
      }
      participants: {
        Row: {
          id: number
          booking_id: number | null
          name: string
          email: string
          phone_number: string
          address: string
          is_primary_user: boolean | null
          created_at: string
        }
        Insert: {
          booking_id?: number | null
          name: string
          email: string
          phone_number: string
          address: string
          is_primary_user?: boolean | null
        }
      }
      vouchers: {
        Row: {
          id: number
          user_id: string | null
          code: string
          discount_percentage: number | null
          discount_amount: number | null
          valid_until: string | null
          is_used: boolean | null
          created_at: string
        }
      }
    }
  }
}
