// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
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
  Crown,
  Zap,
  // REMOVED: Target - not used
  MessageSquareText
} from 'lucide-react';
import ConnectionModal from '../components/ConnectionModal';
import { useAuth } from '../hooks/useAuth';
import { mockUsers } from '../data/mockData';
import { UserProfile } from '../types/db';
import { dbHelpers } from '../lib/supabase';

// Helper function to format display name (first name, capitalized)
const formatDisplayName = (fullName: string | undefined | null): string => {
  if (!fullName) return 'User';
  const firstName = fullName.split(' ')[0];
  if (!firstName) return 'User';
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
};


export default function Dashboard() {
  const { user: authUser } = useAuth();
  const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);
  
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);

  const [activeRequestsCount, setActiveRequestsCount] = useState(0);
  const [connectionsLiveCount, setConnectionsLiveCount] = useState(0);
  const [completedHelpsThisWeekCount, setCompletedHelpsThisWeekCount] = useState(0);
  const [newRequestsYesterdayCount, setNewRequestsYesterdayCount] = useState(0);
  const [newConnectionsThisWeekCount, setNewConnectionsThisWeekCount] = useState(0);
  const [expertRatingChangeThisMonth, setExpertRatingChangeThisMonth] = useState(0);

  const [userBadges, setUserBadges] = useState([
    { id: 'mentor', name: 'Top Mentor', icon: Crown, color: 'text-yellow-600', description: 'Completed 10+ help requests' },
    { id: 'responder', name: 'Quick Responder', icon: Zap, color: 'text-blue-600', description: 'Responded quickly to 5 requests' },
  ]);
  // REMOVED: setUserBadges is declared but never read warning

  const [loadingDashboardData, setLoadingDashboardData] = useState(true);
  const [errorDashboardData, setErrorDashboardData] = useState<string | null>(null);

  const navigate = useNavigate();

  if (!authUser) { 
    return <div className="text-center p-8 text-xl text-gray-600 dark:text-gray-400">Please log in to view the dashboard.</div>;
  }

  useEffect(() => {
    async function fetchUserProfileForDashboard() {
      if (authUser) {
        const { data, error } = await supabase.from('users').select('*').eq('id', authUser.id).single();
        if (error) {
          console.error('Error fetching user profile for dashboard:', error);
          setUserProfileData({
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email || 'Anonymous',
            role: 'user'
          });
        } else {
          setUserProfileData(data as UserProfile);
        }
      } else {
        setUserProfileData(null);
      }
    }
    fetchUserProfileForDashboard();
  }, [authUser?.id]);


  useEffect(() => {
    async function fetchDashboardCounts() {
      setLoadingDashboardData(true);
      setErrorDashboardData(null);
      
      if (!authUser?.id || !userProfileData?.id) {
        setErrorDashboardData('User profile not fully loaded or authenticated for dashboard data.');
        setLoadingDashboardData(false);
        return;
      }

      try {
        const userId = authUser.id;

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

      } catch (error: any) {
        console.error('Error fetching dashboard counts:', error.message);
        setErrorDashboardData(`Failed to load dashboard data: ${error.message}`);
      } finally {
        setLoadingDashboardData(false);
      }
    }

    if (authUser && userProfileData) { 
      fetchDashboardCounts();
    } else if (!authUser) {
      setLoadingDashboardData(false);
    }
  }, [authUser?.id, userProfileData?.id]);


  const handleStatClick = (path: string) => {
    navigate(path);
  };

  const displayUserName = userProfileData?.name ? formatDisplayName(userProfileData.name) : 'User';
  const displayCompletedHelps = userProfileData?.completed_helps ?? 0;
  const displayRating = userProfileData?.rating ?? 0;


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
      value: displayCompletedHelps.toString(),
      icon: CheckCircle,
      color: 'bg-emerald-500',
      change: `+${completedHelpsThisWeekCount} this week`,
      path: '/history'
    },
    {
      label: 'Expert Rating',
      value: displayRating.toFixed(1),
      icon: Award,
      color: 'bg-orange-500',
      change: `${expertRatingChangeThisMonth >= 0 ? '+' : ''}${expertRatingChangeThisMonth.toFixed(1)} this month`,
      path: '/experts'
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

  const handleConnect = (expert: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedExpert(expert);
    setShowConnectionModal(true);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div>
        <h2 className="text-2xl font-bold mb-2 dark:text-gray-100">
          Welcome back, {displayUserName}!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Here's what's happening with your expert connections today.
        </p>
      </div>

      {loadingDashboardData && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading dashboard data...</div>
      )}
      {errorDashboardData && (
        <div className="text-center py-4 text-red-600 dark:text-red-400">{errorDashboardData}</div>
      )}

      {!loadingDashboardData && !errorDashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.slice(0, 2).map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700"
                onClick={() => handleStatClick(stat.path)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4 dark:text-gray-400">{stat.change}</p>
              </div>
            );
          })}

          {/* Expert Badges Card */}
          <div
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700"
            onClick={() => navigate('/achievements')}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Badges Earned</p>
              <Award className="h-6 w-6 text-orange-500" />
            </div>
            {userBadges.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-2">
                {userBadges.slice(0, 3).map((badge) => {
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
              <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">No badges yet!</p>
            )}
            <p className="text-xs text-blue-600 mt-4 hover:underline dark:text-blue-400">View all achievements</p>
          </div>

          {stats.slice(3, 4).map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700"
                onClick={() => handleStatClick(stat.path)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4 dark:text-gray-400">{stat.change}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Rest of your dashboard content (Recent Activity, Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center dark:text-gray-100">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </h3>
            <button
              className="text-blue-600 hover:text-blue-700 text-sm font-medium dark:text-blue-400"
              onClick={() => navigate('/requests')}
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer dark:hover:bg-gray-700"
                   onClick={() => activity.expert && handleQuickConnect(activity.expert)}>
                <div className={`p-2 rounded-full ${activity.type === 'completed' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                  <MessageCircle className={`h-4 w-4 ${activity.type === 'completed' ? 'text-emerald-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.action}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">with {activity.user}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                </div>
                {activity.expert && (
                  <button
                    onClick={(e) => handleConnect(activity.expert as UserProfile, e)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors dark:hover:text-blue-400"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center dark:text-gray-100">
            <TrendingUp className="h-5 w-5 mr-2" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/create')}
              className="w-full flex items-center space-x-3 p-4 text-left bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-emerald-100 transition-all dark:from-blue-900 dark:to-emerald-900 dark:border-blue-700 dark:hover:from-blue-800 dark:hover:to-emerald-800">
              <div className="bg-blue-500 p-2 rounded-lg">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Post a Help Request</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Get expert help quickly</p>
              </div>
            </button>

            <button
              className="w-full flex items-center space-x-3 p-4 text-left bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200 hover:from-emerald-100 hover:to-blue-100 transition-all dark:from-emerald-900 dark:to-blue-900 dark:border-emerald-700 dark:hover:from-emerald-800 dark:hover:to-blue-800"
              onClick={() => navigate('/experts')}
            >
              <div className="bg-emerald-500 p-2 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Browse Experts</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Find the right person to help</p>
              </div>
            </button>

            {/* Community Forum button */}
            <button
              onClick={() => navigate('/forum')}
              className="w-full flex items-center space-x-3 p-4 text-left bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-all dark:from-purple-900 dark:to-pink-900 dark:border-purple-700 dark:hover:from-purple-800 dark:hover:to-pink-800">
              <div className="bg-purple-500 p-2 rounded-lg">
                <MessageSquareText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Community Forum</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Discuss and get answers from the community</p>
              </div>
            </button>


            <button
              onClick={() => handleQuickConnect(mockUsers.find(u => u.role === 'management'))}
              className="w-full flex items-center space-x-3 p-4 text-left bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg border border-orange-200 hover:from-orange-100 hover:to-purple-100 transition-all dark:from-orange-900 dark:to-purple-900 dark:border-orange-700 dark:hover:from-orange-800 dark:hover:to-purple-800"
            >
              <div className="bg-orange-500 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">Connect with Management</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Schedule time or message directly</p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 dark:text-gray-500" />
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