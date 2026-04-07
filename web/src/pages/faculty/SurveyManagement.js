import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  FileText,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const SurveyManagement = () => {
  const { api } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchSurveys();
  }, [pagination.current, statusFilter, searchTerm]);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: 10,
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await api.get('/admin/surveys', { params });
      let filteredSurveys = response.data.surveys;
      
      // Apply search filter
      if (searchTerm) {
        filteredSurveys = filteredSurveys.filter(survey =>
          survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (survey.description && survey.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      setSurveys(filteredSurveys);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      toast.error('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (surveyId) => {
    if (!window.confirm('Are you sure you want to delete this survey? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/surveys/${surveyId}`);
      toast.success('Survey deleted successfully');
      fetchSurveys();
    } catch (error) {
      console.error('Error deleting survey:', error);
      toast.error(error.response?.data?.error || 'Failed to delete survey');
    }
  };

  const handlePublish = async (surveyId) => {
    try {
      await api.post(`/admin/surveys/${surveyId}/publish`);
      toast.success('Survey published successfully');
      fetchSurveys();
    } catch (error) {
      console.error('Error publishing survey:', error);
      toast.error(error.response?.data?.error || 'Failed to publish survey');
    }
  };

  const handleUnpublish = async (surveyId) => {
    try {
      await api.post(`/admin/surveys/${surveyId}/unpublish`);
      toast.success('Survey unpublished successfully');
      fetchSurveys();
    } catch (error) {
      console.error('Error unpublishing survey:', error);
      toast.error(error.response?.data?.error || 'Failed to unpublish survey');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  if (loading && surveys.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Survey Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage your surveys
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

      {/* Filters */}
      <div className="card">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search surveys..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Surveys List */}
      <div className="space-y-4">
        {surveys.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || statusFilter !== 'all' ? 'No matching surveys' : 'No surveys yet'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters.'
                : 'Create your first survey to get started.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link
                to="/faculty/surveys/new"
                className="mt-4 inline-flex items-center btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Survey
              </Link>
            )}
          </div>
        ) : (
          surveys.map((survey) => (
            <div key={survey._id} className="card">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {survey.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(survey.status)}`}>
                        {survey.status}
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
                        <Users className="h-4 w-4" />
                        <span>{survey.responseCount} responses</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created {formatDate(survey.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center space-x-2">
                    {survey.status === 'DRAFT' && (
                      <>
                        <Link
                          to={`/faculty/surveys/${survey._id}/edit`}
                          className="btn-outline text-sm"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handlePublish(survey._id)}
                          className="btn-primary text-sm"
                        >
                          Publish
                        </button>
                      </>
                    )}
                    
                    {survey.status === 'PUBLISHED' && (
                      <>
                        <Link
                          to={`/faculty/surveys/${survey._id}/responses`}
                          className="btn-outline text-sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Responses
                        </Link>
                        <button
                          onClick={() => handleUnpublish(survey._id)}
                          className="btn-outline text-sm"
                        >
                          Unpublish
                        </button>
                      </>
                    )}
                    
                    {survey.status === 'DRAFT' && (
                      <button
                        onClick={() => handleDelete(survey._id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.current - 1) * 10) + 1} to{' '}
            {Math.min(pagination.current * 10, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 text-sm rounded-md ${
                  page === pagination.current
                    ? 'bg-primary-600 text-white'
                    : 'btn-outline'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.pages}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyManagement;
