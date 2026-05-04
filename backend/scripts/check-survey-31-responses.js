require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function checkSurvey31Responses() {
  try {
    console.log('=== Checking Survey 31 Responses ===');
    
    // Get responses for survey 31
    const { data: responses, error } = await supabaseAdmin
      .from('responses')
      .select('*')
      .eq('survey_id', 31);
    
    if (error) {
      console.log('❌ Error:', error);
      return;
    }
    
    console.log('✅ Retrieved responses for survey 31');
    console.log('Number of responses:', responses.length);
    
    responses.forEach((response, index) => {
      console.log(`\nResponse ${index + 1}:`);
      console.log('ID:', response.id);
      console.log('Survey ID:', response.survey_id);
      console.log('User ID:', response.user_id);
      console.log('Submitted At:', response.submitted_at);
      console.log('Completion Time:', response.completion_time);
      console.log('Answers:', response.answers);
      console.log('Answers type:', typeof response.answers);
      
      if (response.answers) {
        try {
          const parsed = JSON.parse(response.answers);
          console.log('Parsed answers:', parsed);
          console.log('Number of parsed answers:', parsed.length);
          parsed.forEach((answer, i) => {
            console.log(`  Answer ${i + 1}:`, answer);
          });
        } catch (e) {
          console.log('❌ Cannot parse answers JSON:', e.message);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSurvey31Responses();
