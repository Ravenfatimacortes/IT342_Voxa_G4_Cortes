require('dotenv').config();
const { supabaseAdmin } = require('./config/database');

async function testSurveys() {
  try {
    console.log('Testing surveys...');
    
    const { data: surveys, error } = await supabaseAdmin
      .from('surveys')
      .select('*');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log(`Found ${surveys.length} surveys:`);
    surveys.forEach((survey, i) => {
      console.log(`${i + 1}. ${survey.title} - Status: ${survey.status}`);
    });
    
    const { data: published, error: pubError } = await supabaseAdmin
      .from('surveys')
      .select('*')
      .eq('status', 'PUBLISHED');
    
    if (pubError) {
      console.error('Published error:', pubError);
      return;
    }
    
    console.log(`\nFound ${published.length} published surveys`);
    
  } catch (err) {
    console.error('Test error:', err);
  }
}

testSurveys();
