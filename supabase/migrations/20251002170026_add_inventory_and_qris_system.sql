/*
  # Add Product Inventory and QRIS Payment System

  1. New Tables
    - `product_inventory`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `email` (text)
      - `password` (text)
      - `is_sold` (boolean, default false)
      - `order_id` (uuid, references orders, nullable)
      - `created_at` (timestamptz)
    
    - `qris_payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `qris_code` (text)
      - `qris_url` (text)
      - `amount` (numeric)
      - `type` (text: 'deposit' or 'purchase')
      - `reference_id` (uuid, nullable - deposit_id or order_id)
      - `status` (text: 'pending', 'completed', 'expired')
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)

  2. Updates
    - Add `product_details` jsonb column to orders table
    - Update deposits table to add reference to qris_payments

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Create product_inventory table
CREATE TABLE IF NOT EXISTS product_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  email text NOT NULL,
  password text NOT NULL,
  is_sold boolean DEFAULT false,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage inventory"
  ON product_inventory FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can view their purchased inventory"
  ON product_inventory FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Create qris_payments table
CREATE TABLE IF NOT EXISTS qris_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  qris_code text NOT NULL,
  qris_url text DEFAULT '',
  amount numeric NOT NULL CHECK (amount > 0),
  type text NOT NULL CHECK (type IN ('deposit', 'purchase')),
  reference_id uuid,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'failed')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '15 minutes'
);

ALTER TABLE qris_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own QRIS payments"
  ON qris_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own QRIS payments"
  ON qris_payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own QRIS payments"
  ON qris_payments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all QRIS payments"
  ON qris_payments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add product_details to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'product_details'
  ) THEN
    ALTER TABLE orders ADD COLUMN product_details jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add qris_payment_id to deposits table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deposits' AND column_name = 'qris_payment_id'
  ) THEN
    ALTER TABLE deposits ADD COLUMN qris_payment_id uuid REFERENCES qris_payments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add qris_payment_id to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'qris_payment_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN qris_payment_id uuid REFERENCES qris_payments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_inventory_product_id ON product_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_product_inventory_is_sold ON product_inventory(is_sold);
CREATE INDEX IF NOT EXISTS idx_qris_payments_user_id ON qris_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_qris_payments_status ON qris_payments(status);