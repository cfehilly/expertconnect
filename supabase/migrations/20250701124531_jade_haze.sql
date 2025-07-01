/*
  # Fix users table SELECT policy

  1. Changes
    - Drop the existing users_read_all policy that causes infinite loading
    - Create new SELECT policy that allows:
      - Admins to see all users
      - Users to see their own profile
    - Add helper function to get user role safely

  2. Security
    - Maintains proper access control
    - Prevents infinite loading loops
    - Allows admin functionality while protecting user privacy
*/

-- Create helper function to get user role safely
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text AS $$
BEGIN
  RETURN (SELECT role FROM users WHERE id = user_id LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the problematic existing SELECT policy
DROP POLICY IF EXISTS "users_read_all" ON users;
DROP POLICY IF EXISTS "Users can read all profiles" ON users;

-- Create new SELECT policy with proper access control
CREATE POLICY "Users can read based on role"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    (get_user_role(auth.uid()) = 'admin') OR (auth.uid() = id)
  );