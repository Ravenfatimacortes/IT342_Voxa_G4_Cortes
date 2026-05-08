import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Plus, 
  Eye,
  Edit,
  BarChart3,
  Clock,
  CheckCircle,
  Download,
  Inbox,
  Zap,
  Activity,
  Crown
} from 'lucide-react';

const Dashboard = () => {
  const { api } = useAuth();
  const [stats, setStats] = useState({
    totalSurveys: 0,
    publishedSurveys: 0,
    draftSurveys: 0,
    totalResponses: 0,
    newResponses: 0,
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

      const surveys = surveysResponse.data.surveys || [];
      const totalResponses = surveys.reduce((sum, survey) => sum + (survey.responseCount || 0), 0);
      const publishedSurveys = surveys.filter(s => s.status === 'PUBLISHED').length;
      const draftSurveys = surveys.filter(s => s.status === 'DRAFT').length;

      setStats({
        totalSurveys: surveys.length,
        publishedSurveys,
        draftSurveys,
        totalResponses,
        newResponses: 24, // This would come from API in real implementation
        recentActivity: surveysResponse.data.surveys || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalSurveys: 0,
        publishedSurveys: 0,
        draftSurveys: 0,
        totalResponses: 0,
        newResponses: 0,
        recentActivity: []
      });
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
        return 'bg-emerald-500/20 text-emerald-400';
      case 'DRAFT':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'CLOSED':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getStatusBorder = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'border-b-2 border-emerald-500';
      case 'DRAFT':
        return 'border-b-2 border-yellow-500';
      case 'CLOSED':
        return 'border-b-2 border-red-500';
      default:
        return 'border-b-2 border-slate-500';
    }
  };

  const exportAllResults = async () => {
    try {
      // Fetch all surveys with their responses
      const response = await api.get('/admin/surveys', { 
        params: { 
          limit: 1000, // Get all surveys
          includeResponses: true 
        } 
      });

      const surveys = response.data.surveys || [];
      
      // Prepare data for Excel export
      const exportData = [];
      
      for (const survey of surveys) {
        // Get detailed responses for each survey
        try {
          const responsesResponse = await api.get(`/admin/surveys/${survey.id}/responses`, {
            params: { limit: 1000 }
          });
          
          const responses = responsesResponse.data.responses || [];
          
          for (const response of responses) {
            exportData.push({
              'Survey Title': survey.title,
              'Survey Description': survey.description || '',
              'Survey Status': survey.status,
              'Student Name': response.userId?.fullName || 'Unknown',
              'Student Email': response.userId?.email || 'Unknown',
              'Submitted At': new Date(response.submittedAt).toLocaleString(),
              'Completion Time': `${Math.floor(response.completionTime / 60)}m ${response.completionTime % 60}s`,
              'Questions Answered': response.answers?.length || 0,
              'Total Questions': survey.questions?.length || 0
            });
          }
        } catch (error) {
          console.error(`Error fetching responses for survey ${survey.id}:`, error);
        }
      }

      if (exportData.length === 0) {
        alert('No data to export');
        return;
      }

      // Convert to CSV (Excel-compatible)
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in values
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `survey_results_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    }
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
          <h1 className="text-3xl font-bold text-white">Faculty Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your surveys and review student responses.
          </p>
        </div>
        <Link
          to="/faculty/responses"
          className="btn-primary flex items-center px-6 py-2 rounded-md"
        >
          <BarChart3 className="h-5 w-5 mr-2" />
          Response Overview
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Surveys */}
        <div className={`card ${getStatusBorder('PUBLISHED')} hover:border-slate-600 transition-all`}>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-500/20 rounded-lg p-3">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-xs font-semibold text-emerald-400">↑ 2 this month</span>
            </div>
            <p className="text-4xl font-bold text-white">{stats.totalSurveys}</p>
            <p className="text-sm text-slate-400 mt-2">Total Surveys</p>
          </div>
        </div>

        {/* Published */}
        <div className={`card border-b-2 border-emerald-500 hover:border-slate-600 transition-all`}>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-emerald-500/20 rounded-lg p-3">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-emerald-400">↑ Active now</span>
            </div>
            <p className="text-4xl font-bold text-white">{stats.publishedSurveys}</p>
            <p className="text-sm text-slate-400 mt-2">Published</p>
          </div>
        </div>

        {/* Drafts */}
        <div className={`card border-b-2 border-yellow-500 hover:border-slate-600 transition-all`}>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-yellow-500/20 rounded-lg p-3">
                <FileText className="h-6 w-6 text-yellow-400" />
              </div>
              <span className="text-xs font-semibold text-yellow-400">⚠ Unpublished</span>
            </div>
            <p className="text-4xl font-bold text-white">{stats.draftSurveys}</p>
            <p className="text-sm text-slate-400 mt-2">Drafts</p>
          </div>
        </div>

        {/* Total Responses */}
        <div className={`card border-b-2 border-purple-500 hover:border-slate-600 transition-all`}>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-500/20 rounded-lg p-3">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-xs font-semibold text-emerald-400">↑ {stats.newResponses} new</span>
            </div>
            <p className="text-4xl font-bold text-white">{stats.totalResponses}</p>
            <p className="text-sm text-slate-400 mt-2">Total Responses</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Surveys Table */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Recent Surveys</h3>
                <Link
                  to="/faculty/surveys"
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                >
                  View all →
                </Link>
              </div>

              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-slate-600" />
                  <h3 className="mt-2 text-sm font-medium text-white">No surveys yet</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Create your first survey to get started.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">SURVEY</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">STATUS</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">RESPONSES</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">DUE DATE</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentActivity.slice(0, 5).map((survey) => (
                        <tr key={survey.id || survey._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                          <td className="py-3 px-4">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="text-white font-medium">{survey.title || 'Untitled Survey'}</p>
                                {survey.isFirstFacultySurvey && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                    <Crown className="h-3 w-3 mr-1" />
                                    First Faculty
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">{survey.questions ? survey.questions.length : 0} questions · Created {formatDate(survey.createdAt)}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(survey.status)}`}>
                              {survey.status || 'DRAFT'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white">{survey.responseCount || 0}</td>
                          <td className="py-3 px-4 text-slate-400">
                            {survey.dueDate ? formatDate(survey.dueDate) : 'Not set'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/faculty/surveys/${survey.id || survey._id}`}
                                className="text-blue-400 hover:text-blue-300 p-1"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                to={`/faculty/surveys/${survey.id || survey._id}/edit`}
                                className="text-slate-400 hover:text-slate-200 p-1"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
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

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Zap className="h-5 w-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
              </div>

              <div className="space-y-3">
                <Link
                  to="/faculty/surveys/new"
                  className="block p-4 border border-slate-700 rounded-lg hover:bg-slate-700/50 hover:border-blue-500 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 text-2xl">📝</div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-blue-400">Create New Survey</p>
                      <p className="text-xs text-slate-500">Build and publish a new survey</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/faculty/surveys"
                  className="block p-4 border border-slate-700 rounded-lg hover:bg-slate-700/50 hover:border-blue-500 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 text-2xl">📊</div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-blue-400">View All Responses</p>
                      <p className="text-xs text-slate-500">Browse submitted answers</p>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={exportAllResults}
                  className="block p-4 border border-slate-700 rounded-lg hover:bg-slate-700/50 hover:border-blue-500 transition-all group w-full text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 text-2xl">⬇️</div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-blue-400">Export Results</p>
                      <p className="text-xs text-slate-500">Download as Excel</p>
                    </div>
                  </div>
                </button>

                <Link
                  to="/faculty/surveys?status=DRAFT"
                  className="block p-4 border border-slate-700 rounded-lg hover:bg-slate-700/50 hover:border-blue-500 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 text-2xl">📁</div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-blue-400">Manage Drafts</p>
                      <p className="text-xs text-slate-500">{stats.draftSurveys} unpublished surveys</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Activity className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400 mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-medium">{stats.totalResponses}</span> responses
                    </p>
                    <p className="text-xs text-slate-500">received on End-of-Term Evaluation</p>
                    <p className="text-xs text-slate-600 mt-1">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-medium">Campus Facilities</span> survey published
                    </p>
                    <p className="text-xs text-slate-600 mt-1">Yesterday</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
