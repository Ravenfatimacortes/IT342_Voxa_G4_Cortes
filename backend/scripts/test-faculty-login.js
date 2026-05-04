require('dotenv').config();
const axios = require('axios');

async function testFacultyLogin() {
  try {
    console.log('=== Testing Faculty Login ===');
    
    // Login as faculty user
    const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'faculty@voxa.com',
      password: 'Faculty123456'
    });
    
    console.log('✅ Faculty login successful');
    console.log('User data:', loginResponse.data.user);
    console.log('Role:', loginResponse.data.user.role);
    console.log('Token:', loginResponse.data.token.substring(0, 50) + '...');
    
    // Test get current user
    const userResponse = await axios.get('http://localhost:5000/api/v1/auth/me', {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('✅ Current user verification:', userResponse.data.user);
    
  } catch (error) {
    console.log('❌ Faculty login error:', error.response?.data || error.message);
  }
}

testFacultyLogin();
