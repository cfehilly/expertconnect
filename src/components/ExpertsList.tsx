import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Star,
  MessageCircle,
  Clock,
  Award,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

import { User } from '../types';

import ConnectionModal from './ConnectionModal';

interface ExpertsListProps {
  experts: User[];
  onExpertSelect: (expert: User) => void;
}

const skillMapping: { [key: string]: string[] } = {
  "pivot table": ["excel", "gsheet", "data analysis"],
  "data visualization": ["tableau", "power bi", "excel"],
  "database management": ["sql", "postgresql", "mysql"],
  "cloud infrastructure": ["aws", "azure", "google cloud"],
  "web development": ["react", "javascript", "html", "css", "nodejs", "python"],
  "mobile development": ["react native", "flutter", "swift", "kotlin"],
  "machine learning": ["python", "r", "tensorflow", "pytorch"],
  "project management": ["agile", "scrum", "jira"],
  "customer support": ["zendesk", "intercom", "crm"],
  "marketing strategy": ["seo", "sem", "content marketing"],
  // Add more mappings as needed! Ensure keys and values are lowercase.
};

export default function ExpertsList({ experts, onExpertSelect }: ExpertsListProps) {
  const [selectedExpert, setSelectedExpert] = useState<User | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [filteredExperts, setFilteredExperts] = useState<User[]>(experts);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Debounce delay: 300ms

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  useEffect(() => {
    let currentFilteredExperts = experts;

    if (debouncedSearchTerm.trim()) {
      const lowerCaseDebouncedTerm = debouncedSearchTerm.toLowerCase().trim();
      let searchKeywords = new Set<string>(); // Use a Set to avoid duplicate keywords

      // Always add the direct search term
      searchKeywords.add(lowerCaseDebouncedTerm);

      // --- MODIFIED: Fuzzy matching against skillMap keys ---
      Object.keys(skillMapping).forEach(mappedPhrase => {
        if (mappedPhrase.includes(lowerCaseDebouncedTerm) || lowerCaseDebouncedTerm.includes(mappedPhrase)) {
          skillMapping[mappedPhrase].forEach(skill => searchKeywords.add(skill));
        }
      });
      // --- END MODIFIED ---

      currentFilteredExperts = currentFilteredExperts.filter(expert => {
        const expertSkills = (expert.expertise || []).map(skill => skill.toLowerCase());
        const expertName = expert.name.toLowerCase();
        const expertDepartment = expert.department.toLowerCase();
        const expertRole = expert.role.toLowerCase();

        // Check if any of the collected searchKeywords match expert data
        return Array.from(searchKeywords).some(keyword =>
          expertName.includes(keyword) ||
          expertDepartment.includes(keyword) ||
          expertRole.includes(keyword) ||
          expertSkills.some(skill => skill.includes(keyword))
        );
      });
    }

    if (selectedDepartment !== 'All Departments') {
      currentFilteredExperts = currentFilteredExperts.filter(expert =>
        expert.department === selectedDepartment
      );
    }

    if (selectedRole !== 'All Roles') {
      currentFilteredExperts = currentFilteredExperts.filter(expert =>
        expert.role === selectedRole
      );
    }

    setFilteredExperts(currentFilteredExperts);
  }, [experts, debouncedSearchTerm, selectedDepartment, selectedRole]);


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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Find Experts</h2>
          <p className="text-gray-600 mt-1">Connect with experts and management across the organization</p>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search experts or requests..."
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 md:flex-none md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 md:flex-none md:w-40"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="All Departments">All Departments</option>
            <option value="Data Analytics">Data Analytics</option>
            <option value="IT Support">IT Support</option>
            <option value="Finance">Finance</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Operations">Operations</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 md:flex-none md:w-36"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="All Roles">All Roles</option>
            <option value="employee">Employee</option>
            <option value="expert">Expert</option>
            <option value="management">Management</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredExperts.map((expert) => {
          const StatusIcon = getStatusIcon(expert.status || 'offline');

          return (
            <div
              key={expert.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
              onClick={() => onExpertSelect(expert)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start">
                  <div className="relative flex-shrink-0 mr-3">
                    <img
                      src={expert.avatar || 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={expert.name}
                      className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${getStatusColor(expert.status || 'offline')}`} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-semibold text-gray-900 truncate">{expert.name}</h3>
                    <p className="text-xs text-gray-600 truncate">{expert.department}</p>
                    <div className="flex items-center space-x-1 mt-1 text-xs">
                      <StatusIcon className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-xs text-gray-500 capitalize">{expert.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 text-right mt-1">
                  <div className="flex items-center justify-end space-x-1 mb-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900">{expert.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs text-gray-500">({expert.completedHelps || expert.completed_helps || 0} helps)</span>
                  </div>
                  <div className="flex items-center justify-end space-x-1">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 capitalize">{expert.role}</span>
                  </div>
                </div>
              </div>

              <div className="mb-3 border-t pt-3">
                <h4 className="text-sm font-medium text-gray-900 mb-1 text-left">Expertise</h4>
                <div className="flex flex-wrap justify-left gap-1">
                  {expert.expertise && expert.expertise.slice(0, 2).map((skill, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {expert.expertise && expert.expertise.length > 2 && (
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      +{expert.expertise.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => handleConnect(expert, e)}
                className={`w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
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