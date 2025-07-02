import { useState, useEffect } from 'react';
// Forced change: 20250702161000 // Unique identifier to force bundle refresh.
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  MessageCircle,
  Award,
  Calendar,
  Activity,
  ExternalLink,
  Crown, // New icon for badges (example)
  Zap, // New icon for badges (example)
  Target // New icon for badges (example)
} from 'lucide-react'; // Import new icons as needed
import ConnectionModal from '../components/ConnectionModal';
import { useAuth } from '../hooks/useAuth';
import { mockUsers } from '../data/mockData';
import { User } from '../types';
import { supabase, dbHelpers } from '../lib/supabase';

export default function Dashboard() {
  const { user: currentUser } = useAuth();
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);

  const [activeRequestsCount, setActiveRequestsCount] = useState(0);
  const [connectionsLiveCount, setConnectionsLiveCount] = useState(0);
  const [completedHelpsThisWeekCount, setCompletedHelpsThisWeekCount] = useState(0);
  const [newRequestsYesterdayCount, setNewRequestsYesterdayCount] = useState(0);
  const [newConnectionsThisWeekCount, setNewConnectionsThisWeekCount] = useState(0);
  const [expertRatingChangeThisMonth, setExpertRatingChangeThisMonth] = useState(0);

  // NEW STATE for placeholder badges
  const [userBadges, setUserBadges] = useState([
    { id: 'mentor', name: 'Top Mentor', icon: Crown, color: 'text-yellow-600', description: 'Completed 10+ help requests' },
    { id: 'responder', name: 'Quick Responder', icon: Zap, color: 'text-blue-600', description: 'Responded quickly to 5 requests' },
    // You'd fetch real badges from the database later
  ]);

  const [loadingDashboardData, setLoadingDashboardData] = useState(true);
  const [errorDashboardData, setErrorDashboardData] = useState<string | null>(null);

  const navigate = useNavigate();

  if (!currentUser) return null;

  const safeCompletedHelps = currentUser.completedHelps || currentUser.completed_helps || 0;
  const safeRating = currentUser.rating || 0; // Still exists in user object but won't be displayed as score
  const safeName = currentUser.name || 'User';

  useEffect(() => {
    async function fetchDashboardData() {
      setLoadingDashboardData(true);
      setErrorDashboardData(null);
      if (!currentUser?.id) {
        setErrorDashboardData('User not authenticated.');
        setLoadingDashboardData(false);
        return;
      }

      try {
        const userId = currentUser.id;

        const fetchedRequestsCount = await dbHelpers.getActiveRequestsCount(userId);
        setActiveRequestsCount(fetchedRequestsCount);

        const fetchedConnectionsCount = await dbHelpers.getConnectionsCount(userId);
        setConnectionsLiveCount(fetchedConnectionsCount);

        const fetchedCompletedHelpsThisWeek = await dbHelpers.getCompletedHelpsCountThisWeek(userId);
        setCompletedHelpsThisWeekCount(fetchedCompletedHelpsThisWeek);

        const fetchedNewRequestsYesterday = await dbHelpers.getNewRequestsCountYesterday(userId);
        setNewRequestsYesterdayCount(fetchedNewRequestsYesterday);

        const fetchedNewConnectionsThisWeek = await dbHelpers.getNewConnectionsCountThisWeek(userId);
        setNewConnectionsThisWeekCount(fetchedNewConnectionsThisWeek);

        const fetchedExpertRatingChange = await dbHelpers.getExpertRatingChangeThisMonth(userId);
        setExpertRatingChangeThisMonth(fetchedExpertRatingChange);

        // TODO: In a real app, you would also fetch the user's earned badges from the database here.
        // For example: const fetchedBadges = await dbHelpers.getUserBadges(userId);
        // setUserBadges(fetchedBadges);

      } catch (error: any) {
        console.error('Error fetching dashboard data:', error.message);
        setErrorDashboardData(`Failed to load dashboard data: ${error.message}`);
      } finally {
        setLoadingDashboardData(false);
      }
    }

    fetchDashboardData();
  }, [currentUser?.id]);


  const handleStatClick = (path: string) => {
    navigate(path);
  };

  // Re-define stats to handle the new Expert Rating card layout
  const stats = [
    {
      label: 'Active Requests',
      value: loadingDashboardData ? '...' : activeRequestsCount.toString(),
      icon: Clock,
      color: 'bg-blue-500',
      change: `${newRequestsYesterdayCount > 0 ? '+' : ''}${newRequestsYesterdayCount} from yesterday`,
      path: '/requests'
    },
    {
      label: 'Completed Helps',
      value: safeCompletedHelps.toString(),
      icon: CheckCircle,
      color: 'bg-emerald-500',
      change: `+${completedHelpsThisWeekCount} this week`,
      path: '/history'
    },
    // The Expert Rating card will be replaced with the Badges section below the grid.
    // We will keep a placeholder in 'stats' to ensure the grid structure remains,
    // but its content will be empty or a dummy.
    // For now, it will use the old icon, but the main content will be replaced outside the map.
    {
        label: 'Expert Rating', // This label will be visually overridden
        value: safeRating.toFixed(1), // This value will be visually overridden
        icon: Award, // This icon will be visually overridden
        color: 'bg-orange-500',
        change: '', // No simple numeric change for badges
        path: '/achievements' // Navigates to achievements page
    },
    {
      label: 'Connections',
      value: loadingDashboardData ? '...' : connectionsLiveCount.toString(),
      icon: Users,
      color: 'bg-purple-500',
      change: `${newConnectionsThisWeekCount > 0 ? '+' : ''}${newConnectionsThisWeekCount} new this week`,
      path: '/connections'
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

  const handleConnect = (expert: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedExpert(expert);
    setShowConnectionModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {safeName}!
        </h2>
        <p className="text-gray-600">
          Here's what's happening with your expert connections today.
        </p>
      </div>

      {loadingDashboardData && (
        <div className="text-center py-4 text-gray-500">Loading dashboard data...</div>
      )}
      {errorDashboardData && (
        <div className="text-center py-4 text-red-600">{errorDashboardData}</div>
      )}

      {!loadingDashboardData && !errorDashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.slice(0, 2).map((stat, index) => { // Render first two stats (Active Requests, Completed Helps)
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleStatClick(stat.path)}
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

          {/* NEW: Expert Badges Card (replaces old Expert Rating card visually) */}
          <div
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/achievements')} // Assuming you have an Achievements page
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">Badges Earned</p>
              <Award className="h-6 w-6 text-orange-500" /> {/* Central icon for Badges */}
            </div>
            {userBadges.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-2">
                {userBadges.slice(0, 3).map((badge) => { // Show max 3 badges
                  const BadgeIcon = badge.icon;
                  return (
                    <div key={badge.id} title={badge.description} className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color} bg-opacity-10`} style={{backgroundColor: `${badge.color.replace('text-', '').replace('-600', '100').replace('-500', '100')}`}}>
                      <BadgeIcon className={`h-4 w-4 ${badge.color}`} />
                      <span>{badge.name}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">No badges yet!</p>
            )}
            <p className="text-xs text-blue-600 mt-4 hover:underline">View all achievements</p>
          </div>

          {stats.slice(3, 4).map((stat, index) => { // Render last stat (Connections)
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleStatClick(stat.path)}
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
      )}

      {/* Rest of your dashboard content (Recent Activity, Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </h3>
            <button
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              onClick={() => navigate('/requests')}
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                       onClick={() => activity.expert && handleQuickConnect(activity.expert)}>
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
                    onClick={(e) => handleConnect(activity.expert as User, e)}
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
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/create')}
              className="w-full flex items-center space-x-3 p-4 text-left bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-emerald-100 transition-all">
              <div className="bg-blue-500 p-2 rounded-lg">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Post a Help Request</p>
                <p className="text-sm text-gray-600">Get expert help quickly</p>
              </div>
            </button>

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