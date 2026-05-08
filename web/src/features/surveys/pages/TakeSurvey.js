import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../contexts/AuthContext';
import { ChevronLeft, ChevronRight, Send, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TakeSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, user } = useAuth();
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
    const isAnswerValid = await trigger(`answers.${question.id}`);
    
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

  const onSubmit = async () => {
    try {
      setSubmitting(true);

      const unansweredRequired = survey.questions.filter(q =>
        q.required && (!answers[q.id] || answers[q.id].toString().trim() === '')
      );
      if (unansweredRequired.length > 0) {
        toast.error(`Please answer all required questions before submitting.`);
        setSubmitting(false);
        return;
      }

      const completionTime = Math.floor((Date.now() - startTime) / 1000);
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      const response = await api.post(`/surveys/${id}/responses`, {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-white">Survey not found</h3>
        <p className="mt-1 text-sm text-slate-400">The survey you're looking for doesn't exist.</p>
      </div>
    );
  }

  const currentQuestionData = survey.questions[currentQuestion];
  const answeredCount = Object.keys(answers).filter(questionId => 
    answers[questionId] && answers[questionId].trim() !== ''
  ).length;
  const progress = (answeredCount / survey.questions.length) * 100;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-sm text-slate-400 hover:text-slate-300 mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
        
        <h1 className="text-2xl font-bold text-white">{survey.title}</h1>
        {survey.description && (
          <p className="mt-1 text-sm text-slate-400">{survey.description}</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">
              {answeredCount} of {survey.questions.length} questions answered
            </span>
            <span className="text-sm text-slate-400">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="card">
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-white">
                {currentQuestionData.questionText}
                {currentQuestionData.required && (
                  <span className="text-red-400 ml-1">*</span>
                )}
              </h3>
            </div>

            {/* Multiple Choice */}
            {currentQuestionData.type === 'MULTIPLE_CHOICE' && (
              <div className="space-y-3">
                {(Array.isArray(currentQuestionData.options) ? currentQuestionData.options : []).map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center p-3 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors"
                  >
                    <input
                      type="radio"
                      {...register(`answers.${currentQuestionData.id}`, {
                        required: currentQuestionData.required ? 'This question is required' : false
                      })}
                      value={option}
                      checked={answers[currentQuestionData.id] === option}
                      onChange={(e) => handleAnswerChange(currentQuestionData.id, e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600"
                    />
                    <span className="ml-3 text-slate-300">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Short Answer */}
            {currentQuestionData.type === 'SHORT_ANSWER' && (
              <div>
                <textarea
                  {...register(`answers.${currentQuestionData.id}`, {
                    required: currentQuestionData.required ? 'This question is required' : false
                  })}
                  value={answers[currentQuestionData.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestionData.id, e.target.value)}
                  rows={4}
                  className="input"
                  placeholder="Type your answer here..."
                />
              </div>
            )}

            {errors.answers?.[currentQuestionData.id] && (
              <p className="text-sm text-red-400">
                {errors.answers[currentQuestionData.id].message}
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
          className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </button>

        <div className="flex space-x-2">
          {currentQuestion < survey.questions.length - 1 ? (
            <button
              type="button"
              onClick={nextQuestion}
              className="btn btn-primary"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary disabled:opacity-50"
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
