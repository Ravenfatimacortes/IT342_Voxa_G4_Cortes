require('dotenv').config();
const axios = require('axios');

async function testAllEndpoints() {
  try {
    console.log('=== Testing All Endpoints ===');
    
    // Login as faculty
    console.log('1. Logging in as faculty...');
    const facultyLogin = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'faculty@voxa.com',
      password: 'Faculty123456'
    });
    
    const facultyToken = facultyLogin.data.token;
    console.log('✅ Faculty login successful');
    
    // Test endpoints
    const endpoints = [
      {
        name: 'Admin Surveys (default)',
        url: '/admin/surveys',
        params: {}
      },
      {
        name: 'Admin Surveys (with limit)',
        url: '/admin/surveys',
        params: { limit: 5 }
      },
      {
        name: 'Admin Surveys (with sort)',
        url: '/admin/surveys',
        params: { limit: 5, sort: '-createdAt' }
      },
      {
        name: 'Admin Surveys (with invalid sort)',
        url: '/admin/surveys',
        params: { limit: 5, sort: 'invalid' }
      }
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n2. Testing ${endpoint.name}...`);
      
      try {
        const response = await axios.get(`http://localhost:5000/api/v1${endpoint.url}`, {
          params: endpoint.params,
          headers: {
            'Authorization': `Bearer ${facultyToken}`
          }
        });
        
        console.log(`✅ ${endpoint.name} - SUCCESS`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Data: ${response.data.surveys ? response.data.surveys.length : 0} surveys`);
        
      } catch (error) {
        console.log(`❌ ${endpoint.name} - ERROR`);
        console.log(`   Status: ${error.response?.status}`);
        console.log(`   Error: ${error.response?.data?.error || error.message}`);
        
        if (error.response?.status === 500) {
          console.log('🔍 Found 500 error!');
          console.log('   Details:', error.response?.data);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Login error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

testAllEndpoints();
