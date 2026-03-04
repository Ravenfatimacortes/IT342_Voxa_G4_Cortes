import React, { createContext, useContext, useReducer, useEffect } from 'react';
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
        token: action.payload.token,
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
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      console.log('LOGOUT action');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
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
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  isAuthenticated: !!localStorage.getItem('token'), // Set based on token existence
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

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
  const login = async (credentials) => {
    try {
      console.log('Login starting...');
      dispatch({ type: 'LOGIN_START' });
      
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
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

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
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

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
    api,
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
