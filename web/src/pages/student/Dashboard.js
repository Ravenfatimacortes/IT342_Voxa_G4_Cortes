import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Clock, CheckCircle, Plus, MessageCircle, Crown } from 'lucide-react';
import PostFeed from '../../components/Posts/PostFeed';

const Dashboard = () => {
  const { api, user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    if (activeTab !== 'feed') {
      fetchSurveys();
    }
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

  const getStatusIcon = (survey) => {
    if (survey.isCompleted) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Clock className="h-5 w-5 text-blue-500" />;
  };

  const getStatusText = (survey) => {
    if (survey.isCompleted) {
      return 'Completed';
    }
    return 'Available';
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
    <div className="space-y-6">
      {/* Header with Greeting */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold">Good morning, {user?.fullName?.split(' ')[0]}! 👋</h1>
        <p className="mt-2 text-blue-100">
          You have {surveys.filter(s => !s.isCompleted).length} pending surveys to complete. Keep up the great work!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500/20 rounded-lg p-3">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Pending</p>
                <p className="text-2xl font-semibold text-white">
                  {surveys.filter(s => !s.isCompleted).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-emerald-500/20 rounded-lg p-3">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Completed</p>
                <p className="text-2xl font-semibold text-white">
                  {surveys.filter(s => s.isCompleted).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-orange-500/20 rounded-lg p-3">
                <FileText className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Response Rate</p>
                <p className="text-2xl font-semibold text-white">
                  {surveys.length > 0 ? Math.round((surveys.filter(s => s.isCompleted).length / surveys.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('feed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
              activeTab === 'feed'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
            }`}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Feed
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'available'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
            }`}
          >
            Available Surveys
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'completed'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
            }`}
          >
            Completed Surveys
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'feed' ? (
        <PostFeed />
      ) : (
        /* Surveys List */
        <div className="space-y-4">
          {surveys.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-slate-600" />
              <h3 className="mt-2 text-sm font-medium text-white">
                {activeTab === 'available' ? 'No available surveys' : 'No completed surveys'}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                {activeTab === 'available' 
                  ? 'Check back later for new surveys to complete.'
                  : 'Complete some surveys to see them here.'
                }
              </p>
            </div>
          ) : (
            surveys.map((survey) => (
              <div key={survey.id} className="card hover:border-slate-600 transition-colors">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-white">
                          {survey.title}
                        </h3>
                        {survey.isFirstFacultySurvey && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <Crown className="h-3 w-3 mr-1" />
                            Faculty
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          survey.isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {getStatusText(survey)}
                        </span>
                      </div>
                      
                      {survey.description && (
                        <p className="mt-2 text-sm text-slate-300">
                          {survey.description}
                        </p>
                      )}
                      
                      <div className="mt-4 flex items-center space-x-6 text-sm text-slate-400">
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>{survey.questions?.length || 0} questions</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Created {formatDate(survey.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>By {survey.creator?.firstName} {survey.creator?.lastName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-shrink-0">
                      {survey.isCompleted ? (
                        <Link
                          to={`/my-responses`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
                        >
                          View Response
                        </Link>
                      ) : (
                        <Link
                          to={`/survey/${survey.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2"
                        >
                          Take Survey
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
