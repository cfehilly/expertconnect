# Supabase Setup Guide for ExpertConnect

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: ExpertConnect
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

## Step 2: Configure Authentication

1. In your Supabase dashboard, go to **Authentication > Settings**
2. Configure the following settings:

### Site URL Configuration
- **Site URL**: `http://localhost:5173` (for development)
- **Redirect URLs**: Add your production domain when ready

### Email Settings
- **Enable email confirmations**: Disabled (for easier testing)
- **Enable email change confirmations**: Enabled
- **Enable secure email change**: Enabled

### Social Auth Providers

#### Google OAuth Setup
1. Go to **Authentication > Providers**
2. Enable **Google**
3. You'll need to create a Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Set authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

#### Microsoft Azure Setup
1. Enable **Azure** provider in Supabase
2. Create an Azure AD app:
   - Go to [Azure Portal](https://portal.azure.com/)
   - Navigate to "Azure Active Directory" → "App registrations"
   - Click "New registration"
   - Set redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Copy Application (client) ID and create a client secret
   - Add these to Supabase Azure provider settings

## Step 3: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Run the migration files in order:
   - `create_users_table.sql`
   - `create_help_requests_table.sql`
   - `create_connections_table.sql`
   - `create_admin_functions.sql`
   - `insert_sample_data.sql`

## Step 4: Configure Environment Variables

1. In Supabase dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL**
   - **Project API Key** (anon/public key)

3. Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 5: Set Up Row Level Security (RLS)

The migration scripts automatically set up RLS policies, but verify:

1. Go to **Database > Tables**
2. For each table (`users`, `help_requests`, `connections`, `messages`):
   - Click on the table
   - Go to "RLS" tab
   - Ensure RLS is enabled
   - Verify policies are created

## Step 6: Create Your First Admin User

1. Start your application: `npm run dev`
2. Go to the login page
3. Sign up with your email (this will be your admin account)
4. In Supabase dashboard, go to **Database > Table Editor > users**
5. Find your user record and change the `role` field to `'admin'`

## Step 7: Test the Integration

1. **Authentication**: Try logging in with email and SSO
2. **User Creation**: Verify user profiles are created automatically
3. **Admin Access**: Check that admin panel is accessible
4. **Data Operations**: Test creating help requests and user management

## Step 8: Production Configuration

When ready for production:

1. **Update Site URL**: Change to your production domain
2. **Configure Custom Domain**: Set up custom domain in Supabase
3. **Update OAuth Redirects**: Update all OAuth provider redirect URLs
4. **Environment Variables**: Update production environment with new URLs
5. **Database Backups**: Enable automatic backups
6. **Monitoring**: Set up monitoring and alerts

## Troubleshooting

### Common Issues:

1. **"Invalid login credentials"**
   - Check if email confirmation is disabled
   - Verify user exists in auth.users table

2. **"Row Level Security policy violation"**
   - Check RLS policies are correctly applied
   - Verify user has correct role in users table

3. **OAuth not working**
   - Verify redirect URLs match exactly
   - Check OAuth provider configuration
   - Ensure providers are enabled in Supabase

4. **User profile not created**
   - Check if trigger function is working
   - Verify users table has correct structure

### Useful SQL Queries:

```sql
-- Check if user profile was created
SELECT * FROM users WHERE email = 'your-email@example.com';

-- Make user an admin
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- View authentication users
SELECT * FROM auth.users;
```

## Security Best Practices

1. **Never expose service role key** in frontend code
2. **Use environment variables** for all sensitive data
3. **Regularly rotate** API keys and OAuth secrets
4. **Monitor authentication logs** for suspicious activity
5. **Keep Supabase updated** to latest version
6. **Use HTTPS** in production
7. **Implement rate limiting** for API calls

## Support

If you encounter issues:
1. Check Supabase documentation
2. Review the logs in Supabase dashboard
3. Test with Supabase's built-in SQL editor
4. Check the browser console for errors

Your ExpertConnect platform is now ready for production use!