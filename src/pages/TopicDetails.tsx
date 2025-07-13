// src/pages/TopicDetails.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Topic,
  Question,
  Answer,
  Vote,
  UserProfile,
  NewQuestionForm,
  AuthUserFromJoin
} from '../types/db';
import AnswerForm from '../components/AnswerForm';

// Define how many answers to show initially and how many to load with each click
const INITIAL_ANSWERS_DISPLAY_COUNT = 3;
const ANSWERS_LOAD_MORE_BATCH_SIZE = 5;

const TopicDetails = () => {
  const { id } = useParams<{ id: string }>();
  const topicId = id ? parseInt(id, 10) : null;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');

  const [newQuestion, setNewQuestion] = useState<NewQuestionForm>({ text: '', isAnonymous: false });
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const [answeringQuestionId, setAnsweringQuestionId] = useState<number | null>(null);

  const [sortBy, setSortBy] = useState<'upvotes' | 'newest'>('upvotes');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // New state to cache auth user details
  const [cachedAuthUsers, setCachedAuthUsers] = useState<Map<string, AuthUserFromJoin>>(new Map());

  // State to track current user's votes on answers
  const [userAnswerVotes, setUserAnswerVotes] = useState<Set<string>>(new Set());

  // State to manage how many answers are displayed for each question
  const [answersDisplayCount, setAnswersDisplayCount] = useState<Map<number, number>>(new Map());

  // CRITICAL CHANGE: State for sorting answers is now per-question (Map)
  const [answerSortBy, setAnswerSortBy] = useState<Map<number, 'upvotes' | 'newest'>>(new Map());


  useEffect(() => {
    if (topicId === null || isNaN(topicId)) {
      setError("Invalid topic ID.");
      setLoading(false);
      return;
    }

    const initializeData = async () => {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData, error: userError } = await supabase.from('users').select('*').eq('id', user.id).single();
        if (userError) {
          console.error('Error fetching user data during initialization:', userError);
          setCurrentUser({ id: user.id, role: 'user', name: 'Guest' });
        } else if (userData) {
          setCurrentUser(userData as UserProfile);
          setUserRole(userData.role as 'user' | 'admin');
        }

        // Ensure current user's auth details are in cache immediately
        setCachedAuthUsers(prevCache => {
          const newCache = new Map(prevCache);
          if (user.id && !newCache.has(user.id)) {
            newCache.set(user.id, {
              id: user.id,
              email: user.email || '',
              raw_user_meta_data: user.user_metadata || null
            });
          }
          return newCache;
        });

      } else {
        setCurrentUser(null);
        setUserRole('user');
      }

      await fetchTopicAndQuestions(topicId, user?.id || null, sortBy);
      setLoading(false);
    };

    initializeData();

    const refetchQuestionsForUpdate = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      await fetchTopicAndQuestions(topicId, user?.id || null, sortBy);
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

    const answersSubscription = supabase
      .channel(`public:answers:topic_id_via_questions_join_${topicId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answers',
        },
        (payload) => {
          console.log('Realtime answer change received:', payload);
          refetchQuestionsForUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(questionsSubscription);
      supabase.removeChannel(answersSubscription);
    };
  }, [topicId]);


  useEffect(() => {
    if (topicId !== null && !isNaN(topicId) && !loading) {
      fetchTopicAndQuestions(topicId, currentUser?.id, sortBy);
    }
  }, [sortBy, topicId, currentUser?.id, loading]);

  // CRITICAL CHANGE: Effect to refetch questions when ANY answerSortBy preference changes
  useEffect(() => {
    if (!loading && topicId !== null && !isNaN(topicId)) {
      // Re-run fetch if any sort preference in the map changes, or if the map reference changes
      fetchTopicAndQuestions(topicId, currentUser?.id, sortBy);
    }
  }, [answerSortBy, topicId, currentUser?.id, loading, sortBy]);


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
        if (!topic) { 
          setError(`Could not load topic: ${topicError.message}`);
          setTopic(null);
        }
        return;
      }
      setTopic(topicData as Topic);

      let query = supabase.from('questions')
        .select('*, user_profile:user_id(name), answers(*)')
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

      let userQuestionVotes: Vote[] = [];
      let userAnswerVotesData: Vote[] = [];
      
      if (currentUserId) {
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('*')
          .eq('user_id', currentUserId)
          .in('target_type', ['question', 'answer']);

        if (votesError) {
          console.error('Error fetching user votes:', votesError);
        } else {
          userQuestionVotes = votesData.filter(vote => vote.target_type === 'question') || [];
          userAnswerVotesData = votesData.filter(vote => vote.target_type === 'answer') || [];
        }
      }

      // Populate userAnswerVotes state
      const newAnswerVotesSet = new Set<string>();
      userAnswerVotesData.forEach(vote => {
          newAnswerVotesSet.add(vote.target_id.toString());
      });
      setUserAnswerVotes(newAnswerVotesSet);


      const augmentedQuestions: Question[] = (questionsData as Question[]).map(q => {
        // Get the specific answer sorting preference for this question, default to 'newest'
        const currentAnswerSortForQuestion = answerSortBy.get(q.id) || 'newest';

        const sortedAnswers = (q.answers || []).sort((a: Answer, b: Answer) => {
            // 1. Prioritize Official Answers (unchanged, still correct)
            if (a.is_official && !b.is_official) {
                return -1;
            }
            if (!a.is_official && b.is_official) {
                return 1;
            }

            // 2. Then, apply secondary sorting based on the question's specific answerSortBy
            if (currentAnswerSortForQuestion === 'upvotes') {
                return (b.upvotes || 0) - (a.upvotes || 0); // Descending upvotes
            } else { // 'newest'
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // Newest first
            }
        });

        return {
          ...q,
          is_upvoted_by_user: userQuestionVotes.some(vote => vote.target_id === q.id),
          answers: sortedAnswers
        };
      });

      // After fetching questions and answers, gather all unique answer user_ids
      const answerCreatorIds = new Set<string>();
      augmentedQuestions.forEach(q => {
        q.answers?.forEach(a => {
          if (a.user_id && !cachedAuthUsers.has(a.user_id)) {
            answerCreatorIds.add(a.user_id);
          }
        });
      });

      // Fetch details for new unique auth users (if any are not already in cache)
      if (answerCreatorIds.size > 0) {
        const { data: authUsersData, error: authUsersError } = await supabase.from('auth.users')
          .select('id, email, raw_user_meta_data')
          .in('id', Array.from(answerCreatorIds));

        if (authUsersError) {
          console.error('Error fetching auth user details for answers:', authUsersError);
        } else if (authUsersData) {
          setCachedAuthUsers(prevCache => {
            const newCache = new Map(prevCache);
            authUsersData.forEach((u: any) => {
              newCache.set(u.id, {
                id: u.id,
                email: u.email,
                raw_user_meta_data: u.raw_user_meta_data
              });
            });
            return newCache;
          });
        }
      }

      setQuestions(augmentedQuestions);

      // Initialize answersDisplayCount for all questions
      setAnswersDisplayCount(prevCounts => {
        const newCounts = new Map(prevCounts);
        augmentedQuestions.forEach(q => {
          if (!newCounts.has(q.id)) { // Only set initial count if not already managed
            newCounts.set(q.id, INITIAL_ANSWERS_DISPLAY_COUNT);
          }
        });
        return newCounts;
      });

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

  const handleUpvote = async (questionId: number, _currentUpvotes: number, hasVoted: boolean) => {
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

  const handleAnswerUpvote = async (answerId: string, currentUpvotes: number) => {
    const numericAnswerId = parseInt(answerId, 10);

    if (!currentUser?.id) {
      alert('You must be logged in to upvote an answer.');
      return;
    }

    const hasVoted = userAnswerVotes.has(answerId);

    try {
      const { data: newUpvotesCount, error } = await supabase.rpc('handle_answer_vote', {
        p_user_id: currentUser.id,
        p_answer_id: numericAnswerId
      });

      if (error) {
        console.error('Error handling answer vote:', error);
        alert('Failed to update answer vote: ' + error.message);
      } else {
        setQuestions(prevQuestions =>
          prevQuestions.map(q => ({
            ...q,
            answers: (q.answers || []).map(a =>
              a.id === answerId
                ? { ...a, upvotes: newUpvotesCount as number }
                : a
            ),
          }))
        );

        setUserAnswerVotes(prevVotes => {
          const newVotes = new Set(prevVotes);
          if (hasVoted) {
            newVotes.delete(answerId);
          } else {
            newVotes.add(answerId);
          }
          return newVotes;
        });
      }
    } catch (error: any) {
      console.error('Unexpected error during answer upvote:', error.message);
      alert('An unexpected error occurred during answer upvote.');
    }
  };

  const handleDeleteAnswer = async (answerId: string, answerUserId: string) => {
    const numericAnswerId = parseInt(answerId, 10);

    if (!currentUser?.id) {
      alert('You must be logged in to delete an answer.');
      return;
    }

    const isAuthorized = userRole === 'admin' || currentUser.id === answerUserId;

    if (!isAuthorized) {
      alert('You are not authorized to delete this answer.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this answer?')) {
      return;
    }

    try {
      const { error } = await supabase.from('answers').delete().eq('id', numericAnswerId);

      if (error) {
        console.error('Error deleting answer:', error);
        alert('Failed to delete answer: ' + error.message);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        await fetchTopicAndQuestions(topicId!, user?.id || null, sortBy);
      }
    } catch (error: any) {
      console.error('Unexpected error during answer deletion:', error.message);
      alert('An unexpected error occurred during deletion.');
    }
  };

  const handleToggleOfficial = async (answerId: string, currentOfficialStatus: boolean) => {
    const numericAnswerId = parseInt(answerId, 10);

    if (!currentUser?.id) {
      alert('You must be logged in to mark an answer as official.');
      return;
    }
    // Authorization check: Only admin or the topic creator can mark official
    const isAuthorized = userRole === 'admin' || currentUser?.id === topic?.creator_id;

    if (!isAuthorized) {
      alert('You are not authorized to mark this answer as official.');
      return;
    }

    try {
      const { error } = await supabase.from('answers')
        .update({ is_official: !currentOfficialStatus })
        .eq('id', numericAnswerId);

      if (error) {
        console.error('Error toggling official status:', error);
        alert('Failed to update official status: ' + error.message);
      } else {
        // Explicitly trigger a refetch of all questions to update the UI
        const { data: { user } } = await supabase.auth.getUser();
        await fetchTopicAndQuestions(topicId!, user?.id || null, sortBy);
      }
    } catch (error: any) {
      console.error('Unexpected error during official status toggle:', error.message);
      alert('An unexpected error occurred during status update.');
    }
  };

  const handleLoadMoreAnswers = (questionId: number) => {
    setAnswersDisplayCount(prevCounts => {
      const newCounts = new Map(prevCounts);
      const currentCount = newCounts.get(questionId) || 0;
      newCounts.set(questionId, currentCount + ANSWERS_LOAD_MORE_BATCH_SIZE);
      return newCounts;
    });
  };

  const canCurrentUserAnswer = (): boolean => {
    return userRole === 'admin' || currentUser?.id === topic?.creator_id;
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
    <div className="p-6 max-w-4xl mx-auto bg-gray-100 min-h-screen shadow-lg rounded-lg relative dark:bg-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 text-center">{topic.title}</h1>
      <p className="text-gray-700 dark:text-gray-300 text-lg text-center mb-6">{topic.description}</p>

      {topic.is_event && (
        <div className="bg-blue-100 text-blue-800 p-4 rounded-md mb-6 text-center text-sm dark:bg-blue-900 dark:text-blue-200">
          This is an Event.
          {topic.start_time && topic.end_time && (
            <span>
              {' '}Live from {new Date(topic.start_time).toLocaleString()} to {new Date(topic.end_time).toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* Q&A Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b pb-3 border-gray-200 dark:border-gray-700">Live Q&A</h2>

        {/* Sorting Controls */}
        <div className="flex justify-end mb-4 gap-2">
          <button
            onClick={() => setSortBy('upvotes')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              sortBy === 'upvotes' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Top Questions
          </button>
          <button
            onClick={() => setSortBy('newest')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              sortBy === 'newest' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Newest Questions
          </button>
        </div>


        {/* Question Submission Form - conditionally rendered */}
        {showQuestionForm && (
          <div className="mb-8 p-6 bg-gray-50 rounded-xl shadow-inner border border-gray-200 animate-fade-in dark:bg-gray-700 dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Ask a Question</h3>
            <textarea
              value={newQuestion.text}
              onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
              placeholder="Type your question here..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md mb-3 focus:ring-blue-500 focus:border-blue-500 resize-y bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
            ></textarea>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={newQuestion.isAnonymous}
                onChange={(e) => setNewQuestion({ ...newQuestion, isAnonymous: e.target.checked })}
                id="anonymous-checkbox"
                className="mr-2 h-4 w-4 text-blue-600 rounded dark:bg-gray-500 dark:border-gray-400"
              />
              <label htmlFor="anonymous-checkbox" className="text-gray-700 dark:text-gray-300">Post Anonymously</label>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowQuestionForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out active:scale-95 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handlePostQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800"
                disabled={!currentUser || !newQuestion.text.trim()}
              >
                Post Question
              </button>
            </div>
          </div>
        )}

        {/* Questions List Container */}
        <AnimatePresence initial={false}>
          {isLoadingQuestions ? (
            // Show loader when sorting
            <motion.div
              key="sorting-loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center py-4 text-gray-500 dark:text-gray-400"
            >
              Sorting questions...
            </motion.div>
          ) : questions.length === 0 ? (
            // Show "No questions" message when no questions and not loading
            <motion.p
              key="no-questions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center text-gray-600 text-lg p-4 bg-white rounded-lg shadow-md dark:bg-gray-700 dark:text-gray-300"
            >
              No questions yet. Be the first to ask!
            </motion.p>
          ) : (
            // Display questions list when not loading and questions exist
            <motion.ul layout className="space-y-4">
              {questions.map((question) => {
                const currentAnswersDisplayed = answersDisplayCount.get(question.id) || INITIAL_ANSWERS_DISPLAY_COUNT;
                const displayedAnswers = question.answers ? question.answers.slice(0, currentAnswersDisplayed) : [];
                const hasMoreAnswers = question.answers ? question.answers.length > displayedAnswers.length : false;

                return (
                  <motion.li
                    key={question.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <p className="text-gray-800 text-base mb-2 dark:text-gray-100">{question.content}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-bold text-blue-600 text-sm dark:text-blue-400">
                        Upvotes: {question.upvotes}
                      </span>
                      <span className="text-xs text-gray-600 group relative dark:text-gray-300">
                        Posted by{' '}
                        {question.is_anonymous ? (
                          <span className="font-semibold italic text-gray-800 dark:text-gray-200">Anonymous</span>
                        ) : (
                          <span className="font-semibold text-blue-700 dark:text-blue-300">{question.user_profile?.name || 'Unknown User'}</span>
                        )}
                        <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          on {new Date(question.created_at).toLocaleString()}
                        </span>
                      </span>
                    </div>
                    <div className="mt-4 border-t pt-4 flex items-center border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => handleUpvote(question.id, question.upvotes, question.is_upvoted_by_user || false)}
                        className={`px-3 py-1 rounded-md text-sm mr-2 transition-colors duration-200 ${
                          question.is_upvoted_by_user ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200'
                        }`}
                        disabled={!currentUser?.id}
                      >
                        👍 Upvote
                      </button>
                      {/* --- Answer Button (Visible to Admin/Topic Creator) --- */}
                      {canCurrentUserAnswer() && (
                          <button
                            onClick={() => setAnsweringQuestionId(question.id === answeringQuestionId ? null : question.id)}
                            className="bg-green-200 hover:bg-green-300 text-green-800 px-3 py-1 rounded-md text-sm ml-2 dark:bg-green-700 dark:hover:bg-green-600 dark:text-green-100"
                            disabled={!currentUser?.id}
                          >
                            Answer
                          </button>
                      )}
                    </div>
                    {/* --- Answer Form Integration --- */}
                    <AnimatePresence>
                      {answeringQuestionId === question.id && currentUser?.id && canCurrentUserAnswer() && (
                        <AnswerForm
                          questionId={question.id}
                          onAnswerSubmitted={() => {
                            setAnsweringQuestionId(null);
                            fetchTopicAndQuestions(topicId!, currentUser.id, sortBy);
                          }}
                          onCancel={() => setAnsweringQuestionId(null)}
                        />
                      )}
                    </AnimatePresence>
                    {/* --- END Answer Form Integration --- */}

                    {/* Display Answers */}
                    {displayedAnswers.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-600">
                        <h4 className="text-xs font-semibold text-gray-600 mb-2 dark:text-gray-300">Answers ({displayedAnswers.length}{hasMoreAnswers ? ` of ${question.answers?.length}` : ''})</h4>
                        {/* NEW: Per-Question Answer Sorting Controls */}
                        <div className="flex justify-end mb-4 gap-2">
                          <button
                            onClick={() => setAnswerSortBy(prev => { // Use a map to store sort preference per question
                              const newMap = new Map(prev);
                              newMap.set(question.id, 'upvotes');
                              return newMap;
                            })}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                              (answerSortBy.get(question.id) || 'newest') === 'upvotes' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            Top Answers
                          </button>
                          <button
                            onClick={() => setAnswerSortBy(prev => { // Use a map to store sort preference per question
                              const newMap = new Map(prev);
                              newMap.set(question.id, 'newest');
                              return newMap;
                            })}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                              (answerSortBy.get(question.id) || 'newest') === 'newest' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            Newest Answers
                          </button>
                        </div>
                        <div className="space-y-3">
                          {displayedAnswers.map((answer) => {
                            // Find the auth user details from the cached map
                            const authUserDetails = cachedAuthUsers.get(answer.user_id);
                            const answerCreatorName = authUserDetails?.raw_user_meta_data?.name || authUserDetails?.email || 'Unknown User';

                            // Check if the current user has upvoted this specific answer
                            const hasUpvotedAnswer = userAnswerVotes.has(answer.id.toString());

                            return (
                              <div key={answer.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
                                <p className="text-gray-800 text-sm mb-1 dark:text-gray-100">{answer.content}</p>
                                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                  <span className="font-bold text-gray-600 dark:text-gray-300">
                                    {answer.upvotes !== undefined ? `Upvotes: ${answer.upvotes}` : 'Upvotes: 0'}
                                  </span>
                                  <p className="text-right">
                                    Answered by{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                                      {answerCreatorName}
                                    </span>
                                    {' on '}
                                    {new Date(answer.created_at).toLocaleString()}
                                    {answer.is_official && <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium dark:bg-blue-800 dark:text-blue-100">Official</span>}
                                  </p>
                                </div>
                                <div className="mt-2 flex justify-end gap-2">
                                  {/* Upvote Button for Answers */}
                                  <button
                                    onClick={() => handleAnswerUpvote(answer.id.toString(), answer.upvotes || 0)}
                                    className={`px-3 py-1 rounded-md text-xs transition-colors duration-200 ${
                                      hasUpvotedAnswer ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200'
                                    }`}
                                    disabled={!currentUser?.id}
                                  >
                                    👍 Upvote
                                  </button>
                                  {/* Delete Button for Answers */}
                                  {(userRole === 'admin' || currentUser?.id === answer.user_id) && (
                                    <button
                                      onClick={() => handleDeleteAnswer(answer.id.toString(), answer.user_id)}
                                      className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900 transition-colors duration-200"
                                    >
                                      Delete
                                    </button>
                                  )}
                                  {/* Mark Official Button for Answers */}
                                  {(userRole === 'admin' || currentUser?.id === topic?.creator_id) && (
                                    <button
                                      onClick={() => handleToggleOfficial(answer.id.toString(), answer.is_official)}
                                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                                        answer.is_official ? 'bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-700 dark:hover:bg-orange-800' : 'bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200'
                                      }`}
                                      disabled={!currentUser?.id}
                                    >
                                      {answer.is_official ? 'Unmark Official' : 'Mark Official'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Load More Answers Button */}
                        {hasMoreAnswers && (
                          <div className="text-center mt-4">
                            <button
                              onClick={() => handleLoadMoreAnswers(question.id)}
                              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
                            >
                              Load More Answers ({question.answers!.length - displayedAnswers.length} remaining)
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      {/* Floating Ask a Question Button */}
      {!showQuestionForm && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowQuestionForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-600"
          >
            + Ask a Question
          </button>
        </div>
      )}
    </div>
  );
};

export default TopicDetails;