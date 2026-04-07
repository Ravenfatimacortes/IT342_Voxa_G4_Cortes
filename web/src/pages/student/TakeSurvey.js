import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft, ChevronRight, Send, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TakeSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [startTime] = useState(Date.now());
  const [answers, setAnswers] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm();

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      const response = await api.get(`/surveys/${id}`);
      if (response.data.hasResponded) {
        toast.error('You have already responded to this survey');
        navigate('/dashboard');
        return;
      }
      setSurvey(response.data.survey);
    } catch (error) {
      console.error('Error fetching survey:', error);
      toast.error('Failed to load survey');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    setValue(`answers.${questionId}`, value);
  };

  const nextQuestion = async () => {
    const question = survey.questions[currentQuestion];
    const isAnswerValid = await trigger(`answers.${question._id}`);
    
    if (isAnswerValid) {
      if (currentQuestion < survey.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      }
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      const completionTime = Math.floor((Date.now() - startTime) / 1000);
      const formattedAnswers = Object.entries(data.answers || {}).map(([questionId, answer]) => {
        const question = survey.questions.find(q => q._id === questionId);
        return {
          questionId,
          answer
        };
      });

      await api.post(`/surveys/${id}/responses`, {
        answers: formattedAnswers,
        completionTime
      });

      toast.success('Survey submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error(error.response?.data?.error || 'Failed to submit survey');
    } finally {
      setSubmitting(false);
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
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Survey not found</h3>
        <p className="mt-1 text-sm text-gray-500">The survey you're looking for doesn't exist.</p>
      </div>
    );
  }

  const currentQuestionData = survey.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / survey.questions.length) * 100;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
        {survey.description && (
          <p className="mt-1 text-sm text-gray-600">{survey.description}</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestion + 1} of {survey.questions.length}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="card">
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {currentQuestionData.questionText}
                {currentQuestionData.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </h3>
            </div>

            {/* Multiple Choice */}
            {currentQuestionData.type === 'MULTIPLE_CHOICE' && (
              <div className="space-y-3">
                {currentQuestionData.options.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="radio"
                      {...register(`answers.${currentQuestionData._id}`, {
                        required: currentQuestionData.required ? 'This question is required' : false
                      })}
                      value={option}
                      checked={answers[currentQuestionData._id] === option}
                      onChange={(e) => handleAnswerChange(currentQuestionData._id, e.target.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Short Answer */}
            {currentQuestionData.type === 'SHORT_ANSWER' && (
              <div>
                <textarea
                  {...register(`answers.${currentQuestionData._id}`, {
                    required: currentQuestionData.required ? 'This question is required' : false
                  })}
                  value={answers[currentQuestionData._id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestionData._id, e.target.value)}
                  rows={4}
                  className="input"
                  placeholder="Type your answer here..."
                />
              </div>
            )}

            {errors.answers?.[currentQuestionData._id] && (
              <p className="text-sm text-red-600">
                {errors.answers[currentQuestionData._id].message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={previousQuestion}
          disabled={currentQuestion === 0}
          className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </button>

        <div className="flex space-x-2">
          {currentQuestion < survey.questions.length - 1 ? (
            <button
              type="button"
              onClick={nextQuestion}
              className="btn-primary"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary disabled:opacity-50"
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Survey
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default TakeSurvey;
