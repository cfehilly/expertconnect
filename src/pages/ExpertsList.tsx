import React, { useState, useEffect } from 'react';
import ExpertsListComponent from '../components/ExpertsList';
import { dbHelpers, hasValidConfig } from '../lib/supabase';
import { mockUsers } from '../data/mockData';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ExpertsList() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExperts();
  }, []);

  const loadExperts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!hasValidConfig) {
        // Use mock data for demo
        const expertsOnly = mockUsers.filter(user => 
          user.role === 'expert' || user.role === 'management'
        );
        setExperts(expertsOnly);
        setLoading(false);
        return;
      }
      
      const data = await dbHelpers.getAllUsers();
      // Filter for experts and management
      const expertsOnly = data?.filter(user => 
        user.role === 'expert' || user.role === 'management'
      ) || [];
      setExperts(expertsOnly);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading experts:', err);
      // Fallback to mock data
      const expertsOnly = mockUsers.filter(user => 
        user.role === 'expert' || user.role === 'management'
      );
      setExperts(expertsOnly);
    } finally {
      setLoading(false);
    }
  };

  const handleExpertSelect = (expert: any) => {
    console.log('Expert selected:', expert);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && experts.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Database not configured. Showing demo experts.
          </p>
          <button 
            onClick={loadExperts}
            className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Retry
          </button>
        </div>
        <div className="mt-6">
          <ExpertsListComponent 
            experts={mockUsers.filter(user => user.role === 'expert' || user.role === 'management')} 
            onExpertSelect={handleExpertSelect} 
          />
        </div>
      </div>
    );
  }

  return <ExpertsListComponent experts={experts} onExpertSelect={handleExpertSelect} />;
}