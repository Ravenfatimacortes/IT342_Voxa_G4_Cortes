import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const handleGoogleAuthCallback = async () => {
      try {
        // Parse URL parameters
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        const userStr = urlParams.get('user');
        
        if (!token || !userStr) {
          throw new Error('Missing authentication data');
        }

        // Parse user data
        const user = JSON.parse(decodeURIComponent(userStr));
        
        // Handle the Google login callback
        const result = await handleGoogleCallback(token, user);
        
        if (result.success) {
          // Redirect based on user role
          const userRole = user.role || 'student';
          if (userRole === 'teacher' || userRole === 'faculty') {
            navigate('/faculty/dashboard', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } else {
          // If login failed, redirect to login page with error
          navigate('/login', { 
            replace: true, 
            state: { error: 'Google login failed' } 
          });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed');
        navigate('/login', { replace: true });
      }
    };

    handleGoogleAuthCallback();
  }, [location.search, handleGoogleCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-blue-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
