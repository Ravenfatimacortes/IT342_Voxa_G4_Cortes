require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function checkResponsesTable() {
  try {
    console.log('=== Checking Responses Table ===');
    
    const { data, error } = await supabaseAdmin
      .from('responses')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error);
      return;
    }
    
    console.log('✅ Responses table exists');
    console.log('Sample data:', data);
    
    // Check if we can add answers as JSON to responses
    console.log('\nTrying to store answers in responses table...');
    
    const testResponse = await supabaseAdmin
      .from('responses')
      .insert([{
        survey_id: 1,
        user_id: 1,
        completion_time: 120,
        is_completed: true,
        answers: JSON.stringify([{ question_id: 1, answer: 'test answer' }])
      }])
      .select();
    
    if (testResponse.error) {
      console.log('❌ Cannot store answers in responses:', testResponse.error);
    } else {
      console.log('✅ Can store answers in responses table');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkResponsesTable();
