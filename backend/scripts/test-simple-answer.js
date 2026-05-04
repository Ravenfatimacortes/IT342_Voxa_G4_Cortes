require('dotenv').config();
const axios = require('axios');

async function testSimpleAnswer() {
  try {
    console.log('=== Testing Simple Survey Answer ===');
    
    // Get available surveys first
    const facultyLogin = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'faculty@voxa.com',
      password: 'Faculty123456'
    });
    
    const facultyToken = facultyLogin.data.token;
    
    // Create a new survey
    const surveyResponse = await axios.post('http://localhost:5000/api/v1/admin/surveys', {
      title: 'Simple Test Survey for Answering',
      description: 'A simple survey to test answering',
      questions: [
        {
          questionText: 'What is your name?',
          type: 'SHORT_ANSWER',
          required: true,
          order: 0,
          options: []
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${facultyToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const surveyId = surveyResponse.data.survey.id;
    console.log('✅ Created survey:', surveyId);
    
    // Publish the survey
    await axios.post(`http://localhost:5000/api/v1/admin/surveys/${surveyId}/publish`, {}, {
      headers: {
        'Authorization': `Bearer ${facultyToken}`
      }
    });
    
    console.log('✅ Published survey');
    
    // Now test as student
    const studentLogin = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'teststudent@voxa.com',
      password: 'Test123456'
    });
    
    const studentToken = studentLogin.data.token;
    
    // Get the survey
    const surveyDetails = await axios.get(`http://localhost:5000/api/v1/surveys/${surveyId}`, {
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    
    console.log('✅ Student can see survey');
    console.log('Questions:', surveyDetails.data.survey.questions.length);
    
    // Submit answer
    const submitResponse = await axios.post(`http://localhost:5000/api/v1/surveys/${surveyId}/responses`, {
      answers: [{
        questionId: surveyDetails.data.survey.questions[0].id,
        answer: 'Test Student Answer'
      }],
      completionTime: 60
    }, {
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    
    console.log('✅ Answer submitted successfully');
    console.log('Response ID:', submitResponse.data.responseId);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
    if (error.response?.data?.details) {
      console.log('Details:', error.response.data.details);
    }
  }
}

testSimpleAnswer();
