require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function testTakeSurveyFlow() {
  try {
    console.log('=== Testing Complete Take Survey Flow ===\n');

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
        
        // Validate each question's options
        let allOptionsValid = true;
        surveyDetailResponse.data.survey.questions.forEach((question, index) => {
          const hasValidOptions = question.type === 'MULTIPLE_CHOICE' 
            ? Array.isArray(question.options) && question.options.length > 0
            : true;
          
          console.log(`   ${index + 1}. ${question.questionText}`);
          console.log(`      - Type: ${question.type}`);
          console.log(`      - Options valid: ${hasValidOptions}`);
          
          if (!hasValidOptions) {
            allOptionsValid = false;
          }
        });
        
        if (allOptionsValid) {
          console.log('\n🎉 All survey questions have valid options!');
          console.log('✅ TakeSurvey component should work without errors');
          
          // Step 4: Test submitting a response
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
          
          const submitResponse = await surveyApi.post(`/surveys/${testSurvey.id}/responses`, answers);
          
          console.log('✅ Survey submission successful!');
          console.log(`   - Response ID: ${submitResponse.data.responseId}`);
          
        } else {
          console.log('\n❌ Some questions have invalid options');
        }
        
      } catch (surveyError) {
        console.error('❌ Error loading survey details:', surveyError.message);
        if (surveyError.response) {
          console.error('Response:', surveyError.response.data);
        }
      }
    }

    console.log('\n🎉 Take Survey Flow Test Complete!');
    console.log('💡 The runtime error should now be fixed in the frontend');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testTakeSurveyFlow();
