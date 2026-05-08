import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { ChevronLeft, Calendar, Clock, FileText } from 'lucide-react';

const ResponseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResponse();
  }, [id]);

  const fetchResponse = async () => {
    try {
      const response = await api.get(`/users/responses/${id}`);
      console.log('Student response data:', response.data);
      setResponse(response.data.response);
    } catch (error) {
      console.error('Error fetching response:', error);
      if (error.response?.status === 404) {
        setResponse(null);
      } else {
        navigate('/my-responses');
      }
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

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-white">Response not found</h3>
        <p className="mt-1 text-sm text-slate-400">The response you're looking for doesn't exist or you don't have permission to view it.</p>
        <button
          onClick={() => navigate('/my-responses')}
          className="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
        >
          Back to My Responses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/my-responses')}
          className="flex items-center text-sm text-slate-400 hover:text-slate-300 mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to My Responses
        </button>
        
        <h1 className="text-2xl font-bold text-white">Response Details</h1>
        <p className="mt-1 text-sm text-slate-400">
          View your submitted answers for this survey
        </p>
      </div>

      {/* Survey Info */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-medium text-white">
                {response.surveyId?.title || 'Unknown Survey'}
              </h2>
              {response.surveyId?.description && (
                <p className="mt-1 text-sm text-slate-400">
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
                  <span>Completion time: {formatDuration(response.completionTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-white">Your Answers</h2>
        
        {response.answers.map((answer, index) => (
          <div key={answer.questionId || index} className="card">
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-slate-700 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white">
                      {answer.questionText}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Type: {answer.questionType === 'MULTIPLE_CHOICE' ? 'Multiple Choice' : 'Short Answer'}
                    </p>
                  </div>
                </div>
                
                <div className="ml-11">
                  <div className="bg-slate-700 rounded-lg p-4">
                    {answer.questionType === 'MULTIPLE_CHOICE' ? (
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                        <span className="text-white">{answer.answer}</span>
                      </div>
                    ) : (
                      <p className="text-white whitespace-pre-wrap">{answer.answer}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-lg font-medium text-white mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {response.answers.length}
              </div>
              <div className="text-sm text-slate-400">Questions Answered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">
                {formatDuration(response.completionTime)}
              </div>
              <div className="text-sm text-slate-400">Time Taken</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                100%
              </div>
              <div className="text-sm text-slate-400">Completion Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseDetails;
