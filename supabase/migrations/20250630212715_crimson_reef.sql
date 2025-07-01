/*
  # Insert sample data for testing

  1. Sample Users
    - Admin user
    - Sample experts
    - Sample employees

  2. Sample Help Requests
    - Various categories and priorities
*/

-- Insert sample admin user (you'll need to replace with actual auth user ID)
-- This is just for reference - actual users will be created through authentication

-- Insert sample help request categories and data
-- Note: This will only work after you have actual authenticated users

-- Sample expertise areas for reference
INSERT INTO help_requests (title, description, category, priority, requester_id, tags, estimated_time)
SELECT 
  'Sample Excel Help Request',
  'Need help with VLOOKUP formulas and data analysis',
  'Excel',
  'medium',
  (SELECT id FROM users LIMIT 1),
  ARRAY['Excel', 'VLOOKUP', 'Data Analysis'],
  '30-45 minutes'
WHERE EXISTS (SELECT 1 FROM users LIMIT 1);

-- This migration will be populated with real data once users start signing up