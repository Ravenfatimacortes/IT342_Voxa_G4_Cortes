require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function checkQuestionsTable() {
  try {
    console.log('=== Checking Questions Table ===');
    
    // Try to select from questions table to check if it exists
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .select('*')
      .limit(1);

    if (questionsError) {
      console.log('❌ Questions table error:', questionsError);
      console.log('❌ Questions table may not exist or has permission issues');
      return;
    }

    console.log('✅ Questions table exists and is accessible');
    console.log('Sample data:', questions);

    // Try to insert a test question
    console.log('\n🧪 Testing question insertion...');
    const testQuestion = {
      survey_id: 1,
      question_text: 'Test question',
      type: 'SHORT_ANSWER',
      required: true,
      order: 0,
      options: []
    };

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('questions')
      .insert([testQuestion])
      .select();

    if (insertError) {
      console.log('❌ Error inserting test question:', insertError);
      console.log('Details:', insertError.details);
    } else {
      console.log('✅ Test question inserted successfully');
      console.log('Insert data:', insertData);

      // Clean up test question
      await supabaseAdmin
        .from('questions')
        .delete()
        .eq('id', insertData[0].id);
      console.log('🧹 Test question cleaned up');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkQuestionsTable();
