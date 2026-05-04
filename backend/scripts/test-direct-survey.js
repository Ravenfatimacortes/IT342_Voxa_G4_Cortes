require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function testDirectSurveyCreation() {
  try {
    console.log('=== Testing Direct Survey Creation ===');
    
    // Create a survey directly with supabaseAdmin
    console.log('1. Creating survey...');
    const { data: survey, error: surveyError } = await supabaseAdmin
      .from('surveys')
      .insert([{
        title: 'Direct Test Survey',
        description: 'Created directly with supabaseAdmin',
        created_by: 48,
        status: 'DRAFT'
      }])
      .select()
      .single();

    if (surveyError) {
      console.log('❌ Survey creation error:', surveyError);
      return;
    }

    console.log('✅ Survey created successfully:', survey);

    // Create questions
    console.log('2. Creating questions...');
    const questionsToInsert = [
      {
        survey_id: survey.id,
        text: 'Test question 1',
        type: 'text',
        "order": 0,
        options: []
      },
      {
        survey_id: survey.id,
        text: 'Test question 2 (multiple choice)',
        type: 'multiple',
        "order": 1,
        options: ['Option A', 'Option B', 'Option C']
      }
    ];

    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (questionsError) {
      console.log('❌ Questions creation error:', questionsError);
      return;
    }

    console.log('✅ Questions created successfully:', questions);

    // Publish the survey
    console.log('3. Publishing survey...');
    const { data: publishedSurvey, error: publishError } = await supabaseAdmin
      .from('surveys')
      .update({ status: 'PUBLISHED' })
      .eq('id', survey.id)
      .select()
      .single();

    if (publishError) {
      console.log('❌ Publish error:', publishError);
      return;
    }

    console.log('✅ Survey published successfully:', publishedSurvey);

    // Test the API endpoint
    console.log('4. Testing API endpoint...');
    const axios = require('axios');
    
    // Login to get token
    const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'faculty@voxa.com',
      password: 'Faculty123456'
    });
    
    const token = loginResponse.data.token;
    
    // Test getting surveys
    const surveysResponse = await axios.get('http://localhost:5000/api/v1/admin/surveys', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ API endpoint working');
    console.log('Found surveys:', surveysResponse.data.surveys.length);
    const ourSurvey = surveysResponse.data.surveys.find(s => s.id === survey.id);
    if (ourSurvey) {
      console.log('Our survey found in API:', ourSurvey.title, 'Status:', ourSurvey.status);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testDirectSurveyCreation();
