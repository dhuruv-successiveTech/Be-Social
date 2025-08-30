'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
 
  useEffect(() => {
    // Only redirect if we're done loading and there's no user
    if (!loading && !user) {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      }
    }
  }, [loading, user, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-300">Loading...</div>
        </div>
      </div>
    );
  }

  // If we have a token but no user yet, show loading
  if (!user && localStorage.getItem('token')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-300">Authenticating...</div>
        </div>
      </div>
    );
  }

  // If no user and no token, return null (will redirect in useEffect)
  if (!user && !localStorage.getItem('token')) {
    return null;
  }

  // If we have a user, render the protected content
  return children;
}
