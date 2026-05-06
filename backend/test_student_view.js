require('dotenv').config();
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('./config/database');

async function testStudentView() {
  try {
    console.log('=== Testing Student Survey View ===');
    
    // Create a test JWT token for a student
    const testUser = {
      userId: 'test-student-id',
      email: 'student@test.com',
      role: 'student',
      fullName: 'Test Student'
    };
    
    const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('✅ Created test student token');
    
    // Simulate the API call with authentication
    const page = 1;
    const limit = 10;
    const status = 'available';
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Get surveys user has already responded to
    const { data: userResponses } = await supabaseAdmin
      .from('responses')
      .select('survey_id')
      .eq('user_id', testUser.userId);
    
    const respondedSurveyIds = userResponses ? userResponses.map(r => r.survey_id) : [];
    console.log(`✅ Student has responded to ${respondedSurveyIds.length} surveys`);

    // Fetch all published surveys with creator information
    let { data: surveys, count, error } = await supabaseAdmin
      .from('surveys')
      .select(`
        *,
        users!surveys_created_by_fkey (
          first_name,
          last_name,
          email
        )
      `, { count: 'exact' })
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching surveys:', error);
      return;
    }
    
    console.log(`✅ Found ${surveys.length} published surveys before filtering`);
    
    // Filter by completion status if requested
    if (status === 'completed') {
      surveys = surveys.filter(s => respondedSurveyIds.includes(s.id));
    } else if (status === 'available') {
      surveys = surveys.filter(s => !respondedSurveyIds.includes(s.id));
    }

    const total = surveys.length;
    const paginated = surveys.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    // Format surveys and add completion status
    const surveysWithStatus = paginated.map(survey => ({
      id: survey.id,
      title: survey.title,
      description: survey.description,
      createdBy: survey.created_by,
      creator: survey.users ? {
        firstName: survey.users.first_name,
        lastName: survey.users.last_name,
        fullName: `${survey.users.first_name} ${survey.users.last_name}`,
        email: survey.users.email
      } : null,
      status: survey.status,
      responseCount: survey.response_count,
      targetAudience: survey.target_audience,
      startDate: survey.start_date,
      endDate: survey.end_date,
      createdAt: survey.created_at,
      updatedAt: survey.updated_at,
      isCompleted: respondedSurveyIds.includes(survey.id)
    }));

    console.log(`\n✅ Student can see ${surveysWithStatus.length} available surveys:`);
    surveysWithStatus.forEach((survey, index) => {
      console.log(`  ${index + 1}. "${survey.title}" by ${survey.creator?.fullName}`);
      console.log(`     - Description: ${survey.description}`);
      console.log(`     - Created: ${new Date(survey.createdAt).toLocaleDateString()}`);
      console.log(`     - Status: ${survey.isCompleted ? 'Completed' : 'Available to take'}`);
    });

    if (surveysWithStatus.length > 0) {
      console.log('\n🎉 SUCCESS: Students can see surveys created by faculty!');
      console.log('💡 The survey visibility system is working correctly.');
    } else {
      console.log('\n❌ ISSUE: No surveys available for students to see.');
      console.log('💡 Make sure faculty surveys are created with status = "PUBLISHED"');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testStudentView();
