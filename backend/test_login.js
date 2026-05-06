require('dotenv').config();
const axios = require('axios');

async function testLogin() {
  try {
    console.log('=== Testing Login Endpoint ===\n');

    const api = axios.create({
      baseURL: 'http://localhost:5000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Test login with student credentials
    console.log('🔄 Testing student login...');
    
    try {
      const response = await api.post('/auth/login', {
        email: 'ravenfatima.cortes@cit.edu',
        password: 'password123' // You may need to update this
      });

      console.log('✅ Login successful!');
      console.log(`   - Token: ${response.data.token ? 'Received' : 'Missing'}`);
      console.log(`   - User: ${response.data.user?.email}`);
      console.log(`   - Role: ${response.data.user?.role}`);

      if (response.data.token) {
        console.log('\n🔄 Testing surveys with valid token...');
        
        const authenticatedApi = axios.create({
          baseURL: 'http://localhost:5000/api/v1',
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${response.data.token}`
          }
        });

        try {
          const surveysResponse = await authenticatedApi.get('/surveys', {
            params: {
              status: 'available',
              limit: 20
            }
          });

          console.log(`✅ Surveys API successful!`);
          console.log(`   - Surveys returned: ${surveysResponse.data.surveys.length}`);
          
          surveysResponse.data.surveys.forEach((survey, index) => {
            const creator = survey.creator;
            const isFirstFaculty = survey.isFirstFacultySurvey;
            const badge = isFirstFaculty ? '👑' : '📝';
            
            console.log(`   ${index + 1}. ${badge} "${survey.title}" by ${creator?.fullName}`);
          });

          console.log('\n🎉 Full authentication flow working!');
          console.log('💡 If frontend still shows network error, check:');
          console.log('   1. Frontend is using correct login credentials');
          console.log('   2. Token is being stored correctly in localStorage');
          console.log('   3. API calls include Authorization header');
          console.log('   4. No browser console errors');

        } catch (surveysError) {
          console.error('❌ Surveys API Error:', surveysError.message);
          if (surveysError.response) {
            console.error('Response Status:', surveysError.response.status);
            console.error('Response Data:', surveysError.response.data);
          }
        }

      }

    } catch (loginError) {
      console.error('❌ Login Error:', loginError.message);
      if (loginError.response) {
        console.error('Response Status:', loginError.response.status);
        console.error('Response Data:', loginError.response.data);
      }
      
      console.log('\n💡 Try these login credentials:');
      console.log('   - Student: ravenfatima.cortes@cit.edu');
      console.log('   - Faculty: faculty@voxa.com');
      console.log('   - Faculty2: faculty@gmail.com');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testLogin();
