import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Clock, CheckCircle, Search, Bell, HelpCircle, Grid3x3, MessageSquare, User, Plus } from 'lucide-react';

const Dashboard = () => {
  const { api, user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [completedSurveys, setCompletedSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for demonstration
  const mockStats = {
    pending: 3,
    completed: 8,
    responseRate: 94
  };

  const mockAvailableSurveys = [
    {
      id: 1,
      title: 'End-of-Term Course Evaluation',
      description: 'Rate the quality of instruction and course materials',
      questions: 12,
      status: 'urgent',
      createdAt: '2026-03-01'
    },
    {
      id: 2,
      title: 'Campus Facilities Feedback',
      description: 'Share your thoughts on library resources and study spaces',
      questions: 8,
      status: 'new',
      createdAt: '2026-03-02'
    },
    {
      id: 3,
      title: 'Student Wellness Check-In',
      description: 'A short survey to help us understand student wellbeing',
      questions: 6,
      status: 'open',
      createdAt: '2026-03-03'
    }
  ];

  const mockCompletedSurveys = [
    {
      id: 4,
      title: 'Faculty Performance Survey - 2nd Sem',
      questions: 10,
      submittedAt: '2026-02-14',
      timeAgo: '2 weeks ago',
      status: 'completed'
    },
    {
      id: 5,
      title: 'Online Learning Experience Survey',
      questions: 15,
      submittedAt: '2026-01-30',
      timeAgo: '1 month ago',
      status: 'completed'
    },
    {
      id: 6,
      title: 'Library Services Satisfaction Survey',
      questions: 7,
      submittedAt: '2026-01-10',
      timeAgo: '2 months ago',
      status: 'completed'
    }
  ];

  useEffect(() => {
    // Use mock data for now
    setSurveys(mockAvailableSurveys);
    setCompletedSurveys(mockCompletedSurveys);
    setLoading(false);
    
    // Uncomment when API is ready
    // fetchSurveys();
  }, [activeTab]);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await api.get('/surveys', {
        params: { 
          status: activeTab === 'completed' ? 'completed' : 'available',
          limit: 20
        }
      });
      setSurveys(response.data.surveys);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      urgent: { bg: 'bg-red-600', text: 'text-white', label: 'Urgent' },
      new: { bg: 'bg-blue-500', text: 'text-white', label: 'New' },
      open: { bg: 'bg-green-600', text: 'text-white', label: 'Open' },
      completed: { bg: 'bg-gray-600', text: 'text-gray-300', label: 'Completed' }
    };
    return badges[status] || badges.open;
  };

  const getSurveyIcon = (title) => {
    if (title.includes('Course Evaluation')) {
      return <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
        <FileText className="h-4 w-4 text-white" />
      </div>;
    }
    if (title.includes('Campus Facilities')) {
      return <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
        <MessageSquare className="h-4 w-4 text-white" />
      </div>;
    }
    if (title.includes('Wellness')) {
      return <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
        <User className="h-4 w-4 text-white" />
      </div>;
    }
    return <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center">
      <FileText className="h-4 w-4 text-white" />
    </div>;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">Voxa</h1>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 p-4">
          <div className="mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Menu</p>
            <nav className="space-y-2">
              <Link
                to="/dashboard"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white"
              >
                <Grid3x3 className="h-4 w-4 mr-3" />
                Dashboard
              </Link>
              <Link
                to="/my-responses"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <FileText className="h-4 w-4 mr-3" />
                My Surveys
                <span className="ml-auto bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <User className="h-4 w-4 mr-3" />
                Profile
              </Link>
            </nav>
          </div>
          
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Settings</p>
            <Link
              to="/help"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-3" />
              Help & Support
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-white">Voxa</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search surveys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              
              {/* User Profile */}
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'JS'}
                  </span>
                </div>
                <span className="text-sm font-medium text-white">
                  {user?.fullName || 'Juan Santos'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Greeting */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Good morning, {user?.firstName || 'Juan'}!
            </h2>
            <p className="text-blue-200">You have {mockStats.pending} pending surveys to complete</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-600 rounded-lg p-6">
              <p className="text-3xl font-bold text-white">{mockStats.pending}</p>
              <p className="text-blue-100">Pending</p>
            </div>
            <div className="bg-blue-600 rounded-lg p-6">
              <p className="text-3xl font-bold text-white">{mockStats.completed}</p>
              <p className="text-blue-100">Completed</p>
            </div>
            <div className="bg-blue-600 rounded-lg p-6">
              <p className="text-3xl font-bold text-white">{mockStats.responseRate}%</p>
              <p className="text-blue-100">Response Rate</p>
            </div>
          </div>

          {/* Available Surveys */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center mr-2">
                <FileText className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Available Surveys</h3>
            </div>
            
            <div className="space-y-4">
              {mockAvailableSurveys.map((survey) => {
                const badge = getStatusBadge(survey.status);
                return (
                  <div key={survey.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getSurveyIcon(survey.title)}
                          <h4 className="text-lg font-medium text-white">{survey.title}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </div>
                        
                        <p className="text-gray-300 mb-3">{survey.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                          <span>{survey.questions} questions</span>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <Link
                          to={`/survey/${survey.id}`}
                          className="inline-flex items-center px-4 py-2 border border-blue-400 text-sm font-medium rounded-lg text-blue-400 hover:bg-blue-400 hover:text-white transition-colors"
                        >
                          Take Survey
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completed Surveys */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Completed Surveys</h3>
            </div>
            
            <div className="space-y-4">
              {mockCompletedSurveys.map((survey) => (
                <div key={survey.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h4 className="text-lg font-medium text-white">{survey.title}</h4>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <span>{survey.questions} questions</span>
                        <span>Submitted {formatDate(survey.submittedAt)}</span>
                        <span>{survey.timeAgo}</span>
                      </div>
                      
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-gray-300">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 border-t border-gray-700 px-6 py-8 mt-12">
          <div className="flex flex-wrap justify-center space-x-8 text-sm text-gray-400">
            <Link to="/about" className="hover:text-white transition-colors">About Voxa</Link>
            <Link to="/help" className="hover:text-white transition-colors">Help Center</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link to="/support" className="hover:text-white transition-colors">Contact Support</Link>
          </div>
          <div className="text-center text-sm text-gray-500 mt-6">
            © 2026 Voxa. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
