require('dotenv').config();
const axios = require('axios');

async function testCompleteResponseViewing() {
  try {
    console.log('=== Testing Complete Response Viewing ===');
    
    // Login as faculty
    console.log('1. Logging in as faculty...');
    const facultyLogin = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'faculty@voxa.com',
      password: 'Faculty123456'
    });
    
    const facultyToken = facultyLogin.data.token;
    console.log('✅ Faculty login successful');
    
    // Create a comprehensive survey
    console.log('2. Creating comprehensive survey...');
    const surveyResponse = await axios.post('http://localhost:5000/api/v1/admin/surveys', {
      title: 'Comprehensive Test Survey',
      description: 'A survey with multiple question types to test answer viewing',
      questions: [
        {
          questionText: 'What is your favorite programming language?',
          type: 'SHORT_ANSWER',
          required: true,
          order: 0,
          options: []
        },
        {
          questionText: 'How satisfied are you with this course?',
          type: 'MULTIPLE_CHOICE',
          required: true,
          order: 1,
          options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']
        },
        {
          questionText: 'What topics would you like to learn more about?',
          type: 'SHORT_ANSWER',
          required: true,
          order: 2,
          options: []
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${facultyToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const surveyId = surveyResponse.data.survey.id;
    console.log('✅ Survey created:', surveyId);
    
    // Publish survey
    await axios.post(`http://localhost:5000/api/v1/admin/surveys/${surveyId}/publish`, {}, {
      headers: {
        'Authorization': `Bearer ${facultyToken}`
      }
    });
    console.log('✅ Survey published');
    
    // Create a test response
    console.log('3. Creating test response...');
    
    // Get survey details first
    const surveyDetails = await axios.get(`http://localhost:5000/api/v1/surveys/${surveyId}`, {
      headers: {
        'Authorization': `Bearer ${facultyToken}`
      }
    });
    
    const questions = surveyDetails.data.survey.questions;
    console.log('✅ Retrieved survey questions:', questions.length);
    
    // Create a response in the database (simulating student submission)
    const { data: testResponse } = await axios.post(`http://localhost:5000/api/v1/surveys/${surveyId}/responses`, {
      answers: questions.map((q, index) => ({
        questionId: q.id,
        answer: `Test answer ${index + 1}`
      })),
      completionTime: 180
    }, {
      headers: {
        'Authorization': `Bearer ${facultyToken}`
      }
    });
    
    console.log('✅ Created test response:', testResponse.responseId);
    
    // Get response details
    console.log('4. Testing response details...');
    const detailResponse = await axios.get(`http://localhost:5000/api/v1/admin/surveys/${surveyId}/responses/45`, {
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
    
    console.log('\n✅ Complete response viewing test successful!');
    console.log('- Faculty can view survey responses');
    console.log('- Student answers are displayed');
    console.log('- Multiple question types supported');
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

testCompleteResponseViewing();
