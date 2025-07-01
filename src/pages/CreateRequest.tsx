import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateRequestComponent from '../components/CreateRequest';
import { dbHelpers, hasValidConfig } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function CreateRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreateRequest = async (requestData: any) => {
    if (!user) {
      setError('You must be logged in to create a request');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // If Supabase is not configured, simulate success
      if (!hasValidConfig) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success message and redirect
        alert('Help request created successfully! (Demo mode - request not actually saved)');
        navigate('/requests');
        return;
      }

      const newRequest = {
        title: requestData.title,
        description: requestData.description,
        category: requestData.category,
        priority: requestData.priority,
        requester_id: user.id,
        tags: requestData.tags,
        estimated_time: requestData.estimatedTime || null
      };

      await dbHelpers.createHelpRequest(newRequest);
      
      // Show success message and redirect
      alert('Help request created successfully!');
      navigate('/requests');
    } catch (err: any) {
      console.error('Error creating help request:', err);
      setError(err.message || 'Failed to create help request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
      {error && (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">Error: {error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      
      <CreateRequestComponent onSubmit={handleCreateRequest} />
      
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <span>Creating request...</span>
          </div>
        </div>
      )}
    </div>
  );
}