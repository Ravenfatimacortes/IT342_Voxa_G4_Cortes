require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function testSurveysAPIEndpoint() {
  try {
    console.log('=== Testing Surveys API Endpoint ===\n');

    // Create test token for a student
    const testUser = {
      userId: 'test-student-id',
      email: 'student@test.com',
      role: 'student',
      fullName: 'Test Student'
    };
    
    const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('✅ Created test student token');

    // Test the actual API endpoint
    const api = axios.create({
      baseURL: 'http://localhost:5000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('🔄 Testing GET /surveys endpoint...');
    
    try {
      const response = await api.get('/surveys', {
        params: {
          status: 'available',
          limit: 20
        }
      });

      console.log(`✅ API Response Status: ${response.status}`);
      console.log(`✅ Surveys returned: ${response.data.surveys.length}`);
      
      console.log('\n📋 Survey List:');
      response.data.surveys.forEach((survey, index) => {
        const creator = survey.creator;
        const isFirstFaculty = survey.isFirstFacultySurvey;
        const badge = isFirstFaculty ? '👑' : '📝';
        
        console.log(`  ${index + 1}. ${badge} "${survey.title}"`);
        console.log(`     - Creator: ${creator?.fullName} (${creator?.email})`);
        console.log(`     - Status: ${survey.status}`);
        console.log(`     - First Faculty: ${isFirstFaculty}`);
        console.log(`     - Description: ${survey.description}`);
        console.log('');
      });

      console.log('🎉 API endpoint working correctly!');
      console.log('💡 If frontend still shows network error, check:');
      console.log('   1. Frontend server running on localhost:3000');
      console.log('   2. Backend server running on localhost:5000');
      console.log('   3. CORS configuration in backend');
      console.log('   4. API configuration in frontend AuthContext');

    } catch (apiError) {
      console.error('❌ API Error:', apiError.message);
      if (apiError.response) {
        console.error('Response Status:', apiError.response.status);
        console.error('Response Data:', apiError.response.data);
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testSurveysAPIEndpoint();
