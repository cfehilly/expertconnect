import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Adjust path if needed

interface Topic {
  id: number;
  title: string;
  description?: string;
  creator_id: string;
  pinned: boolean;
  created_at: string;
}

function Topics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const fetchTopics = async () => {
    const { data } = await supabase.from('topics').select('*').order('created_at', { ascending: false });
    setTopics(data || []);
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleCreateTopic = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('Please log in');

    const { error } = await supabase.from('topics').insert({
      title: newTitle,
      description: newDescription,
      creator_id: user.id
    });
    if (error) alert(error.message);
    else {
      setNewTitle('');
      setNewDescription('');
      fetchTopics();
    }
  };

  const handlePin = async (id: number, pinned: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: topic } = await supabase.from('topics').select('creator_id').eq('id', id).single();
    if (user?.role !== 'admin' && user?.id !== topic?.creator_id) return alert('Not authorized');

    const { error } = await supabase.from('topics').update({ pinned: !pinned }).eq('id', id);
    if (error) alert(error.message);
    else fetchTopics();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Topics</h2>
      <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Topic Title" className="border p-2 mr-2" />
      <input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Description" className="border p-2 mr-2" />
      <button onClick={handleCreateTopic} className="bg-blue-500 text-white p-2 rounded">Create Topic</button>
      <div className="mt-6">
        {topics.map(topic => (
          <div key={topic.id} className="mb-4 p-4 bg-white rounded shadow">
            <h3 className="font-bold">{topic.title} {topic.pinned ? '(Pinned)' : ''}</h3>
            <p>{topic.description || 'No description'}</p>
            <button onClick={() => handlePin(topic.id, topic.pinned)} className="text-blue-500"> {topic.pinned ? 'Unpin' : 'Pin'}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Topics;