/**
 * Design Patterns Implementation Index
 * 
 * This file exports all the design patterns implemented for the Voxa project.
 * 
 * Patterns Implemented:
 * 1. Factory Pattern (Creational) - QuestionFactory
 * 2. Singleton Pattern (Creational) - NotificationService, DatabaseManager
 * 3. Adapter Pattern (Structural) - SupabaseAdapter, LocalStorageAdapter
 * 4. Facade Pattern (Structural) - SurveyFacade
 * 5. Observer Pattern (Behavioral) - NotificationService
 * 6. Strategy Pattern (Behavioral) - ValidationStrategy
 */

// Creational Patterns
export {
  Question,
  MultipleChoiceQuestion,
  RatingQuestion,
  TextQuestion,
  CheckboxQuestion,
  QuestionFactory
} from './QuestionFactory.js';

export {
  NotificationService,
  NotificationObserver,
  NotificationSubject,
  ToastNotificationObserver,
  ConsoleNotificationObserver,
  EmailNotificationObserver
} from './NotificationService.js';

export {
  DatabaseManager
} from './SupabaseAdapter.js';

// Structural Patterns
export {
  SupabaseAdapter,
  LocalStorageAdapter,
  DatabaseInterface,
  DatabaseAdapterFactory
} from './SupabaseAdapter.js';

export {
  SurveyFacade,
  SurveyValidator,
  SurveyStorage,
  SurveyAnalytics
} from './SurveyFacade.js';

// Behavioral Patterns
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
} from './ValidationStrategy.js';

// Pattern Categories Documentation
export const DESIGN_PATTERNS = {
  CREATIONAL: {
    'Factory Pattern': {
      class: 'QuestionFactory',
      description: 'Creates different types of survey questions',
      benefits: ['Centralized creation logic', 'Type safety', 'Easy to extend']
    },
    'Singleton Pattern': {
      class: 'NotificationService',
      description: 'Ensures single instance of notification service',
      benefits: ['Global access', 'Resource management', 'State consistency']
    }
  },
  STRUCTURAL: {
    'Adapter Pattern': {
      class: 'SupabaseAdapter',
      description: 'Adapts different database interfaces',
      benefits: ['Interoperability', 'Legacy integration', 'Interface consistency']
    },
    'Facade Pattern': {
      class: 'SurveyFacade',
      description: 'Simplifies complex survey operations',
      benefits: ['Simplified interface', 'Reduced coupling', 'Better organization']
    }
  },
  BEHAVIORAL: {
    'Observer Pattern': {
      class: 'NotificationService',
      description: 'Notifies multiple components of events',
      benefits: ['Loose coupling', 'Dynamic subscription', 'Event-driven']
    },
    'Strategy Pattern': {
      class: 'ValidationStrategy',
      description: 'Encapsulates validation algorithms',
      benefits: ['Algorithm flexibility', 'Easy to extend', 'Clean separation']
    }
  }
};
