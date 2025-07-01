import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ImportUser {
  name: string;
  email: string;
  department: string;
  role: string;
  expertise?: string[];
}

Deno.serve(async (req) => {
  console.log('Function started, method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting user import process...');

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the request is from an authenticated admin user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      throw new Error('Invalid authentication token');
    }

    console.log(`Authenticated user: ${user.email}`);

    // Check if user is admin
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile lookup failed:', profileError);
      throw new Error('Could not verify user permissions');
    }

    if (userProfile?.role !== 'admin') {
      throw new Error('Admin access required for user import');
    }

    console.log('Admin access verified');

    // Parse request body
    const { users }: { users: ImportUser[] } = await req.json();

    if (!users || !Array.isArray(users)) {
      throw new Error('Invalid users data - expected array of users');
    }

    console.log(`Processing ${users.length} users for import`);

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each user individually
    for (let i = 0; i < users.length; i++) {
      const userData = users[i];
      console.log(`Processing user ${i + 1}/${users.length}: ${userData.email}`);

      try {
        // Validate required fields
        if (!userData.name?.trim()) {
          throw new Error('Name is required');
        }
        if (!userData.email?.trim()) {
          throw new Error('Email is required');
        }
        if (!userData.department?.trim()) {
          throw new Error('Department is required');
        }
        if (!userData.role?.trim()) {
          throw new Error('Role is required');
        }

        const email = userData.email.trim().toLowerCase();
        const validRoles = ['employee', 'expert', 'management', 'admin'];

        if (!validRoles.includes(userData.role)) {
          throw new Error(`Invalid role "${userData.role}". Must be one of: ${validRoles.join(', ')}`);
        }

        // Check if user already exists in auth
        const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingAuthUser = existingAuthUsers.users.find(u => u.email === email);

        let userId: string;

        if (existingAuthUser) {
          console.log(`User ${email} already exists in auth, using existing ID: ${existingAuthUser.id}`);
          userId = existingAuthUser.id;
        } else {
          // Create new auth user - this will trigger the database trigger to create profile
          console.log(`Creating new auth user for: ${email}`);
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            email_confirm: true,
            user_metadata: {
              name: userData.name.trim(),
              department: userData.department.trim(),
            },
          });

          if (authError) {
            console.error(`Auth creation failed for ${email}:`, authError);
            throw new Error(`Failed to create auth user: ${authError.message}`);
          }

          userId = authData.user.id;
          console.log(`Auth user created successfully for ${email}, ID: ${userId}`);
        }

        // Wait a moment for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Now UPDATE the user profile (don't INSERT - the trigger already created it)
        const profileData = {
          name: userData.name.trim(),
          department: userData.department.trim(),
          role: userData.role.trim(),
          expertise: userData.expertise || [],
          avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400',
          status: 'available',
          rating: 0,
          completed_helps: 0,
        };

        console.log(`Updating profile for ${email} with data:`, profileData);

        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update(profileData)
          .eq('id', userId);

        if (updateError) {
          console.error(`Profile update failed for ${email}:`, updateError);
          throw new Error(`Failed to update profile: ${updateError.message}`);
        }

        console.log(`Successfully imported user: ${email}`);
        results.successful++;
      } catch (error: any) {
        console.error(`Error importing user ${userData.email}:`, error.message);
        results.failed++;
        results.errors.push(`${userData.email || 'Unknown'}: ${error.message}`);
      }
    }

    console.log('Import process completed. Final results:', results);

    return new Response(
      JSON.stringify(results),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Import function error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        successful: 0,
        failed: 0,
        errors: [error.message],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
