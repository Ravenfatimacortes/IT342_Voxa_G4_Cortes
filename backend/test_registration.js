require('dotenv').config();
const axios = require('axios');

async function testRegistration() {
  try {
    console.log('=== Testing Registration Endpoint ===\n');

    const api = axios.create({
      baseURL: 'http://localhost:5000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Test 1: Student registration
    console.log('1. Testing student registration...');
    
    try {
      const studentResponse = await api.post('/auth/register', {
        email: 'newstudent@test.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'Student',
        role: 'student'
      });
      
      console.log('✅ Student registration successful!');
      console.log(`   - User: ${studentResponse.data.user?.email}`);
      console.log(`   - Role: ${studentResponse.data.user?.role}`);
      console.log(`   - Token: ${studentResponse.data.token ? 'Received' : 'Missing'}`);
      
    } catch (studentError) {
      console.error('❌ Student registration failed:', studentError.message);
      if (studentError.response) {
        console.error('Response Status:', studentError.response.status);
        console.error('Response Data:', studentError.response.data);
      }
    }

    // Test 2: Faculty registration
    console.log('\n2. Testing faculty registration...');
    
    try {
      const facultyResponse = await api.post('/auth/register', {
        email: 'newfaculty@test.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'Faculty',
        role: 'teacher'
      });
      
      console.log('✅ Faculty registration successful!');
      console.log(`   - User: ${facultyResponse.data.user?.email}`);
      console.log(`   - Role: ${facultyResponse.data.user?.role}`);
      console.log(`   - Token: ${facultyResponse.data.token ? 'Received' : 'Missing'}`);
      
    } catch (facultyError) {
      console.error('❌ Faculty registration failed:', facultyError.message);
      if (facultyError.response) {
        console.error('Response Status:', facultyError.response.status);
        console.error('Response Data:', facultyError.response.data);
      }
    }

    // Test 3: Invalid registration (missing fields)
    console.log('\n3. Testing invalid registration (missing fields)...');
    
    try {
      const invalidResponse = await api.post('/auth/register', {
        email: 'invalid@test.com',
        // Missing password, firstName, lastName, role
      });
      
      console.log('❌ Invalid registration should have failed');
      
    } catch (invalidError) {
      console.log('✅ Invalid registration correctly rejected');
      console.log(`   - Error: ${invalidError.response?.data?.error}`);
    }

    // Test 4: Duplicate registration
    console.log('\n4. Testing duplicate registration...');
    
    try {
      const duplicateResponse = await api.post('/auth/register', {
        email: 'ravenfatima.cortes@cit.edu', // Existing user
        password: 'password123',
        firstName: 'Duplicate',
        lastName: 'User',
        role: 'student'
      });
      
      console.log('❌ Duplicate registration should have failed');
      
    } catch (duplicateError) {
      console.log('✅ Duplicate registration correctly rejected');
      console.log(`   - Error: ${duplicateError.response?.data?.error}`);
    }

    console.log('\n🎉 Registration testing complete!');
    console.log('💡 Check the results above to identify the specific issue');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testRegistration();
