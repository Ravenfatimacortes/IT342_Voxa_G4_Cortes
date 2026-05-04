require('dotenv').config();
const axios = require('axios');

async function testSurveyCreation() {
  try {
    console.log('=== Testing Survey Creation ===');
    
    // Login as faculty user
    console.log('1. Logging in as faculty...');
    const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'faculty@voxa.com',
      password: 'Faculty123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Faculty login successful');
    console.log('User role:', loginResponse.data.user.role);
    
    // Test survey creation
    console.log('2. Creating survey...');
    const surveyData = {
      title: 'Test Survey for Faculty',
      description: 'This is a test survey created by faculty',
      questions: [
        {
          questionText: 'What is your favorite subject?',
          type: 'SHORT_ANSWER',
          required: true,
          order: 0,
          options: []
        },
        {
          questionText: 'How satisfied are you with the course?',
          type: 'MULTIPLE_CHOICE',
          required: true,
          order: 1,
          options: ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied']
        }
      ]
    };
    
    const createResponse = await axios.post('http://localhost:5000/api/v1/admin/surveys', surveyData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Survey created successfully');
    console.log('Survey ID:', createResponse.data.survey.id);
    console.log('Survey title:', createResponse.data.survey.title);
    console.log('Number of questions:', createResponse.data.survey.questions.length);
    
    // Test publishing the survey
    console.log('3. Publishing survey...');
    const publishResponse = await axios.post(`http://localhost:5000/api/v1/admin/surveys/${createResponse.data.survey.id}/publish`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Survey published successfully');
    console.log('Survey status:', publishResponse.data.survey.status);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
    console.log('Full error:', error);
    if (error.response?.status === 403) {
      console.log('Access denied - check user permissions');
    }
  }
}

testSurveyCreation();
