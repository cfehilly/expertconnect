// src/pages/Forum.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Topic, NewTopicForm } from '../types/db'; // Removed UserProfile as it's not used here

// Assuming XchangeLogo is an actual component you use, otherwise remove this import
// import XchangeLogo from '../components/XchangeLogo';

const Forum = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState<NewTopicForm>({ title: '', description: '', is_event: false, start_time: null, end_time: null });
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);

  // Keeping currentUserId if you need just the ID for conditional rendering (e.g., login status)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching topics:', error);
        setError(error.message);
      } else {
        setTopics(data as Topic[]);
      }
      setLoading(false);
    };

    const fetchSessionAndUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
        // If you need the full UserProfile in Forum.tsx, you would fetch it here:
        // const { data: userData, error: userError } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        // if (userData) {
        //   setCurrentUser(userData as UserProfile); // Ensure 'name' is present in userData
        // }
      } else {
        setCurrentUserId(null);
      }
    };

    fetchTopics();
    fetchSessionAndUser();

    // Set up a subscription for real-time updates on topics
    const topicSubscription = supabase
      .channel('public:topics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'topics' }, payload => {
        console.log('Realtime topic change received:', payload);
        fetchTopics(); // Re-fetch all topics on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(topicSubscription);
    };
  }, []);

  const handleCreateTopic = async () => {
    if (!currentUserId) {
      alert('You must be logged in to create a topic.');
      return;
    }
    if (!newTopic.title.trim() || !newTopic.description.trim()) {
      alert('Title and description cannot be empty.');
      return;
    }

    // Renamed 'data' to '_data' to suppress unused variable warning
    const { data: _data, error } = await supabase.from('topics').insert({
      title: newTopic.title,
      description: newTopic.description,
      creator_id: currentUserId,
      pinned: false, // Default value
      is_event: newTopic.is_event,
      start_time: newTopic.is_event ? newTopic.start_time : null,
      end_time: newTopic.is_event ? newTopic.end_time : null,
    }).select(); // Use .select() to return the inserted data

    if (error) {
      console.error('Error creating topic:', error);
      alert('Failed to create topic: ' + error.message);
    } else {
      setNewTopic({ title: '', description: '', is_event: false, start_time: null, end_time: null });
      setShowNewTopicForm(false);
      // Topics will be re-fetched by the subscription.
      // If you want to optimistically update immediately, uncomment the line below:
      // setTopics(prev => [_data[0] as Topic, ...prev]);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading topics...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-100 min-h-screen shadow-lg rounded-lg dark:bg-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 text-center">Forum Topics</h1>

      {/* Conditional "Create New Topic" button */}
      {currentUserId && !showNewTopicForm && (
        <div className="text-center mb-8">
          <button
            onClick={() => setShowNewTopicForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-700 dark:hover:bg-green-800 dark:focus:ring-green-600"
          >
            + Create New Topic
          </button>
        </div>
      )}

      {/* New Topic Form */}
      {showNewTopicForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl shadow-inner border border-gray-200 animate-fade-in dark:bg-gray-700 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Create New Topic</h3>
          <input
            type="text"
            value={newTopic.title}
            onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
            placeholder="Topic Title"
            className="w-full p-3 border border-gray-300 rounded-md mb-3 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
          />
          <textarea
            value={newTopic.description}
            onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
            placeholder="Topic Description"
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-md mb-3 focus:ring-blue-500 focus:border-blue-500 resize-y bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
          ></textarea>
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              checked={newTopic.is_event}
              onChange={(e) => setNewTopic({ ...newTopic, is_event: e.target.checked })}
              id="is-event-checkbox"
              className="mr-2 h-4 w-4 text-blue-600 rounded dark:bg-gray-500 dark:border-gray-400"
            />
            <label htmlFor="is-event-checkbox" className="text-gray-700 dark:text-gray-300">Is this an Event?</label>
          </div>
          {newTopic.is_event && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <input
                type="datetime-local"
                value={newTopic.start_time || ''} // Handle null
                onChange={(e) => setNewTopic({ ...newTopic, start_time: e.target.value })}
                className="p-3 border border-gray-300 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
              />
              <input
                type="datetime-local"
                value={newTopic.end_time || ''} // Handle null
                onChange={(e) => setNewTopic({ ...newTopic, end_time: e.target.value })}
                className="p-3 border border-gray-300 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
              />
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowNewTopicForm(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out active:scale-95 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTopic}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800"
              disabled={!currentUserId || !newTopic.title.trim() || !newTopic.description.trim()}
            >
              Create Topic
            </button>
          </div>
        </div>
      )}

      {/* Topics List */}
      <div className="space-y-4">
        {topics.length === 0 ? (
          <p className="text-center text-gray-600 text-lg p-4 bg-white rounded-lg shadow-md dark:bg-gray-700 dark:text-gray-300">
            No topics yet. Be the first to create one!
          </p>
        ) : (
          topics.map((topic) => (
            <div key={topic.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              {/* Corrected Link path */}
              <Link to={`/forum/topic/${topic.id}`} className="block">
                <h2 className="text-xl font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-2">{topic.title}</h2>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{topic.description}</p>
              </Link>
              {topic.is_event && (
                <div className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full inline-block mb-2 dark:bg-blue-900 dark:text-blue-200">
                  Event
                  {topic.start_time && topic.end_time && (
                    <span>
                      {' '}Live: {new Date(topic.start_time).toLocaleDateString()} - {new Date(topic.end_time).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Created on {new Date(topic.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Forum;