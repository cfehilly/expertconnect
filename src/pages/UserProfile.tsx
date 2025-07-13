// src/pages/UserProfile.tsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { UserProfile as DbUserProfile, Question, Answer, AuthUserFromJoin } from '../types/db';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import ExpertiseEditor from '../components/ExpertiseEditor';

// Helper function to format display name (first name, capitalized)
const formatDisplayName = (fullName: string | undefined): string => {
  if (!fullName) return 'Set your name';
  const firstName = fullName.split(' ')[0];
  if (!firstName) return 'Set your name';
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
};


const UserProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [userProfile, setUserProfile] = useState<DbUserProfile | null>(null);
  const [authUser, setAuthUser] = useState<AuthUserFromJoin | null>(null);

  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Answer[]>([]);

  const [cachedQuestions, setCachedQuestions] = useState<Map<number, { topic_id: number, content: string }>>(new Map());

  // State for avatar upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // State for editing expertise (visibility toggle)
  const [isEditingExpertiseMode, setIsEditingExpertiseMode] = useState(false);

  // NEW: State for inline editing of display name
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [editedDisplayName, setEditedDisplayName] = useState('');
  const displayNameInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const fetchUserProfileData = async () => {
      setLoading(true);
      setError(null);

      const { data: { user: authSupabaseUser } } = await supabase.auth.getUser();

      if (!authSupabaseUser) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      setAuthUser({
        id: authSupabaseUser.id,
        email: authSupabaseUser.email || '',
        raw_user_meta_data: authSupabaseUser.user_metadata || null
      });

      // Fetch user profile from public.users table
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authSupabaseUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        setError('Failed to load user profile: ' + profileError.message);
        setUserProfile({
          id: authSupabaseUser.id,
          name: authSupabaseUser.user_metadata?.name || authSupabaseUser.email || 'Anonymous',
          role: 'user'
        });
      } else if (profileData) {
        setUserProfile(profileData as DbUserProfile);
      }

      // NEW: Initialize editedDisplayName from fetched profile data (or authUser metadata)
      setEditedDisplayName(authSupabaseUser.user_metadata?.name || authSupabaseUser.email || '');


      // Fetch user's questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*, user_profile:user_id(name)')
        .eq('user_id', authSupabaseUser.id)
        .order('created_at', { ascending: false });

      if (questionsError) {
        console.error('Error fetching user questions:', questionsError);
        setError(prev => (prev ? prev + '\n' : '') + 'Failed to load user questions: ' + questionsError.message);
      } else {
        setUserQuestions(questionsData as Question[]);
      }

      // Fetch user's answers
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .eq('user_id', authSupabaseUser.id)
        .order('created_at', { ascending: false });

      if (answersError) {
        console.error('Error fetching user answers:', answersError);
        setError(prev => (prev ? prev + '\n' : '') + 'Failed to load user answers: ' + answersError.message);
      } else {
        setUserAnswers(answersData as Answer[]);

        const uniqueQuestionIds = new Set<number>();
        (answersData as Answer[]).forEach(answer => {
          if (typeof answer.question_id === 'number') {
            uniqueQuestionIds.add(answer.question_id);
          }
        });

        if (uniqueQuestionIds.size > 0) {
          const { data: associatedQuestionsData, error: associatedQuestionsError } = await supabase
            .from('questions')
            .select('id, topic_id, content')
            .in('id', Array.from(uniqueQuestionIds));

          if (associatedQuestionsError) {
            console.error('Error fetching associated question details for answers:', associatedQuestionsError);
            setError(prev => (prev ? prev + '\n' : '') + 'Failed to load associated questions: ' + associatedQuestionsError.message);
          } else if (associatedQuestionsData) {
            setCachedQuestions(prevCache => {
              const newCache = new Map(prevCache);
              associatedQuestionsData.forEach(q => {
                newCache.set(q.id, { topic_id: q.topic_id, content: q.content });
              });
              return newCache;
            });
          }
        }
      }

      setLoading(false);
    };

    fetchUserProfileData();
  }, []);

  // NEW: Effect to focus display name input when entering edit mode
  useEffect(() => {
    if (isEditingDisplayName && displayNameInputRef.current) {
      displayNameInputRef.current.focus();
    }
  }, [isEditingDisplayName]);


  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setAvatarFile(event.target.files[0]);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !userProfile) return;

    setIsUploadingAvatar(true);
    setError(null);

    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userProfile.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      if (userProfile.avatar) {
        const oldFilePathSegment = userProfile.avatar.split('avatars/')[1];
        if (oldFilePathSegment) {
          const { error: deleteError } = await supabase.storage.from('avatars').remove([`avatars/${oldFilePathSegment}`]);
          if (deleteError) {
            console.warn('Could not delete old avatar:', deleteError.message);
          }
        }
      }
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase.from('users')
        .update({ avatar: publicUrl })
        .eq('id', userProfile.id);

      if (updateError) {
        throw updateError;
      }

      setUserProfile(prevProfile => prevProfile ? { ...prevProfile, avatar: publicUrl } : null);
      setAvatarFile(null);

    } catch (err: any) {
      console.error('Error uploading avatar:', err.message);
      setError('Failed to upload avatar: ' + err.message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveExpertise = async (newExpertise: string[]) => {
    if (!userProfile) return;

    if (JSON.stringify(newExpertise) === JSON.stringify(userProfile.expertise || [])) {
      setIsEditingExpertiseMode(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.from('users')
        .update({ expertise: newExpertise })
        .eq('id', userProfile.id);
      
      if (updateError) {
        console.error('Error updating expertise:', updateError);
        alert('Failed to update expertise: ' + updateError.message);
      } else {
        setUserProfile(prevProfile => prevProfile ? { ...prevProfile, expertise: newExpertise } : null);
      }
    } catch (err) {
      console.error('Unexpected error during expertise update:', err);
      alert('An unexpected error occurred while updating expertise.');
    } finally {
      setIsEditingExpertiseMode(false);
    }
  };

  const handleCancelExpertiseEdit = () => {
    setIsEditingExpertiseMode(false);
  };

  // NEW: handleSaveDisplayName function for inline editing
  const handleSaveDisplayName = async () => {
    if (!authUser || !userProfile) return;

    const trimmedName = editedDisplayName.trim();

    // Check if name actually changed
    if (trimmedName === userProfile.name) {
      setIsEditingDisplayName(false);
      return;
    }

    if (!trimmedName) {
      alert('Display name cannot be empty.');
      setEditedDisplayName(userProfile.name); // Revert to old name
      setIsEditingDisplayName(false);
      return;
    }

    try {
      // Update name in auth.users raw_user_meta_data
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: trimmedName }
      });

      if (authError) {
        console.error('Error updating auth user metadata:', authError);
        alert('Failed to update display name: ' + authError.message);
        setEditedDisplayName(userProfile.name); // Revert on error
      } else {
        // Update name in public.users table as well for consistency
        const { error: profileUpdateError } = await supabase.from('users')
          .update({ name: trimmedName })
          .eq('id', userProfile.id);
        
        if (profileUpdateError) {
          console.error('Error updating public user profile name:', profileUpdateError);
          alert('Display name updated in auth, but failed to update in public profile: ' + profileUpdateError.message);
        }

        // Optimistically update the userProfile state
        setUserProfile(prevProfile => prevProfile ? { ...prevProfile, name: trimmedName } : null);
        // Update authUser state for consistency
        setAuthUser(prevAuth => prevAuth ? { 
          ...prevAuth, 
          raw_user_meta_data: { ...prevAuth.raw_user_meta_data, name: trimmedName }
        } : null);
      }
    } catch (err) {
      console.error('Unexpected error during display name update:', err);
      alert('An unexpected error occurred while updating display name.');
      setEditedDisplayName(userProfile.name); // Revert on unexpected error
    } finally {
      setIsEditingDisplayName(false);
    }
  };

  // NEW: handleCancelEditDisplayName function
  const handleCancelEditDisplayName = () => {
    if (userProfile) {
      setEditedDisplayName(userProfile.name); // Revert to original full name
    }
    setIsEditingDisplayName(false);
  };

  // NEW: handleKeyDown for display name input
  const handleDisplayNameInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      displayNameInputRef.current?.blur(); // Trigger onBlur to save
    } else if (e.key === 'Escape') {
      handleCancelEditDisplayName();
    }
  };


  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600 text-lg">Error: {error}</div>;
  }

  if (!userProfile) {
    return <div className="text-center p-8 text-gray-700 text-lg">User profile not found.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-100 min-h-screen shadow-lg rounded-lg dark:bg-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 text-center">User Profile</h1>

      {/* Basic Profile Info */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 dark:bg-gray-800 dark:text-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">Name:</p>
            {/* NEW: Display Name Editing Logic */}
            {isEditingDisplayName ? (
              <input
                ref={displayNameInputRef}
                type="text"
                value={editedDisplayName}
                onChange={(e) => setEditedDisplayName(e.target.value)}
                onBlur={handleSaveDisplayName}
                onKeyDown={handleDisplayNameInputKeyDown}
                className="w-full p-2 border border-blue-300 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            ) : (
              <p 
                className="text-lg font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md cursor-pointer"
                onClick={() => setIsEditingDisplayName(true)}
              >
                {formatDisplayName(userProfile.name)}
              </p>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">Email:</p>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{authUser?.email || 'N/A'}</p>
          </div>
          {userProfile.role && (
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">Role:</p>
              <p className="text-lg font-medium text-blue-600 dark:text-blue-300 capitalize">{userProfile.role}</p>
            </div>
          )}
          {userProfile.department && (
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">Department:</p>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{userProfile.department}</p>
            </div>
          )}
          {/* Expertise Editor Integration */}
          <div className="md:col-span-2">
            <p className="font-semibold text-gray-700 dark:text-gray-300">Expertise:</p>
            {isEditingExpertiseMode ? (
              <ExpertiseEditor
                currentExpertise={userProfile.expertise || []}
                onSave={handleSaveExpertise}
                onCancel={handleCancelExpertiseEdit}
                userDepartment={userProfile.department}
              />
            ) : (
              <div 
                className="flex flex-wrap gap-2 mt-1 p-1 min-h-[40px] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer items-center"
                onClick={() => setIsEditingExpertiseMode(true)}
              >
                {userProfile.expertise && userProfile.expertise.length > 0 ? (
                  userProfile.expertise.map((skill, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full dark:bg-purple-900 dark:text-purple-200">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic dark:text-gray-400">Add your expertise...</span>
                )}
              </div>
            )}
          </div>

          {/* Avatar Upload Section */}
          <div className="md:col-span-2">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Profile Picture:</p>
            <div className="flex items-center space-x-4">
              <img
                src={userProfile.avatar || 'https://via.placeholder.com/100/A0AEC0/FFFFFF?text=No+Avatar'}
                alt="User Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-400 cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              />
              <input
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <div>
                {avatarFile ? (
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Selected: {avatarFile.name}
                    <button
                      onClick={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                      className="ml-2 px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingAvatar ? 'Uploading...' : 'Upload New Avatar'}
                    </button>
                    <button
                      onClick={() => setAvatarFile(null)}
                      disabled={isUploadingAvatar}
                      className="ml-2 px-3 py-1 bg-gray-300 text-gray-800 text-xs rounded-md hover:bg-gray-400 transition-colors duration-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Change Avatar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User's Questions */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 dark:bg-gray-800 dark:text-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">Your Questions ({userQuestions.length})</h2>
        {userQuestions.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">You haven't asked any questions yet.</p>
        ) : (
          <ul className="space-y-3">
            {userQuestions.map(question => (
              <li key={question.id} className="bg-gray-50 p-4 rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                <Link to={`/forum/topic/${question.topic_id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                  <p className="font-semibold text-gray-800 dark:text-gray-100 text-base mb-1">{question.content}</p>
                </Link>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Posted on {new Date(question.created_at).toLocaleDateString()} | Upvotes: {question.upvotes}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* User's Answers */}
      <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">Your Answers ({userAnswers.length})</h2>
        {userAnswers.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">You haven't provided any answers yet.</p>
        ) : (
          <ul className="space-y-3">
            {userAnswers.map(answer => {
              const associatedQuestion = cachedQuestions.get(answer.question_id);
              const topicLink = associatedQuestion ? `/forum/topic/${associatedQuestion.topic_id}` : '#';
              const questionContentPreview = associatedQuestion ? associatedQuestion.content.substring(0, 50) + (associatedQuestion.content.length > 50 ? '...' : '') : 'Loading question...';

              return (
                <li key={answer.id} className="bg-gray-50 p-4 rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                  <Link to={topicLink} className="text-blue-600 hover:underline dark:text-blue-400">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-base mb-1">{answer.content}</p>
                    {associatedQuestion && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 italic mt-1">
                        (Answering: "{questionContentPreview}")
                      </p>
                    )}
                  </Link>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Answered on {new Date(answer.created_at).toLocaleDateString()} | Upvotes: {answer.upvotes || 0}
                    {answer.is_official && <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium dark:bg-blue-800 dark:text-blue-100">Official</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserProfile;