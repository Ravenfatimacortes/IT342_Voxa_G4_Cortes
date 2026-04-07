import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
      setResponse(response.data.response);
    } catch (error) {
      console.error('Error fetching response:', error);
      navigate('/my-responses');
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
        <h3 className="text-lg font-medium text-gray-900">Response not found</h3>
        <p className="mt-1 text-sm text-gray-500">The response you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/my-responses')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to My Responses
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900">Response Details</h1>
        <p className="mt-1 text-sm text-gray-600">
          View your submitted answers for this survey
        </p>
      </div>

      {/* Survey Info */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-medium text-gray-900">
                {response.surveyId?.title || 'Unknown Survey'}
              </h2>
              {response.surveyId?.description && (
                <p className="mt-1 text-sm text-gray-600">
                  {response.surveyId.description}
                </p>
              )}
              
              <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
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
        <h2 className="text-lg font-medium text-gray-900">Your Answers</h2>
        
        {response.answers.map((answer, index) => (
          <div key={answer.questionId || index} className="card">
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {answer.questionText}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Type: {answer.questionType === 'MULTIPLE_CHOICE' ? 'Multiple Choice' : 'Short Answer'}
                    </p>
                  </div>
                </div>
                
                <div className="ml-11">
                  <div className="bg-gray-50 rounded-lg p-4">
                    {answer.questionType === 'MULTIPLE_CHOICE' ? (
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-primary-600 rounded-full"></div>
                        <span className="text-gray-900">{answer.answer}</span>
                      </div>
                    ) : (
                      <p className="text-gray-900 whitespace-pre-wrap">{answer.answer}</p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {response.answers.length}
              </div>
              <div className="text-sm text-gray-600">Questions Answered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatDuration(response.completionTime)}
              </div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                100%
              </div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseDetails;
