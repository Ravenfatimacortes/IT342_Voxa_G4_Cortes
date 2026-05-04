require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function checkSurveyResponses() {
  try {
    console.log('=== Checking Survey Responses ===');
    
    // Get the test survey
    const { data: surveys, error: surveyError } = await supabaseAdmin
      .from('surveys')
      .select('*')
      .eq('created_by', 48)
      .limit(1);
    
    if (surveyError || !surveys || surveys.length === 0) {
      console.log('❌ No surveys found for faculty user');
      return;
    }
    
    const survey = surveys[0];
    console.log('✅ Found survey:', survey.title);
    console.log('Survey ID:', survey.id);
    
    // Get responses for this survey
    const { data: responses, error: responseError } = await supabaseAdmin
      .from('responses')
      .select('*')
      .eq('survey_id', survey.id);
    
    if (responseError) {
      console.log('❌ Error getting responses:', responseError);
      return;
    }
    
    console.log('✅ Found responses:', responses.length);
    
    responses.forEach((response, index) => {
      console.log(`\nResponse ${index + 1}:`);
      console.log('Response ID:', response.id);
      console.log('User ID:', response.user_id);
      console.log('Survey ID:', response.survey_id);
      console.log('Submitted At:', response.submitted_at);
      console.log('Answers:', response.answers);
      console.log('Answers Type:', typeof response.answers);
      
      if (response.answers) {
        try {
          const parsed = JSON.parse(response.answers);
          console.log('Parsed Answers:', parsed);
          console.log('Number of Answers:', parsed.length);
        } catch (e) {
          console.log('❌ Cannot parse answers JSON');
        }
      }
    });
    
    // Create a test response if none exist
    if (responses.length === 0) {
      console.log('\nCreating a test response...');
      
      const { data: testResponse, error: createError } = await supabaseAdmin
        .from('responses')
        .insert([{
          survey_id: survey.id,
          user_id: 49, // Test student user
          completion_time: 120,
          is_completed: true,
          submitted_at: new Date().toISOString(),
          answers: JSON.stringify([
            { questionId: 49, answer: 'JavaScript' }
          ])
        }])
        .select()
        .single();
      
      if (createError) {
        console.log('❌ Error creating test response:', createError);
      } else {
        console.log('✅ Created test response:', testResponse.id);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSurveyResponses();
