import { createClient } from '@supabase/supabase-js';

// These variables should come from your .env.local file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://spnsfmunfyknyzyombuy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwbnNmbXVuZnlrbnl6eW9tYnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMTgwNzksImV4cCI6MjA2Njg5NDA3OX0.lx6oms-Yfb4esOk7hSmxfvRss2kVMv8kZK3aU2AtwcE';

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
  // Existing helper functions for dashboard counts
  async getActiveRequestsCount(userId: string) {
    if (!hasValidConfig) {
      console.warn('Supabase not configured, returning 0 for active requests.');
      return 0;
    }
    const { count, error } = await supabase
      .from('help_requests') // Using 'help_requests' table
      .select('id', { count: 'exact' })
      .eq('status', 'open') // Changed to 'open'
      .or(`requester_id.eq.${userId},expert_id.eq.${userId}`);
    if (error) {
      console.error('Error fetching active requests count:', error);
      throw error;
    }
    return count || 0;
  },

  async getConnectionsCount(userId: string) {
    if (!hasValidConfig) {
      console.warn('Supabase not configured, returning 0 for connections count.');
      return 0;
    }
    const { count, error } = await supabase
      .from('connections')
      .select('id', { count: 'exact' })
      .or(`requester_id.eq.${userId},expert_id.eq.${userId}`);
    if (error) {
      console.error('Error fetching connections count:', error);
      throw error;
    }
    return count || 0;
  },

  async getCompletedHelpsCountThisWeek(userId: string) {
    if (!hasValidConfig) {
      console.warn('Supabase not configured, returning 0 for completed helps this week.');
      return 0;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    const { count, error } = await supabase
      .from('help_requests')
      .select('id', { count: 'exact' })
      .eq('status', 'completed')
      .or(`requester_id.eq.${userId},expert_id.eq.${userId}`)
      .gte('updated_at', sevenDaysAgoISO);
    if (error) {
      console.error('Error fetching completed helps this week count:', error);
      throw error;
    }
    return count || 0;
  },

  async getNewRequestsCountYesterday(userId: string) {
    if (!hasValidConfig) return 0;
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const twentyFourHoursAgoISO = twentyFourHoursAgo.toISOString();

    const { count, error } = await supabase
      .from('help_requests')
      .select('id', { count: 'exact' })
      .or(`requester_id.eq.${userId},expert_id.eq.${userId}`)
      .gte('created_at', twentyFourHoursAgoISO);
    if (error) {
      console.error('Error fetching new requests yesterday count:', error);
      throw error;
    }
    return count || 0;
  },

  async getNewConnectionsCountThisWeek(userId: string) {
    if (!hasValidConfig) return 0;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    const { count, error } = await supabase
      .from('connections')
      .select('id', { count: 'exact' })
      .or(`requester_id.eq.${userId},expert_id.eq.${userId}`)
      .gte('created_at', sevenDaysAgoISO);
    if (error) {
      console.error('Error fetching new connections this week count:', error);
      throw error;
    }
    return count || 0;
  },

  async getExpertRatingChangeThisMonth(userId: string) {
    return 0; // Placeholder
  },

  // Your other existing dbHelpers functions (copied from your previous response):
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

  async getAllUsers() {
    if (!hasValidConfig) {
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

  async getHelpRequests() {
    if (!hasValidConfig) {
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

  async getUserStats() {
    if (!hasValidConfig) {
      return { total_users: 0, active_users: 0, experts: 0, management: 0, new_users_this_month: 0 };
    }
    const { data, error } = await supabase
      .rpc('get_user_stats');
    if (error) throw error;
    return data;
  },

  async getRequestStats() {
    if (!hasValidConfig) {
      return { total_requests: 0, open_requests: 0, completed_requests: 0, avg_completion_time: '0 minutes', requests_this_week: 0 };
    }
    const { data, error } = await supabase
      .rpc('get_request_stats');
    if (error) throw error;
    return data;
  },

  async getDepartmentAnalytics() {
    if (!hasValidConfig) {
      return [];
    }
    const { data, error } = await supabase
      .rpc('get_department_analytics');
    if (error) throw error;
    return data;
  },

  async bulkImportUsers(users: any[]) {
    if (!hasValidConfig) {
      throw new Error('Supabase not configured. Please set up your database connection.');
    }
    console.log('Starting bulk import via direct fetch to Edge Function.');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session. Please log in again.');
      }
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/import-users`;
      console.log('Calling Edge Function directly:', edgeFunctionUrl);
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ users }),
      });
      const responseData = await response.json();
      if (!response.ok) {
        console.error('Direct fetch Edge function error response:', responseData);
        throw new Error(responseData.error || 'Edge Function returned a non-2xx status code');
      }
      console.log('Import results from Edge Function (direct fetch):', responseData);
      return {
        successful: responseData.successful || 0,
        failed: responseData.failed || 0,
        errors: responseData.errors || []
      };
    } catch (error: any) {
      console.error('Frontend bulk import (direct fetch) caught error:', error);
      throw new Error(error.message || 'Failed to import users');
    }
  },

  // --- NEW: Function to update request status ---
  async updateRequestStatus(requestId: string, newStatus: string) {
    if (!hasValidConfig) {
      throw new Error('Supabase not configured. Cannot update request status.');
    }
    const { data, error } = await supabase
      .from('help_requests') // Assuming requests are in 'help_requests' table
      .update({ status: newStatus })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating request ${requestId} status to ${newStatus}:`, error);
      throw error;
    }
    return data;
  },
  // --- END NEW ---
};

export { hasValidConfig };