require('dotenv').config();
const axios = require('axios');

async function testUserInfo() {
  try {
    console.log('=== Testing User Information ===');
    
    // Login as faculty
    console.log('1. Logging in as faculty...');
    const facultyLogin = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'faculty@voxa.com',
      password: 'Faculty123456'
    });
    
    const facultyToken = facultyLogin.data.token;
    console.log('✅ Faculty login successful');
    console.log('Token:', facultyToken.substring(0, 50) + '...');
    
    // Test user info endpoint
    console.log('2. Testing user info...');
    
    try {
      const userResponse = await axios.get('http://localhost:5000/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${facultyToken}`
        }
      });
      
      console.log('✅ User info retrieved');
      console.log('User ID:', userResponse.data.user.id);
      console.log('User Role:', userResponse.data.user.role);
      console.log('User Email:', userResponse.data.user.email);
      
    } catch (error) {
      console.log('❌ User info error:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
    }
    
    // Test admin surveys with debug
    console.log('3. Testing admin surveys with debug...');
    
    try {
      const surveysResponse = await axios.get('http://localhost:5000/api/v1/admin/surveys', {
        params: { limit: 5 },
        headers: {
          'Authorization': `Bearer ${facultyToken}`
        }
      });
      
      console.log('✅ Admin surveys working');
      console.log('Surveys found:', surveysResponse.data.surveys.length);
      
    } catch (error) {
      console.log('❌ Admin surveys error:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
      
      if (error.response?.status === 500) {
        console.log('🔍 500 Error Details:');
        console.log('   Error:', error.response.data.error);
        console.log('   Stack:', error.response.data.stack);
      }
    }
    
  } catch (error) {
    console.log('❌ Login error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

testUserInfo();
