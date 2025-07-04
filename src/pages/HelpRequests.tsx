import { useState, useEffect } from 'react';
import { dbHelpers } from '../lib/supabase';
import { Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Import useAuth to get current user info

// Define an interface for a Help Request, matching your Supabase table
interface HelpRequest {
  id: string;
  title: string;
  description: string;
  // Updated status types to match your database constraint
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  created_at: string;
  requester_id: string;
  expert_id: string | null;
  requester: { id: string; name: string; avatar?: string; department?: string; };
  expert?: { id: string; name: string; avatar?: string; department?: string; } | null;
}

export default function HelpRequests() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);
  const { user: currentUser } = useAuth(); // Get current authenticated user

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedRequests = await dbHelpers.getHelpRequests();
      setRequests(fetchedRequests as HelpRequest[]);
    } catch (err: any) {
      console.error('Error fetching help requests:', err);
      setError(`Failed to load requests: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleMarkAsComplete = async (requestId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents navigating to detail page when clicking the button
    setUpdatingRequestId(requestId);
    try {
      await dbHelpers.updateRequestStatus(requestId, 'completed');
      await fetchRequests(); // Re-fetch all requests to update the list and dashboard counts
    } catch (err: any) {
      console.error(`Error marking request ${requestId} as complete:`, err);
      alert(`Failed to mark request as complete: ${err.message}`);
    } finally {
      setUpdatingRequestId(null);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading help requests...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Help Requests</h1>
      
      {requests.length === 0 && (
        <div className="text-center py-8 text-gray-500">No help requests found.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((request) => (
          // Wrapped the entire card in a Link component
          <Link key={request.id} to={`/requests/${request.id}`} className="block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{request.title}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                  ${request.status === 'open' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : // New: in-progress style
                    request.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                    request.status === 'cancelled' ? 'bg-red-100 text-red-800' : // New: cancelled style
                    'bg-gray-100 text-gray-800'}`}
                >
                  {request.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">{request.description}</p>
              <div className="text-xs text-gray-500">
                Requested by: {request.requester?.name || 'Unknown'} ({request.requester?.department || 'N/A'})
                <br />
                {request.expert ? `Expert: ${request.expert.name}` : 'No expert assigned yet'}
                <br />
                {new Date(request.created_at).toLocaleDateString()}
              </div>
              
              {/* Mark as Complete Button */}
              {currentUser && currentUser.id === request.requester_id && // Only show if current user is the requester
               request.status !== 'completed' && request.status !== 'cancelled' && ( // Using 'cancelled' here
                <button
                  onClick={(e) => handleMarkAsComplete(request.id, e)} // Pass event to stop propagation
                  disabled={updatingRequestId === request.id}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingRequestId === request.id ? 'Completing...' : 'Mark as Complete'}
                </button>
              )}
              {request.status === 'completed' && (
                  <div className="flex items-center text-emerald-600 font-medium text-sm mt-4">
                      <CheckCircle className="h-4 w-4 mr-2" /> Completed
                  </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}