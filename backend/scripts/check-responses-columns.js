require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function checkResponsesColumns() {
  try {
    console.log('=== Checking Responses Table Columns ===');
    
    // Try to select all columns from responses
    const { data: responses, error } = await supabaseAdmin
      .from('responses')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error);
      return;
    }
    
    if (responses.length > 0) {
      console.log('✅ Response columns:');
      Object.keys(responses[0]).forEach(key => {
        console.log(`  - ${key}: ${typeof responses[0][key]}`);
      });
    }
    
    // Try to update with answers
    console.log('\nTesting answers column...');
    const { error: updateError } = await supabaseAdmin
      .from('responses')
      .update({ answers: JSON.stringify([{ test: 'test' }]) })
      .eq('id', 20);
    
    if (updateError) {
      console.log('❌ Cannot update answers column:', updateError);
    } else {
      console.log('✅ Answers column exists and can be updated');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkResponsesColumns();
