import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  MessageSquare, 
  Video, 
  Phone,
  Clock,
  ExternalLink,
  Send,
  Star,
  Award
} from 'lucide-react';
import { User } from '../types';

interface ConnectionModalProps {
  expert: User;
  onClose: () => void;
}

export default function ConnectionModal({ expert, onClose }: ConnectionModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const connectionOptions = [
    {
      id: 'slack',
      title: 'Message on Slack',
      description: 'Send a direct message instantly',
      icon: MessageSquare,
      color: 'bg-purple-500',
      action: 'Message Now'
    },
    {
      id: 'calendar',
      title: 'Schedule Meeting',
      description: 'Sync with their calendar to book time',
      icon: Calendar,
      color: 'bg-blue-500',
      action: 'Open Calendar'
    },
    {
      id: 'video',
      title: 'Start Video Call',
      description: 'Begin an immediate video session',
      icon: Video,
      color: 'bg-emerald-500',
      action: 'Start Call'
    },
    {
      id: 'phone',
      title: 'Phone Call',
      description: 'Call their direct line',
      icon: Phone,
      color: 'bg-orange-500',
      action: 'Call Now'
    }
  ];

  const handleConnect = async () => {
    if (!selectedOption) return;
    
    setIsConnecting(true);
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    switch (selectedOption) {
      case 'slack':
        // In a real app, this would integrate with Slack API
        window.open(`https://slack.com/app_redirect?channel=${expert.email.split('@')[0]}`, '_blank');
        break;
      case 'calendar':
        // In a real app, this would integrate with calendar APIs (Google Calendar, Outlook, etc.)
        const calendarUrl = `https://calendar.google.com/calendar/u/0/r/week?cid=${expert.email}`;
        window.open(calendarUrl, '_blank');
        break;
      case 'video':
        // In a real app, this would start a video call (Teams, Zoom, etc.)
        window.open(`https://teams.microsoft.com/l/chat/0/0?users=${expert.email}`, '_blank');
        break;
      case 'phone':
        // In a real app, this would initiate a phone call
        alert(`Calling ${expert.name}... (This would integrate with your phone system)`);
        break;
    }
    
    setIsConnecting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={expert.avatar}
                alt={expert.name}
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{expert.name}</h2>
                <p className="text-gray-600">{expert.department}</p>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900">{expert.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 capitalize">{expert.role}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Expertise Areas</h3>
            <div className="flex flex-wrap gap-2">
              {expert.expertise.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How would you like to connect?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectionOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedOption === option.id;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`${option.color} p-2 rounded-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{option.title}</h4>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      {isSelected && (
                        <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="h-2 w-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Optional Message
            </label>
            <textarea
              id="message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Let them know what you need help with..."
            />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConnect}
              disabled={!selectedOption || isConnecting}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
                selectedOption && !isConnecting
                  ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white hover:from-blue-600 hover:to-emerald-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  <span>
                    {selectedOption 
                      ? connectionOptions.find(opt => opt.id === selectedOption)?.action 
                      : 'Select Option'
                    }
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}