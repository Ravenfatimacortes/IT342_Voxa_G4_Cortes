require('dotenv').config();
const axios = require('axios');

async function testResponseViewingFixed() {
  try {
    console.log('=== Testing Response Viewing (Fixed) ===');
    
    // Login as faculty
    console.log('1. Logging in as faculty...');
    const facultyLogin = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'faculty@voxa.com',
      password: 'Faculty123456'
    });
    
    const facultyToken = facultyLogin.data.token;
    console.log('✅ Faculty login successful');
    
    // Get faculty surveys
    console.log('2. Getting faculty surveys...');
    const surveysResponse = await axios.get('http://localhost:5000/api/v1/admin/surveys', {
      headers: {
        'Authorization': `Bearer ${facultyToken}`
      }
    });
    
    if (surveysResponse.data.surveys.length === 0) {
      console.log('❌ No surveys found');
      return;
    }
    
    const survey = surveysResponse.data.surveys[0];
    console.log('✅ Found survey:', survey.title);
    console.log('Survey ID:', survey.id);
    
    // Get responses for this survey
    console.log('3. Getting survey responses...');
    const responsesResponse = await axios.get(`http://localhost:5000/api/v1/admin/surveys/${survey.id}/responses`, {
      headers: {
        'Authorization': `Bearer ${facultyToken}`
      }
    });
    
    if (responsesResponse.data.responses.length === 0) {
      console.log('❌ No responses found');
      return;
    }
    
    const response = responsesResponse.data.responses[0];
    console.log('✅ Found response:', response.userId.fullName);
    console.log('Response ID:', response.id);
    console.log('User ID:', response.userId._id);
    
    // Get response details
    console.log('4. Getting response details...');
    const detailResponse = await axios.get(`http://localhost:5000/api/v1/admin/surveys/${survey.id}/responses/${response.userId._id}`, {
      headers: {
        'Authorization': `Bearer ${facultyToken}`
      }
    });
    
    console.log('✅ Retrieved response details');
    console.log('Student Name:', detailResponse.data.response.userId.fullName);
    console.log('Number of Questions:', detailResponse.data.response.questions.length);
    console.log('Number of Answers:', detailResponse.data.response.answers.length);
    
    // Display all answers
    console.log('\n📝 Student Answers:');
    detailResponse.data.response.questions.forEach((question, index) => {
      const answer = detailResponse.data.response.answers.find(a => a.questionId === question.id);
      console.log(`\nQ${index + 1}: ${question.questionText}`);
      console.log(`   Type: ${question.type}`);
      console.log(`   A${index + 1}: ${answer?.answer || 'No answer'}`);
    });
    
    console.log('\n✅ Response viewing test successful!');
    console.log('- Faculty can view survey responses');
    console.log('- Student answers are displayed');
    console.log('- All answers visible in response details');
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

testResponseViewingFixed();
