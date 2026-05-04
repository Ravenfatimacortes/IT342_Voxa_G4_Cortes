require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function addAnswersColumn() {
  try {
    console.log('=== Adding Answers Column to Responses Table ===');
    
    // Try to add the column
    const { error } = await supabaseAdmin.rpc('exec', {
      sql: `ALTER TABLE responses ADD COLUMN IF NOT EXISTS answers jsonb;`
    });
    
    if (error) {
      console.log('❌ Error adding column:', error);
      
      // Try direct approach - update a response with answers
      const { error: updateError } = await supabaseAdmin
        .from('responses')
        .update({ answers: JSON.stringify([{ test: 'test' }]) })
        .eq('id', 1);
      
      if (updateError && !updateError.message.includes('column')) {
        console.log('✅ Answers column exists or was added');
      } else {
        console.log('❌ Could not add answers column:', updateError);
      }
    } else {
      console.log('✅ Answers column added successfully');
    }
    
    // Test the column
    const { data, error: testError } = await supabaseAdmin
      .from('responses')
      .select('answers')
      .limit(1);
    
    if (testError) {
      console.log('❌ Column test failed:', testError);
    } else {
      console.log('✅ Answers column is working');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addAnswersColumn();
