/**
 * Factory Pattern Implementation for Question Creation
 * Creational Design Pattern
 */

// Base Question Class
class Question {
  constructor(id, text, type, required = true) {
    this.id = id;
    this.text = text;
    this.type = type;
    this.required = required;
    this.answer = null;
  }

  validate() {
    if (this.required && !this.answer) {
      return false;
    }
    return this.validateAnswer();
  }

  validateAnswer() {
    // Override in subclasses
    return true;
  }

  setAnswer(answer) {
    this.answer = answer;
  }

  getAnswer() {
    return this.answer;
  }
}

// Multiple Choice Question
class MultipleChoiceQuestion extends Question {
  constructor(id, text, options, required = true) {
    super(id, text, 'multiple', required);
    this.options = options;
  }

  validateAnswer() {
    if (!this.required) return true;
    return this.options.includes(this.answer);
  }
}

// Rating Question
class RatingQuestion extends Question {
  constructor(id, text, min = 1, max = 5, required = true) {
    super(id, text, 'rating', required);
    this.min = min;
    this.max = max;
  }

  validateAnswer() {
    if (!this.required) return true;
    const rating = parseInt(this.answer);
    return !isNaN(rating) && rating >= this.min && rating <= this.max;
  }
}

// Text Question
class TextQuestion extends Question {
  constructor(id, text, minLength = 0, maxLength = 1000, required = true) {
    super(id, text, 'text', required);
    this.minLength = minLength;
    this.maxLength = maxLength;
  }

  validateAnswer() {
    if (!this.required) return true;
    const answer = this.answer || '';
    return answer.length >= this.minLength && answer.length <= this.maxLength;
  }
}

// Checkbox Question
class CheckboxQuestion extends Question {
  constructor(id, text, options, required = true) {
    super(id, text, 'checkbox', required);
    this.options = options;
  }

  validateAnswer() {
    if (!this.required) return true;
    if (!Array.isArray(this.answer)) return false;
    return this.answer.length > 0 && this.answer.every(opt => this.options.includes(opt));
  }
}

// Question Factory
class QuestionFactory {
  static createQuestion(questionData) {
    const { id, text, type, required = true, ...options } = questionData;

    switch (type) {
      case 'multiple':
        return new MultipleChoiceQuestion(
          id, 
          text, 
          options.options || [], 
          required
        );

      case 'rating':
        return new RatingQuestion(
          id, 
          text, 
          options.min || 1, 
          options.max || 5, 
          required
        );

      case 'text':
        return new TextQuestion(
          id, 
          text, 
          options.minLength || 0, 
          options.maxLength || 1000, 
          required
        );

      case 'checkbox':
        return new CheckboxQuestion(
          id, 
          text, 
          options.options || [], 
          required
        );

      default:
        throw new Error(`Unsupported question type: ${type}`);
    }
  }

  static createQuestionsFromData(questionsData) {
    return questionsData.map(questionData => 
      this.createQuestion(questionData)
    );
  }
}

export {
  Question,
  MultipleChoiceQuestion,
  RatingQuestion,
  TextQuestion,
  CheckboxQuestion,
  QuestionFactory
};
