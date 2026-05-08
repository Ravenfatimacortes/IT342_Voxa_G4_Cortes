// Model index file to handle circular dependencies
const User = require('./User');
const { Survey, Question } = require('./Survey');
const { Response, Answer } = require('./Response');

// Add missing imports to Response model for proper formatting
const formatUser = User.formatUser;
const formatSurvey = Survey.formatSurvey;
const formatQuestion = Question.formatQuestion;

// Patch the Response model to have access to formatters
const originalFormatResponse = require('./Response').Response.formatResponse;
require('./Response').Response.formatResponse = function(responseData) {
  if (!responseData) return null;
  
  const formattedResponse = {
    id: responseData.id,
    surveyId: responseData.survey_id,
    userId: responseData.user_id,
    submittedAt: responseData.submitted_at,
    isCompleted: responseData.is_completed,
    completionTime: responseData.completion_time,
    createdAt: responseData.created_at,
    updatedAt: responseData.updated_at
  };
  
  // Add related data if it exists
  if (responseData.answers) {
    formattedResponse.answers = responseData.answers.map(a => require('./Response').Answer.formatAnswer(a));
  }
  
  if (responseData.users) {
    formattedResponse.user = formatUser(responseData.users);
  }
  
  if (responseData.surveys) {
    formattedResponse.survey = formatSurvey(responseData.surveys);
  }
  
  return formattedResponse;
};

// Patch the Answer model similarly
const originalFormatAnswer = require('./Response').Answer.formatAnswer;
require('./Response').Answer.formatAnswer = function(answerData) {
  if (!answerData) return null;
  
  const formattedAnswer = {
    id: answerData.id,
    responseId: answerData.response_id,
    questionId: answerData.question_id,
    answerText: answerData.answer_text,
    answerOptions: answerData.answer_options,
    rating: answerData.rating,
    createdAt: answerData.created_at,
    updatedAt: answerData.updated_at
  };
  
  // Add related data if it exists
  if (answerData.questions) {
    formattedAnswer.question = formatQuestion(answerData.questions);
  }
  
  if (answerData.responses) {
    formattedAnswer.response = require('./Response').Response.formatResponse(answerData.responses);
  }
  
  return formattedAnswer;
};

module.exports = {
  User,
  Survey,
  Question,
  Response,
  Answer
};
