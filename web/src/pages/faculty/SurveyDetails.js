import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  BarChart3,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const SurveyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSurveyDetails();
  }, [id]);

  const fetchSurveyDetails = async () => {
    try {
      setLoading(true);
      
      // Get survey details
      const surveyResponse = await api.get(`/admin/surveys/${id}`);
      setSurvey(surveyResponse.data.survey);
      
      // Get survey responses
      const responsesResponse = await api.get(`/admin/surveys/${id}/responses`);
      setResponses(responsesResponse.data.responses || []);
      
    } catch (error) {
      console.error('Error fetching survey details:', error);
      toast.error('Failed to load survey details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-900 text-green-200';
      case 'DRAFT':
        return 'bg-yellow-900 text-yellow-200';
      case 'CLOSED':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-white">Survey not found</h3>
        <p className="mt-1 text-sm text-gray-400">The survey you're looking for doesn't exist.</p>
        <Link
          to="/faculty/surveys"
          className="mt-4 btn-primary px-6 py-2 rounded-md"
        >
          Back to Surveys
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/faculty"
            className="text-gray-400 hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{survey.title}</h1>
            <p className="mt-1 text-sm text-gray-300">{survey.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(survey.status)}`}>
            {survey.status}
          </span>
          <Link
            to={`/faculty/surveys/${id}/edit`}
            className="text-gray-400 hover:text-gray-200"
          >
            <Edit className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-900/50 rounded-lg p-3">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Questions</p>
                <p className="text-2xl font-semibold text-white">
                  {survey.questions ? survey.questions.length : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-900/50 rounded-lg p-3">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Responses</p>
                <p className="text-2xl font-semibold text-white">
                  {responses.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-900/50 rounded-lg p-3">
                <CheckCircle className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Completion Rate</p>
                <p className="text-2xl font-semibold text-white">
                  {responses.length > 0 ? '100%' : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-900/50 rounded-lg p-3">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Created</p>
                <p className="text-sm font-semibold text-white">
                  {formatDate(survey.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'questions'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
            }`}
          >
            Questions ({survey.questions ? survey.questions.length : 0})
          </button>
          <button
            onClick={() => setActiveTab('responses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'responses'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
            }`}
          >
            Responses ({responses.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-medium text-white mb-4">Survey Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Description</h4>
                  <p className="mt-1 text-sm text-white">{survey.description || 'No description provided'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Status</h4>
                  <p className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(survey.status)}`}>
                      {survey.status}
                    </span>
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Created Date</h4>
                  <p className="mt-1 text-sm text-white">{formatDate(survey.createdAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Target Audience</h4>
                  <p className="mt-1 text-sm text-white">{survey.targetAudience || 'All users'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="space-y-4">
          {survey.questions && survey.questions.length > 0 ? (
            survey.questions.map((question, index) => (
              <div key={question.id} className="card">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-primary-900/50 text-primary-400 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="text-lg font-medium text-white">{question.questionText}</h4>
                          <div className="mt-2 flex items-center space-x-4">
                            <span className="text-sm text-gray-400">Type: {question.type}</span>
                            <span className="text-sm text-gray-400">Required: Yes</span>
                          </div>
                        </div>
                      </div>
                      {question.type === 'MULTIPLE_CHOICE' && question.options && question.options.length > 0 && (
                        <div className="mt-4 ml-11">
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-gray-600 rounded"></div>
                                <span className="text-sm text-gray-300">{option}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-white">No questions</h3>
              <p className="mt-1 text-sm text-gray-400">This survey doesn't have any questions yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'responses' && (
        <div className="space-y-4">
          {responses.length > 0 ? (
            responses.map((response) => (
              <div key={response.id} className="card">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-white">{response.userId.fullName}</h4>
                        <p className="text-sm text-gray-400">{response.userId.email}</p>
                        <div className="mt-1 flex items-center space-x-4">
                          <span className="text-xs text-gray-400">
                            Submitted: {formatDate(response.submittedAt)}
                          </span>
                          <span className="text-xs text-gray-400">
                            Time: {response.completionTime}s
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/faculty/surveys/${id}/responses/${response.userId._id}`}
                      className="btn-secondary px-4 py-2 rounded-md text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-white">No responses yet</h3>
              <p className="mt-1 text-sm text-gray-400">This survey hasn't received any responses.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SurveyDetails;
