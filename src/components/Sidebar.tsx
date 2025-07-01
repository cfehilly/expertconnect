import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  MessageCircle, 
  Users, 
  Plus, 
  Clock, 
  Award,
  Settings,
  HelpCircle,
  X,
  Shield
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'requests', label: 'Help Requests', icon: HelpCircle, path: '/requests' },
    { id: 'experts', label: 'Find Experts', icon: Users, path: '/experts' },
    { id: 'connections', label: 'My Connections', icon: MessageCircle, path: '/connections' },
    { id: 'create', label: 'New Request', icon: Plus, path: '/create' },
    { id: 'history', label: 'History', icon: Clock, path: '/history' },
    { id: 'achievements', label: 'Achievements', icon: Award, path: '/achievements' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-2 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">ExpertConnect</h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={() => onClose()}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {user?.role === 'admin' && (
            <div className="mt-8 pt-4 border-t border-gray-200">
              <Link
                to="/admin"
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 text-red-600 hover:bg-red-50"
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