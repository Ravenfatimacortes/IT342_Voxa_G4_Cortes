require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function testSimpleSurveyCreation() {
  try {
    console.log('=== Testing Simple Survey Creation ===');
    
    // Create a survey directly
    const { data: survey, error: surveyError } = await supabaseAdmin
      .from('surveys')
      .insert([{
        title: 'Simple Test Survey',
        description: 'A simple test survey',
        created_by: 48, // Faculty user ID
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
    const questionsToInsert = [
      {
        survey_id: survey.id,
        text: 'What is your favorite subject?',
        type: 'text',
        "order": 0,
        options: []
      },
      {
        survey_id: survey.id,
        text: 'How satisfied are you with the course?',
        type: 'multiple',
        "order": 1,
        options: ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied']
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
    console.log('Survey ID:', publishedSurvey.id);
    console.log('Status:', publishedSurvey.status);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testSimpleSurveyCreation();
