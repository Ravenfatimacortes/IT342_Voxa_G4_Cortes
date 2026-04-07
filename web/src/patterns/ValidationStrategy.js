/**
 * Strategy Pattern Implementation for Survey Validation
 * Behavioral Design Pattern
 */

// Validation Strategy Interface
class ValidationStrategy {
  validate(value, rules) {
    throw new Error('validate method must be implemented');
  }

  getErrorMessage() {
    throw new Error('getErrorMessage method must be implemented');
  }
}

// Concrete Validation Strategies
class RequiredValidationStrategy extends ValidationStrategy {
  validate(value, rules) {
    const isEmpty = value === null || value === undefined || value === '';
    return !isEmpty;
  }

  getErrorMessage() {
    return 'This field is required';
  }
}

class EmailValidationStrategy extends ValidationStrategy {
  validate(value, rules) {
    if (!value) return true; // Use Required strategy for empty validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  getErrorMessage() {
    return 'Please enter a valid email address';
  }
}

class MinLengthValidationStrategy extends ValidationStrategy {
  validate(value, rules) {
    if (!value) return true;
    return value.length >= (rules.minLength || 1);
  }

  getErrorMessage() {
    return `Minimum length is ${this.rules?.minLength || 1} characters`;
  }
}

class MaxLengthValidationStrategy extends ValidationStrategy {
  validate(value, rules) {
    if (!value) return true;
    return value.length <= (rules.maxLength || 1000);
  }

  getErrorMessage() {
    return `Maximum length is ${this.rules?.maxLength || 1000} characters`;
  }
}

class RangeValidationStrategy extends ValidationStrategy {
  validate(value, rules) {
    if (!value) return true;
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    return num >= (rules.min || 0) && num <= (rules.max || 100);
  }

  getErrorMessage() {
    return `Value must be between ${this.rules?.min || 0} and ${this.rules?.max || 100}`;
  }
}

class OptionsValidationStrategy extends ValidationStrategy {
  validate(value, rules) {
    if (!value) return true;
    if (Array.isArray(value)) {
      return value.every(v => rules.options.includes(v));
    }
    return rules.options.includes(value);
  }

  getErrorMessage() {
    return 'Please select a valid option';
  }
}

// Validation Context
class ValidationContext {
  constructor() {
    this.strategies = new Map();
    this.setupDefaultStrategies();
  }

  setupDefaultStrategies() {
    this.strategies.set('required', new RequiredValidationStrategy());
    this.strategies.set('email', new EmailValidationStrategy());
    this.strategies.set('minLength', new MinLengthValidationStrategy());
    this.strategies.set('maxLength', new MaxLengthValidationStrategy());
    this.strategies.set('range', new RangeValidationStrategy());
    this.strategies.set('options', new OptionsValidationStrategy());
  }

  addStrategy(name, strategy) {
    this.strategies.set(name, strategy);
  }

  validate(value, validationRules) {
    const errors = [];

    for (const rule of validationRules) {
      const strategy = this.strategies.get(rule.type);
      if (!strategy) {
        console.warn(`Unknown validation strategy: ${rule.type}`);
        continue;
      }

      strategy.rules = rule; // Pass rules to strategy
      const isValid = strategy.validate(value, rule);
      
      if (!isValid) {
        errors.push({
          field: rule.field || 'unknown',
          message: strategy.getErrorMessage(),
          type: rule.type
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Survey Question Validator
class SurveyQuestionValidator {
  constructor() {
    this.validationContext = new ValidationContext();
  }

  validateQuestion(question, answer) {
    const validationRules = this.buildValidationRules(question);
    return this.validationContext.validate(answer, validationRules);
  }

  buildValidationRules(question) {
    const rules = [];

    // Required validation
    if (question.required) {
      rules.push({
        type: 'required',
        field: question.id
      });
    }

    // Type-specific validations
    switch (question.type) {
      case 'email':
        rules.push({
          type: 'email',
          field: question.id
        });
        break;

      case 'text':
        if (question.minLength) {
          rules.push({
            type: 'minLength',
            field: question.id,
            minLength: question.minLength
          });
        }
        if (question.maxLength) {
          rules.push({
            type: 'maxLength',
            field: question.id,
            maxLength: question.maxLength
          });
        }
        break;

      case 'rating':
        rules.push({
          type: 'range',
          field: question.id,
          min: question.min || 1,
          max: question.max || 5
        });
        break;

      case 'multiple':
      case 'checkbox':
        rules.push({
          type: 'options',
          field: question.id,
          options: question.options || []
        });
        break;
    }

    return rules;
  }

  validateSurvey(survey, responses) {
    const allErrors = [];
    let isValid = true;

    for (const question of survey.questions) {
      const answer = responses[question.id];
      const result = this.validateQuestion(question, answer);
      
      if (!result.isValid) {
        isValid = false;
        allErrors.push({
          questionId: question.id,
          questionText: question.text,
          errors: result.errors
        });
      }
    }

    return {
      isValid,
      errors: allErrors
    };
  }
}

// Factory for creating validators
class ValidatorFactory {
  static createSurveyValidator() {
    return new SurveyQuestionValidator();
  }

  static createCustomValidator(strategies) {
    const context = new ValidationContext();
    
    // Add custom strategies
    Object.entries(strategies).forEach(([name, strategy]) => {
      context.addStrategy(name, strategy);
    });
    
    return context;
  }
}

export {
  ValidationStrategy,
  RequiredValidationStrategy,
  EmailValidationStrategy,
  MinLengthValidationStrategy,
  MaxLengthValidationStrategy,
  RangeValidationStrategy,
  OptionsValidationStrategy,
  ValidationContext,
  SurveyQuestionValidator,
  ValidatorFactory
};
