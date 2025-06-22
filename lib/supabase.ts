import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://uzjtdkemuuwwtwgtlxoq.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6anRka2VtdXV3d3R3Z3RseG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NjQzNzQsImV4cCI6MjA2NjE0MDM3NH0.A46Y0cY27VGvaPh8V3ufmx7IVHnjELFY3PmGyKZxOcM"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
