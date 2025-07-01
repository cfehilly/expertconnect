import { createClient } from '@supabase/supabase-js';

// Use the provided Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://spnsfmunfyknyzyombuy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwbnNmbXVuZnlrbnl6eW9tYnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMTgwNzksImV4cCI6MjA2Njg5NDA3OX0.lx6oms-Yfb4esOk7hSmxfvRss2kVMv8kZK3aU2AtwcE';

// Check if we have valid Supabase configuration
const hasValidConfig = supabaseUrl.includes('supabase.co') && supabaseAnonKey.length > 50;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: hasValidConfig,
    persistSession: hasValidConfig,
    detectSessionInUrl: hasValidConfig
  }
});

// Database helper functions with error handling
export const dbHelpers = {
  // Get user profile
  async getUserProfile(userId: string) {
    if (!hasValidConfig) {
      throw new Error('Supabase not configured. Please set up your database connection.');
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: any) {
    if (!hasValidConfig) {
      throw new Error('Supabase not configured. Please set up your database connection.');
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get all users (admin only)
  async getAllUsers() {
    if (!hasValidConfig) {
      // Return empty array for demo purposes
      return [];
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    console.log('Fetched users from database:', data);
    return data;
  },

  // Get help requests
  async getHelpRequests() {
    if (!hasValidConfig) {
      // Return empty array for demo
      return [];
    }
    
    const { data, error } = await supabase
      .from('help_requests')
      .select(`
        *,
        requester:requester_id(name, email, avatar, department),
        expert:expert_id(name, email, avatar, department)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create help request
  async createHelpRequest(request: any) {
    if (!hasValidConfig) {
      throw new Error('Supabase not configured. Please set up your database connection.');
    }
    
    const { data, error } = await supabase
      .from('help_requests')
      .insert(request)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get user statistics (admin only)
  async getUserStats() {
    if (!hasValidConfig) {
      return { total_users: 0, active_users: 0, experts: 0, management: 0, new_users_this_month: 0 };
    }
    
    const { data, error } = await supabase
      .rpc('get_user_stats');
    
    if (error) throw error;
    return data;
  },

  // Get request statistics (admin only)
  async getRequestStats() {
    if (!hasValidConfig) {
      return { total_requests: 0, open_requests: 0, completed_requests: 0, avg_completion_time: '0 minutes', requests_this_week: 0 };
    }
    
    const { data, error } = await supabase
      .rpc('get_request_stats');
    
    if (error) throw error;
    return data;
  },

  // Get department analytics (admin only)
  async getDepartmentAnalytics() {
    if (!hasValidConfig) {
      return [];
    }
    
    const { data, error } = await supabase
      .rpc('get_department_analytics');
    
    if (error) throw error;
    return data;
  },

  // NEW BULK IMPORT USERS - With the final fix
  async bulkImportUsers(users: any[]) {
    if (!hasValidConfig) {
      throw new Error('Supabase not configured. Please set up your database connection.');
    }
    
    console.log('Starting bulk import via Edge Function:', users);
    
    try {
      // Get the current session to pass the auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session. Please log in again.');
      }

      console.log('Calling import-users Edge Function...');

      // Call the Edge Function for user import
      const { data, error } = await supabase.functions.invoke('import-users', {
        // *** THE FIX IS HERE: Manually stringify the body ***
        body: JSON.stringify({ users }),
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to import users via Edge Function');
      }

      console.log('Import results from Edge Function:', data);
      
      // Ensure we return a properly formatted result
      return {
        successful: data.successful || 0,
        failed: data.failed || 0,
        errors: data.errors || []
      };

    } catch (error: any) {
      console.error('Import error:', error);
      throw new Error(error.message || 'Failed to import users');
    }
  }
};

// Export configuration status for components to check
export { hasValidConfig };