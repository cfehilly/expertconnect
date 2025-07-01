import React from 'react';
import { 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const stats = [
    {
      label: 'Total Users',
      value: '1,247',
      icon: Users,
      color: 'bg-blue-500',
      change: '+12% from last month'
    },
    {
      label: 'Active Requests',
      value: '89',
      icon: MessageCircle,
      color: 'bg-orange-500',
      change: '+5% from yesterday'
    },
    {
      label: 'Completed Helps',
      value: '2,156',
      icon: CheckCircle,
      color: 'bg-emerald-500',
      change: '+18% from last month'
    },
    {
      label: 'Response Time',
      value: '12m',
      icon: Clock,
      color: 'bg-purple-500',
      change: '-8% improvement'
    }
  ];

  const weeklyData = [
    { name: 'Mon', requests: 24, completed: 18 },
    { name: 'Tue', requests: 32, completed: 28 },
    { name: 'Wed', requests: 28, completed: 25 },
    { name: 'Thu', requests: 35, completed: 30 },
    { name: 'Fri', requests: 42, completed: 38 },
    { name: 'Sat', requests: 18, completed: 15 },
    { name: 'Sun', requests: 12, completed: 10 }
  ];

  const monthlyTrend = [
    { month: 'Jan', users: 980, requests: 1200 },
    { month: 'Feb', users: 1050, requests: 1350 },
    { month: 'Mar', users: 1120, requests: 1480 },
    { month: 'Apr', users: 1180, requests: 1620 },
    { month: 'May', users: 1247, requests: 1750 }
  ];

  const recentActivity = [
    { action: 'New user registered', user: 'John Smith', time: '2 minutes ago', type: 'user' },
    { action: 'Help request completed', user: 'Sarah Chen', time: '5 minutes ago', type: 'completed' },
    { action: 'Expert status granted', user: 'Mike Johnson', time: '12 minutes ago', type: 'expert' },
    { action: 'System backup completed', user: 'System', time: '1 hour ago', type: 'system' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600">Monitor system performance and user activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="#3B82F6" name="Requests" />
              <Bar dataKey="completed" fill="#10B981" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Growth Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Growth Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} name="Users" />
              <Line type="monotone" dataKey="requests" stroke="#10B981" strokeWidth={2} name="Requests" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`p-2 rounded-full ${
                  activity.type === 'completed' ? 'bg-emerald-100' :
                  activity.type === 'expert' ? 'bg-blue-100' :
                  activity.type === 'system' ? 'bg-purple-100' : 'bg-orange-100'
                }`}>
                  <Activity className={`h-4 w-4 ${
                    activity.type === 'completed' ? 'text-emerald-600' :
                    activity.type === 'expert' ? 'text-blue-600' :
                    activity.type === 'system' ? 'text-purple-600' : 'text-orange-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.user}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="font-medium text-emerald-900">Database</span>
              </div>
              <span className="text-emerald-600 text-sm font-medium">Healthy</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="font-medium text-emerald-900">API Services</span>
              </div>
              <span className="text-emerald-600 text-sm font-medium">Operational</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Email Service</span>
              </div>
              <span className="text-yellow-600 text-sm font-medium">Degraded</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="font-medium text-emerald-900">File Storage</span>
              </div>
              <span className="text-emerald-600 text-sm font-medium">Healthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}