import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Adjust path if needed

interface ProfileData {
  skills?: string[];
  availability?: boolean;
  badges?: number;
}

function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login'; // Redirect if no user
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('skills, availability, badges')
        .eq('id', user.id)
        .single();
      if (error) console.error(error);
      else setProfile(data);
    }
    fetchProfile();
  }, []);

  if (profile === null) return <p>Loading profile...</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Your Profile</h2>
      <p>Skills: {profile.skills ? profile.skills.join(', ') : 'None yet'}</p>
      <p>Availability: {profile.availability ? 'Available' : 'Not Available'}</p>
      <p>Badges: {profile.badges ?? 0}</p>
      {profile.badges && profile.badges >= 10 && <span className="bg-yellow-500 text-white px-2 py-1 rounded">Helper Badge Earned!</span>}
    </div>
  );
}

export default Profile;