import React, { useState, useEffect } from 'react'; // Added useEffect
import { 
  Star, 
  MessageCircle, 
  Clock, 
  Award,
  CheckCircle,
  AlertCircle,
  Calendar,
  MessageSquare, // MessageSquare added for potential use in Contact options
  Video, // Video added for potential use in Contact options
  Phone // Phone added for potential use in Contact options
} from 'lucide-react';

// Assuming User type is defined in '../types', keep your original import
import { User } from '../types'; 

import ConnectionModal from './ConnectionModal';

interface ExpertsListProps {
  experts: User[]; // This component receives the full list of experts
  onExpertSelect: (expert: User) => void;
}

export default function ExpertsList({ experts, onExpertSelect }: ExpertsListProps) {
  const [selectedExpert, setSelectedExpert] = useState<User | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  // --- NEW STATE FOR SEARCH AND FILTERS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [filteredExperts, setFilteredExperts] = useState<User[]>(experts); // State to hold the currently filtered list
  // --- END NEW STATE ---

  // --- NEW useEffect for Filtering Logic ---
  // This hook runs whenever 'experts', 'searchTerm', 'selectedDepartment', or 'selectedRole' changes
  useEffect(() => {
    let currentFilteredExperts = experts;

    // Apply Search Filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentFilteredExperts = currentFilteredExperts.filter(expert =>
        expert.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        expert.department.toLowerCase().includes(lowerCaseSearchTerm) ||
        expert.role.toLowerCase().includes(lowerCaseSearchTerm) ||
        (expert.expertise && expert.expertise.some(skill => skill.toLowerCase().includes(lowerCaseSearchTerm)))
      );
    }

    // Apply Department Filter
    if (selectedDepartment !== 'All Departments') {
      currentFilteredExperts = currentFilteredExperts.filter(expert =>
        expert.department === selectedDepartment
      );
    }

    // Apply Role Filter
    if (selectedRole !== 'All Roles') {
      currentFilteredExperts = currentFilteredExperts.filter(expert =>
        expert.role === selectedRole
      );
    }

    setFilteredExperts(currentFilteredExperts);
  }, [experts, searchTerm, selectedDepartment, selectedRole]); // Dependencies: re-run this effect if any of these change

  // --- END NEW useEffect ---


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
    e.stopPropagation(); // Prevents the outer div's onClick from firing
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
          {/* --- NEW SEARCH BAR --- */}
          <input
            type="text"
            placeholder="Search experts or requests..."
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
            value={searchTerm} // Controlled component: value is from state
            onChange={(e) => setSearchTerm(e.target.value)} // Update state on change
          />
          {/* --- END NEW SEARCH BAR --- */}

          {/* --- MODIFIED DEPARTMENT FILTER --- */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedDepartment} // Controlled component: value is from state
            onChange={(e) => setSelectedDepartment(e.target.value)} // Update state on change
          >
            <option value="All Departments">All Departments</option>
            <option value="Data Analytics">Data Analytics</option>
            <option value="IT Support">IT Support</option>
            <option value="Finance">Finance</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Operations">Operations</option>
          </select>
          {/* --- END MODIFIED DEPARTMENT FILTER --- */}

          {/* --- MODIFIED ROLES FILTER --- */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedRole} // Controlled component: value is from state
            onChange={(e) => setSelectedRole(e.target.value)} // Update state on change
          >
            <option value="All Roles">All Roles</option>
            <option value="employee">Employee</option> {/* Use lowercase value if your data has it */}
            <option value="expert">Expert</option>
            <option value="management">Management</option>
            <option value="admin">Admin</option> {/* Added admin role as seen in data */}
          </select>
          {/* --- END MODIFIED ROLES FILTER --- */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* --- NOW MAPPING OVER filteredExperts INSTEAD OF original experts --- */}
        {filteredExperts.map((expert) => {
          const StatusIcon = getStatusIcon(expert.status || 'offline'); // Provide a default if status can be undefined

          return (
            <div
              key={expert.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
              onClick={() => onExpertSelect(expert)}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <img
                    src={expert.avatar || 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400'} // Default avatar
                    alt={expert.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${getStatusColor(expert.status || 'offline')}`} />
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
                  <span className="text-sm font-medium text-gray-900">{expert.rating?.toFixed(1) || '0.0'}</span> {/* Ensure rating is number */}
                  <span className="text-sm text-gray-500">({expert.completedHelps || expert.completed_helps || 0} helps)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 capitalize">{expert.role}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Expertise</h4>
                <div className="flex flex-wrap gap-1">
                  {expert.expertise && expert.expertise.slice(0, 3).map((skill, index) => ( // Ensure expertise is defined
                    <span
                      key={index}
                      className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {expert.expertise && expert.expertise.length > 3 && ( // Ensure expertise is defined
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