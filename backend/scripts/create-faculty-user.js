require('dotenv').config();
const { supabaseAdmin } = require('../config/database');
const bcrypt = require('bcryptjs');

async function createFacultyUser() {
  try {
    console.log('=== Creating Faculty User ===');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Faculty123456', salt);
    
    // Create faculty user
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          first_name: 'Faculty',
          last_name: 'Test User',
          email: 'faculty@voxa.com',
          password: hashedPassword,
          role: 'faculty'
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.log('❌ Error creating faculty user:', error.message);
      return;
    }
    
    console.log('✅ Faculty user created:', data);
    
    // Test login
    const { data: loginTest } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'faculty@voxa.com')
      .single();
    
    console.log('✅ Faculty user verification:', loginTest);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

createFacultyUser();
