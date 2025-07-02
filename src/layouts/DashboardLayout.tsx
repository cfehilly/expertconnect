import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';

export default function DashboardLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentUser={user}
        // The 'onNotificationClick' prop has been removed here.
        // It is no longer needed because the Header component now manages the notification dropdown state internally.
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 min-h-screen lg:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
}