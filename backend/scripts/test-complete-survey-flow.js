require('dotenv').config();
const axios = require('axios');

async function testCompleteSurveyFlow() {
  try {
    console.log('=== Testing Complete Survey Flow ===');
    
    // 1. Faculty creates survey
    console.log('1. Faculty creating survey...');
    const facultyLogin = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'faculty@voxa.com',
      password: 'Faculty123456'
    });
    
    const facultyToken = facultyLogin.data.token;
    
    const surveyResponse = await axios.post('http://localhost:5000/api/v1/admin/surveys', {
      title: 'Complete Test Survey',
      description: 'A comprehensive survey with multiple question types',
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
          questionText: 'What is your learning goal?',
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
    
    // 2. Publish survey
    await axios.post(`http://localhost:5000/api/v1/admin/surveys/${surveyId}/publish`, {}, {
      headers: {
        'Authorization': `Bearer ${facultyToken}`
      }
    });
    console.log('✅ Survey published');
    
    // 3. Student takes survey
    console.log('2. Student taking survey...');
    const studentLogin = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'teststudent@voxa.com',
      password: 'Test123456'
    });
    
    const studentToken = studentLogin.data.token;
    
    // Get survey details
    const surveyDetails = await axios.get(`http://localhost:5000/api/v1/surveys/${surveyId}`, {
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    
    const questions = surveyDetails.data.survey.questions;
    console.log('✅ Student can see survey');
    console.log('Questions:', questions.length);
    
    // Submit answers
    const studentAnswers = {
      '0': 'JavaScript',
      '1': 'Very Satisfied',
      '2': 'To become a full-stack developer'
    };
    
    const submitResponse = await axios.post(`http://localhost:5000/api/v1/surveys/${surveyId}/responses`, {
      answers: questions.map((q, index) => ({
        questionId: q.id,
        answer: studentAnswers[index]
      })),
      completionTime: 120
    }, {
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    
    console.log('✅ Student submitted survey');
    console.log('Response ID:', submitResponse.data.responseId);
    
    // 4. Faculty views responses
    console.log('3. Faculty viewing responses...');
    const responsesResponse = await axios.get(`http://localhost:5000/api/v1/admin/surveys/${surveyId}/responses`, {
      headers: {
        'Authorization': `Bearer ${facultyToken}`
      }
    });
    
    console.log('✅ Faculty can see responses');
    console.log('Number of responses:', responsesResponse.data.responses.length);
    
    // 5. Faculty views specific response details
    if (responsesResponse.data.responses.length > 0) {
      const response = responsesResponse.data.responses[0];
      console.log('4. Faculty viewing response details...');
      
      const detailResponse = await axios.get(`http://localhost:5000/api/v1/admin/surveys/${surveyId}/responses/${response.userId._id}`, {
        headers: {
          'Authorization': `Bearer ${facultyToken}`
        }
      });
      
      console.log('✅ Faculty can see response details');
      console.log('Student Name:', detailResponse.data.response.userId.fullName);
      console.log('Student Answers:');
      
      detailResponse.data.response.questions.forEach((question, index) => {
        const answer = detailResponse.data.response.answers.find(a => a.questionId === question.id);
        console.log(`Q${index + 1}: ${question.questionText}`);
        console.log(`A${index + 1}: ${answer?.answer || 'No answer'}`);
      });
    }
    
    console.log('\n✅ Complete survey flow working!');
    console.log('- Faculty can create and publish surveys');
    console.log('- Students can take surveys');
    console.log('- Faculty can view responses');
    console.log('- Faculty can see student answers');
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

testCompleteSurveyFlow();
