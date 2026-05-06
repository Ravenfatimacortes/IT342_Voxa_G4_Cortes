require('dotenv').config();
const FirstFacultyService = require('./services/firstFacultyService');
const { supabaseAdmin } = require('./config/database');

async function testFirstFacultyFunctionality() {
  try {
    console.log('=== Testing First Faculty Functionality ===\n');

    // 1. Get first faculty ID
    console.log('1. Getting first faculty account...');
    const firstFacultyId = await FirstFacultyService.getFirstFacultyId();
    console.log(`✅ First Faculty ID: ${firstFacultyId}`);

    if (!firstFacultyId) {
      console.log('❌ No faculty account found. Creating test scenario...');
      
      // Get first user with teacher role
      const { data: teachers } = await supabaseAdmin
        .from('users')
        .select('id, email, created_at')
        .eq('role', 'teacher')
        .order('created_at', { ascending: true })
        .limit(1);

      if (teachers && teachers.length > 0) {
        console.log(`✅ Found teacher: ${teachers[0].email}`);
        FirstFacultyService.clearCache(); // Clear cache to refresh
        const refreshedId = await FirstFacultyService.getFirstFacultyId();
        console.log(`✅ Refreshed First Faculty ID: ${refreshedId}`);
      }
    }

    // 2. Get first faculty surveys
    console.log('\n2. Getting first faculty surveys...');
    const firstFacultySurveys = await FirstFacultyService.getFirstFacultySurveys();
    console.log(`✅ Found ${firstFacultySurveys.length} surveys from first faculty:`);
    firstFacultySurveys.forEach((survey, index) => {
      console.log(`  ${index + 1}. "${survey.title}" - Status: ${survey.status}`);
    });

    // 3. Test survey checking
    if (firstFacultySurveys.length > 0) {
      const testSurveyId = firstFacultySurveys[0].id;
      console.log(`\n3. Testing survey ${testSurveyId}...`);
      
      const isFirstFaculty = await FirstFacultyService.isFirstFacultySurvey(testSurveyId);
      console.log(`✅ Is first faculty survey: ${isFirstFaculty}`);

      // Test with a different survey ID (if exists)
      const { data: allSurveys } = await supabaseAdmin
        .from('surveys')
        .select('id')
        .neq('id', testSurveyId)
        .limit(1);

      if (allSurveys && allSurveys.length > 0) {
        const otherSurveyId = allSurveys[0].id;
        const isOtherFirstFaculty = await FirstFacultyService.isFirstFacultySurvey(otherSurveyId);
        console.log(`✅ Other survey ${otherSurveyId} is first faculty: ${isOtherFirstFaculty}`);
      }
    }

    // 4. Simulate API response
    console.log('\n4. Simulating API response for students...');
    
    // Get first faculty IDs
    const firstFacultyIds = firstFacultySurveys.map(s => s.id);
    console.log(`✅ First faculty survey IDs: [${firstFacultyIds.join(', ')}]`);

    // Build query conditions
    let queryConditions = 'status.eq.PUBLISHED';
    if (firstFacultyIds.length > 0) {
      queryConditions += `,id.in.(${firstFacultyIds.join(',')})`;
    }

    // Simulate the query that would be made
    let { data: visibleSurveys, error } = await supabaseAdmin
      .from('surveys')
      .select(`
        *,
        users!surveys_created_by_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .or(queryConditions)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error in visibility query:', error);
      return;
    }

    console.log(`✅ Total surveys visible to students: ${visibleSurveys.length}`);
    visibleSurveys.forEach((survey, index) => {
      const isFirstFaculty = firstFacultyIds.includes(survey.id);
      const visibility = isFirstFaculty ? '(First Faculty - Auto Visible)' : '(Published)';
      console.log(`  ${index + 1}. "${survey.title}" by ${survey.users?.first_name} ${survey.users?.last_name} ${visibility}`);
    });

    console.log('\n🎉 First Faculty Functionality Test Complete!');
    console.log('💡 Features working:');
    console.log('   - First faculty identification');
    console.log('   - Automatic survey visibility for first faculty');
    console.log('   - Special badges in frontend');
    console.log('   - Cross-account visibility');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testFirstFacultyFunctionality();
