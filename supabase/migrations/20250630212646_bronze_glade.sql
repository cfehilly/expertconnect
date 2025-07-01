/*
  # Create help requests table

  1. New Tables
    - `help_requests`
      - `id` (uuid, primary key)
      - `title` (text, request title)
      - `description` (text, detailed description)
      - `category` (text, request category)
      - `priority` (text, priority level)
      - `requester_id` (uuid, foreign key to users)
      - `expert_id` (uuid, foreign key to users, nullable)
      - `status` (text, request status)
      - `tags` (text array, searchable tags)
      - `estimated_time` (text, estimated completion time)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `help_requests` table
    - Users can read all open requests
    - Users can create requests
    - Users can update their own requests
    - Experts and admins can update any request
*/

CREATE TABLE IF NOT EXISTS help_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expert_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'completed', 'cancelled')),
  tags text[] DEFAULT '{}',
  estimated_time text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;

-- Users can read all help requests
CREATE POLICY "Users can read all help requests"
  ON help_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can create help requests
CREATE POLICY "Users can create help requests"
  ON help_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

-- Users can update their own requests
CREATE POLICY "Users can update own requests"
  ON help_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = requester_id);

-- Experts and admins can update any request
CREATE POLICY "Experts and admins can update requests"
  ON help_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role IN ('expert', 'management', 'admin') OR id = expert_id)
    )
  );

-- Trigger to update updated_at
CREATE TRIGGER update_help_requests_updated_at
  BEFORE UPDATE ON help_requests
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();