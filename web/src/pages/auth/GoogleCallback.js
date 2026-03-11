import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const GoogleCallback = () => {
  const { handleGoogleCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const result = handleGoogleCallback();
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [handleGoogleCallback, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4 mx-auto" />
        <p className="text-white text-lg">Completing Google sign-in...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
