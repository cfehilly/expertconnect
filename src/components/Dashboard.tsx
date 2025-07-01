import React, { useState } from 'react';

import { 
  Clock, 
  CheckCircle, 
  Users, 
  TrendingUp,
  MessageCircle,
  Award,
  Calendar,
  Activity,
  ExternalLink
} from 'lucide-react';

import ConnectionModal from './ConnectionModal';
import { useAuth } from '../hooks/useAuth';
import { mockUsers } from '../data/mockData';

// --- NEW IMPORT FOR NAVIGATION ---
// Make sure you have react-router-dom installed in your project: npm install react-router-dom
import { useNavigate } from 'react-router-dom';
// --- END NEW IMPORT ---

// --- User Type Definition (Ensures TypeScript understands the User structure) ---
// If 'User' is already imported from '../types', you can remove this interface block.
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
  expertise?: string[];
  status?: string;
  rating?: number;
  completedHelps?: number;
  completed_helps?: number; // Added for robustness, as your code uses both
}
// --- END User Type Definition ---


export default function Dashboard() {
  const { user: currentUser } = useAuth();
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);

  // --- NEW NAVIGATION HOOK - Place this near the top of your component function, before 'if (!currentUser) return null;' ---
  const navigate = useNavigate();
  // --- END NEW NAVIGATION HOOK ---

  if (!currentUser) return null;

  // Safely access user properties with fallbacks (your code already does this)
  const safeCompletedHelps = currentUser.completedHelps || currentUser.completed_helps || 0;
  const safeRating = currentUser.rating || 0;
  const safeName = currentUser.name || 'User';

  // --- NEW FUNCTION TO HANDLE NAVIGATION FOR STAT CARDS ---
  const handleStatClick = (path: string) => {
    navigate(path);
  };
  // --- END NEW FUNCTION ---

  const stats = [
    {
      label: 'Active Requests',
      value: '3',
      icon: Clock,
      color: 'bg-blue-500',
      change: '+2 from yesterday',
      path: '/requests' // <--- Added navigation path for the card
    },
    {
      label: 'Completed Helps',
      value: safeCompletedHelps.toString(),
      icon: CheckCircle,
      color: 'bg-emerald-500',
      change: '+5 this week',
      path: '/history' // <--- Added navigation path (assuming this leads to completed help history)
    },
    {
      label: 'Expert Rating',
      value: safeRating.toFixed(1),
      icon: Award,
      color: 'bg-orange-500',
      change: '+0.2 this month',
      path: '/experts' // <--- Added navigation path (assuming this leads to experts list for rating context)
    },
    {
      label: 'Connections',
      value: '12',
      icon: Users,
      color: 'bg-purple-500',
      change: '+3 new this week',
      path: '/connections' // <--- Added navigation path
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Helped with Excel formula',
      user: 'John Smith',
      time: '2 hours ago',
      type: 'completed',
      expert: mockUsers.find(u => u.name === 'Sarah Chen')
    },
    {
      id: 2,
      action: 'New connection request',
      user: 'Amanda Wilson',
      time: '4 hours ago',
      type: 'new',
      expert: mockUsers.find(u => u.name === 'David Park')
    },
    {
      id: 3,
      action: 'Career discussion completed',
      user: 'Michael Rodriguez',
      time: '1 day ago',
      type: 'completed',
      expert: mockUsers.find(u => u.name === 'Michael Rodriguez')
    }
  ];

  const handleQuickConnect = (expert: any) => {
    if (expert) {
      setSelectedExpert(expert);
      setShowConnectionModal(true);
    }
  };

  // This function is for the button within each recent activity item that already works.
  // It's here for clarity but wasn't part of the direct problem areas.
  const handleConnect = (expert: User, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents the outer div's onClick from firing
    setSelectedExpert(expert);
    setShowConnectionModal(true);
  };


  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {currentUser.name || 'User'}!
        </h2>
        <p className="text-gray-600">
          Here's what's happening with your expert connections today.
        </p>
      </div>

      {/* --- MODIFIED: Stats Grid - Now Clickable --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" // Added cursor-pointer for visual feedback
              onClick={() => handleStatClick(stat.path)} // ADDED onClick HANDLER
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">{stat.change}</p>
            </div>
          );
        })}
      </div>
      {/* --- END MODIFIED: Stats Grid --- */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </h3>
            {/* --- MODIFIED: 'VIEW ALL' BUTTON FIX --- */}
            <button 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              onClick={() => navigate('/requests')} // ADDED onClick HANDLER (assuming this goes to your requests list page)
            >
              View All
            </button>
            {/* --- END MODIFIED: 'VIEW ALL' BUTTON FIX --- */}
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" // Added cursor-pointer
                   onClick={() => handleQuickConnect(activity.expert)}>
                <div className={`p-2 rounded-full ${activity.type === 'completed' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                  <MessageCircle className={`h-4 w-4 ${activity.type === 'completed' ? 'text-emerald-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">with {activity.user}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
                {activity.expert && (
                  <button
                    onClick={(e) => handleConnect(activity.expert, e)} // This button already had onClick
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Quick connect"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            {/* Post a Help Request Button (already had some functionality, no change needed) */}
            <button className="w-full flex items-center space-x-3 p-4 text-left bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-emerald-100 transition-all">
              <div className="bg-blue-500 p-2 rounded-lg">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Post a Help Request</p>
                <p className="text-sm text-gray-600">Get expert help quickly</p>
              </div>
            </button>

            {/* Browse Experts Button (already fixed in previous round) */}
            <button
              className="w-full flex items-center space-x-3 p-4 text-left bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200 hover:from-emerald-100 hover:to-blue-100 transition-all"
              onClick={() => navigate('/experts')}
            >
              <div className="bg-emerald-500 p-2 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Browse Experts</p>
                <p className="text-sm text-gray-600">Find the right person to help</p>
              </div>
            </button>

            {/* Connect with Management Button (already had onClick) */}
            <button
              onClick={() => handleQuickConnect(mockUsers.find(u => u.role === 'management'))}
              className="w-full flex items-center space-x-3 p-4 text-left bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg border border-orange-200 hover:from-orange-100 hover:to-purple-100 transition-all"
            >
              <div className="bg-orange-500 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Connect with Management</p>
                <p className="text-sm text-gray-600">Schedule time or message directly</p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {showConnectionModal && selectedExpert && (
        <ConnectionModal
          expert={selectedExpert}
          onClose={() => {
            setShowConnectionModal(false);
            setSelectedExpert(null);
          }}
        />
      )}
    </div>
  );
}