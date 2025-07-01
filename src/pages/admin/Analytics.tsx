import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Clock,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30d');

  const departmentData = [
    { name: 'Data Analytics', requests: 145, completed: 132, experts: 8 },
    { name: 'IT Support', requests: 98, completed: 89, experts: 12 },
    { name: 'Finance', requests: 76, completed: 71, experts: 6 },
    { name: 'Operations', requests: 65, completed: 58, experts: 5 },
    { name: 'HR', requests: 54, completed: 49, experts: 4 },
    { name: 'Marketing', requests: 43, completed: 38, experts: 3 }
  ];

  const responseTimeData = [
    { hour: '9 AM', avgTime: 15, requests: 12 },
    { hour: '10 AM', avgTime: 12, requests: 18 },
    { hour: '11 AM', avgTime: 8, requests: 25 },
    { hour: '12 PM', avgTime: 18, requests: 15 },
    { hour: '1 PM', avgTime: 22, requests: 8 },
    { hour: '2 PM', avgTime: 14, requests: 20 },
    { hour: '3 PM', avgTime: 10, requests: 28 },
    { hour: '4 PM', avgTime: 16, requests: 22 },
    { hour: '5 PM', avgTime: 25, requests: 10 }
  ];

  const expertiseDistribution = [
    { name: 'Excel/Spreadsheets', value: 35, color: '#3B82F6' },
    { name: 'IT Support', value: 25, color: '#10B981' },
    { name: 'Career Development', value: 20, color: '#F59E0B' },
    { name: 'Process Help', value: 12, color: '#EF4444' },
    { name: 'Other', value: 8, color: '#8B5CF6' }
  ];

  const satisfactionTrend = [
    { month: 'Jan', satisfaction: 4.2, responses: 156 },
    { month: 'Feb', satisfaction: 4.4, responses: 189 },
    { month: 'Mar', satisfaction: 4.3, responses: 203 },
    { month: 'Apr', satisfaction: 4.6, responses: 234 },
    { month: 'May', satisfaction: 4.7, responses: 267 },
    { month: 'Jun', satisfaction: 4.8, responses: 298 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
          <p className="text-gray-600">Detailed insights into platform performance and usage</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">14.2m</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-emerald-600 mt-4">↓ 12% faster than last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">94.2%</p>
            </div>
            <div className="bg-emerald-500 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-emerald-600 mt-4">↑ 3.2% improvement</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">User Satisfaction</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">4.8/5</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-emerald-600 mt-4">↑ 0.3 points higher</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Experts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">47</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-emerald-600 mt-4">↑ 8 new this month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Department Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="#3B82F6" name="Requests" />
              <Bar dataKey="completed" fill="#10B981" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Response Time by Hour */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Response Time by Hour</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="avgTime" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Avg Time (min)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expertise Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Request Categories</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expertiseDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expertiseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Satisfaction Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">User Satisfaction Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={satisfactionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[3.5, 5]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="satisfaction" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                name="Satisfaction Rating"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Department Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Total Requests</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Completed</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Success Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Active Experts</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {departmentData.map((dept, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{dept.name}</td>
                  <td className="py-3 px-4 text-gray-600">{dept.requests}</td>
                  <td className="py-3 px-4 text-gray-600">{dept.completed}</td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-600 font-medium">
                      {((dept.completed / dept.requests) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{dept.experts}</td>
                  <td className="py-3 px-4 text-gray-600">{Math.floor(Math.random() * 20) + 10}m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}