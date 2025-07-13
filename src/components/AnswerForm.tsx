// src/components/AnswerForm.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types/db';

interface AnswerFormProps {
  questionId: number;
  onAnswerSubmitted: () => void; // Callback to refresh answers or update UI
  onCancel: () => void; // Callback to close the form
}

const AnswerForm: React.FC<AnswerFormProps> = ({ questionId, onAnswerSubmitted, onCancel }) => {
  const [content, setContent] = useState(''); // CRITICAL FIX: Changed from answerContent to content
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      } else {
        setCurrentUserId(null);
      }
    };
    fetchUserId();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { // Use 'content' here
      setError('Answer cannot be empty.');
      return;
    }
    if (!currentUserId) {
        setError('You must be logged in to post an answer.');
        return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('answers').insert({
        question_id: questionId,
        content: content, // CRITICAL FIX: Changed from 'text' to 'content'
        user_id: currentUserId,
        is_official: true, // Assuming default official, or add a checkbox for user to select
        upvotes: 0, // NEW FIX: Initialize upvotes, as it's a column in your DB
        is_answered: false, // NEW FIX: Initialize is_answered, as it's a column in your DB
      });

      if (insertError) {
        console.error('Failed to submit answer:', insertError);
        setError('Failed to submit answer: ' + insertError.message);
      } else {
        setContent(''); // Clear the form, use 'content'
        onAnswerSubmitted(); // Notify parent component (TopicDetails) to refresh
      }
    } catch (err) {
      console.error('Unexpected error submitting answer:', err);
      setError('An unexpected error occurred while submitting your answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Post Your Answer</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-3 mb-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-y min-h-[80px]"
          placeholder="Type your answer here..."
          value={content} // Use 'content' here
          onChange={(e) => setContent(e.target.value)} // Use 'setContent' here
          rows={4}
          disabled={isSubmitting}
        ></textarea>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || !currentUserId}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AnswerForm;