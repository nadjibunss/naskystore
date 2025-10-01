/*
  # Add Promo Codes System

  1. New Table
    - `promo_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `discount_type` (text: 'percentage' or 'fixed')
      - `discount_value` (numeric)
      - `is_active` (boolean, default true)
      - `min_purchase` (numeric, default 0)
      - `max_usage` (integer, default null for unlimited)
      - `current_usage` (integer, default 0)
      - `valid_until` (timestamptz, default null for no expiry)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on promo_codes table
    - Allow authenticated users to read active promo codes
    - Allow admins to manage promo codes
*/

CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  is_active boolean DEFAULT true,
  min_purchase numeric DEFAULT 0,
  max_usage integer DEFAULT NULL,
  current_usage integer DEFAULT 0,
  valid_until timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active promo codes"
  ON promo_codes FOR SELECT
  TO authenticated
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Admins can manage promo codes"
  ON promo_codes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Insert sample promo codes
INSERT INTO promo_codes (code, discount_type, discount_value, min_purchase) VALUES
('WELCOME10', 'percentage', 10, 0),
('SAVE5K', 'fixed', 5000, 50000),
('PROMO20', 'percentage', 20, 100000);