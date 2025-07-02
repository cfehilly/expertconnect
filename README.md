# PeerIQ- Internal Peer-to-Peer Expert Connection Platform

A production-ready platform for connecting employees with internal experts and management for help, guidance, and knowledge sharing.

## 🚀 Quick Start for Development

### Option 1: Local Development (Recommended)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Then open http://localhost:5173 in your browser. Changes will be reflected immediately!

### Option 2: Deploy to See Changes
If you want to see changes on the deployed version:
1. Click the "Deploy" button in the interface
2. Wait for deployment to complete
3. Use the new URL provided

## 🔧 Development Workflow

### Making Changes
- **Local Development**: Changes appear instantly at http://localhost:5173
- **Deployed Version**: Requires clicking "Deploy" to see changes

### Database Setup
1. **Connect to Supabase**: Click "Connect to Supabase" in the top right
2. **Run Setup SQL**: Use the provided SQL in your Supabase SQL Editor
3. **Test Locally**: Use `npm run dev` to test changes immediately

## Features

### 🔐 Authentication & Security
- **Single Sign-On (SSO)** - Google and Microsoft Azure integration
- **Email/Password Authentication** - Traditional login option
- **Role-based Access Control** - Employee, Expert, Management, Admin roles
- **Secure Session Management** - JWT-based authentication

### 👥 User Management
- **CSV User Import** - Bulk import users with template
- **Role Assignment** - Flexible role management system
- **Department Organization** - Organize users by departments
- **Expert Profiles** - Showcase expertise and ratings

### 🤝 Expert Connection System
- **Help Request Creation** - Detailed request forms with categories
- **Expert Discovery** - Find experts by skills and availability
- **Multi-channel Communication** - Slack, Calendar, Video, Phone integration
- **Real-time Status** - Available, Busy, Offline indicators

### 📊 Admin Dashboard
- **User Analytics** - Comprehensive user activity insights
- **Performance Metrics** - Response times, satisfaction ratings
- **System Health Monitoring** - Real-time system status
- **Department Analytics** - Performance by department

### ⚙️ System Configuration
- **Branding Customization** - Colors, logos, custom CSS
- **Feature Toggles** - Enable/disable platform features
- **Notification Settings** - Email, Slack, push notifications
- **Security Policies** - Session timeouts, password requirements

## Development Commands

```bash
# Start development server (changes appear instantly)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linting
npm run lint
```

## Environment Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for database and authentication)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd PeerIQ
npm install
```

2. **Set up Supabase**
   - Create a new Supabase project
   - Click "Connect to Supabase" in the top right of the application
   - Follow the setup wizard to configure your database

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. **Start development server**
```bash
npm run dev
```

## Database Setup

The application will automatically create the necessary database tables when you connect to Supabase. The schema includes:

- **users** - User profiles and authentication
- **help_requests** - Help requests and their status
- **connections** - User connections and conversations
- **messages** - Chat messages between users

## User Import

### CSV Format
Import users using a CSV file with the following columns:
- `name` (required) - Full name
- `email` (required) - Email address
- `department` (required) - Department name
- `role` (required) - employee, expert, management, admin
- `expertise` (optional) - Comma-separated skills

### Example CSV
```csv
name,email,department,role,expertise
John Smith,john.smith@company.com,Marketing,employee,"Social Media, Content Creation"
Sarah Chen,sarah.chen@company.com,Data Analytics,expert,"Excel, Power BI, SQL"
Mike Johnson,mike.johnson@company.com,Operations,management,"Leadership, Process Optimization"
```

## Admin Features

### User Management
- View all users with filtering and search
- Edit user roles and permissions
- Bulk import via CSV
- Export user data

### Analytics Dashboard
- User activity metrics
- Response time analytics
- Department performance
- Satisfaction ratings
- System health monitoring

### System Settings
- **General** - Site name, registration settings
- **Notifications** - Email, Slack, frequency settings
- **Security** - Session timeouts, password policies
- **Features** - Enable/disable platform features
- **Branding** - Colors, logos, custom styling

## Integration Options

### Slack Integration
- Direct messaging through Slack
- Notification forwarding
- Status synchronization

### Calendar Integration
- Google Calendar sync
- Outlook integration
- Meeting scheduling

### Video Conferencing
- Microsoft Teams integration
- Zoom meeting links
- Direct video calls

## Deployment

### Development vs Production
- **Development**: Use `npm run dev` for instant changes at http://localhost:5173
- **Production**: Click "Deploy" button to update the live version

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
The application is optimized for Netlify deployment with:
- Automatic builds from Git
- Environment variable management
- Custom domain support
- SSL certificates

### Environment Variables for Production
```bash
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

## Troubleshooting

### Common Issues

1. **Changes not appearing on deployed version**
   - Solution: Click "Deploy" button to update the live version
   - Alternative: Use `npm run dev` for local development

2. **Database connection issues**
   - Check Supabase credentials in .env file
   - Verify database setup is complete
   - Use the diagnostic tools in the app

3. **Authentication not working**
   - Verify Supabase project configuration
   - Check OAuth provider settings
   - Ensure redirect URLs are correct

## Security Considerations

- All authentication handled by Supabase
- Row Level Security (RLS) enabled on all tables
- API keys secured through environment variables
- HTTPS enforced in production
- Session management with automatic timeouts

## Support & Customization

The platform is designed to be highly customizable:
- **Theming** - Custom colors and branding
- **Features** - Modular feature toggles
- **Integrations** - Extensible integration system
- **Workflows** - Configurable approval processes

## License

This project is proprietary software designed for internal enterprise use.