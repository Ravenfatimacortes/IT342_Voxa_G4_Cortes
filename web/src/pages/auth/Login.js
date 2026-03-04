import React, { useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  
  // Debug: Log current auth state
  console.log('Current auth state:', { loading, isAuthenticated });
  
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Memoize submit handler to prevent re-renders
  const onSubmit = useCallback(async (data) => {
    console.log('Login form submitted with data:', data);
    const result = await login(data);
    console.log('Login result:', result);
    if (result.success) {
      // Add small delay to ensure state is updated
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
    }
  }, [login, navigate, from]);

  return (
    <div className="login-background min-h-screen relative overflow-hidden">
      {/* Glowing Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-blue-950"></div>
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-96 h-96 bg-blue-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-blue-400 rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        {/* Wave Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="waves-login" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0 50 Q25 30 50 50 T100 50 T150 50 T200 50" stroke="url(#gradient-login)" strokeWidth="2" fill="none"/>
              <path d="M0 70 Q25 50 50 70 T100 70 T150 70 T200 70" stroke="url(#gradient-login)" strokeWidth="1" fill="none" opacity="0.5"/>
            </pattern>
            <linearGradient id="gradient-login" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#waves-login)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        {/* Logo */}
        <div className="absolute top-8 left-8">
          <h1 className="text-3xl font-bold text-white shadow-2xl shadow-blue-500/50">Voxa</h1>
        </div>

        {/* Top Right Navigation */}
        <nav className="absolute top-8 right-8 flex space-x-6">
          <Link to="/about" className="text-white hover:text-blue-400 transition-colors font-medium">About</Link>
          <span className="text-blue-400 font-medium">Login</span>
          <Link to="/register" className="text-white hover:text-blue-400 transition-colors font-medium">Sign Up</Link>
        </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 relative">
        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 w-full max-w-2xl border border-white/20 shadow-2xl">
          <h2 className="text-3xl font-bold text-white text-center mb-2">Welcome back!</h2>
          <p className="text-white/80 text-center mb-8">Sign in to access your surveys & feedback</p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter your username"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
                Forgot Password?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-white/80 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};

export default React.memo(Login);
