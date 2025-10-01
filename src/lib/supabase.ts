import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  name: string;
  balance: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  image_url: string;
  title: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_best_seller: boolean;
  stock: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
}
