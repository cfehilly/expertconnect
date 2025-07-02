import { useState, useRef, useEffect } from 'react'; // Removed React from direct import
// Forced change: 20250702100800 // This line is for debugging / forcing a new bundle hash. Update if needed with current time.
import { Users, Bell, Search, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { User } from '../types'; // Correct import for User type
import { useNavigate } from 'react-router-dom'; // Essential for navigation

interface HeaderProps {
  currentUser: User;
  onMenuClick: () => void;
}

export default function Header({ currentUser, onMenuClick }: HeaderProps) {
  const { signOut } = useAuth();
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate(); // Initialize navigate hook

  // Ensure currentUser has default values
  const safeUser = {
    name: currentUser?.name || 'User',
    avatar: currentUser?.avatar || 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400',
    role: currentUser?.role || 'employee'
  };

  // Dummy notifications for now
  const notifications = [
    { id: 1, message: 'New help request from Sarah.', time: '5 min ago' },
    { id: 2, message: 'John Smith accepted your request.', time: '1 hour ago' },
    { id: 3, message: 'Your rating increased to 4.5!', time: 'yesterday' },
  ];

  // Function to toggle dropdown visibility
  const handleBellClick = () => {
    setShowNotificationsDropdown(prev => !prev);
    console.log('Bell clicked! Dropdown state toggled.'); // Diagnostic log
  };

  // Function for individual notification click
  const handleNotificationItemClick = (notificationId: number) => {
    console.log('Notification item clicked:', notificationId); // Diagnostic log
    navigate(`/notifications/${notificationId}`); // NOW UNCOMMENTED: Will navigate to a detail page
    setShowNotificationsDropdown(false); // Close dropdown after clicking an item
  };

  // Function for "View All Notifications" button click
  const handleViewAllNotificationsClick = () => {
    console.log('View All Notifications clicked.'); // Diagnostic log
    navigate('/notifications'); // Will navigate to the main notifications list page
    setShowNotificationsDropdown(false); // Close dropdown
  };

  // Effect to handle clicks outside the dropdown to close it
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

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 lg:pl-64">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2 lg:hidden">
              <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-2 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">peer iq</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search experts or requests..."
                className="pl-10 pr-4 py-2 w-80 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleBellClick}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
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
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="block px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleNotificationItemClick(notification.id)}
                        >
                          <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">No new notifications.</div>
                    )}
                  </div>
                  <div className="border-t border-gray-200">
                    <button
                      className="w-full text-center py-2 text-sm text-blue-600 hover:bg-gray-50 rounded-b-lg"
                      onClick={handleViewAllNotificationsClick}
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <img
                src={safeUser.avatar}
                alt={safeUser.name}
                className="h-8 w-8 rounded-full object-cover"
              />
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{safeUser.name}</p>
                <p className="text-xs text-gray-500 capitalize">{safeUser.role}</p>
              </div>
            </div>

            <button
              onClick={signOut}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}