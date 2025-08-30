"use client"
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useApolloClient } from '@apollo/client/react';
import { isTokenExpired, getTokenExpirationTime } from '../utils/tokenUtils';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndToken = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        // Don't show error toast on public routes
        const isPublicRoute = window.location.pathname === '/login' || 
                            window.location.pathname === '/register' ||
                            window.location.pathname === '/';
        
        if (!token || !userData) {
          setUser(null);
          setLoading(false);
          if (!isPublicRoute) {
            router.push('/login');
            toast.error('You must be logged in to view this page');
          }
          return;
        }

        const isValid = await validateToken();
        if (!isValid) {
          setUser(null);
          setLoading(false);
          if (!isPublicRoute) {
            router.push('/login');
          }
          return;
        }

        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setLoading(false);
        } catch (e) {
          console.error('Error parsing user data:', e);
          logout();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setLoading(false);
      }
    };

    checkAuthAndToken();

    // Set up interval to check token expiration every minute
    const tokenCheckInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && isTokenExpired(token)) {
        logout();
      }
    }, 60000);

    return () => clearInterval(tokenCheckInterval);
  }, []);

  const validateToken = async () => {
    try {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!token) {
        setLoading(false);
        return false;
      }

      if (isTokenExpired(token)) {
        // If there's a refresh token, try to refresh
        if (refreshToken) {
          try {
            // TODO: Implement token refresh logic with your backend
            // const newToken = await refreshTokenMutation();
            // if (newToken) {
            //   localStorage.setItem('token', newToken);
            //   return true;
            // }
          } catch (error) {
            console.error('Token refresh failed:', error);
          }
        }
        
        toast.error('Your session has expired. Please login again');
        logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
      return false;
    }
  };

  const login = (userData, token, refreshToken) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    // Check token expiration time and set up alert
    const expirationTime = getTokenExpirationTime(token);
    if (expirationTime) {
      const warningTime = new Date(expirationTime.getTime() - 5 * 60000); // 5 minutes before expiration
      const now = new Date();
      if (warningTime > now) {
        setTimeout(() => {
          toast.warning('Your session will expire in 5 minutes. Please save your work and re-login.');
        }, warningTime.getTime() - now.getTime());
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    client.clearStore();
    router.push('/login');
    // client.resetStore();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, validateToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
