import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  Download,
  Eye,
  Activity
} from 'lucide-react';

const ResponseOverview = () => {
  const { api } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalSurveys: 0,
    totalResponses: 0,
    publishedSurveys: 0,
    draftSurveys: 0,
    closedSurveys: 0,
    averageCompletionTime: 0,
    responseRate: 0,
    recentActivity: [],
    surveyPerformance: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // 'all', '7days', '30days', '90days'

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      // Fetch all surveys with responses
      const surveysResponse = await api.get('/admin/surveys', { 
        params: { 
          limit: 100,
          sort: '-createdAt'
        } 
      });

      const surveys = surveysResponse.data.surveys || [];
      const totalResponses = surveys.reduce((sum, survey) => sum + (survey.responseCount || 0), 0);
      const publishedSurveys = surveys.filter(s => s.status === 'PUBLISHED').length;
      const draftSurveys = surveys.filter(s => s.status === 'DRAFT').length;
      const closedSurveys = surveys.filter(s => s.status === 'CLOSED').length;
      
      // Calculate average completion time (mock data for now)
      const averageCompletionTime = 180; // 3 minutes in seconds
      
      // Calculate response rate
      const responseRate = publishedSurveys > 0 
        ? Math.round((totalResponses / publishedSurveys) * 100) 
        : 0;

      // Prepare survey performance data
      const surveyPerformance = surveys.slice(0, 10).map(survey => ({
        id: survey.id,
        title: survey.title,
        responses: survey.responseCount || 0,
        status: survey.status,
        createdAt: survey.createdAt,
        responseRate: survey.questions && survey.questions.length > 0 
          ? Math.round(((survey.responseCount || 0) / survey.questions.length) * 100)
          : 0
      }));

      setAnalytics({
        totalSurveys: surveys.length,
        totalResponses,
        publishedSurveys,
        draftSurveys,
        closedSurveys,
        averageCompletionTime,
        responseRate,
        recentActivity: surveys.slice(0, 5),
        surveyPerformance
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'DRAFT':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'CLOSED':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const exportAnalytics = () => {
    const csvContent = [
      ['Survey Title', 'Status', 'Responses', 'Response Rate (%)', 'Created Date'],
      ...analytics.surveyPerformance.map(survey => [
        survey.title,
        survey.status,
        survey.responses,
        survey.responseRate,
        formatDate(survey.createdAt)
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Response Overview</h1>
          <p className="mt-1 text-sm text-slate-400">
            Comprehensive analytics for all your surveys and responses.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-md text-sm"
          >
            <option value="all">All Time</option>
            <option value="90days">Last 90 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="7days">Last 7 Days</option>
          </select>
          <button
            onClick={exportAnalytics}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Analytics
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Responses */}
        <div className="card border-b-2 border-blue-500">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 rounded-lg p-3">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-xs font-semibold text-emerald-400">↑ 12% this month</span>
            </div>
            <p className="text-4xl font-bold text-white">{analytics.totalResponses}</p>
            <p className="text-sm text-slate-400 mt-2">Total Responses</p>
          </div>
        </div>

        {/* Response Rate */}
        <div className="card border-b-2 border-emerald-500">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-500/20 rounded-lg p-3">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-emerald-400">↑ 5% increase</span>
            </div>
            <p className="text-4xl font-bold text-white">{analytics.responseRate}%</p>
            <p className="text-sm text-slate-400 mt-2">Response Rate</p>
          </div>
        </div>

        {/* Published Surveys */}
        <div className="card border-b-2 border-purple-500">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 rounded-lg p-3">
                <CheckCircle className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-xs font-semibold text-purple-400">Active</span>
            </div>
            <p className="text-4xl font-bold text-white">{analytics.publishedSurveys}</p>
            <p className="text-sm text-slate-400 mt-2">Published Surveys</p>
          </div>
        </div>

        {/* Avg Completion Time */}
        <div className="card border-b-2 border-yellow-500">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500/20 rounded-lg p-3">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <span className="text-xs font-semibold text-yellow-400">↓ 15s faster</span>
            </div>
            <p className="text-4xl font-bold text-white">{formatDuration(analytics.averageCompletionTime)}</p>
            <p className="text-sm text-slate-400 mt-2">Avg. Time</p>
          </div>
        </div>
      </div>

      {/* Survey Performance Table */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Survey Performance</h3>
            <div className="text-sm text-slate-400">
              Showing top performing surveys
            </div>
          </div>

          {analytics.surveyPerformance.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-slate-600" />
              <h3 className="mt-2 text-sm font-medium text-white">No survey data yet</h3>
              <p className="mt-1 text-sm text-slate-400">
                Create and publish surveys to see performance analytics.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">SURVEY NAME</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">STATUS</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">RESPONSES</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">RESPONSE RATE</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">CREATED</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.surveyPerformance.map((survey) => (
                    <tr key={survey.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white font-medium">{survey.title}</p>
                          <p className="text-xs text-slate-500">Created {formatDate(survey.createdAt)}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(survey.status)}`}>
                          {survey.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-medium">{survey.responses}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="text-white mr-2">{survey.responseRate}%</span>
                          <div className="w-16 bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-emerald-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(survey.responseRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{formatDate(survey.createdAt)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.location.href = `/faculty/surveys/${survey.id}/responses`}
                            className="text-blue-400 hover:text-blue-300 p-1"
                            title="View Responses"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponseOverview;
