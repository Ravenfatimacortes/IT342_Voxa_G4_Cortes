/**
 * Refactored TakeSurvey Component using Design Patterns
 * 
 * Patterns Applied:
 * - Factory Pattern: For question creation
 * - Facade Pattern: For survey operations
 * - Observer Pattern: For notifications
 * - Strategy Pattern: For validation
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

// Import design patterns
import { 
  QuestionFactory, 
  SurveyFacade, 
  NotificationService,
  SurveyQuestionValidator 
} from '../../patterns';

const TakeSurveyRefactored = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, currentQuestionSet] = useState(0);
  const [questions, questionsSet] = useState([]);
  const [submitting, submittingSet] = useState(false);
  const [startTime] = useState(Date.now());

  // Pattern instances
  const [surveyFacade] = useState(() => new SurveyFacade());
  const [notificationService] = useState(() => NotificationService.getInstance());
  const [validator] = useState(() => new SurveyQuestionValidator());

  // Initialize notification service
  useEffect(() => {
    notificationService.initialize(toast);
  }, [notificationService]);

  // Fetch survey data
  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      
      // Use Facade pattern to get survey
      const result = surveyFacade.getSurvey(id, user?.id);
      
      if (!result.success) {
        notificationService.error('Survey not found');
        navigate('/dashboard');
        return;
      }

      setSurvey(result.survey);
      questionsSet(result.survey.questions);
      
      // Start survey tracking
      surveyFacade.startSurvey(id, user?.id);
      
    } catch (error) {
      console.error('Error fetching survey:', error);
      notificationService.error('Failed to load survey');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Answer management using Factory pattern
  const handleAnswerChange = (questionId, value) => {
    const updatedQuestions = questions.map(question => {
      if (question.id === questionId) {
        const updatedQuestion = QuestionFactory.createQuestion({
          id: question.id,
          text: question.text,
          type: question.type,
          required: question.required,
          ...question
        });
        updatedQuestion.setAnswer(value);
        return updatedQuestion;
      }
      return question;
    });
    
    questionsSet(updatedQuestions);
  };

  // Navigation
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      currentQuestionSet(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      currentQuestionSet(currentQuestion - 1);
    }
  };

  // Validation using Strategy pattern
  const validateCurrentQuestion = () => {
    const currentQ = questions[currentQuestion];
    const answer = currentQ.getAnswer();
    
    const validation = validator.validateQuestion({
      id: currentQ.id,
      text: currentQ.text,
      type: currentQ.type,
      required: currentQ.required,
      options: currentQ.options,
      min: currentQ.min,
      max: currentQ.max
    }, answer);
    
    return validation.isValid;
  };

  // Submit survey using Facade pattern
  const handleSubmit = async () => {
    // Validate all questions using Strategy pattern
    const responses = {};
    const validationErrors = [];

    questions.forEach(question => {
      const answer = question.getAnswer();
      responses[question.id] = answer;
      
      const validation = validator.validateQuestion({
        id: question.id,
        text: question.text,
        type: question.type,
        required: question.required,
        options: question.options,
        min: question.min,
        max: question.max
      }, answer);
      
      if (!validation.isValid) {
        validationErrors.push(...validation.errors);
      }
    });

    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.map(error => error.message).join(', ');
      notificationService.error('Please fix validation errors: ' + errorMessage);
      return;
    }

    submittingSet(true);
    const completionTime = Math.floor((Date.now() - startTime) / 1000);

    try {
      // Use Facade pattern for submission
      const result = await surveyFacade.submitSurvey(id, responses, user?.id);
      
      if (result.success) {
        notificationService.success('Survey completed successfully!');
        navigate('/dashboard', { 
          state: { message: 'Survey completed successfully!' }
        });
      } else {
        notificationService.error(result.error || 'Failed to submit survey');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      notificationService.error('Failed to submit survey');
    } finally {
      submittingSet(false);
    }
  };

  // Render question using Factory pattern
  const renderQuestion = (question) => {
    const answer = question.getAnswer();

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
            value={answer || ''}
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
              {[...Array(question.max - question.min + 1)].map((_, i) => {
                const rating = question.min + i;
                return (
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
                );
              })}
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        );

      default:
        return <div className="text-gray-500">Unsupported question type</div>;
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

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const canProceed = validateCurrentQuestion();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
        <p className="text-gray-600 mt-2">{survey.description}</p>
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Voxa Survey System</span>
          <span>Question {currentQuestion + 1} of {questions.length}</span>
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
            {question.required && <span className="text-red-500 ml-1">*</span>}
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

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || !canProceed}
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
              disabled={!canProceed}
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

export default TakeSurveyRefactored;
