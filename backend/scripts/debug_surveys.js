require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function debugSurveyVisibility() {
  try {
    console.log('=== Debugging Survey Visibility ===\n');

    // 1. Check all users and their roles
    console.log('1. All users in system:');
    const { data: allUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: true });

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    allUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} - Role: ${user.role} - Created: ${user.created_at}`);
    });

    // 2. Check all surveys with creator info
    console.log('\n2. All surveys with creators:');
    const { data: allSurveys, error: surveysError } = await supabaseAdmin
      .from('surveys')
      .select(`
        *,
        users!surveys_created_by_fkey (
          email,
          role,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    if (surveysError) {
      console.error('❌ Error fetching surveys:', surveysError);
      return;
    }

    console.log(`Found ${allSurveys.length} total surveys:`);
    allSurveys.forEach((survey, index) => {
      const creator = survey.users;
      console.log(`  ${index + 1}. "${survey.title}"`);
      console.log(`     - Creator: ${creator?.email} (${creator?.role})`);
      console.log(`     - Status: ${survey.status}`);
      console.log(`     - Created: ${survey.created_at}`);
      console.log(`     - Creator ID: ${survey.created_by}`);
      console.log('');
    });

    // 3. Test what a student would see
    console.log('3. Testing student visibility...');
    
    // Get first faculty
    const firstFaculty = allUsers.find(u => u.role === 'teacher');
    console.log(`First faculty: ${firstFaculty?.email} (${firstFaculty?.id})`);

    // Build the query like the API does
    const firstFacultySurveys = allSurveys.filter(s => s.created_by === firstFaculty?.id);
    const firstFacultyIds = firstFacultySurveys.map(s => s.id);
    
    console.log(`First faculty survey IDs: [${firstFacultyIds.join(', ')}]`);

    // Simulate the API query
    let queryConditions = 'status.eq.PUBLISHED';
    if (firstFacultyIds.length > 0) {
      queryConditions += `,id.in.(${firstFacultyIds.join(',')})`;
    }

    console.log(`Query conditions: ${queryConditions}`);

    let { data: visibleSurveys, error: visibleError } = await supabaseAdmin
      .from('surveys')
      .select(`
        *,
        users!surveys_created_by_fkey (
          email,
          role,
          first_name,
          last_name
        )
      `)
      .or(queryConditions)
      .order('created_at', { ascending: false });

    if (visibleError) {
      console.error('❌ Error in visibility query:', visibleError);
      return;
    }

    console.log(`\n✅ Surveys visible to students: ${visibleSurveys.length}`);
    visibleSurveys.forEach((survey, index) => {
      const isFirstFaculty = firstFacultyIds.includes(survey.id);
      const visibility = isFirstFaculty ? '(First Faculty - Auto)' : '(Published)';
      console.log(`  ${index + 1}. "${survey.title}" by ${survey.users?.email} ${visibility}`);
    });

    // 4. Check for any issues
    console.log('\n4. Issue Analysis:');
    const publishedSurveys = allSurveys.filter(s => s.status === 'PUBLISHED');
    const nonFirstFacultyPublished = publishedSurveys.filter(s => s.created_by !== firstFaculty?.id);
    
    console.log(`Total published surveys: ${publishedSurveys.length}`);
    console.log(`Published by non-first-faculty: ${nonFirstFacultyPublished.length}`);
    
    if (nonFirstFacultyPublished.length > 0) {
      console.log('❌ ISSUE: Published surveys from other faculty should be visible!');
      nonFirstFacultyPublished.forEach((survey, index) => {
        console.log(`  ${index + 1}. "${survey.title}" by ${survey.users?.email}`);
      });
    } else {
      console.log('✅ All published surveys are from first faculty - working correctly');
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugSurveyVisibility();
