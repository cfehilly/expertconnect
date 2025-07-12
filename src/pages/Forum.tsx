import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Topic, UserProfile, NewTopicForm } from '../types/db';
// The logo import line is still removed as we are setting that aside for now.

const Forum = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState<NewTopicForm>({ title: '', description: '', isEvent: false, startTime: '', endTime: '' });
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchUserInfo();
    fetchTopics();

    const topicSubscription = supabase
      .channel('public:topics')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'topics' },
        (payload) => {
          console.log('Realtime topic change received:', payload);
          if (payload.eventType === 'INSERT') {
            setTopics((prev) => [...prev, payload.new as Topic].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
          } else if (payload.eventType === 'UPDATE') {
            setTopics((prev) =>
              prev.map((t) => (t.id === (payload.old as Topic).id ? (payload.new as Topic) : t))
            );
          } else if (payload.eventType === 'DELETE') {
            setTopics((prev) => prev.filter((t) => t.id !== (payload.old as Topic).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(topicSubscription);
    };
  }, []);

  const fetchUserInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      const { data: userData, error } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (error) {
        console.error('Error fetching user data:', error);
        setCurrentUser({ id: user.id, role: 'user' });
      } else if (userData) {
        setCurrentUser(userData as UserProfile);
        setUserRole(userData.role as 'user' | 'admin');
      }
    } else {
      setCurrentUserId(null);
      setCurrentUser(null);
      setUserRole('user');
    }
  };

  const fetchTopics = async () => {
    const { data, error } = await supabase.from('topics').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching topics:', error);
      setLoading(false);
    } else {
      setTopics((data as Topic[]) || []);
      setLoading(false);
    }
  };

  const createTopic = async () => {
    if (!currentUserId) {
      alert('You must be logged in to create a topic.');
      return;
    }
    if (newTopic.isEvent && userRole !== 'admin') {
      alert('Only admins can create events.');
      return;
    }
    if (!newTopic.title.trim()) {
        alert('Topic title cannot be empty.');
        return;
    }

    const topicData: Omit<Topic, 'id' | 'created_at'> = {
      title: newTopic.title,
      description: newTopic.description,
      creator_id: currentUserId,
      pinned: false,
      is_event: newTopic.isEvent,
      start_time: null,
      end_time: null,
    };

    if (newTopic.isEvent) {
      if (newTopic.startTime) topicData.start_time = new Date(newTopic.startTime).toISOString();
      if (newTopic.endTime) topicData.end_time = new Date(newTopic.endTime).toISOString();
    }

    const { error } = await supabase.from('topics').insert(topicData);
    if (error) {
      console.error('Error creating topic:', error);
      alert('Failed to create topic: ' + error.message);
    } else {
      setNewTopic({ title: '', description: '', isEvent: false, startTime: '', endTime: '' });
      setShowCreateForm(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-xl text-gray-600">Loading forum content...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      {/* --- LOGO INTEGRATION (TEXT H1 REMOVED) --- */}
      <div className="flex flex-col items-center justify-center mb-8">
        {/* If you place your logo in public folder, you can use: */}
        {/* <img src="/xchange-logo.png" alt="Xchange Logo" className="h-24 w-auto mb-4 drop-shadow-md" /> */}
        {/* The h1 'Xchange' text is now removed */}
      </div>
      {/* --- END LOGO INTEGRATION --- */}

      {/* List Topics Section - main focus */}
      <h2 className="text-4xl font-extrabold text-blue-800 mb-8 text-center drop-shadow-sm">Latest Discussions</h2> {/* Enhanced heading style and color */}

      {topics.length === 0 && !loading ? (
        <p className="text-center text-gray-600 text-lg p-6 bg-white rounded-2xl shadow-md border border-gray-100">No topics yet. Be the first to create one!</p>
      ) : (
        <ul className="space-y-6">
          {topics.map((topic) => (
            <li key={topic.id} className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 border border-gray-100">
              <Link to={`/forum/topic/${topic.id}`} className="block">
                <h3 className="text-2xl font-bold text-gray-800 mb-2 hover:text-blue-700 transition-colors duration-200 leading-tight">
                  {topic.title}
                  {topic.pinned && <span className="ml-3 px-3 py-1 bg-gradient-to-r from-green-300 to-green-500 text-green-800 text-sm font-medium rounded-full drop-shadow-sm">Pinned</span>} {/* Pinned tag color updated */}
                  {topic.is_event && <span className="ml-3 px-3 py-1 bg-gradient-to-r from-purple-300 to-purple-500 text-purple-800 text-sm font-medium rounded-full drop-shadow-sm">Event</span>} {/* Event tag color updated */}
                </h3>
                <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">{topic.description}</p> {/* Text color slightly darker */}
                {topic.is_event && topic.start_time && topic.end_time && (
                  <p className="text-gray-600 text-sm mt-2 font-medium">
                    <span className="text-gray-800">Time:</span> {new Date(topic.start_time).toLocaleString()} to {new Date(topic.end_time).toLocaleString()}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-3">
                  Posted: {new Date(topic.created_at).toLocaleString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Create Topic Button - moved to the bottom after the list, with new gradient color */}
      {!showCreateForm && (
        <div className="text-center mt-12"> {/* Increased top margin for spacing */}
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold py-3.5 px-10 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-teal-300"
          >
            + Create New Topic
          </button>
        </div>
      )}

      {/* Create Form - conditionally rendered, positioned after the button */}
      {showCreateForm && (
        <div className="mt-10 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 animate-fade-in-down">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3">Create New Topic</h2>
          <input
            type="text"
            placeholder="Topic Title (required)"
            value={newTopic.title}
            onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
            className="border border-gray-300 p-3 mb-4 w-full rounded-lg focus:ring-teal-500 focus:border-teal-500 text-gray-800 placeholder-gray-400"
            aria-label="Topic Title"
            required
          />
          <textarea
            placeholder="Topic Description"
            value={newTopic.description}
            onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
            rows={5}
            className="border border-gray-300 p-3 mb-4 w-full rounded-lg resize-y focus:ring-teal-500 focus:border-teal-500 text-gray-800 placeholder-gray-400"
            aria-label="Topic Description"
          />
          <label className="flex items-center mb-5 text-gray-700 cursor-pointer text-base">
            <input
              type="checkbox"
              checked={newTopic.isEvent}
              onChange={(e) => setNewTopic({ ...newTopic, isEvent: e.target.checked })}
              className="mr-3 h-5 w-5 text-teal-600 rounded focus:ring-teal-500"
            />
            Is this an Event? (Admin Only)
          </label>

          {newTopic.isEvent && (
            <div className="flex flex-col md:flex-row gap-4 mb-5">
              <input
                type="datetime-local"
                value={newTopic.startTime}
                onChange={(e) => setNewTopic({ ...newTopic, startTime: e.target.value })}
                className="border border-gray-300 p-3 flex-1 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-gray-800"
                placeholder="Event Start Time"
                aria-label="Event Start Time"
              />
              <input
                type="datetime-local"
                value={newTopic.endTime}
                onChange={(e) => setNewTopic({ ...newTopic, endTime: e.target.value })}
                className="border border-gray-300 p-3 flex-1 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-gray-800"
                placeholder="Event End Time"
                aria-label="Event End Time"
              />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 px-6 rounded-lg transition duration-300 ease-in-out active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={createTopic}
              className="bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              disabled={!currentUserId || !newTopic.title.trim()}
            >
              Create Topic
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forum;