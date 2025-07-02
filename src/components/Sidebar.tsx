import React from 'react'; // Added back for general React component usage if not explicitly using hooks/JSX transform
import { Link, useLocation } from 'react-router-dom';
import { Users, Bell, Search, Menu, LogOut, Home, HelpCircle, MessageCircle, Plus, Clock, Award, Settings, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth'; // Assuming useAuth is used elsewhere in Sidebar logic not shown

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth(); // Assuming useAuth is needed to conditionally show Admin link

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['employee', 'admin'] },
    { name: 'Help Requests', href: '/requests', icon: HelpCircle, roles: ['employee', 'admin'] },
    { name: 'Find Experts', href: '/experts', icon: Search, roles: ['employee', 'admin'] }, // Changed icon from Users to Search
    { name: 'My Connections', href: '/connections', icon: MessageCircle, roles: ['employee', 'admin'] },
    { name: 'New Request', href: '/create', icon: Plus, roles: ['employee', 'admin'] },
    { name: 'History', href: '/history', icon: Clock, roles: ['employee', 'admin'] },
    { name: 'Achievements', href: '/achievements', icon: Award, roles: ['employee', 'admin'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['employee', 'admin'] },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-2 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            {/* UPDATED COMPANY NAME HERE */}
            <h1 className="text-xl font-bold text-gray-900">peer iq</h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="h-5 w-5" /> {/* Using Menu icon for close, or you can use X if preferred */}
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  onClick={onClose} // Close sidebar on navigation click
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                    ${location.pathname === item.href
                      ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          {user?.role === 'admin' && ( // Conditionally render Admin Panel link for admin users
            <div className="mt-8 pt-4 border-t border-gray-200">
              <Link
                to="/admin/dashboard"
                onClick={onClose}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                  ${location.pathname.startsWith('/admin')
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                    : 'text-red-600 hover:bg-red-50'
                  }
                `}
              >
                <Shield className="h-5 w-5" />
                <span className="font-medium">Admin Panel</span>
              </Link>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}