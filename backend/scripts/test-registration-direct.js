require('dotenv').config();
const { supabaseAdmin } = require('../config/database');
const bcrypt = require('bcryptjs');

async function testDirectRegistration() {
  try {
    console.log('=== Testing Direct Registration ===');
    
    const userData = {
      fullName: 'Test Registration User',
      email: 'testreg@voxa.com',
      password: 'Test123456',
      role: 'student'
    };
    
    console.log('Processing user data:', userData);
    
    // Split fullName into firstName and lastName
    const nameParts = userData.fullName.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || 'Name';
    
    console.log('Split names:', { firstName, lastName });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    console.log('Password hashed successfully');
    
    // Create user directly in Supabase
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email: userData.email,
          password: hashedPassword,
          role: userData.role
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.log('❌ Registration error:', error.message);
      console.log('Error details:', error);
      return;
    }
    
    console.log('✅ User created successfully:', data);
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

testDirectRegistration();
