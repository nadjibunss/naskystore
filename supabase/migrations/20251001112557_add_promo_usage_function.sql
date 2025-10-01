/*
  # Add Function to Increment Promo Code Usage

  1. New Function
    - `increment_promo_usage` - Increments the current_usage counter for a promo code
    
  2. Security
    - Function is accessible to authenticated users
    - Function updates promo_codes table
*/

CREATE OR REPLACE FUNCTION increment_promo_usage(promo_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE promo_codes
  SET current_usage = current_usage + 1
  WHERE code = promo_code;
END;
$$;