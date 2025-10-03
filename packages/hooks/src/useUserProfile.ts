/**
 * User Profile Hook
 * React hook for managing user profile data
 */

import { useAuth } from '@auraos/ui/contexts/AuthContext';

/**
 * A hook to access the current user's profile and related actions.
 * This hook is a lightweight wrapper around the `useAuth` context,
 * ensuring a single source of truth for user profile data.
 */
export function useUserProfile() {
  const {
    user,
    userProfile,
    loading,
    updateUserProfile: updateProfileData,
  } = useAuth();

  // The AuthProvider already handles updating the profile.
  // We can expose it directly or wrap it if needed.
  const updateProfile = updateProfileData;

  return {
    user,
    profile: userProfile,
    loading,
    updateProfile,
  };
}
