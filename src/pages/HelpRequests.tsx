import React, { useState, useEffect } from 'react';
import HelpRequestsComponent from '../components/HelpRequests';
import { dbHelpers, hasValidConfig } from '../lib/supabase';
import { mockRequests } from '../data/mockData';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HelpRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!hasValidConfig) {
        // Use mock data for demo
        setRequests(mockRequests);
        setLoading(false);
        return;
      }
      
      const data = await dbHelpers.getHelpRequests();
      setRequests(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading help requests:', err);
      // Fallback to mock data on error
      setRequests(mockRequests);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSelect = (request: any) => {
    console.log('Request selected:', request);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && requests.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Database not configured. Showing demo data.
          </p>
          <button 
            onClick={loadRequests}
            className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Retry
          </button>
        </div>
        <div className="mt-6">
          <HelpRequestsComponent requests={mockRequests} onRequestSelect={handleRequestSelect} />
        </div>
      </div>
    );
  }

  return <HelpRequestsComponent requests={requests} onRequestSelect={handleRequestSelect} />;
}