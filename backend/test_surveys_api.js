require('dotenv').config();
const express = require('express');
const { supabaseAdmin } = require('./config/database');

// Simulate the surveys endpoint
async function testSurveysEndpoint() {
  try {
    console.log('=== Testing Surveys API Endpoint ===');
    
    const page = 1;
    const limit = 10;
    const status = 'available'; // Simulate student requesting available surveys
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Get surveys user has already responded to (simulate user ID)
    const userId = 'test-user-id';
    const { data: userResponses } = await supabaseAdmin
      .from('responses')
      .select('survey_id')
      .eq('user_id', userId);
    
    const respondedSurveyIds = userResponses ? userResponses.map(r => r.survey_id) : [];

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

    // Manual pagination
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

    console.log(`✅ Returning ${surveysWithStatus.length} surveys to student:`);
    surveysWithStatus.forEach((survey, index) => {
      console.log(`  ${index + 1}. "${survey.title}" by ${survey.creator?.fullName} - Completed: ${survey.isCompleted}`);
    });

    // Test the response format
    const response = {
      surveys: surveysWithStatus,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total
      }
    };
    
    console.log('\n✅ API Response format:', JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testSurveysEndpoint();
