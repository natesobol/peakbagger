// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

// Supabase credentials - these are safe to use in client-side code
const supabaseUrl = 'https://uobvavnsstrgyezcklib.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYnZhdm5zc3RyZ3llemNrbGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODEzNTksImV4cCI6MjA4MTA1NzM1OX0.KL32AFytJcOC5RPEPlWlCzBDiA8N_Su9qb0yXT2n2ZI';

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
}

// Helper to check if user is logged in
export async function isLoggedIn() {
  const user = await getCurrentUser();
  return !!user;
}
