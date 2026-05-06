require('dotenv').config();
const { supabaseAdmin } = require('./config/database');

async function updateDatabaseFunctions() {
  try {
    console.log('=== Updating database functions ===');
    
    // Update the get_survey_responses_with_answers function
    const { error: functionError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION get_survey_responses_with_answers(survey_id_param BIGINT)
        RETURNS TABLE (
            response_id BIGINT,
            user_id BIGINT,
            submitted_at TIMESTAMPTZ,
            completion_time INTEGER,
            is_completed BOOLEAN,
            answer_id BIGINT,
            question_id BIGINT,
            answer_text TEXT,
            answer_options JSONB,
            rating INTEGER
        ) AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                r.id as response_id,
                r.user_id,
                r.submitted_at,
                r.completion_time,
                r.is_completed,
                a.id as answer_id,
                a.question_id,
                a.answer_text,
                a.answer_options,
                a.rating
            FROM user_responses r
            LEFT JOIN answers a ON r.id = a.response_id
            WHERE r.survey_id = survey_id_param
            ORDER BY r.submitted_at DESC, a.question_id;
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    if (functionError) {
      console.error('❌ Error updating function:', functionError);
      console.log('You may need to manually update the function in your Supabase SQL editor');
    } else {
      console.log('✅ Database function updated successfully');
    }
    
  } catch (error) {
    console.error('❌ Update error:', error);
  }
}

updateDatabaseFunctions();
