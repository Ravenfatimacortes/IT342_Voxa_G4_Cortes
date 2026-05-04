require('dotenv').config();
const axios = require('axios');

async function testFacultyResponses() {
  try {
    console.log('=== Testing Faculty Response Viewing ===');
    
    // Login as faculty
    console.log('1. Logging in as faculty...');
    const facultyLogin = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'faculty@voxa.com',
      password: 'Faculty123456'
    });
    
    const facultyToken = facultyLogin.data.token;
    console.log('✅ Faculty login successful');
    
    // Get faculty's surveys
    console.log('2. Getting faculty surveys...');
    const surveysResponse = await axios.get('http://localhost:5000/api/v1/admin/surveys', {
      headers: {
        'Authorization': `Bearer ${facultyToken}`
      }
    });
    
    console.log('✅ Retrieved surveys');
    console.log('Number of surveys:', surveysResponse.data.surveys.length);
    
    // Find a published survey with responses
    const publishedSurveys = surveysResponse.data.surveys.filter(s => s.status === 'PUBLISHED');
    if (publishedSurveys.length === 0) {
      console.log('❌ No published surveys found');
      return;
    }
    
    const survey = publishedSurveys[0];
    console.log('Survey ID:', survey.id);
    console.log('Survey Title:', survey.title);
    console.log('Response Count:', survey.responseCount);
    
    // Get survey responses
    console.log('3. Getting survey responses...');
    const responsesResponse = await axios.get(`http://localhost:5000/api/v1/admin/surveys/${survey.id}/responses`, {
      headers: {
        'Authorization': `Bearer ${facultyToken}`
      }
    });
    
    console.log('✅ Retrieved responses');
    console.log('Number of responses:', responsesResponse.data.responses.length);
    console.log('Survey questions:', responsesResponse.data.survey.questions.length);
    
    // Display response details
    if (responsesResponse.data.responses.length > 0) {
      const response = responsesResponse.data.responses[0];
      console.log('\nSample Response:');
      console.log('Student:', response.userId.fullName);
      console.log('Email:', response.userId.email);
      console.log('Submitted At:', response.submittedAt);
      console.log('Completion Time:', response.completionTime);
      console.log('Number of Answers:', response.answers.length);
      
      // Get specific response details
      console.log('\n4. Getting specific response details...');
      const detailResponse = await axios.get(`http://localhost:5000/api/v1/admin/surveys/${survey.id}/responses/${response.userId._id}`, {
        headers: {
          'Authorization': `Bearer ${facultyToken}`
        }
      });
      
      console.log('✅ Retrieved response details');
      console.log('Response ID:', detailResponse.data.response.id);
      console.log('Questions in detail:', detailResponse.data.response.questions.length);
      console.log('Answers in detail:', detailResponse.data.response.answers.length);
      
      // Display answers
      console.log('\nStudent Answers:');
      detailResponse.data.response.questions.forEach((question, index) => {
        const answer = detailResponse.data.response.answers.find(a => a.questionId === question.id);
        console.log(`Q${index + 1}: ${question.questionText}`);
        console.log(`A${index + 1}: ${answer?.answer || 'No answer'}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

testFacultyResponses();
