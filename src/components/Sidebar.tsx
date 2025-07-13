// src/components/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
// Import icons from lucide-react (assuming these are installed)
import { Award, Calendar, CheckCircle, Clock, Crown, ExternalLink, MessageCircle, MessageSquareText, Target, TrendingUp, Users, Zap } from 'lucide-react'; // Ensure all icons are imported

// Define props interface for Sidebar
interface SidebarProps {
  isOpen: boolean; // Controls whether sidebar is visible (for mobile/responsive)
  onClose: () => void; // Function to close the sidebar
}

// CRITICAL FIX: Ensure Sidebar component accepts and destructures props
const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useAuth(); // Get user info to conditionally show Admin Panel

  // Consolidated navItems for cleaner structure
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Clock }, // Using Clock for Dashboard for example
    { name: 'Xchange', path: '/forum', icon: MessageSquareText }, // Using MessageSquareText for Xchange
    { name: 'Settings', path: '/settings', icon: Target }, // Using Target for Settings
    { name: 'Profile', path: '/profile', icon: Users }, // Using Users for Profile
  ];

  return (
    // Conditional styling for mobile responsiveness
    // CRITICAL FIX: Adjusted classes for responsive sidebar behavior and dark mode
    <div className={`bg-gray-800 dark:bg-gray-900 text-white dark:text-gray-100 w-64 min-h-screen p-5 flex flex-col shadow-xl 
                   transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                   lg:translate-x-0 transition-transform duration-200 ease-in-out
                   fixed lg:static inset-y-0 left-0 z-40`}>
      {/* PeerIQ Logo/App Name */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-blue-400 mt-2">PeerIQ</h1>
      </div>

      <nav className="flex-1">
        <ul className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon; // Get the Lucide icon component
            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-lg text-lg font-medium transition-colors duration-200 ${
                      isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } dark:hover:bg-gray-700 dark:hover:text-gray-100`
                  }
                  onClick={onClose} // Close sidebar on navigation click (useful for mobile)
                >
                  <Icon className="h-6 w-6 mr-3" /> {/* Render the Lucide icon */}
                  {item.name}
                </NavLink>
              </li>
            );
          })}

          {/* Admin Panel Link (conditionally rendered for admins) */}
          {user?.role === 'admin' && (
            <li>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg text-lg font-medium transition-colors duration-200 mt-6 ${
                    isActive ? 'bg-red-600 text-white shadow-md' : 'text-red-300 hover:bg-gray-700 hover:text-white'
                  } dark:hover:bg-gray-700 dark:hover:text-gray-100`
                }
                onClick={onClose} // Close sidebar on navigation click
              >
                <Crown className="h-6 w-6 mr-3" /> {/* Using Crown for admin icon */}
                Admin Panel
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;