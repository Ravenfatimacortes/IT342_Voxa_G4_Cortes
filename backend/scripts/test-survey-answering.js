require('dotenv').config();
const axios = require('axios');

async function testSurveyAnswering() {
  try {
    console.log('=== Testing Survey Answering ===');
    
    // Login as student
    console.log('1. Logging in as student...');
    const studentLogin = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'teststudent@voxa.com',
      password: 'Test123456'
    });
    
    const studentToken = studentLogin.data.token;
    console.log('✅ Student login successful');
    
    // Get available surveys
    console.log('2. Getting available surveys...');
    const surveysResponse = await axios.get('http://localhost:5000/api/v1/surveys', {
      headers: {
        'Authorization': `Bearer ${studentToken}`
      },
      params: {
        status: 'available'
      }
    });
    
    console.log('✅ Retrieved surveys');
    console.log('Available surveys:', surveysResponse.data.surveys.length);
    
    if (surveysResponse.data.surveys.length === 0) {
      console.log('❌ No available surveys to test');
      return;
    }
    
    // Get first survey details
    const survey = surveysResponse.data.surveys[0];
    console.log('Survey ID:', survey.id);
    console.log('Survey Title:', survey.title);
    
    // Get survey with questions
    console.log('3. Getting survey details...');
    const surveyDetailsResponse = await axios.get(`http://localhost:5000/api/v1/surveys/${survey.id}`, {
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    
    const surveyDetails = surveyDetailsResponse.data.survey;
    console.log('✅ Retrieved survey details');
    console.log('Number of questions:', surveyDetails.questions.length);
    console.log('Has responded:', surveyDetailsResponse.data.hasResponded);
    
    // Display questions
    surveyDetails.questions.forEach((q, index) => {
      console.log(`\nQuestion ${index + 1}:`);
      console.log(`  Text: ${q.questionText}`);
      console.log(`  Type: ${q.type}`);
      if (q.options && q.options.length > 0) {
        console.log(`  Options: ${q.options.join(', ')}`);
      }
    });
    
    // Submit test answers
    console.log('\n4. Submitting test answers...');
    const testAnswers = surveyDetails.questions.map(q => {
      if (q.type === 'SHORT_ANSWER') {
        return {
          questionId: q.id,
          answer: 'Test answer for ' + q.questionText
        };
      } else if (q.type === 'MULTIPLE_CHOICE') {
        return {
          questionId: q.id,
          answer: q.options[0] // Select first option
        };
      }
    });
    
    const submitResponse = await axios.post(`http://localhost:5000/api/v1/surveys/${survey.id}/responses`, {
      answers: testAnswers,
      completionTime: 120 // 2 minutes
    }, {
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    
    console.log('✅ Survey response submitted successfully');
    console.log('Response ID:', submitResponse.data.responseId);
    
    // Verify completion
    console.log('\n5. Verifying survey completion...');
    const completedSurveysResponse = await axios.get('http://localhost:5000/api/v1/surveys', {
      headers: {
        'Authorization': `Bearer ${studentToken}`
      },
      params: {
        status: 'completed'
      }
    });
    
    console.log('✅ Completed surveys:', completedSurveysResponse.data.surveys.length);
    const completedSurvey = completedSurveysResponse.data.surveys.find(s => s.id === survey.id);
    if (completedSurvey) {
      console.log('✅ Survey marked as completed');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

testSurveyAnswering();
