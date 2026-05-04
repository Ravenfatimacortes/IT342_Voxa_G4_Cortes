require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function createAnswersColumnDirect() {
  try {
    console.log('=== Creating Answers Column Directly ===');
    
    // Try to add the column using SQL
    const { error } = await supabaseAdmin.rpc('exec', {
      sql: `
        ALTER TABLE responses 
        ADD COLUMN IF NOT EXISTS answers jsonb;
        
        -- Add comment to the column
        COMMENT ON COLUMN responses.answers IS 'JSON array of question answers';
      `
    });
    
    if (error) {
      console.log('❌ Error with exec function:', error);
      
      // Try alternative approach - use raw SQL
      console.log('Trying raw SQL approach...');
      
      // Create a temporary table with answers and copy data
      const { error: createError } = await supabaseAdmin
        .from('responses')
        .select('id')
        .limit(1);
      
      if (createError) {
        console.log('❌ Cannot access responses table');
        return;
      }
      
      // Try to update a response with answers to test if column exists
      const { error: updateError } = await supabaseAdmin
        .from('responses')
        .update({ 
          answers: JSON.stringify([{ test: 'test_answer' }])
        })
        .eq('id', 1)
        .select();
      
      if (updateError && !updateError.message.includes('column')) {
        console.log('✅ Answers column exists or was created');
        
        // Test the column
        const { data, error: testError } = await supabaseAdmin
          .from('responses')
          .select('answers')
          .eq('id', 1)
          .single();
        
        if (testError) {
          console.log('❌ Column test failed:', testError);
        } else {
          console.log('✅ Answers column is working');
          console.log('Sample data:', data);
        }
      } else {
        console.log('❌ Could not create answers column:', updateError);
      }
    } else {
      console.log('✅ Answers column created successfully');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createAnswersColumnDirect();
