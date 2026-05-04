require('dotenv').config();
const axios = require('axios');

async function testRegistration() {
  try {
    console.log('=== Testing Registration ===');
    
    const userData = {
      fullName: 'Test Registration User',
      email: 'testreg@voxa.com',
      password: 'Test123456',
      role: 'student'
    };
    
    console.log('Sending registration data:', userData);
    
    const response = await axios.post('http://localhost:5000/api/v1/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Registration successful:', response.data);
    
    // Test login with new user
    const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'testreg@voxa.com',
      password: 'Test123456'
    });
    
    console.log('✅ Login successful:', loginResponse.data);
    
  } catch (error) {
    console.log('❌ Registration error:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error details:', error.response.data);
    }
  }
}

testRegistration();
