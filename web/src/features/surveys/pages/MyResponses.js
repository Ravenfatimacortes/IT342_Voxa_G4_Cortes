import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { FileText, Calendar, Clock, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const MyResponses = () => {
  const { api } = useAuth();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchResponses();
  }, [pagination.current]);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/responses', {
        params: {
          page: pagination.current,
          limit: 10
        }
      });
      console.log('My Responses API response:', response.data);
      setResponses(response.data.responses);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching responses:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to view your responses');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to load your responses');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  if (loading && responses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">My Responses</h1>
        <p className="mt-1 text-sm text-slate-400">
          View your submitted survey responses
        </p>
      </div>

      {/* Stats Card */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-emerald-500/20 rounded-lg p-3">
              <FileText className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Total Responses</p>
              <p className="text-2xl font-semibold text-white">
                {pagination.total}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Responses List */}
      <div className="space-y-4">
        {responses.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-slate-600" />
            <h3 className="mt-2 text-sm font-medium text-white">
              No responses yet
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Complete some surveys to see your responses here.
            </p>
            <Link
              to="/dashboard"
              className="mt-4 inline-flex items-center btn btn-primary"
            >
              Browse Surveys
            </Link>
          </div>
        ) : (
          responses.map((response) => (
            <div key={response._id} className="card hover:border-slate-600 transition-colors">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <h3 className="text-lg font-medium text-white">
                        {response.surveyId?.title || 'Unknown Survey'}
                      </h3>
                    </div>
                    
                    {response.surveyId?.description && (
                      <p className="mt-2 text-sm text-slate-300">
                        {response.surveyId.description}
                      </p>
                    )}
                    
                    <div className="mt-4 flex items-center space-x-6 text-sm text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted {formatDate(response.submittedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Time: {formatDuration(response.completionTime)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>{response.answers.length} questions answered</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    <Link
                      to={`/my-responses/${response._id}`}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
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
          <div className="text-sm text-slate-400">
            Showing {((pagination.current - 1) * 10) + 1} to{' '}
            {Math.min(pagination.current * 10, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 text-sm rounded-md ${
                  page === pagination.current
                    ? 'bg-blue-600 text-white'
                    : 'btn btn-outline'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.pages}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyResponses;
