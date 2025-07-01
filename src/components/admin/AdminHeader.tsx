import React from 'react';
import { Shield, Bell, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../types';

interface AdminHeaderProps {
  currentUser: User;
  onMenuClick: () => void;
}

export default function AdminHeader({ currentUser, onMenuClick }: AdminHeaderProps) {
  const { signOut } = useAuth();

  // Ensure currentUser has default values
  const safeUser = {
    name: currentUser?.name || 'Admin',
    avatar: currentUser?.avatar || 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400'
  };

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
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-600" />
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                2
              </span>
            </button>

            <div className="flex items-center space-x-3">
              <img
                src={safeUser.avatar}
                alt={safeUser.name}
                className="h-8 w-8 rounded-full object-cover"
              />
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{safeUser.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
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