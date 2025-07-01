import React, { useState } from 'react';
import { 
  Star, 
  MessageCircle, 
  Clock, 
  Award,
  CheckCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  Video,
  Phone
} from 'lucide-react';
import { User } from '../types';
import ConnectionModal from './ConnectionModal';

interface ExpertsListProps {
  experts: User[];
  onExpertSelect: (expert: User) => void;
}

export default function ExpertsList({ experts, onExpertSelect }: ExpertsListProps) {
  const [selectedExpert, setSelectedExpert] = useState<User | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return CheckCircle;
      case 'busy': return Clock;
      case 'offline': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const handleConnect = (expert: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedExpert(expert);
    setShowConnectionModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Find Experts</h2>
          <p className="text-gray-600 mt-1">Connect with experts and management across the organization</p>
        </div>
        <div className="flex items-center space-x-3">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All Departments</option>
            <option>Data Analytics</option>
            <option>IT Support</option>
            <option>Finance</option>
            <option>Human Resources</option>
            <option>Operations</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All Roles</option>
            <option>Expert</option>
            <option>Management</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experts.map((expert) => {
          const StatusIcon = getStatusIcon(expert.status);
          
          return (
            <div
              key={expert.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
              onClick={() => onExpertSelect(expert)}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <img
                    src={expert.avatar}
                    alt={expert.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${getStatusColor(expert.status)}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{expert.name}</h3>
                  <p className="text-sm text-gray-600">{expert.department}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <StatusIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500 capitalize">{expert.status}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center space-x-1 mb-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900">{expert.rating}</span>
                  <span className="text-sm text-gray-500">({expert.completedHelps} helps)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 capitalize">{expert.role}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Expertise</h4>
                <div className="flex flex-wrap gap-1">
                  {expert.expertise.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {expert.expertise.length > 3 && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      +{expert.expertise.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => handleConnect(expert, e)}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  expert.status === 'available'
                    ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white hover:from-blue-600 hover:to-emerald-600'
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                }`}
                disabled={expert.status !== 'available'}
              >
                <MessageCircle className="h-4 w-4" />
                <span>{expert.status === 'available' ? 'Connect' : 'Unavailable'}</span>
              </button>
            </div>
          );
        })}
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