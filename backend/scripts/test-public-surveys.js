require('dotenv').config();
const axios = require('axios');

async function testPublicSurveys() {
  try {
    console.log('=== Testing Public Survey Access ===');
    
    // Test as student
    console.log('1. Testing as student...');
    const studentLogin = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'teststudent@voxa.com',
      password: 'Test123456'
    });
    
    const studentToken = studentLogin.data.token;
    
    // Get surveys as student
    const studentSurveys = await axios.get('http://localhost:5000/api/v1/surveys', {
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    
    console.log('✅ Student can access surveys');
    console.log('Number of surveys available to student:', studentSurveys.data.surveys.length);
    
    // Test specific survey
    if (studentSurveys.data.surveys.length > 0) {
      const surveyId = studentSurveys.data.surveys[0].id;
      const surveyDetails = await axios.get(`http://localhost:5000/api/v1/surveys/${surveyId}`, {
        headers: {
          'Authorization': `Bearer ${studentToken}`
        }
      });
      
      console.log('✅ Student can view survey details');
      console.log('Survey title:', surveyDetails.data.survey.title);
      console.log('Number of questions:', surveyDetails.data.survey.questions.length);
    }
    
    // Test as faculty
    console.log('\n2. Testing as faculty...');
    const facultyLogin = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'faculty@voxa.com',
      password: 'Faculty123456'
    });
    
    const facultyToken = facultyLogin.data.token;
    
    // Get surveys as faculty
    const facultySurveys = await axios.get('http://localhost:5000/api/v1/surveys', {
      headers: {
        'Authorization': `Bearer ${facultyToken}`
      }
    });
    
    console.log('✅ Faculty can access surveys');
    console.log('Number of surveys available to faculty:', facultySurveys.data.surveys.length);
    
    // Compare surveys
    console.log('\n3. Comparing survey access...');
    console.log('Student surveys:', studentSurveys.data.surveys.map(s => s.title));
    console.log('Faculty surveys:', facultySurveys.data.surveys.map(s => s.title));
    
    const studentSurveyIds = studentSurveys.data.surveys.map(s => s.id);
    const facultySurveyIds = facultySurveys.data.surveys.map(s => s.id);
    
    if (JSON.stringify(studentSurveyIds.sort()) === JSON.stringify(facultySurveyIds.sort())) {
      console.log('✅ Both students and faculty can see the same published surveys');
    } else {
      console.log('❌ Survey access differs between students and faculty');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

testPublicSurveys();
