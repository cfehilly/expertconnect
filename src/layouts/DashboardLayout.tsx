// src/layouts/DashboardLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar'; // Ensure this path is correct
import { useAuth } from '../hooks/useAuth';

export default function DashboardLayout() {
  const { user } = useAuth(); // Get user from context, if needed for layout logic
  const [sidebarOpen, setSidebarOpen] = useState(false); // State to control sidebar visibility

  // If user is not logged in, typically a ProtectedRoute higher up would handle this.
  // Returning null here would just hide the layout if not authenticated.
  if (!user) return null; 

  return (
    // Outer container for the entire dashboard layout
    // CRITICAL FIX: Applied dark mode background and text colors here for global effect
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header
        // Header no longer needs currentUser prop, it fetches its own data
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} // Pass toggle function for mobile sidebar
      />
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen} // Pass isOpen prop
          onClose={() => setSidebarOpen(false)} // Pass onClose prop
        />
        {/* Main content area */}
        {/* CRITICAL FIX: Added padding and dark mode background/text to main content area */}
        <main className="flex-1 min-h-screen lg:ml-64 p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <Outlet /> {/* Renders nested routes (e.g., Dashboard, Profile, Forum) */}
        </main>
      </div>
    </div>
  );
}