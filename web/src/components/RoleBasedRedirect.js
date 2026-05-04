import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  const userRole = user?.role || 'student';
  if (userRole === 'teacher' || userRole === 'faculty') {
    return <Navigate to="/faculty/dashboard" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
};

export default RoleBasedRedirect;
