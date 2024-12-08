import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const {
    user,
    organizationId,
    isLoading,
    error,
    isDev,
    hasAdminAccess,
    signIn,
    signOut
  } = useAuthStore();

  // Get display name from metadata
  const displayName = user ? `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || ''}`.trim() : '';

  return {
    user,
    displayName,
    organizationId,
    isLoading,
    error,
    isDev,
    hasAdminAccess,
    signIn,
    signOut
  };
}