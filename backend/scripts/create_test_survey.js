require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function createTestSurveyFromSecondFaculty() {
  try {
    console.log('=== Creating Test Survey from Second Faculty ===\n');

    // Get the second faculty user
    const { data: faculty, error: facultyError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('email', 'faculty@gmail.com')
      .single();

    if (facultyError || !faculty) {
      console.error('❌ Second faculty not found:', facultyError);
      return;
    }

    console.log(`✅ Found second faculty: ${faculty.email} (${faculty.id})`);

    // Create a test survey
    const surveyData = {
      title: 'Test Survey from Second Faculty',
      description: 'This survey should be visible to all users when published',
      created_by: faculty.id,
      status: 'PUBLISHED'
    };

    const { data: survey, error: surveyError } = await supabaseAdmin
      .from('surveys')
      .insert([surveyData])
      .select()
      .single();

    if (surveyError) {
      console.error('❌ Error creating survey:', surveyError);
      return;
    }

    console.log(`✅ Created survey: "${survey.title}" (ID: ${survey.id})`);

    // Create some test questions
    const questions = [
      {
        survey_id: survey.id,
        text: 'How do you rate this course?',
        type: 'multiple',
        options: JSON.stringify(['Excellent', 'Good', 'Average', 'Poor']),
        "order": 1
      },
      {
        survey_id: survey.id,
        text: 'What improvements would you suggest?',
        type: 'text',
        options: null,
        "order": 2
      }
    ];

    const { data: createdQuestions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .insert(questions)
      .select();

    if (questionsError) {
      console.error('❌ Error creating questions:', questionsError);
      // Clean up the survey if questions failed
      await supabaseAdmin.from('surveys').delete().eq('id', survey.id);
      return;
    }

    console.log(`✅ Created ${createdQuestions.length} questions`);

    // Test visibility
    console.log('\n=== Testing Survey Visibility ===');
    
    // Test what students would see
    const { data: visibleSurveys, error: visibleError } = await supabaseAdmin
      .from('surveys')
      .select(`
        *,
        users!surveys_created_by_fkey (
          email,
          first_name,
          last_name
        )
      `)
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false });

    if (visibleError) {
      console.error('❌ Error testing visibility:', visibleError);
      return;
    }

    console.log(`✅ Total surveys visible to students: ${visibleSurveys.length}`);
    visibleSurveys.forEach((survey, index) => {
      const isFirstFaculty = survey.users?.email === 'faculty@voxa.com';
      const creatorType = isFirstFaculty ? 'First Faculty' : 'Other Faculty';
      console.log(`  ${index + 1}. "${survey.title}" by ${survey.users?.email} (${creatorType})`);
    });

    console.log('\n🎉 Test survey created successfully!');
    console.log('💡 Students should now see 3 surveys total');
    console.log('💡 The new survey should be visible to all users');

  } catch (error) {
    console.error('❌ Error creating test survey:', error);
  }
}

createTestSurveyFromSecondFaculty();
