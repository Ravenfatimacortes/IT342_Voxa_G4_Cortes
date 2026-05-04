require('dotenv').config();
const axios = require('axios');

async function testProfileUpdate() {
  try {
    console.log('=== Testing Profile Update ===');
    
    // First login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'teststudent@voxa.com',
      password: 'Test123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test profile update
    console.log('2. Testing profile update...');
    const updateData = {
      fullName: 'Updated Test User'
    };
    
    const updateResponse = await axios.put('http://localhost:5000/api/v1/users/profile', updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Profile update successful');
    console.log('Response:', updateResponse.data);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.log('Server error details:', error.response.data);
    }
  }
}

testProfileUpdate();
