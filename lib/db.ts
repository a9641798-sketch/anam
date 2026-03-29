import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
// Accept both prefixed (browser-accessible) and non-prefixed (server-only) forms
const supabaseServiceKey =
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  ''

let supabase: SupabaseClient | null = null
let supabaseAdmin: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, storageKey: 'hh_admin_session' },
    })
  } catch (e) {}
}

if (supabaseUrl && supabaseServiceKey) {
  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })
  } catch (e) {}
}

// Export clients
export { supabase, supabaseAdmin }

// Helper function to check if supabase is available
export function isSupabaseAvailable(): boolean {
  return supabase !== null
}

// Helper function to get supabase or throw a helpful error
export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please check your environment variables.')
  }
  return supabase
}

// Database types based on schema
export type OrderType = 'pickup' | 'delivery' | 'dine_in'
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type OfferType = 'percentage_discount' | 'flat_discount' | 'bogo' | 'bundle'
export type OfferScope = 'entire_order' | 'category' | 'item'
export type GalleryCategory = 'food' | 'ambience' | 'events' | 'parties' | 'other'
