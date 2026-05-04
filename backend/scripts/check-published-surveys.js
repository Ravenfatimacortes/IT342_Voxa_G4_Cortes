require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function checkPublishedSurveys() {
  try {
    console.log('=== Checking Published Surveys ===');
    
    // Check all surveys
    const { data: allSurveys, error: allError } = await supabaseAdmin
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allError) {
      console.log('❌ Error fetching all surveys:', allError);
      return;
    }
    
    console.log('Total surveys in database:', allSurveys.length);
    allSurveys.forEach(survey => {
      console.log(`- ID: ${survey.id}, Title: ${survey.title}, Status: ${survey.status}`);
    });
    
    // Check only published surveys
    const { data: publishedSurveys, error: publishedError } = await supabaseAdmin
      .from('surveys')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false });
    
    if (publishedError) {
      console.log('❌ Error fetching published surveys:', publishedError);
      return;
    }
    
    console.log('\nPublished surveys:', publishedSurveys.length);
    publishedSurveys.forEach(survey => {
      console.log(`- ID: ${survey.id}, Title: ${survey.title}, Status: ${survey.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkPublishedSurveys();
