require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function checkResponsesData() {
  try {
    console.log('=== Checking Responses Data ===');
    
    // Get responses with answers
    const { data: responses, error } = await supabaseAdmin
      .from('responses')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ Error:', error);
      return;
    }
    
    console.log('✅ Retrieved responses');
    responses.forEach((response, index) => {
      console.log(`\nResponse ${index + 1}:`);
      console.log('ID:', response.id);
      console.log('Survey ID:', response.survey_id);
      console.log('User ID:', response.user_id);
      console.log('Answers:', response.answers);
      console.log('Answers type:', typeof response.answers);
      
      if (response.answers) {
        try {
          const parsed = JSON.parse(response.answers);
          console.log('Parsed answers:', parsed);
          console.log('Parsed type:', typeof parsed);
        } catch (e) {
          console.log('❌ Cannot parse answers JSON');
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkResponsesData();
