require('dotenv').config();
const axios = require('axios');

async function testSurveyPublish() {
  try {
    console.log('=== Testing Survey Creation and Publishing ===');
    
    // Login as faculty user
    console.log('1. Logging in as faculty...');
    const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'faculty@voxa.com',
      password: 'Faculty123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Faculty login successful');
    
    // Create a survey
    console.log('2. Creating survey...');
    const surveyData = {
      title: 'Test Survey for Publishing',
      description: 'This is a test survey to verify publishing works',
      questions: [
        {
          questionText: 'What is your favorite programming language?',
          type: 'SHORT_ANSWER',
          required: true,
          order: 0,
          options: []
        },
        {
          questionText: 'How do you rate this course?',
          type: 'MULTIPLE_CHOICE',
          required: true,
          order: 1,
          options: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']
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
    console.log('Initial status:', createResponse.data.survey.status);
    
    // Publish the survey
    console.log('3. Publishing survey...');
    const publishResponse = await axios.post(`http://localhost:5000/api/v1/admin/surveys/${createResponse.data.survey.id}/publish`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Survey published successfully');
    console.log('Updated status:', publishResponse.data.survey.status);
    console.log('Published at:', publishResponse.data.survey.publishedAt);
    
    // Verify the survey can be retrieved
    console.log('4. Verifying survey retrieval...');
    const getResponse = await axios.get('http://localhost:5000/api/v1/admin/surveys', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Survey retrieval successful');
    console.log('Number of surveys:', getResponse.data.surveys.length);
    const publishedSurvey = getResponse.data.surveys.find(s => s.id === createResponse.data.survey.id);
    if (publishedSurvey) {
      console.log('Published survey found:', publishedSurvey.title, 'Status:', publishedSurvey.status);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
    if (error.response?.data?.details) {
      console.log('Details:', error.response.data.details);
    }
  }
}

testSurveyPublish();
