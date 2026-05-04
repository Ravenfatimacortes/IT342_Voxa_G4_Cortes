require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');

async function testProfileUpdateWithFormData() {
  try {
    console.log('=== Testing Profile Update with FormData ===');
    
    // First login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'teststudent@voxa.com',
      password: 'Test123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test profile update with FormData
    console.log('2. Testing profile update with FormData...');
    const formData = new FormData();
    formData.append('fullName', 'FormData Test User');
    
    const updateResponse = await axios.put('http://localhost:5000/api/v1/users/profile', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
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

testProfileUpdateWithFormData();
