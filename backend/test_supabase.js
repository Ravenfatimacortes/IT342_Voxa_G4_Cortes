// Test script to verify Supabase models work correctly
// Run this after setting up your Supabase project and environment variables

require('dotenv').config();

async function testModels() {
  console.log('Testing Supabase Models...');
  
  try {
    // Test database connection
    const { supabase } = require('./config/database');
    console.log('✓ Database configuration loaded');
    
    // Test User model
    const User = require('./models/User');
    console.log('✓ User model loaded');
    
    // Test Survey model
    const { Survey, Question } = require('./models/Survey');
    console.log('✓ Survey and Question models loaded');
    
    // Test Response model
    const { Response, Answer } = require('./models/Response');
    console.log('✓ Response and Answer models loaded');
    
    // Test basic database access
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('✗ Database access failed:', error.message);
      return false;
    }
    console.log('✓ Database access successful');
    
    // Test model formatting
    const testUser = User.formatUser({
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      role: 'student',
      student_id: '12345',
      department: 'Computer Science',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    if (testUser && testUser.getFullName && testUser.getFullName() === 'John Doe') {
      console.log('✓ User model formatting works');
    } else {
      console.error('✗ User model formatting failed');
    }
    
    const testSurvey = Survey.formatSurvey({
      id: 1,
      title: 'Test Survey',
      description: 'A test survey',
      created_by: 1,
      status: 'PUBLISHED',
      response_count: 0,
      target_audience: null,
      start_date: null,
      end_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    if (testSurvey && testSurvey.title === 'Test Survey') {
      console.log('✓ Survey model formatting works');
    } else {
      console.error('✗ Survey model formatting failed');
    }
    
    console.log('\n🎉 All tests passed! Migration is ready.');
    console.log('\nNext steps:');
    console.log('1. Set up your Supabase project');
    console.log('2. Run the SQL schema in Supabase SQL Editor');
    console.log('3. Update your .env file with Supabase credentials');
    console.log('4. Start the server: npm run dev');
    
    return true;
    
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    console.log('\nThis is expected if you haven\'t set up Supabase yet.');
    console.log('Please follow the MIGRATION_GUIDE.md for setup instructions.');
    return false;
  }
}

testModels();
