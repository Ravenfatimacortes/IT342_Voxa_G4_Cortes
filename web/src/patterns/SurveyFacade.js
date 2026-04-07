/**
 * Facade Pattern Implementation for Survey Operations
 * Structural Design Pattern
 */

import { QuestionFactory } from './QuestionFactory.js';
import { NotificationService } from './NotificationService.js';

class SurveyValidator {
  validateSurvey(survey) {
    const errors = [];

    if (!survey.title || survey.title.trim().length === 0) {
      errors.push('Survey title is required');
    }

    if (!survey.questions || survey.questions.length === 0) {
      errors.push('Survey must have at least one question');
    }

    if (survey.questions && survey.questions.length > 50) {
      errors.push('Survey cannot have more than 50 questions');
    }

    // Validate each question
    survey.questions?.forEach((question, index) => {
      try {
        QuestionFactory.createQuestion(question);
      } catch (error) {
        errors.push(`Question ${index + 1}: ${error.message}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateResponses(responses, survey) {
    const errors = [];
    const questions = QuestionFactory.createQuestionsFromData(survey.questions);

    questions.forEach(question => {
      const response = responses[question.id];
      question.setAnswer(response);
      
      if (!question.validate()) {
        errors.push(`Question "${question.text}" is invalid or required`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

class SurveyStorage {
  async saveSurvey(survey) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store in localStorage for demo
      const surveys = JSON.parse(localStorage.getItem('surveys') || '[]');
      surveys.push({
        ...survey,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('surveys', JSON.stringify(surveys));
      
      return { success: true, id: surveys[surveys.length - 1].id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async saveResponse(surveyId, responses, userId) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Store in localStorage for demo
      const allResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
      allResponses.push({
        id: Date.now().toString(),
        surveyId,
        userId,
        responses,
        submittedAt: new Date().toISOString(),
        completionTime: Math.floor(Math.random() * 300) + 60 // 1-5 minutes
      });
      localStorage.setItem('surveyResponses', JSON.stringify(allResponses));
      
      return { success: true, id: allResponses[allResponses.length - 1].id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

class SurveyAnalytics {
  trackSurveyView(surveyId, userId) {
    const views = JSON.parse(localStorage.getItem('surveyViews') || '[]');
    views.push({
      surveyId,
      userId,
      viewedAt: new Date().toISOString()
    });
    localStorage.setItem('surveyViews', JSON.stringify(views));
  }

  trackSurveyStart(surveyId, userId) {
    const starts = JSON.parse(localStorage.getItem('surveyStarts') || '[]');
    starts.push({
      surveyId,
      userId,
      startedAt: new Date().toISOString()
    });
    localStorage.setItem('surveyStarts', JSON.stringify(starts));
  }

  trackSurveyCompletion(surveyId, userId, completionTime) {
    const completions = JSON.parse(localStorage.getItem('surveyCompletions') || '[]');
    completions.push({
      surveyId,
      userId,
      completedAt: new Date().toISOString(),
      completionTime
    });
    localStorage.setItem('surveyCompletions', JSON.stringify(completions));
  }
}

// Survey Facade
class SurveyFacade {
  constructor() {
    this.validator = new SurveyValidator();
    this.storage = new SurveyStorage();
    this.analytics = new SurveyAnalytics();
    this.notificationService = NotificationService.getInstance();
  }

  // Complete survey creation workflow
  async createSurvey(surveyData, userId) {
    try {
      // Step 1: Validate survey
      const validation = this.validator.validateSurvey(surveyData);
      if (!validation.isValid) {
        this.notificationService.error('Survey validation failed', { errors: validation.errors });
        return { success: false, errors: validation.errors };
      }

      // Step 2: Save survey
      const result = await this.storage.saveSurvey(surveyData);
      if (!result.success) {
        this.notificationService.error('Failed to save survey');
        return { success: false, error: result.error };
      }

      // Step 3: Track analytics
      this.analytics.trackSurveyView(result.id, userId);

      // Step 4: Send notification
      this.notificationService.success('Survey created successfully', { surveyId: result.id });

      return { success: true, surveyId: result.id };
    } catch (error) {
      this.notificationService.error('Unexpected error creating survey');
      return { success: false, error: error.message };
    }
  }

  // Complete survey submission workflow
  async submitSurvey(surveyId, responses, userId) {
    try {
      // Step 1: Get survey data (in real app, this would be from API)
      const surveys = JSON.parse(localStorage.getItem('surveys') || '[]');
      const survey = surveys.find(s => s.id === surveyId);
      
      if (!survey) {
        this.notificationService.error('Survey not found');
        return { success: false, error: 'Survey not found' };
      }

      // Step 2: Validate responses
      const validation = this.validator.validateResponses(responses, survey);
      if (!validation.isValid) {
        this.notificationService.error('Please answer all required questions', { errors: validation.errors });
        return { success: false, errors: validation.errors };
      }

      // Step 3: Save responses
      const startTime = Date.now();
      const result = await this.storage.saveResponse(surveyId, responses, userId);
      
      if (!result.success) {
        this.notificationService.error('Failed to submit survey');
        return { success: false, error: result.error };
      }

      // Step 4: Track analytics
      const completionTime = Date.now() - startTime;
      this.analytics.trackSurveyCompletion(surveyId, userId, completionTime);

      // Step 5: Send notification
      this.notificationService.success('Survey submitted successfully', { 
        surveyId, 
        responseId: result.id,
        completionTime 
      });

      return { success: true, responseId: result.id };
    } catch (error) {
      this.notificationService.error('Unexpected error submitting survey');
      return { success: false, error: error.message };
    }
  }

  // Get survey with questions
  getSurvey(surveyId, userId) {
    try {
      const surveys = JSON.parse(localStorage.getItem('surveys') || '[]');
      const survey = surveys.find(s => s.id === surveyId);
      
      if (!survey) {
        return { success: false, error: 'Survey not found' };
      }

      // Track analytics
      this.analytics.trackSurveyView(surveyId, userId);

      // Create question objects
      const questions = QuestionFactory.createQuestionsFromData(survey.questions);

      return { 
        success: true, 
        survey: {
          ...survey,
          questions: questions.map(q => ({ ...q }))
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Start survey
  startSurvey(surveyId, userId) {
    this.analytics.trackSurveyStart(surveyId, userId);
    this.notificationService.info('Survey started', { surveyId });
  }
}

export {
  SurveyFacade,
  SurveyValidator,
  SurveyStorage,
  SurveyAnalytics
};
