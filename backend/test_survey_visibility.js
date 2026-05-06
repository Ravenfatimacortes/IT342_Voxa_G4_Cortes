const { supabaseAdmin } = require('./config/database');

async function testSurveyVisibility() {
  try {
    console.log('=== Testing Survey Visibility ===');
    
    // 1. Check all surveys in database
    const { data: allSurveys, error: allError } = await supabaseAdmin
      .from('surveys')
      .select(`
        *,
        users!surveys_created_by_fkey (
          firstName,
          lastName,
          email
        )
      `);
    
    if (allError) {
      console.error('❌ Error fetching all surveys:', allError);
      return;
    }
    
    console.log(`✅ Found ${allSurveys.length} total surveys in database:`);
    allSurveys.forEach((survey, index) => {
      console.log(`  ${index + 1}. "${survey.title}" - Status: ${survey.status} - Created by: ${survey.users?.firstName} ${survey.users?.lastName}`);
    });
    
    // 2. Check only published surveys
    const { data: publishedSurveys, error: publishedError } = await supabaseAdmin
      .from('surveys')
      .select(`
        *,
        users!surveys_created_by_fkey (
          firstName,
          lastName,
          email
        )
      `)
      .eq('status', 'PUBLISHED');
    
    if (publishedError) {
      console.error('❌ Error fetching published surveys:', publishedError);
      return;
    }
    
    console.log(`\n✅ Found ${publishedSurveys.length} published surveys:`);
    publishedSurveys.forEach((survey, index) => {
      console.log(`  ${index + 1}. "${survey.title}" - Status: ${survey.status} - Created by: ${survey.users?.firstName} ${survey.users?.lastName}`);
    });
    
    // 3. Test the exact query used by the surveys endpoint
    console.log('\n=== Testing surveys endpoint query ===');
    const { data: endpointSurveys, error: endpointError } = await supabaseAdmin
      .from('surveys')
      .select(`
        *,
        users!surveys_created_by_fkey (
          firstName,
          lastName,
          email
        )
      `, { count: 'exact' })
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false });
    
    if (endpointError) {
      console.error('❌ Error with endpoint query:', endpointError);
      return;
    }
    
    console.log(`✅ Endpoint query returns ${endpointSurveys.length} surveys`);
    
    if (endpointSurveys.length === 0) {
      console.log('\n❌ No published surveys found! This is why students can\'t see any surveys.');
      console.log('💡 Solution: Create a survey and make sure it has status = "PUBLISHED"');
    } else {
      console.log('\n✅ Published surveys are available for students to see!');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testSurveyVisibility();
