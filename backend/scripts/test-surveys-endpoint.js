require('dotenv').config();
const axios = require('axios');

async function testSurveysEndpoint() {
  try {
    console.log('=== Testing Surveys Endpoint Directly ===');
    
    // Login as student
    const studentLogin = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'teststudent@voxa.com',
      password: 'Test123456'
    });
    
    const token = studentLogin.data.token;
    console.log('✅ Login successful');
    
    // Test the surveys endpoint with detailed logging
    console.log('\nTesting GET /api/v1/surveys...');
    
    try {
      const response = await axios.get('http://localhost:5000/api/v1/surveys', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Request successful');
      console.log('Status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
    } catch (apiError) {
      console.log('❌ API Error:');
      console.log('Status:', apiError.response?.status);
      console.log('Error data:', apiError.response?.data);
      
      if (apiError.response?.status === 500) {
        console.log('Server error - checking logs...');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSurveysEndpoint();
