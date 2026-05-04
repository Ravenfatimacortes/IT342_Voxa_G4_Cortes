require('dotenv').config();
const axios = require('axios');

async function testProfileAPI() {
  try {
    console.log('=== Testing Profile API ===');
    
    // First login to get token
    const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'testuser@voxa.com',
      password: 'Test123456'
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    
    // Test profile update
    const updateData = {
      fullName: 'API Test User'
    };
    
    const updateResponse = await axios.put('http://localhost:5000/api/v1/users/profile', updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Profile update successful:', updateResponse.data);
    
    // Test get current user
    const userResponse = await axios.get('http://localhost:5000/api/v1/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Current user data:', userResponse.data);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testProfileAPI();
