require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function debugSurveySubmission() {
  try {
    console.log('=== Debugging Survey Submission ===\n');

    // Step 1: Login as student
    console.log('1. Logging in as student...');
    
    const loginApi = axios.create({
      baseURL: 'http://localhost:5000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const loginResponse = await loginApi.post('/auth/login', {
      email: 'ravenfatima.cortes@cit.edu',
      password: 'test123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Get available surveys
    console.log('\n2. Getting available surveys...');
    
    const surveyApi = axios.create({
      baseURL: 'http://localhost:5000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const surveysResponse = await surveyApi.get('/surveys', {
      params: { status: 'available', limit: 20 }
    });

    console.log(`✅ Found ${surveysResponse.data.surveys.length} available surveys`);
    
    // Step 3: Test taking a specific survey
    if (surveysResponse.data.surveys.length > 0) {
      const testSurvey = surveysResponse.data.surveys[0];
      console.log(`\n3. Testing survey: "${testSurvey.title}"`);
      
      try {
        const surveyDetailResponse = await surveyApi.get(`/surveys/${testSurvey.id}`);
        
        console.log('✅ Survey details loaded successfully');
        console.log(`   - Questions: ${surveyDetailResponse.data.survey.questions.length}`);
        
        // Step 4: Test submitting a response with detailed logging
        console.log('\n4. Testing survey submission...');
        
        const answers = {
          answers: [
            {
              questionId: surveyDetailResponse.data.survey.questions[0].id,
              answer: surveyDetailResponse.data.survey.questions[0].type === 'MULTIPLE_CHOICE' 
                ? surveyDetailResponse.data.survey.questions[0].options[0]
                : 'Test answer'
            }
          ],
          completionTime: 30
        };
        
        console.log('Submitting answers:', JSON.stringify(answers, null, 2));
        
        try {
          const submitResponse = await surveyApi.post(`/surveys/${testSurvey.id}/responses`, answers);
          console.log('✅ Survey submission successful!');
          console.log(`   - Response ID: ${submitResponse.data.responseId}`);
        } catch (submitError) {
          console.error('❌ Survey submission error details:');
          console.error('Status:', submitError.response?.status);
          console.error('Status Text:', submitError.response?.statusText);
          console.error('Response:', JSON.stringify(submitError.response?.data, null, 2));
          console.error('Headers:', JSON.stringify(submitError.response?.headers, null, 2));
        }
        
      } catch (surveyError) {
        console.error('❌ Error loading survey details:', surveyError.message);
        if (surveyError.response) {
          console.error('Response:', surveyError.response.data);
        }
      }
    }

  } catch (error) {
    console.error('❌ Debug error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

debugSurveySubmission();
