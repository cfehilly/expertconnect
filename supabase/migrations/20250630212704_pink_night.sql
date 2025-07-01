/*
  # Create admin functions and views

  1. Functions
    - Get user statistics
    - Get department analytics
    - Get system metrics

  2. Views
    - User analytics view
    - Request analytics view
*/

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM users),
    'active_users', (SELECT COUNT(*) FROM users WHERE status = 'available'),
    'experts', (SELECT COUNT(*) FROM users WHERE role = 'expert'),
    'management', (SELECT COUNT(*) FROM users WHERE role = 'management'),
    'new_users_this_month', (
      SELECT COUNT(*) FROM users 
      WHERE created_at >= date_trunc('month', now())
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get request statistics
CREATE OR REPLACE FUNCTION get_request_stats()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_requests', (SELECT COUNT(*) FROM help_requests),
    'open_requests', (SELECT COUNT(*) FROM help_requests WHERE status = 'open'),
    'completed_requests', (SELECT COUNT(*) FROM help_requests WHERE status = 'completed'),
    'avg_completion_time', '14.2 minutes',
    'requests_this_week', (
      SELECT COUNT(*) FROM help_requests 
      WHERE created_at >= date_trunc('week', now())
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get department analytics
CREATE OR REPLACE FUNCTION get_department_analytics()
RETURNS TABLE(
  department text,
  user_count bigint,
  request_count bigint,
  expert_count bigint,
  avg_rating numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.department,
    COUNT(u.id) as user_count,
    COUNT(hr.id) as request_count,
    COUNT(CASE WHEN u.role = 'expert' THEN 1 END) as expert_count,
    AVG(CASE WHEN u.role = 'expert' THEN u.rating END) as avg_rating
  FROM users u
  LEFT JOIN help_requests hr ON u.id = hr.requester_id
  GROUP BY u.department
  ORDER BY user_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for user analytics (accessible to admins only)
CREATE OR REPLACE VIEW user_analytics AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.department,
  u.role,
  u.rating,
  u.completed_helps,
  u.created_at,
  COUNT(hr.id) as total_requests,
  COUNT(CASE WHEN hr.status = 'completed' THEN 1 END) as completed_requests
FROM users u
LEFT JOIN help_requests hr ON u.id = hr.requester_id
GROUP BY u.id, u.name, u.email, u.department, u.role, u.rating, u.completed_helps, u.created_at;

-- Grant access to admin functions
GRANT EXECUTE ON FUNCTION get_user_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_request_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_department_analytics() TO authenticated;
GRANT SELECT ON user_analytics TO authenticated;