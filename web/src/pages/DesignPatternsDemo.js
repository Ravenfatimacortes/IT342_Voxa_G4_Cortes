/**
 * Design Patterns Demo Page
 * Shows all implemented patterns in action
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// Import all design patterns
import {
  QuestionFactory,
  NotificationService,
  SurveyFacade,
  SurveyQuestionValidator,
  DatabaseManager,
  SupabaseAdapter,
  LocalStorageAdapter
} from '../patterns';

const DesignPatternsDemo = () => {
  const [logs, setLogs] = useState([]);
  const [testResults, setTestResults] = useState({});

  // Add log to display
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  // Test Factory Pattern
  const testFactoryPattern = () => {
    addLog('🏭 Testing Factory Pattern...', 'info');
    
    try {
      // Create different question types
      const multipleChoice = QuestionFactory.createQuestion({
        id: 'q1',
        text: 'What is your favorite color?',
        type: 'multiple',
        options: ['Red', 'Blue', 'Green'],
        required: true
      });

      const rating = QuestionFactory.createQuestion({
        id: 'q2',
        text: 'Rate our service',
        type: 'rating',
        min: 1,
        max: 5,
        required: true
      });

      const text = QuestionFactory.createQuestion({
        id: 'q3',
        text: 'Any feedback?',
        type: 'text',
        maxLength: 500,
        required: false
      });

      // Test validation
      multipleChoice.setAnswer('Blue');
      rating.setAnswer(4);
      text.setAnswer('Great service!');

      const results = {
        multipleChoice: multipleChoice.validate(),
        rating: rating.validate(),
        text: text.validate()
      };

      addLog('✅ Factory Pattern: All questions created and validated successfully', 'success');
      addLog(`📊 Results: ${JSON.stringify(results)}`, 'info');
      
      setTestResults(prev => ({ ...prev, factory: '✅ Passed' }));
    } catch (error) {
      addLog(`❌ Factory Pattern Error: ${error.message}`, 'error');
      setTestResults(prev => ({ ...prev, factory: '❌ Failed' }));
    }
  };

  // Test Singleton + Observer Pattern
  const testSingletonObserverPattern = () => {
    addLog('🔔 Testing Singleton + Observer Pattern...', 'info');
    
    try {
      // Get singleton instance
      const notificationService1 = NotificationService.getInstance();
      const notificationService2 = NotificationService.getInstance();
      
      // Verify singleton
      const isSingleton = notificationService1 === notificationService2;
      
      if (isSingleton) {
        addLog('✅ Singleton Pattern: Same instance returned', 'success');
        
        // Initialize with toast
        notificationService1.initialize(toast);
        
        // Test notifications (Observer Pattern)
        notificationService1.success('Test notification from observer pattern');
        notificationService1.info('This demonstrates the Observer pattern');
        notificationService1.warning('Multiple observers receive notifications');
        
        setTestResults(prev => ({ ...prev, singletonObserver: '✅ Passed' }));
      } else {
        throw new Error('Singleton pattern failed');
      }
    } catch (error) {
      addLog(`❌ Singleton/Observer Error: ${error.message}`, 'error');
      setTestResults(prev => ({ ...prev, singletonObserver: '❌ Failed' }));
    }
  };

  // Test Facade Pattern
  const testFacadePattern = async () => {
    addLog('🏢 Testing Facade Pattern...', 'info');
    
    try {
      const surveyFacade = new SurveyFacade();
      
      // Create test survey
      const testSurvey = {
        title: 'Test Survey for Facade Pattern',
        description: 'This survey tests the facade pattern',
        questions: [
          {
            id: 'fq1',
            text: 'Test question 1',
            type: 'multiple',
            options: ['Yes', 'No'],
            required: true
          }
        ]
      };

      // Test facade operations
      const createResult = await surveyFacade.createSurvey(testSurvey, 'test-user');
      addLog(`📝 Create Survey: ${createResult.success ? 'Success' : 'Failed'}`, createResult.success ? 'success' : 'error');

      if (createResult.success) {
        // Test submission
        const responses = { fq1: 'Yes' };
        const submitResult = await surveyFacade.submitSurvey(createResult.surveyId, responses, 'test-user');
        addLog(`📤 Submit Survey: ${submitResult.success ? 'Success' : 'Failed'}`, submitResult.success ? 'success' : 'error');
        
        setTestResults(prev => ({ ...prev, facade: submitResult.success ? '✅ Passed' : '❌ Failed' }));
      } else {
        setTestResults(prev => ({ ...prev, facade: '❌ Failed' }));
      }
    } catch (error) {
      addLog(`❌ Facade Pattern Error: ${error.message}`, 'error');
      setTestResults(prev => ({ ...prev, facade: '❌ Failed' }));
    }
  };

  // Test Strategy Pattern
  const testStrategyPattern = () => {
    addLog('🎯 Testing Strategy Pattern...', 'info');
    
    try {
      const validator = new SurveyQuestionValidator();
      
      // Test different validation strategies
      const testCases = [
        {
          question: {
            id: 'email_q',
            text: 'What is your email?',
            type: 'text',
            required: true
          },
          answer: 'test@example.com',
          expected: true
        },
        {
          question: {
            id: 'rating_q',
            text: 'Rate us',
            type: 'rating',
            min: 1,
            max: 5,
            required: true
          },
          answer: 3,
          expected: true
        },
        {
          question: {
            id: 'required_q',
            text: 'Required question',
            type: 'text',
            required: true
          },
          answer: '',
          expected: false
        }
      ];

      let passedTests = 0;
      testCases.forEach((testCase, index) => {
        const result = validator.validateQuestion(testCase.question, testCase.answer);
        const passed = result.isValid === testCase.expected;
        
        addLog(`🧪 Test ${index + 1}: ${passed ? '✅ Passed' : '❌ Failed'} - ${testCase.question.text}`, passed ? 'success' : 'error');
        if (passed) passedTests++;
      });

      const allPassed = passedTests === testCases.length;
      addLog(`📊 Strategy Pattern Results: ${passedTests}/${testCases.length} tests passed`, allPassed ? 'success' : 'error');
      
      setTestResults(prev => ({ ...prev, strategy: allPassed ? '✅ Passed' : '❌ Failed' }));
    } catch (error) {
      addLog(`❌ Strategy Pattern Error: ${error.message}`, 'error');
      setTestResults(prev => ({ ...prev, strategy: '❌ Failed' }));
    }
  };

  // Test Adapter Pattern
  const testAdapterPattern = async () => {
    addLog('🔌 Testing Adapter Pattern...', 'info');
    
    try {
      // Test LocalStorage Adapter
      const localStorageAdapter = new LocalStorageAdapter();
      
      // Test database operations
      const testData = { name: 'Test User', email: 'test@example.com' };
      
      // Create
      const createResult = await localStorageAdapter.create('users', testData);
      addLog(`📝 Create Operation: ${createResult.success ? 'Success' : 'Failed'}`, createResult.success ? 'success' : 'error');

      if (createResult.success) {
        // Read
        const readResult = await localStorageAdapter.find('users', { where: { id: createResult.data.id } });
        addLog(`📖 Read Operation: ${readResult.success ? 'Success' : 'Failed'}`, readResult.success ? 'success' : 'error');

        // Update
        const updateResult = await localStorageAdapter.update('users', createResult.data.id, { name: 'Updated User' });
        addLog(`✏️ Update Operation: ${updateResult.success ? 'Success' : 'Failed'}`, updateResult.success ? 'success' : 'error');

        // Delete
        const deleteResult = await localStorageAdapter.delete('users', createResult.data.id);
        addLog(`🗑️ Delete Operation: ${deleteResult.success ? 'Success' : 'Failed'}`, deleteResult.success ? 'success' : 'error');

        const allOperationsPassed = createResult.success && readResult.success && updateResult.success && deleteResult.success;
        setTestResults(prev => ({ ...prev, adapter: allOperationsPassed ? '✅ Passed' : '❌ Failed' }));
      } else {
        setTestResults(prev => ({ ...prev, adapter: '❌ Failed' }));
      }
    } catch (error) {
      addLog(`❌ Adapter Pattern Error: ${error.message}`, 'error');
      setTestResults(prev => ({ ...prev, adapter: '❌ Failed' }));
    }
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    setTestResults({});
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Design Patterns Demo</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Test Design Patterns</h2>
              
              <div className="space-y-3">
                <button
                  onClick={testFactoryPattern}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🏭 Test Factory Pattern
                </button>
                
                <button
                  onClick={testSingletonObserverPattern}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  🔔 Test Singleton + Observer Pattern
                </button>
                
                <button
                  onClick={testFacadePattern}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  🏢 Test Facade Pattern
                </button>
                
                <button
                  onClick={testStrategyPattern}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  🎯 Test Strategy Pattern
                </button>
                
                <button
                  onClick={testAdapterPattern}
                  className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  🔌 Test Adapter Pattern
                </button>
                
                <button
                  onClick={clearLogs}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  🧹 Clear Logs
                </button>
              </div>
            </div>

            {/* Test Results */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Test Results</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>🏭 Factory Pattern</span>
                  <span className={testResults.factory ? 'text-green-600' : 'text-gray-400'}>
                    {testResults.factory || '⏳ Not Tested'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>🔔 Singleton + Observer</span>
                  <span className={testResults.singletonObserver ? 'text-green-600' : 'text-gray-400'}>
                    {testResults.singletonObserver || '⏳ Not Tested'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>🏢 Facade Pattern</span>
                  <span className={testResults.facade ? 'text-green-600' : 'text-gray-400'}>
                    {testResults.facade || '⏳ Not Tested'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>🎯 Strategy Pattern</span>
                  <span className={testResults.strategy ? 'text-green-600' : 'text-gray-400'}>
                    {testResults.strategy || '⏳ Not Tested'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>🔌 Adapter Pattern</span>
                  <span className={testResults.adapter ? 'text-green-600' : 'text-gray-400'}>
                    {testResults.adapter || '⏳ Not Tested'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>
            
            <div className="h-96 overflow-y-auto bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500">Click the test buttons to see pattern execution logs...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                    <span className={
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'warning' ? 'text-yellow-400' :
                      'text-blue-400'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pattern Information */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pattern Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-blue-50 rounded">
              <h3 className="font-semibold text-blue-900 mb-2">🏭 Factory Pattern</h3>
              <p className="text-blue-700">Creates different question types without specifying exact classes</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded">
              <h3 className="font-semibold text-purple-900 mb-2">🔔 Singleton + Observer</h3>
              <p className="text-purple-700">Single notification service with multiple observers</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded">
              <h3 className="font-semibold text-green-900 mb-2">🏢 Facade Pattern</h3>
              <p className="text-green-700">Simplifies complex survey operations</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded">
              <h3 className="font-semibold text-orange-900 mb-2">🎯 Strategy Pattern</h3>
              <p className="text-orange-700">Encapsulates validation algorithms</p>
            </div>
            
            <div className="p-4 bg-pink-50 rounded">
              <h3 className="font-semibold text-pink-900 mb-2">🔌 Adapter Pattern</h3>
              <p className="text-pink-700">Adapts different database interfaces</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignPatternsDemo;
