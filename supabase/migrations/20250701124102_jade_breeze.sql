/*
  # Fix users table INSERT policy

  1. Changes
    - Drop the incorrect INSERT policy "users_insert_own"
    - Create new INSERT policy that allows only admins to insert users
    
  2. Security
    - Only users with admin role can insert new users into the users table
    - This prevents unauthorized user creation through the application
*/

-- Drop the existing incorrect INSERT policy
DROP POLICY IF EXISTS "users_insert_own" ON users;

-- Create new INSERT policy for admins only
CREATE POLICY "Admins can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );