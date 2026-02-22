import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Clock, CheckCircle, Plus } from 'lucide-react';

const Dashboard = () => {
  const { api } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    fetchSurveys();
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and respond to available surveys
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Surveys</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {surveys.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {surveys.filter(s => s.isCompleted).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {surveys.filter(s => !s.isCompleted).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'available'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Available Surveys
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'completed'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Completed Surveys
          </button>
        </nav>
      </div>

      {/* Surveys List */}
      <div className="space-y-4">
        {surveys.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {activeTab === 'available' ? 'No available surveys' : 'No completed surveys'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'available' 
                ? 'Check back later for new surveys to complete.'
                : 'Complete some surveys to see them here.'
              }
            </p>
          </div>
        ) : (
          surveys.map((survey) => (
            <div key={survey._id} className="card">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(survey)}
                      <h3 className="text-lg font-medium text-gray-900">
                        {survey.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        survey.isCompleted
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {getStatusText(survey)}
                      </span>
                    </div>
                    
                    {survey.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {survey.description}
                      </p>
                    )}
                    
                    <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{survey.questions.length} questions</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Created {formatDate(survey.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>By {survey.createdBy?.fullName || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    {survey.isCompleted ? (
                      <Link
                        to={`/my-responses`}
                        className="btn-outline"
                      >
                        View Response
                      </Link>
                    ) : (
                      <Link
                        to={`/survey/${survey._id}`}
                        className="btn-primary"
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
    </div>
  );
};

export default Dashboard;
