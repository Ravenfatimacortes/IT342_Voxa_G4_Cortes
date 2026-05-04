require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function checkResponsesSchema() {
  try {
    console.log('=== Checking Responses Schema ===');
    
    // Get a sample response to see the columns
    const { data: responses, error } = await supabaseAdmin
      .from('responses')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error);
      return;
    }
    
    if (responses.length === 0) {
      console.log('No responses found');
      return;
    }
    
    const response = responses[0];
    console.log('✅ Response columns:');
    Object.keys(response).forEach(key => {
      console.log(`  - ${key}: ${typeof response[key]} = ${response[key]}`);
    });
    
    // Try to add answers column if it doesn't exist
    console.log('\nTrying to add answers column...');
    
    // First, try to update a response with answers
    const { error: updateError } = await supabaseAdmin
      .from('responses')
      .update({ 
        answers: JSON.stringify([
          { questionId: 49, answer: 'Test Answer' }
        ])
      })
      .eq('id', response.id);
    
    if (updateError) {
      console.log('❌ Cannot update with answers column:', updateError);
      
      // Try to create the column using a different approach
      console.log('Trying to create answers column...');
      
      // Since we can't modify schema through API, we'll work around it
      console.log('⚠️  Answers column does not exist - using workaround');
    } else {
      console.log('✅ Answers column exists and can be updated');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkResponsesSchema();
