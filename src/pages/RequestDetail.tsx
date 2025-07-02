import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { dbHelpers } from '../lib/supabase'; // Assuming dbHelpers is needed for fetching request
import { User } from '../types'; // Assuming User type is used

interface HelpRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  requester_id: string;
  expert_id: string | null;
  requester: { name: string; avatar?: string; department?: string; };
  expert?: { name: string; avatar?: string; department?: string; } | null;
}

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>(); // Get the request ID from the URL
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) {
        setError('Request ID is missing from URL.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Assuming you'll have a dbHelpers.getSingleHelpRequestById in supabase.ts later
        // For now, let's use the general getHelpRequests and filter
        const allRequests = await dbHelpers.getHelpRequests();
        const foundRequest = allRequests.find((req: HelpRequest) => req.id === id);

        if (foundRequest) {
          setRequest(foundRequest);
        } else {
          setError('Request not found.');
        }
      } catch (err: any) {
        console.error('Error fetching request detail:', err);
        setError(`Failed to load request: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]); // Refetch if ID changes in URL

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading request details...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  if (!request) {
    return <div className="p-6 text-center text-gray-500">Request not found.</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">Request: {request.title}</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
        <p className="text-lg text-gray-800">{request.description}</p>
        <div className="text-sm text-gray-600">
          <p>Status: <span className="font-medium capitalize">{request.status}</span></p>
          <p>Requested by: {request.requester?.name || 'Unknown'} ({request.requester?.department || 'N/A'})</p>
          <p>Expert: {request.expert?.name || 'Not yet assigned'}</p>
          <p>Created: {new Date(request.created_at).toLocaleDateString()}</p>
        </div>

        {/* Helper buttons will go here later */}
        {/* Poster "Mark as Complete" button will go here later */}
      </div>
    </div>
  );
}