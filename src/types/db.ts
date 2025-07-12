// src/types/db.ts

export interface UserProfile {
  id: string; // uuid from Supabase auth.users table
  role: 'user' | 'admin'; // text from your users table
  name?: string; // Confirmed 'name' as display name
  username?: string; // Keep if you still have a username column
  avatar_url?: string; // Add if you have an avatar_url column in your users table
  // ... any other user profile fields you fetch/use
}

export interface Topic {
  id: number; // Confirmed: int4 from your topics table
  title: string;
  description: string;
  creator_id: string; // uuid, FK to users.id
  pinned: boolean;
  is_event: boolean; // Confirmed existing in topics table
  start_time: string | null; // Confirmed existing, TIMESTAMPTZ, can be null
  end_time: string | null;   // Confirmed existing, TIMESTAMPTZ, can be null
  created_at: string; // TIMESTAMPTZ
}

export interface Question {
  id: number; // CRITICAL CHANGE: Changed from 'string' to 'number' to match DB's int4
  topic_id: number; // INT4 FOREIGN KEY to topics.id
  content: string; // 'content' to match DB
  user_id: string | null; // 'user_id' to match DB, uuid FK to users.id, can be null if anonymous
  is_anonymous: boolean; // Confirmed existing
  upvotes: number; // 'upvotes' to match DB
  created_at: string; // TIMESTAMPTZ
  is_answered: boolean; // Confirmed existing
  is_hidden: boolean; // Confirmed existing
  user_profile: {
      name: string | null; // 'name' from joined user profile
  } | null; // Can be null if is_anonymous is true or user doesn't exist
  is_upvoted_by_user?: boolean; // Optional property to track if current user has upvoted
}

export interface Answer {
  id: string; // uuid PRIMARY KEY for answers table (assuming UUIDs for answers)
  question_id: number; // CRITICAL CHANGE: Changed from 'string' to 'number' to match Question.id
  text: string;
  creator_id: string | null; // uuid FOREIGN KEY to users.id (admin/topic creator)
  is_official: boolean;
  created_at: string; // TIMESTAMPTZ
  upvotes_count: number; // For upvoting answers
  is_hidden: boolean;
}

export interface Vote {
  user_id: string; // uuid FOREIGN KEY to users.id
  target_id: string | number; // Can be UUID (for answers/comments) or number (for questions)
  target_type: 'question' | 'answer' | 'comment'; // 'question', 'answer' etc.
  created_at: string; // TIMESTAMPTZ
}

// --- NEW: Search Result Interfaces (modified SearchResultExpert with rating and completed_helps) ---
export interface SearchResultExpert {
  type: 'expert';
  id: string; // UUID from users.id
  name: string | null;
  email: string | null;
  role: string | null;
  expertise: string[] | null; // Assuming expertise is string array
  match_rank: number; // For sorting relevance
  avatar: string | null; // Added
  status: string | null; // Added
  department: string | null; // Added
  rating: number | null; // NEW: Added rating
  completed_helps: number | null; // NEW: Added completed_helps
}

export interface SearchResultTopic {
  type: 'topic';
  id: number; // int4 from topics.id
  title: string;
  description: string | null;
  created_at: string; // TIMESTAMPTZ
  match_rank: number;
}

export interface SearchResultHelpRequest {
  type: 'help_request';
  id: string; // UUID from help_requests.id
  title: string;
  description: string | null;
  status: string | null;
  created_at: string; // TIMESTAMPTZ
  match_rank: number;
}

// Union type for any possible search result
export type SearchResult = SearchResultExpert | SearchResultTopic | SearchResultHelpRequest;
// --- END NEW ---