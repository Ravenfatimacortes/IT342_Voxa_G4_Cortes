// Debug script to test the database connection
const { supabaseAdmin } = require('./config/database');

async function debugDatabase() {
  console.log('=== Database Debug Test ===');
  
  try {
    // Test 1: Check if responses table exists and has data
    console.log('\n1. Testing responses table...');
    const { data: userResponses, error: urError } = await supabaseAdmin
      .from('responses')
      .select('count')
      .limit(1);
    
    console.log('User responses result:', { 
      count: userResponses?.length || 0, 
      error: urError?.message 
    });
    
    // Test 2: Check if we can query a specific user
    console.log('\n2. Testing user query...');
    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .limit(5);
    
    console.log('Users result:', { 
      count: users?.length || 0, 
      error: userError?.message 
    });
    
    if (users && users.length > 0) {
      const testUserId = users[0].id;
      console.log('\n3. Testing responses for user:', testUserId);
      
      const { data: responses, error: respError } = await supabaseAdmin
        .from('responses')
        .select('*')
        .eq('user_id', testUserId)
        .limit(5);
      
      console.log('User responses result:', { 
        count: responses?.length || 0, 
        error: respError?.message 
      });
    }
    
    // Test 4: Check surveys table
    console.log('\n4. Testing surveys table...');
    const { data: surveys, error: surveyError } = await supabaseAdmin
      .from('surveys')
      .select('id, title')
      .limit(3);
    
    console.log('Surveys result:', { 
      count: surveys?.length || 0, 
      error: surveyError?.message 
    });
    
  } catch (error) {
    console.error('Debug test error:', error);
  }
  
  console.log('\n=== Debug Test Complete ===');
}

// Run the debug test
debugDatabase();
