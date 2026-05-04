require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function createAnswersTableAlternative() {
  try {
    console.log('=== Creating Answers Table Alternative ===');
    
    // Create a separate table for answers
    const { error: createError } = await supabaseAdmin
      .from('survey_answers')
      .insert([{
        response_id: 1,
        question_id: 1,
        answer_text: 'test'
      }]);
    
    if (createError && !createError.message.includes('relation')) {
      console.log('❌ Could not create survey_answers table:', createError);
      
      // Try to create the table with SQL
      console.log('Trying to create table with SQL...');
      
      // Create a simple table for storing answers
      const { error: sqlError } = await supabaseAdmin.rpc('sql', {
        query: `
          CREATE TABLE IF NOT EXISTS survey_answers (
            id BIGSERIAL PRIMARY KEY,
            response_id BIGINT NOT NULL,
            question_id BIGINT NOT NULL,
            answer_text TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (sqlError) {
        console.log('❌ Could not create table with SQL:', sqlError);
      } else {
        console.log('✅ Created survey_answers table');
      }
    } else {
      console.log('✅ survey_answers table exists');
    }
    
    // Test the table
    const { data, error: testError } = await supabaseAdmin
      .from('survey_answers')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log('❌ Table test failed:', testError);
    } else {
      console.log('✅ survey_answers table is working');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createAnswersTableAlternative();
