// Test script to check if responses endpoint is working
const { supabaseAdmin } = require('./config/database');

async function testResponsesEndpoint() {
  try {
    console.log('Testing responses endpoint...');
    
    // Test if we can fetch responses for a user
    // Note: You'll need to replace with an actual user ID from your database
    const testUserId = 'your-user-id-here';
    
    const { data: responses, error: responsesError } = await supabaseAdmin
      .from('responses')
      .select(`
        *,
        surveys (
          id,
          title,
          description,
          created_at
        )
      `)
      .eq('user_id', testUserId)
      .order('submitted_at', { ascending: false })
      .limit(10);

    if (responsesError) {
      console.error('Responses error:', responsesError);
      return;
    }

    console.log('Responses found:', responses?.length || 0);
    console.log('Sample response:', responses?.[0]);

    // Test count query
    const { count, error: countError } = await supabaseAdmin
      .from('responses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', testUserId);

    if (countError) {
      console.error('Count error:', countError);
    } else {
      console.log('Total count:', count);
    }

    // Test answers query
    if (responses && responses.length > 0) {
      const responseIds = responses.map(r => r.id);
      const { data: answers } = await supabaseAdmin
        .from('answers')
        .select('response_id')
        .in('response_id', responseIds);
      
      console.log('Answers found:', answers?.length || 0);
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

// Get a list of users to test with
async function getUsers() {
  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .limit(5);
  
  if (error) {
    console.error('Users error:', error);
  } else {
    console.log('Available users for testing:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}`);
    });
  }
}

// Run tests
getUsers();
// testResponsesEndpoint();
