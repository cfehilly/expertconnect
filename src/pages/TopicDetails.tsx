import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Topic,
  Question,
  Vote,
  UserProfile,
  NewQuestionForm
} from '../types/db';

const TopicDetails = () => {
  const { id } = useParams<{ id: string }>();
  const topicId = id ? parseInt(id, 10) : null;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true); // Initial full page load state
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');

  const [newQuestion, setNewQuestion] = useState<NewQuestionForm>({ text: '', isAnonymous: false });
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const [sortBy, setSortBy] = useState<'upvotes' | 'newest'>('upvotes');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  useEffect(() => {
    if (topicId === null || isNaN(topicId)) {
      setError("Invalid topic ID.");
      setLoading(false);
      return;
    }

    const initializeData = async () => {
      setLoading(true); // Set full page loading ONCE
      setError(null);
      await fetchUserInfo();
      await fetchTopicAndQuestions(topicId, currentUser?.id, sortBy);
      setLoading(false); // Set full page loading OFF after initial load
    };

    initializeData();

    const refetchQuestionsForUpdate = () => {
      fetchTopicAndQuestions(topicId, currentUser?.id, sortBy);
    };

    const questionsSubscription = supabase
      .channel(`public:questions:topic_id=eq.${topicId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions',
          filter: `topic_id=eq.${topicId}`
        },
        (payload) => {
          console.log('Realtime question change received:', payload);
          refetchQuestionsForUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(questionsSubscription);
    };
  }, [topicId, currentUser?.id]);

  useEffect(() => {
    if (!loading && topicId !== null && !isNaN(topicId)) {
      fetchTopicAndQuestions(topicId, currentUser?.id, sortBy);
    }
  }, [sortBy, topicId, currentUser?.id, loading]);

  const fetchUserInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData, error } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (error) {
        console.error('Error fetching user data:', error);
        setCurrentUser({ id: user.id, role: 'user' } as UserProfile);
      } else if (userData) {
        setCurrentUser(userData as UserProfile);
        setUserRole(userData.role as 'user' | 'admin');
      }
    } else {
      setCurrentUser(null);
      setUserRole('user');
    }
  };

  const fetchTopicAndQuestions = async (id: number, currentUserId: string | undefined | null, currentSortBy: 'upvotes' | 'newest') => {
    setIsLoadingQuestions(true);
    try {
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select('*')
        .eq('id', id)
        .single();

      if (topicError) {
        console.error('Error fetching topic:', topicError);
        setError(`Could not load topic: ${topicError.message}`);
        setTopic(null);
        return;
      }
      setTopic(topicData as Topic);

      let query = supabase.from('questions')
        .select('*, user_profile:user_id(name)')
        .eq('topic_id', id);

      if (currentSortBy === 'upvotes') {
        query = query.order('upvotes', { ascending: false }).order('created_at', { ascending: false });
      } else if (currentSortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      }

      const { data: questionsData, error: questionsError } = await query;

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        setError((prev) => prev ? prev + `\nError fetching questions: ${questionsError.message}` : `Error fetching questions: ${questionsError.message}`);
        setQuestions([]);
        return;
      }

      let userVotes: Vote[] = [];
      if (currentUserId) {
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('*')
          .eq('user_id', currentUserId)
          .eq('target_type', 'question')
          .in('target_id', questionsData.map(q => q.id as number));

        if (votesError) {
          console.error('Error fetching user votes:', votesError);
        } else {
          userVotes = votesData || [];
        }
      }

      const augmentedQuestions: Question[] = (questionsData as Question[]).map(q => ({
        ...q,
        is_upvoted_by_user: userVotes.some(vote => vote.target_id === q.id)
      }));

      setQuestions(augmentedQuestions);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handlePostQuestion = async () => {
    if (!currentUser) {
      alert('You must be logged in to post a question.');
      return;
    }
    if (!newQuestion.text.trim()) {
      alert('Question text cannot be empty.');
      return;
    }
    if (topicId === null || isNaN(topicId)) {
      alert('Cannot post question to an invalid topic.');
      return;
    }

    const { error } = await supabase.from('questions').insert({
      topic_id: topicId,
      content: newQuestion.text,
      user_id: newQuestion.isAnonymous ? null : currentUser.id,
      is_anonymous: newQuestion.isAnonymous,
      upvotes: 0,
    });

    if (error) {
      console.error('Error posting question:', error);
      alert('Failed to post question: ' + error.message);
    } else {
      setNewQuestion({ text: '', isAnonymous: false });
      setShowQuestionForm(false);
    }
  };

  const handleUpvote = async (questionId: number, hasVoted: boolean) => {
    if (!currentUser?.id) {
      alert('You must be logged in to upvote.');
      return;
    }

    try {
      const { data: newUpvotesCount, error } = await supabase.rpc('handle_question_vote', {
        p_user_id: currentUser.id,
        p_question_id: questionId
      });

      if (error) {
        console.error('Error handling vote:', error);
        alert('Failed to update vote: ' + error.message);
      } else {
        setQuestions(prevQuestions =>
          prevQuestions.map(q =>
            q.id === questionId
              ? {
                  ...q,
                  upvotes: newUpvotesCount as number,
                  is_upvoted_by_user: !hasVoted
                }
              : q
          )
        );
      }
    } catch (error: any) {
      console.error('Unexpected error during upvote:', error.message);
      alert('An unexpected error occurred during upvote.');
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-xl text-gray-600">Loading topic details and Q&A...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600 text-lg">Error: {error}</div>;
  }

  if (!topic) {
    return <div className="text-center p-8 text-gray-700 text-lg">Topic not found.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-100 min-h-screen shadow-lg rounded-lg">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4 text-center">{topic.title}</h1>
      <p className="text-gray-700 text-lg text-center mb-6">{topic.description}</p>

      {topic.is_event && (
        <div className="bg-blue-100 text-blue-800 p-4 rounded-md mb-6 text-center text-sm">
          This is an Event.
          {topic.start_time && topic.end_time && (
            <span>
              {' '}Live from {new Date(topic.start_time).toLocaleString()} to {new Date(topic.end_time).toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* Q&A Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Live Q&A</h2>

        {/* Sorting Controls */}
        <div className="flex justify-end mb-4 gap-2">
          <button
            onClick={() => setSortBy('upvotes')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              sortBy === 'upvotes' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Top Questions
          </button>
          <button
            onClick={() => setSortBy('newest')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              sortBy === 'newest' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Newest Questions
          </button>
        </div>

        {/* Ask a Question Button - conditionally visible */}
        {!showQuestionForm && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowQuestionForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              + Ask a Question
            </button>
          </div>
        )}

        {/* Question Submission Form - conditionally rendered */}
        {showQuestionForm && (
          <div className="mb-8 p-6 bg-gray-50 rounded-xl shadow-inner border border-gray-200 animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Ask a Question</h3>
            <textarea
              value={newQuestion.text}
              onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
              placeholder="Type your question here..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md mb-3 focus:ring-blue-500 focus:border-blue-500 resize-y"
            ></textarea>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={newQuestion.isAnonymous}
                onChange={(e) => setNewQuestion({ ...newQuestion, isAnonymous: e.target.checked })}
                id="anonymous-checkbox"
                className="mr-2 h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="anonymous-checkbox" className="text-gray-700">Post Anonymously</label>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowQuestionForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handlePostQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!currentUser || !newQuestion.text.trim()}
              >
                Post Question
              </button>
            </div>
          </div>
        )}

        {/* Questions List */}
        {/* Loader specific to the questions list */}
        {isLoadingQuestions && (
          <div className="text-center py-4 text-gray-500">Sorting questions...</div>
        )}

        {/* Main list container, always mounted for smooth animations */}
        <AnimatePresence initial={false}>
          {!isLoadingQuestions && questions.length === 0 ? (
            <motion.p
              key="no-questions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-600 text-lg p-4 bg-white rounded-lg shadow-md"
            >
              No questions yet. Be the first to ask!
            </motion.p>
          ) : (
            <motion.ul layout className="space-y-4">
              {questions.map((question) => (
                <motion.li
                  key={question.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-5 rounded-lg shadow-sm border border-gray-200"
                >
                  <p className="text-gray-800 text-base mb-2">{question.content}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className="font-bold text-blue-600 text-sm">
                      Upvotes: {question.upvotes}
                    </span>
                    <span className="text-xs text-gray-600 group relative">
                      Posted by{' '}
                      {question.is_anonymous ? (
                        <span className="font-semibold italic text-gray-800">Anonymous</span>
                      ) : (
                        <span className="font-semibold text-blue-700">{question.user_profile?.name || 'Unknown User'}</span>
                      )}
                      <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        on {new Date(question.created_at).toLocaleString()}
                      </span>
                    </span>
                  </div>
                  <div className="mt-4 border-t pt-4 flex items-center">
                    <button
                      onClick={() => handleUpvote(question.id, question.is_upvoted_by_user || false)}
                      className={`px-3 py-1 rounded-md text-sm mr-2 transition-colors duration-200 ${
                        question.is_upvoted_by_user ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                      disabled={!currentUser?.id}
                    >
                      👍 Upvote
                    </button>
                    {(userRole === 'admin' || currentUser?.id === topic.creator_id) && (
                      <button className="bg-green-200 hover:bg-green-300 text-green-800 px-3 py-1 rounded-md text-sm">
                        Answer
                      </button>
                    )}
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TopicDetails;