require('dotenv').config();
const axios = require('axios');

async function testSurveyDetails() {
  try {
    console.log('=== Testing Survey Details ===');
    
    // Login as faculty
    console.log('1. Logging in as faculty...');
    const facultyLogin = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'faculty@voxa.com',
      password: 'Faculty123456'
    });
    
    const facultyToken = facultyLogin.data.token;
    console.log('✅ Faculty login successful');
    
    // Get faculty surveys
    console.log('2. Getting faculty surveys...');
    const surveysResponse = await axios.get('http://localhost:5000/api/v1/admin/surveys', {
      headers: {
        'Authorization': `Bearer ${facultyToken}`
      }
    });
    
    if (surveysResponse.data.surveys.length === 0) {
      console.log('❌ No surveys found');
      return;
    }
    
    const survey = surveysResponse.data.surveys[0];
    console.log('✅ Found survey:', survey.title);
    console.log('Survey ID:', survey.id);
    
    // Test single survey details endpoint
    console.log('3. Testing survey details endpoint...');
    
    try {
      const detailsResponse = await axios.get(`http://localhost:5000/api/v1/admin/surveys/${survey.id}`, {
        headers: {
          'Authorization': `Bearer ${facultyToken}`
        }
      });
      
      console.log('✅ Survey details retrieved successfully');
      console.log('Survey Title:', detailsResponse.data.survey.title);
      console.log('Survey Status:', detailsResponse.data.survey.status);
      console.log('Number of Questions:', detailsResponse.data.survey.questions.length);
      console.log('Response Count:', detailsResponse.data.survey.responseCount);
      
      // Display questions
      console.log('\n📝 Survey Questions:');
      detailsResponse.data.survey.questions.forEach((question, index) => {
        console.log(`\nQ${index + 1}: ${question.questionText}`);
        console.log(`   Type: ${question.type}`);
        console.log(`   Required: ${question.required}`);
        if (question.options && question.options.length > 0) {
          console.log(`   Options: ${question.options.join(', ')}`);
        }
      });
      
      console.log('\n✅ Survey details test successful!');
      console.log('- Single survey endpoint working');
      console.log('- Questions loaded properly');
      console.log('- Response count calculated');
      
    } catch (error) {
      console.log('❌ Survey details error:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

testSurveyDetails();
