require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function testSurveyOptions() {
  try {
    console.log('=== Testing Survey Options Parsing ===\n');

    // Create test token
    const token = jwt.sign({
      userId: '82188e0c-729f-4ea1-9fd5-6c4c54323d75',
      email: 'ravenfatima.cortes@cit.edu',
      role: 'student',
      fullName: 'Raven Cortes'
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const api = axios.create({
      baseURL: 'http://localhost:5000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Test getting a survey with multiple choice questions
    console.log('🔄 Testing survey details endpoint...');
    
    try {
      const response = await api.get('/surveys/10'); // Test survey from second faculty
      
      console.log('✅ Survey API Response:');
      console.log(`   - Survey: ${response.data.survey.title}`);
      console.log(`   - Questions: ${response.data.survey.questions.length}`);
      
      response.data.survey.questions.forEach((question, index) => {
        console.log(`   ${index + 1}. Question: ${question.questionText}`);
        console.log(`      - Type: ${question.type}`);
        console.log(`      - Options: ${JSON.stringify(question.options)}`);
        console.log(`      - Options is array: ${Array.isArray(question.options)}`);
        console.log(`      - Options length: ${question.options.length}`);
        console.log('');
      });

      console.log('🎉 Survey options parsing working correctly!');
      
    } catch (error) {
      console.error('❌ Error testing survey:', error.message);
      if (error.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', error.response.data);
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testSurveyOptions();
