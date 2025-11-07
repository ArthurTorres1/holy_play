import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (requiredRole: 'ADMIN' | 'USER'): boolean => {
    if (!isAuthenticated || !user) return false;
    return user.role === requiredRole;
  };

  const isAdmin = (): boolean => {
    return hasRole('ADMIN');
  };

  const isUser = (): boolean => {
    return hasRole('USER');
  };

  const canAccessAdmin = (): boolean => {
    return isAdmin();
  };

  const canManageUsers = (): boolean => {
    return isAdmin();
  };

  const canUploadVideos = (): boolean => {
    return isAdmin();
  };

  return {
    hasRole,
    isAdmin,
    isUser,
    canAccessAdmin,
    canManageUsers,
    canUploadVideos,
    user,
    isAuthenticated
  };
};
