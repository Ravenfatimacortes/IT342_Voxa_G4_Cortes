import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft, ChevronRight, CheckCircle, Clock } from 'lucide-react';

const TakeSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      const response = await fetch(`/api/v1/surveys/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.hasResponded) {
          navigate('/dashboard', { 
            state: { message: 'You have already completed this survey' }
          });
          return;
        }
        setSurvey(data.survey);
        
        // Initialize answers
        const initialAnswers = {};
        data.survey.questions.forEach(q => {
          initialAnswers[q.id] = q.type === 'multiple' ? '' : '';
        });
        setAnswers(initialAnswers);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching survey:', error);
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
  };

  const handleNext = () => {
    if (currentQuestion < survey.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all answers
    const unansweredQuestions = survey.questions.filter(q => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    const completionTime = Math.floor((Date.now() - startTime) / 1000);

    try {
      const formattedAnswers = survey.questions.map(q => ({
        questionId: q.id,
        answer: answers[q.id]
      }));

      const response = await fetch(`/api/v1/surveys/${id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          answers: formattedAnswers,
          completionTime
        })
      });

      if (response.ok) {
        navigate('/dashboard', { 
          state: { message: 'Survey completed successfully!' }
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit survey');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    const answer = answers[question.id];

    switch (question.type) {
      case 'multiple':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'text':
        return (
          <textarea
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Type your answer here..."
            className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
          />
        );

      case 'rating':
        return (
          <div className="space-y-4">
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleAnswerChange(question.id, rating)}
                  className={`w-12 h-12 rounded-full border-2 font-bold transition ${
                    answer === rating
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        );

      default:
        return null;
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
        <h2 className="text-2xl font-bold text-gray-900">Survey not found</h2>
        <p className="text-gray-600 mt-2">The survey you're looking for doesn't exist.</p>
      </div>
    );
  }

  const question = survey.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / survey.questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
        <p className="text-gray-600 mt-2">{survey.description}</p>
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Created by: {survey.creator?.firstName} {survey.creator?.lastName}</span>
          <span>Question {currentQuestion + 1} of {survey.questions.length}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {question.text}
          </h2>
          {renderQuestion(question)}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{Math.floor((Date.now() - startTime) / 1000)}s</span>
          </div>

          {currentQuestion === survey.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Survey
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!answers[question.id]}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeSurvey;
