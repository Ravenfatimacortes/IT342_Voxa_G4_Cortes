require('dotenv').config();
const axios = require('axios');

async function testRegistrationAPI() {
  try {
    console.log('=== Testing Registration API ===');
    
    const userData = {
      fullName: 'API Test User',
      email: 'apitest@voxa.com',
      password: 'Test123456',
      role: 'student'
    };
    
    console.log('Sending registration request...');
    
    const response = await axios.post('http://localhost:5000/api/v1/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json'
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
    
    console.log('✅ Registration successful:', response.data);
    
  } catch (error) {
    console.log('❌ Registration failed:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error Data:', error.response?.data);
    console.log('Error Message:', error.message);
    
    if (error.response?.data) {
      console.log('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testRegistrationAPI();
