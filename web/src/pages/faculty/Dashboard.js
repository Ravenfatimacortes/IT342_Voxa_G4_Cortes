import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Plus, 
  Eye,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  const { api } = useAuth();
  const [stats, setStats] = useState({
    totalSurveys: 0,
    publishedSurveys: 0,
    totalResponses: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [surveysResponse, recentResponse] = await Promise.all([
        api.get('/admin/surveys', { params: { limit: 5 } }),
        api.get('/admin/surveys', { 
          params: { 
            limit: 5,
            sort: '-createdAt'
          } 
        })
      ]);

      const surveys = surveysResponse.data.surveys;
      const totalResponses = surveys.reduce((sum, survey) => sum + survey.responseCount, 0);

      setStats({
        totalSurveys: surveys.length,
        publishedSurveys: surveys.filter(s => s.status === 'PUBLISHED').length,
        totalResponses,
        recentActivity: surveysResponse.data.surveys
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your surveys and view student responses
          </p>
        </div>
        <Link
          to="/faculty/surveys/new"
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Survey
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Surveys</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalSurveys}
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
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.publishedSurveys}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalResponses}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Responses</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalSurveys > 0 ? Math.round(stats.totalResponses / stats.totalSurveys) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Surveys */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Surveys</h3>
              <Link
                to="/faculty/surveys"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </div>
            
            <div className="space-y-4">
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No surveys yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create your first survey to get started.
                  </p>
                </div>
              ) : (
                stats.recentActivity.slice(0, 3).map((survey) => (
                  <div key={survey._id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {survey.title}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(survey.status)}`}>
                          {survey.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {survey.questions.length} questions
                        </span>
                        <span className="text-xs text-gray-500">
                          {survey.responseCount} responses
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/faculty/surveys/${survey._id}/responses`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/faculty/surveys/${survey._id}/edit`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <Link
                to="/faculty/surveys/new"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Plus className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Create New Survey</p>
                    <p className="text-xs text-gray-500">Design a new survey for students</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/faculty/surveys"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Manage Surveys</p>
                    <p className="text-xs text-gray-500">View and edit existing surveys</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/my-responses"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Users className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">View All Responses</p>
                    <p className="text-xs text-gray-500">Analyze student feedback</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
