import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

// Auth context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  console.log('Auth reducer called:', { state: { ...state }, action });
  
  switch (action.type) {
    case 'LOGIN_START':
      console.log('LOGIN_START action');
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      console.log('LOGIN_SUCCESS action:', action.payload);
      const newState = {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        session: action.payload.session,
        error: null,
      };
      console.log('New state after LOGIN_SUCCESS:', newState);
      return newState;
    case 'LOGIN_FAILURE':
      console.log('LOGIN_FAILURE action:', action.payload);
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        session: null,
        error: action.payload,
      };
    case 'LOGOUT':
      console.log('LOGOUT action');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        session: null,
        error: null,
      };
    case 'SET_USER':
      console.log('SET_USER action:', action.payload);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case 'SET_LOADING_FALSE':
      return { ...state, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  session: null,
  loading: true,
  error: null,
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: session.user,
              session: session,
            },
          });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      }
    );

    // Check for existing session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: session.user,
            session: session,
          },
        });
      } else {
        dispatch({ type: 'SET_LOADING_FALSE' });
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  // Login function with Supabase
  const login = async (credentials) => {
    try {
      console.log('Login starting...');
      dispatch({ type: 'LOGIN_START' });
      
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function with Supabase
  const register = async (userData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'student',
          }
        }
      });

      if (error) throw error;
      
      toast.success('Registration successful! Please check your email to verify your account.');
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function with Supabase
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  // Google OAuth login with Supabase
  const loginWithGoogle = async () => {
    try {
      console.log('Starting Google OAuth login...');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error('Google OAuth error:', error);
        toast.error(`Google login failed: ${error.message}`);
        return { success: false, error: error.message };
      }
      
      console.log('Google OAuth initiated successfully');
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      const errorMessage = error.message || 'Google login failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
