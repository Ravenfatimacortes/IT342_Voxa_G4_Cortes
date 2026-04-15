import React, { createContext, useContext, useReducer, useEffect } from 'react';
<<<<<<< HEAD
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

=======
import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with optimized settings
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
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
<<<<<<< HEAD
        session: action.payload.session,
=======
        token: action.payload.token,
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
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
<<<<<<< HEAD
        session: null,
=======
        token: null,
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
        error: action.payload,
      };
    case 'LOGOUT':
      console.log('LOGOUT action');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
<<<<<<< HEAD
        session: null,
=======
        token: null,
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
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
<<<<<<< HEAD
    case 'SET_LOADING_FALSE':
      return { ...state, loading: false };
=======
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Initial state
const initialState = {
<<<<<<< HEAD
  isAuthenticated: false,
  user: null,
  session: null,
  loading: true,
=======
  isAuthenticated: !!localStorage.getItem('token'), // Set based on token existence
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
  error: null,
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

<<<<<<< HEAD
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
=======
  // Set up axios interceptors
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = state.token || localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          dispatch({ type: 'LOGOUT' });
          localStorage.removeItem('token');
          toast.error('Session expired. Please login again.');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [state.token]);

  // Check authentication on mount with performance optimization
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Add timeout to prevent hanging
          const response = await Promise.race([
            api.get('/auth/me'),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Auth check timeout')), 5000)
            )
          ]);
          dispatch({
            type: 'SET_USER',
            payload: response.data.user,
          });
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    // Use setTimeout to prevent blocking initial render
    const timeoutId = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Login function with optimized performance
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
  const login = async (credentials) => {
    try {
      console.log('Login starting...');
      dispatch({ type: 'LOGIN_START' });
      
<<<<<<< HEAD
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;
=======
      const response = await api.post('/auth/login', credentials);
      console.log('Login response received:', response.data);
      
      const { token, user } = response.data;
      console.log('Extracted token and user:', { token, user });
      
      // Store token immediately
      localStorage.setItem('token', token);
      console.log('Token stored in localStorage');
      
      // Dispatch success
      const successAction = {
        type: 'LOGIN_SUCCESS',
        payload: { token, user },
      };
      console.log('Dispatching success action:', successAction);
      dispatch(successAction);
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
<<<<<<< HEAD
      const errorMessage = error.message || 'Login failed';
=======
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

<<<<<<< HEAD
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
=======
  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await api.post('/auth/register', userData);
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user },
      });
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

<<<<<<< HEAD
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
=======
  // Logout function
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  // Google OAuth login
  const loginWithGoogle = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = `${api.defaults.baseURL}/auth/google`;
  };

  // Handle Google OAuth callback
  const handleGoogleCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem('token', token);
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token, user },
        });
        
        toast.success('Google login successful!');
        return { success: true };
      } catch (error) {
        console.error('Error parsing Google callback:', error);
        toast.error('Google login failed');
        return { success: false, error: 'Invalid callback data' };
      }
    } else {
      toast.error('Google login failed');
      return { success: false, error: 'Missing callback data' };
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
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
<<<<<<< HEAD
=======
    handleGoogleCallback,
    api,
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
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
