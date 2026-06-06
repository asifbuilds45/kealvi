import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://eiyelakqglopqwdaokiz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpeWVsYWtxZ2xvcHF3ZGFva2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDA4NjcsImV4cCI6MjA5NTk3Njg2N30.m-gZJgtIQ4VH1uJrNn6Y8QsXwxpgZmXom6KlIrOU8po";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Browser-safe client
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Server-only client
export const supabase = typeof window === "undefined"
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabaseClient;