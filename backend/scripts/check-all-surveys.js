require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function checkAllSurveys() {
  try {
    console.log('=== Checking All Surveys ===');
    
    // Get all surveys
    const { data: surveys, error } = await supabaseAdmin
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Error:', error);
      return;
    }
    
    console.log('✅ Retrieved surveys');
    console.log('Total surveys:', surveys.length);
    
    if (surveys.length === 0) {
      console.log('No surveys found in database');
      console.log('Creating a test survey...');
      
      // Create a test survey
      const { data: newSurvey, error: createError } = await supabaseAdmin
        .from('surveys')
        .insert([{
          title: 'Test Survey for Dashboard',
          description: 'A test survey to check dashboard functionality',
          status: 'PUBLISHED',
          created_by: 48, // Faculty user ID
          response_count: 0,
          target_audience: 'all',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }])
        .select()
        .single();
      
      if (createError) {
        console.log('❌ Create survey error:', createError);
      } else {
        console.log('✅ Created test survey:', newSurvey.id);
        
        // Create a test question
        const { data: question, error: questionError } = await supabaseAdmin
          .from('questions')
          .insert([{
            survey_id: newSurvey.id,
            text: 'What is your favorite programming language?',
            type: 'text',
            "order": 0,
            options: []
          }])
          .select()
          .single();
        
        if (questionError) {
          console.log('❌ Create question error:', questionError);
        } else {
          console.log('✅ Created test question:', question.id);
        }
      }
    } else {
      surveys.forEach((survey, index) => {
        console.log(`\nSurvey ${index + 1}:`);
        console.log('ID:', survey.id);
        console.log('Title:', survey.title);
        console.log('Status:', survey.status);
        console.log('Created By:', survey.created_by);
        console.log('Created At:', survey.created_at);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAllSurveys();
