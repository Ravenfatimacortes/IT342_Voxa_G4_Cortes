const axios = require('axios');

async function testProfileUpdate() {
  try {
    console.log('Testing profile update...');
    
    // First, let's try to login to get a token
    console.log('Attempting login...');
    const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Login successful:', loginResponse.data);
    const token = loginResponse.data.token;
    
    // Now test profile update
    console.log('Testing profile update...');
    const updateResponse = await axios.put('http://localhost:5000/api/v1/users/profile', 
      { fullName: 'John Updated Doe' },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Profile update successful:', updateResponse.data);
    
  } catch (error) {
    console.error('Error testing profile update:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request:', error.request);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testProfileUpdate();
