// src/components/Header.tsx
import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom'; // Added NavLink for consistency if needed, Link for general navigation
import { Users, Bell, Search, Menu, LogOut, User as UserIcon } from 'lucide-react'; // Import Lucide icons, renamed User to UserIcon
import { useAuth } from '../hooks/useAuth';
// Import Supabase's User type directly to ensure proper typing for 'user' from useAuth,
// as well as UserProfile from db.ts for public profile data.
import { User as SupabaseAuthUser } from '@supabase/supabase-js'; 
import { UserProfile } from '../types/db'; 
import { supabase } from '../supabaseClient'; // Import supabase client

// Helper function to format display name (first name, capitalized)
const formatDisplayName = (fullName: string | undefined | null): string => { // Added null to type
  if (!fullName) return 'User'; // Default if name is empty
  const firstName = fullName.split(' ')[0];
  if (!firstName) return 'User';
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
};

interface HeaderProps {
  onMenuClick: () => void;
  // REMOVED: currentUser: User; // No longer receiving currentUser as a prop
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth(); // Get user (Supabase Auth User) and signOut from your AuthContext
  const navigate = useNavigate();

  // State to hold the user's *public profile* data (from public.users table)
  // This is used for displaying name, avatar, role from your custom profile table
  const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);

  // States for search and notifications (from your previous Header.tsx)
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user's public profile data (e.g., name, avatar, role from public.users)
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) { // `user` here is the Supabase Auth User object from useAuth
        const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single();
        if (error) {
          console.error('Error fetching public user profile for header:', error);
          setUserProfileData(null);
        } else {
          setUserProfileData(data as UserProfile);
        }
      } else {
        setUserProfileData(null); // Clear profile if no user is logged in
      }
    };

    fetchUserProfile();
    // This useEffect will re-run when the `user` object from useAuth changes
    // (e.g., after login/logout, or metadata update from UserProfile page, as supabase-js updates user.user_metadata)
  }, [user]); // Dependency array: re-run when the authenticated 'user' object changes

  // Dummy notifications for now (from your previous Header.tsx)
  const notifications = [
    { id: 1, message: 'New help request from Sarah.', time: '5 min ago' },
    { id: 2, message: 'John Smith accepted your request.', time: '1 hour ago' },
    { id: 3, message: 'Your rating increased to 4.5!', time: 'yesterday' },
  ];

  // Function to toggle dropdown visibility (from your previous Header.tsx)
  const handleBellClick = () => {
    setShowNotificationsDropdown(prev => !prev);
  };

  // Function for individual notification click (from your previous Header.tsx)
  const handleNotificationItemClick = (notificationId: number) => {
    navigate(`/notifications/${notificationId}`);
    setShowNotificationsDropdown(false);
  };

  // Function for "View All Notifications" button click (from your previous Header.tsx)
  const handleViewAllNotificationsClick = () => {
    navigate('/notifications');
    setShowNotificationsDropdown(false);
  };

  // Effect to handle clicks outside the notification dropdown (from your previous Header.tsx)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotificationsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle global search submission (from your previous Header.tsx)
  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
    if ('key' in e && e.key !== 'Enter') {
      return;
    }
    // Prevent default form submission if it's an event from an input/button inside a form
    e.preventDefault(); 
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Determine the name to display in the profile link
  // Prioritize public.users name, then auth.user.user_metadata.name, then auth.user.email
  const displayUserName = userProfileData?.name 
                        ? formatDisplayName(userProfileData.name) 
                        : (user?.user_metadata?.name 
                           ? formatDisplayName(user.user_metadata.name) 
                           : (user?.email || 'User')); // Fallback to 'User' if no name/email


  return (
    <header className="bg-white shadow-sm border-b border-gray-200 lg:pl-64 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center"> {/* Combined outer flex div */}
        {/* Left Section: Menu Toggle (for mobile) and PeerIQ Logo/Name (for mobile) */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          {/* PeerIQ Logo/Name (only visible on small screens) */}
          <div className="flex items-center space-x-2 lg:hidden">
            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-2 rounded-lg">
              <Users className="h-6 w-6 text-white" /> {/* Assuming Users icon is for logo */}
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">PeerIQ</h1>
          </div>
        </div>

        {/* Center Section: Search Input Field */}
        <div className="flex-grow flex justify-center mx-4 md:mx-0"> {/* Center search on larger screens */}
          <div className="relative w-full max-w-md"> {/* Ensure search takes full width of its container */}
            <input
              type="text"
              placeholder="Search experts or requests..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
            />
            <button
              onClick={handleSearchSubmit}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-l-lg dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
              aria-label="Submit search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Right Section: Notification Bell and User Profile/Sign Out */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleBellClick}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Content */}
            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 dark:bg-gray-800 dark:border-gray-700">
                <div className="py-2">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="block px-4 py-2 hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-700"
                        onClick={() => handleNotificationItemClick(notification.id)}
                      >
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{notification.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No new notifications.</div>
                  )}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <button
                    className="w-full text-center py-2 text-sm text-blue-600 hover:bg-gray-50 rounded-b-lg dark:text-blue-400 dark:hover:bg-gray-700"
                    onClick={handleViewAllNotificationsClick}
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info & Link */}
          {user ? ( // Only show if user is logged in
            <div className="flex items-center space-x-2"> {/* Added space-x-2 */}
              <Link to="/profile" className="flex items-center text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium">
                <img
                  src={userProfileData?.avatar || user.user_metadata?.avatar_url || 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400'} // Use public profile avatar first, then auth metadata, then placeholder
                  alt={displayUserName} // Use the formatted display name for alt text
                  className="h-8 w-8 rounded-full object-cover mr-2"
                />
                <span className="hidden md:block">{displayUserName}</span> {/* Only show name on medium+ screens */}
              </Link>
              <button
                onClick={signOut}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:text-gray-700 dark:hover:bg-gray-100"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 dark:bg-blue-600 dark:hover:bg-blue-700">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}