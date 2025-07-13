// src/types/db.ts

// --- Core Database Interfaces ---

// Represents a user profile from the 'users' table (public.users)
// This is for your custom user profiles, not auth.users
export interface UserProfile {
  id: string; // UUID from auth.users.id
  name: string;
  role: 'user' | 'admin' | 'expert'; // Example roles, adjust as per your enum/design
  expertise?: string[]; // Array of strings, e.g., ['React', 'Supabase']
  avatar?: string; // URL to avatar image
  status?: string; // e.g., 'online', 'offline', 'away'
  department?: string;
  rating?: number; // Numeric rating
  completed_helps?: number;
  // search_vector: any; // tsvector type is not directly used in frontend interfaces
}

// Represents a topic from the 'topics' table
export interface Topic {
  id: number;
  title: string;
  description: string;
  creator_id: string; // UUID of the user who created it
  pinned: boolean;
  is_event: boolean;
  start_time?: string | null; // ISO timestamp string (timestamptz) - Now allows null
  end_time?: string | null;   // ISO timestamp string (timestamptz) - Now allows null
  created_at: string;
  // search_vector: any; // tsvector
}

// Represents a question from the 'questions' table
export interface Question {
  id: number;
  topic_id: number;
  content: string;
  user_id: string | null; // UUID of the user who posted it (null if anonymous)
  is_anonymous: boolean;
  upvotes: number;
  created_at: string; // ISO timestamp string
  is_answered?: boolean; // Optional
  is_hidden?: boolean; // Optional

  // Joined properties:
  user_profile?: UserProfile | null; // Joined public.users data for the question creator
  answers?: Answer[]; // Nested answers for this question
  is_upvoted_by_user?: boolean; // Frontend-specific flag for user's vote status
}

// Represents data directly from 'auth.users' table when fetched separately
// This interface is for fetching creator details from the built-in Supabase auth.users table
export interface AuthUserFromJoin {
  id: string; // Adding ID here as it's fetched for caching
  email: string;
  raw_user_meta_data: {
    name?: string; // Name from user metadata
    avatar_url?: string; // Avatar URL from user metadata (common in Supabase auth)
    // You can add other properties from raw_user_meta_data here if you use them
    [key: string]: any; // Allows for other arbitrary properties in meta data
  } | null;
}

// Represents an answer from the 'answers' table
export interface Answer {
  id: string; // UUID for answers table ID (from DB screenshot)
  question_id: number;
  content: string; // CRITICAL FIX: Changed from 'text' to 'content'
  user_id: string; // Matches your DB's FK column name (answers.user_id -> auth.users.id)
  upvotes?: number; // CRITICAL FIX: Changed from 'upvotes_count' to 'upvotes' and made optional
  is_answered?: boolean; // NEW: Added as per your DB schema
  is_official: boolean;
  created_at: string; // ISO timestamp string
  is_hidden?: boolean; // Optional, if this column exists and is used
}

// Represents a vote from the 'votes' table
export interface Vote {
  user_id: string;
  target_id: number; // For questions
  target_type: 'question' | 'answer'; // Could be 'question', 'answer', etc.
  created_at: string;
}

// Represents a help request from the 'help_requests' table
export interface HelpRequest {
  id: string; // UUID
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'; // Example statuses
  created_at: string;
  // search_vector: any; // tsvector
}


// --- Form Data Interfaces (for new submissions) ---

// For the "Ask a Question" form
export interface NewQuestionForm {
  text: string;
  isAnonymous: boolean;
}

// For the "Post Your Answer" form (used by AnswerForm.tsx)
export interface NewAnswerForm {
  text: string; // Note: This is for the form's input, still 'text' for input value
  // Potentially add isOfficial: boolean here if you want a checkbox in the form
  // or isAnonymous: boolean if you allow anonymous answers
}

// For the "Create New Topic" form (assuming this is used in Forum.tsx or a similar component)
export interface NewTopicForm {
  title: string;
  description: string;
  is_event: boolean;
  start_time?: string | null; // Allow null for optional event times
  end_time?: string | null;   // Allow null for optional event times
  // Add other fields needed for creating a new topic
}


// --- Search Results Interface ---
// This aligns with the `search_global` RPC function's return structure
export type SearchResultType = 'expert' | 'topic' | 'help_request';

export interface SearchResult {
  type: SearchResultType;
  id: string; // Could be uuid for user/help_request, or int4 for topic
  title?: string; // For topics/help_requests
  name?: string; // For experts (users)
  description?: string; // For topics/help_requests
  email?: string; // For experts (users)
  status?: string; // For experts/help_requests
  expertise?: string[]; // For experts
  avatar?: string; // For experts
  rating?: number; // For experts
  completed_helps?: number; // For experts
}