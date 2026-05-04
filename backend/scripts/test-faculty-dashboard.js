require('dotenv').config();
const axios = require('axios');

async function testFacultyDashboard() {
  try {
    console.log('=== Testing Faculty Dashboard ===');
    
    // Login as faculty
    console.log('1. Logging in as faculty...');
    const facultyLogin = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'faculty@voxa.com',
      password: 'Faculty123456'
    });
    
    const facultyToken = facultyLogin.data.token;
    console.log('✅ Faculty login successful');
    
    // Test faculty dashboard data
    console.log('2. Testing faculty dashboard data...');
    
    try {
      const surveysResponse = await axios.get('http://localhost:5000/api/v1/admin/surveys', { 
        params: { limit: 5 },
        headers: {
          'Authorization': `Bearer ${facultyToken}`
        }
      });
      
      console.log('✅ Faculty surveys endpoint working');
      console.log('Number of surveys:', surveysResponse.data.surveys.length);
      
      // Check survey data structure
      surveysResponse.data.surveys.forEach((survey, index) => {
        console.log(`\nSurvey ${index + 1}:`);
        console.log('ID:', survey.id);
        console.log('Title:', survey.title);
        console.log('Status:', survey.status);
        console.log('Response Count:', survey.responseCount);
        console.log('Questions:', survey.questions ? survey.questions.length : 'undefined');
      });
      
    } catch (error) {
      console.log('❌ Faculty surveys error:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
    }
    
    // Test recent activity endpoint
    console.log('\n3. Testing recent activity endpoint...');
    
    try {
      const recentResponse = await axios.get('http://localhost:5000/api/v1/admin/surveys', { 
        params: { 
          limit: 5,
          sort: '-createdAt'
        },
        headers: {
          'Authorization': `Bearer ${facultyToken}`
        }
      });
      
      console.log('✅ Recent activity endpoint working');
      console.log('Number of recent surveys:', recentResponse.data.surveys.length);
      
    } catch (error) {
      console.log('❌ Recent activity error:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
    }
    
  } catch (error) {
    console.log('❌ Login error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

testFacultyDashboard();
