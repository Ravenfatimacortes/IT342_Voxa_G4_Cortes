require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function checkSurveyOwners() {
  try {
    console.log('=== Checking Survey Owners ===');
    
    // Get all surveys with their creators
    const { data: surveys, error } = await supabaseAdmin
      .from('surveys')
      .select(`
        id,
        title,
        status,
        created_by,
        created_at,
        users (
          id,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Error:', error);
      return;
    }
    
    console.log('✅ Retrieved surveys');
    console.log('Total surveys:', surveys.length);
    
    surveys.forEach((survey, index) => {
      console.log(`\nSurvey ${index + 1}:`);
      console.log('ID:', survey.id);
      console.log('Title:', survey.title);
      console.log('Status:', survey.status);
      console.log('Created By:', survey.created_by);
      console.log('Creator Email:', survey.users?.email);
      console.log('Creator Role:', survey.users?.role);
      console.log('Creator ID:', survey.users?.id);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSurveyOwners();
