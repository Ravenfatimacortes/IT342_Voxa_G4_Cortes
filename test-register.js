// Test registration endpoint
const axios = require('axios');

async function testRegistration() {
  try {
    const response = await axios.post('http://localhost:5000/api/v1/auth/register', {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'Test123456',
      role: 'STUDENT'
    });
    
    console.log('Registration successful:', response.data);
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
  }
}

testRegistration();
