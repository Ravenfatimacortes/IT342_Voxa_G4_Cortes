const { supabaseAdmin } = require('./config/database');

async function debugProfileUpdate() {
  try {
    console.log('Debugging profile update...');
    
    // Test 1: Check if users table exists and get a sample user
    console.log('\n=== Test 1: Check users table ===');
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, email')
      .limit(1);
    
    console.log('Users table result:', { users: users?.length, error: usersError?.message });
    
    if (!users || users.length === 0) {
      console.log('No users found, creating test user...');
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          password: 'hashedpassword',
          role: 'student'
        })
        .select()
        .single();
      
      console.log('Create user result:', { user: newUser, error: createError?.message });
    }
    
    // Get a user to test with
    const { data: testUser, error: testUserError } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name')
      .eq('email', 'test@example.com')
      .single();
    
    if (testUserError || !testUser) {
      console.error('Could not find test user:', testUserError?.message);
      return;
    }
    
    console.log('Testing with user:', testUser);
    
    // Test 2: Try a simple update without any triggers
    console.log('\n=== Test 2: Simple update test ===');
    const updateData = {
      first_name: 'John',
      last_name: 'Doe',
      updated_at: new Date().toISOString()
    };
    
    console.log('Update data:', updateData);
    
    const { data: updateResult, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', testUser.id)
      .select()
      .single();
    
    console.log('Update result:', { 
      success: !!updateResult, 
      error: updateError?.message,
      details: updateError?.details 
    });
    
    // Test 3: Check if there are any triggers or RLS policies
    console.log('\n=== Test 3: Check database structure ===');
    
    // Check if profile_activity_log table exists
    const { data: logTable, error: logError } = await supabaseAdmin
      .from('profile_activity_log')
      .select('count')
      .limit(1);
    
    console.log('profile_activity_log table check:', { 
      exists: !logError || !logError.message?.includes('does not exist'), 
      error: logError?.message 
    });
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugProfileUpdate();
