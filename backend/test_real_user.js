require('dotenv').config();
const { supabaseAdmin } = require('./config/database');
const jwt = require('jsonwebtoken');

async function testWithRealUser() {
  try {
    console.log('=== Testing with Real User ===\n');

    // Get a real student user
    const { data: student, error: studentError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, first_name, last_name')
      .eq('role', 'student')
      .limit(1)
      .single();

    if (studentError || !student) {
      console.error('❌ No student user found:', studentError);
      return;
    }

    console.log(`✅ Found student: ${student.email} (${student.id})`);

    // Create real token
    const token = jwt.sign({
      userId: student.id,
      email: student.email,
      role: student.role,
      fullName: `${student.first_name} ${student.last_name}`
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('✅ Created real student token');

    // Test the surveys endpoint manually
    const express = require('express');
    const { auth } = require('./middleware/auth');
    
    // Simulate request
    const req = {
      headers: {
        authorization: `Bearer ${token}`
      },
      user: null,
      query: {
        status: 'available',
        limit: 20,
        page: 1
      }
    };

    const res = {
      json: (data) => {
        console.log('✅ API Response:');
        console.log(`   - Surveys: ${data.surveys.length}`);
        data.surveys.forEach((survey, index) => {
          const creator = survey.creator;
          const isFirstFaculty = survey.isFirstFacultySurvey;
          const badge = isFirstFaculty ? '👑' : '📝';
          
          console.log(`   ${index + 1}. ${badge} "${survey.title}" by ${creator?.fullName}`);
        });
      },
      status: (code) => ({
        json: (data) => {
          console.error(`❌ Error ${code}:`, data);
        }
      })
    };

    // Test the auth middleware
    auth(req, res, () => {
      console.log('✅ Authentication successful');
      console.log(`   - User ID: ${req.user.userId}`);
      console.log(`   - Email: ${req.user.email}`);
      console.log(`   - Role: ${req.user.role}`);

      // Now test the surveys route
      testSurveysRoute(req, res);
    });

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

async function testSurveysRoute(req, res) {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Get surveys user has already responded to
    const { data: userResponses } = await supabaseAdmin
      .from('responses')
      .select('survey_id')
      .eq('user_id', req.user.userId);
    
    const respondedSurveyIds = userResponses ? userResponses.map(r => r.survey_id) : [];

    // Get first faculty surveys
    const FirstFacultyService = require('./services/firstFacultyService');
    const firstFacultySurveys = await FirstFacultyService.getFirstFacultySurveys();
    const firstFacultyIds = firstFacultySurveys.map(s => s.id);

    // Build query conditions
    let queryConditions = 'status.eq.PUBLISHED';
    if (firstFacultyIds.length > 0) {
      queryConditions += `,id.in.(${firstFacultyIds.join(',')})`;
    }

    // Fetch surveys
    let { data: surveys, count, error } = await supabaseAdmin
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
      console.error('❌ Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    // Filter by completion status
    if (status === 'completed') {
      surveys = surveys.filter(s => respondedSurveyIds.includes(s.id));
    } else if (status === 'available') {
      surveys = surveys.filter(s => !respondedSurveyIds.includes(s.id));
    }

    const total = surveys.length;
    const paginated = surveys.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    // Format surveys
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
      isCompleted: respondedSurveyIds.includes(survey.id),
      isFirstFacultySurvey: firstFacultyIds.includes(survey.id)
    }));

    res.json({
      surveys: surveysWithStatus,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total
      }
    });

  } catch (error) {
    console.error('❌ Route error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

testWithRealUser();
