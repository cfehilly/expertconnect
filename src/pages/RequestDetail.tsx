import React, { useEffect, useState } from 'react';
// Forced change: 20250702213500 // Unique identifier to force bundle refresh.
import { useParams, useNavigate } from 'react-router-dom';
import { dbHelpers } from '../lib/supabase';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';
import { User as UserIcon, Clock as ClockIcon, Calendar as CalendarIcon, Tag as TagIcon, ArrowRight, CheckCircle, Lightbulb } from 'lucide-react';

interface HelpRequest {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled'; // Corrected to match DB enum values
  created_at: string;
  requester_id: string;
  expert_id: string | null;
  requester: { id: string; name: string; avatar?: string; department?: string; };
  expert?: { id: string; name: string; avatar?: string; department?: string; } | null;
}

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false); // Used for 'Assign Myself' and 'Mark as Complete' loading

  const fetchRequest = async () => {
    if (!id) {
      setError('Request ID is missing from URL.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const allRequests = await dbHelpers.getHelpRequests(); // Fetches all requests
      const foundRequest = allRequests.find((req: HelpRequest) => req.id === id); // Filters locally
      
      if (foundRequest) {
        setRequest(foundRequest);
      } else {
        setError('Request not found or you do not have permission to view it.');
      }
    } catch (err: any) {
      console.error('Error fetching request detail:', err);
      setError(`Failed to load request: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  // Determine if the "Assign Myself" button should be shown
  const showAssignButton =
    currentUser && // 1. User is logged in
    currentUser.id !== request?.requester_id && // 2. Current user is NOT the requester
    !request?.expert_id && // 3. No expert is currently assigned (expert_id is null)
    (request?.status === 'open'); // 4. Request is in 'open' status (as per DB constraint for assignment)

  // Handle Assign Myself button click
  const handleAssignMyself = async () => {
    if (!currentUser || !currentUser.id || !request?.id) {
      alert('You must be logged in to assign yourself to a request.');
      return;
    }
    setAssigning(true);
    try {
      await dbHelpers.assignExpertToRequest(request.id, currentUser.id);
      alert('Successfully assigned yourself to this request! Status updated to "in-progress".');
      await fetchRequest(); // Re-fetch the request to update its status and expert info
    } catch (err: any) {
      console.error('Error assigning expert:', err);
      if (err.message.includes('Request already assigned or not in "open" status.')) {
        alert(err.message);
      } else {
        alert(`Failed to assign: ${err.message}`);
      }
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading request details...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  if (!request) {
    return <div className="p-6 text-center text-gray-500">Request not found.</div>;
  }

  const isRequester = currentUser?.id === request.requester_id;
  const isAssignedExpert = currentUser?.id && request.expert_id === currentUser.id;

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{request.title}</h1>
            <span className={`px-4 py-1 rounded-full text-sm font-semibold capitalize
              ${request.status === 'open' ? 'bg-blue-100 text-blue-800' :
                request.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : // Styled 'in-progress'
                request.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                request.status === 'cancelled' ? 'bg-red-100 text-red-800' : // Styled 'cancelled'
                'bg-gray-100 text-gray-800'}`}
            >
              {request.status}
            </span>
          </div>
          <p className="text-base text-gray-700 leading-relaxed">{request.description}</p>
        </div>

        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Request Details</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-center"><UserIcon className="h-4 w-4 mr-2 text-gray-500" />
              Requested by: <span className="font-medium ml-1">{request.requester?.name || 'Unknown'} ({request.requester?.department || 'N/A'})</span>
            </p>
            <p className="flex items-center"><Lightbulb className="h-4 w-4 mr-2 text-gray-500" />
              Expert: <span className="font-medium ml-1">{request.expert?.name || 'Not yet assigned'}</span>
            </p>
            <p className="flex items-center"><ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
              Created: <span className="font-medium ml-1">{new Date(request.created_at).toLocaleDateString()}</span>
            </p>
            {request.status === 'completed' && request.expert && (
                 <p className="flex items-center text-emerald-600"><CheckCircle className="h-4 w-4 mr-2" />
                    Completed by: <span className="font-medium ml-1">{request.expert.name}</span>
                 </p>
            )}
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Actions</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Conditional "Assign Myself" button for Helpers */}
            {showAssignButton && (
              <button
                onClick={handleAssignMyself}
                disabled={assigning}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigning ? 'Assigning...' : 'Assign Myself'}
              </button>
            )}

            {/* Poster "Mark as Complete" button */}
            {/* This button would only be visible to the requester (isRequester)
                and if the status is 'in-progress' AND expert_id is not null */}
            {isRequester && request.expert_id && request.status === 'in-progress' && ( // Condition for poster to mark complete
                <button
                    onClick={async () => { // Make onClick async
                        setAssigning(true); // Reusing 'assigning' state for any action button loading
                        try {
                            await dbHelpers.updateRequestStatus(request.id, 'completed'); // Update status to 'completed'
                            alert('Request marked as complete!');
                            await fetchRequest(); // Re-fetch to update UI
                        } catch (err: any) {
                            console.error('Error marking request as complete:', err);
                            alert(`Failed to mark as complete: ${err.message}`);
                        } finally {
                            setAssigning(false);
                        }
                    }}
                    disabled={assigning} // Use 'assigning' for loading state
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {assigning ? 'Completing...' : 'Mark as Complete'}
                </button>
            )}

            {/* Helper "Send Reminder" button (future implementation) */}
            {/* This button would only be visible to the assigned expert (isAssignedExpert)
                if the status is 'in-progress' */}
            {isAssignedExpert && request.status === 'in-progress' && (
                <button
                    onClick={() => alert('Send Reminder functionality coming soon!')}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Send Reminder
                </button>
            )}

            {/* Back to requests button */}
            <button
              onClick={() => navigate('/requests')}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Back to Requests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}