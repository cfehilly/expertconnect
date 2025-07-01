import React, { useState } from 'react';
import { 
  Clock, 
  AlertCircle, 
  User, 
  MessageCircle,
  Tag,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { HelpRequest } from '../types';
import ConnectionModal from './ConnectionModal';

interface HelpRequestsProps {
  requests: HelpRequest[];
  onRequestSelect: (request: HelpRequest) => void;
}

export default function HelpRequests({ requests, onRequestSelect }: HelpRequestsProps) {
  const [selectedRequester, setSelectedRequester] = useState<any>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRespond = (request: HelpRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRequester(request.requester);
    setShowConnectionModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Help Requests</h2>
          <p className="text-gray-600 mt-1">Browse and respond to help requests from your colleagues</p>
        </div>
        <div className="flex items-center space-x-3">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All Categories</option>
            <option>Excel</option>
            <option>Career</option>
            <option>IT Support</option>
            <option>Management</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All Priorities</option>
            <option>Urgent</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
            onClick={() => onRequestSelect(request)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                    {request.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{request.description}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{request.requester.name} • {request.requester.department}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                  {request.estimatedTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{request.estimatedTime}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <img
                  src={request.requester.avatar}
                  alt={request.requester.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {request.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
              
              <button 
                onClick={(e) => handleRespond(request, e)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:from-blue-600 hover:to-emerald-600 transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Connect & Respond</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showConnectionModal && selectedRequester && (
        <ConnectionModal
          expert={selectedRequester}
          onClose={() => {
            setShowConnectionModal(false);
            setSelectedRequester(null);
          }}
        />
      )}
    </div>
  );
}