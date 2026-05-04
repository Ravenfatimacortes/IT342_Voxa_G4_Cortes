require('dotenv').config();
const { supabaseAdmin } = require('../config/database');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    console.log('=== Creating Test User ===');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Test123456', salt);
    
    // Create user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          first_name: 'Test',
          last_name: 'User',
          email: 'testuser@voxa.com',
          password: hashedPassword,
          role: 'student'
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.log('❌ Error creating user:', error.message);
      return;
    }
    
    console.log('✅ Test user created:', user);
    
    // Test login
    const isPasswordValid = await bcrypt.compare('Test123456', user.password);
    console.log('Password validation:', isPasswordValid);
    
    if (isPasswordValid) {
      console.log('✅ Test user login successful!');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

createTestUser();
