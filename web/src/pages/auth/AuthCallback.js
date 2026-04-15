import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Handling auth callback...');
        
        // Get the URL hash and parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const urlParams = new URLSearchParams(window.location.search);
        
        console.log('Hash params:', Object.fromEntries(hashParams));
        console.log('URL params:', Object.fromEntries(urlParams));
        
        // Check for error in the callback
        const error = hashParams.get('error') || urlParams.get('error');
        if (error) {
          console.error('OAuth error in callback:', error);
          toast.error(`Authentication failed: ${error}`);
          navigate('/login');
          return;
        }

        // Let Supabase handle the session exchange
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          toast.error('Authentication failed');
          navigate('/login');
          return;
        }

        if (data.session) {
          console.log('Session found:', data.session.user);
          toast.success('Successfully authenticated!');
          
          // Navigate based on user role or default
          const userRole = data.session.user?.user_metadata?.role;
          const targetRoute = userRole === 'faculty' ? '/faculty/dashboard' : '/dashboard';
          navigate(targetRoute);
        } else {
          // Try to get session from hash if not available
          const { data: authData, error: authError } = await supabase.auth.refreshSession();
          
          if (authError) {
            console.error('Auth refresh error:', authError);
            toast.error('Authentication failed');
            navigate('/login');
            return;
          }
          
          if (authData.session) {
            console.log('Session found after refresh:', authData.session.user);
            toast.success('Successfully authenticated!');
            const userRole = authData.session.user?.user_metadata?.role;
            const targetRoute = userRole === 'faculty' ? '/faculty/dashboard' : '/dashboard';
            navigate(targetRoute);
          } else {
            console.log('No session found, redirecting to login');
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Callback error:', error);
        toast.error('Authentication failed');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
