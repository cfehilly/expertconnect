/*
  # Create connections and messages tables

  1. New Tables
    - `connections`
      - `id` (uuid, primary key)
      - `help_request_id` (uuid, foreign key to help_requests)
      - `requester_id` (uuid, foreign key to users)
      - `expert_id` (uuid, foreign key to users)
      - `status` (text, connection status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `messages`
      - `id` (uuid, primary key)
      - `connection_id` (uuid, foreign key to connections)
      - `sender_id` (uuid, foreign key to users)
      - `content` (text, message content)
      - `message_type` (text, message type)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own connections and messages
*/

CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  help_request_id uuid REFERENCES help_requests(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expert_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can only access their own connections
CREATE POLICY "Users can access own connections"
  ON connections
  FOR ALL
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = expert_id);

-- Users can only access messages from their connections
CREATE POLICY "Users can access own messages"
  ON messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM connections 
      WHERE id = connection_id 
      AND (requester_id = auth.uid() OR expert_id = auth.uid())
    )
  );

-- Admins can access all connections and messages
CREATE POLICY "Admins can access all connections"
  ON connections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can access all messages"
  ON messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Triggers to update updated_at
CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();