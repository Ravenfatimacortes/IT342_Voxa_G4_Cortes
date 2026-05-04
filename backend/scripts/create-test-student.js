require('dotenv').config();
const { supabaseAdmin } = require('../config/database');
const bcrypt = require('bcrypt');

async function createTestStudent() {
  try {
    console.log('=== Creating Test Student ===');
    
    const hashedPassword = await bcrypt.hash('Test123456', 10);
    
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert([{
        email: 'teststudent2@voxa.com',
        password: hashedPassword,
        first_name: 'Test',
        last_name: 'Student2',
        role: 'student',
        student_id: 'STU002'
      }])
      .select()
      .single();
    
    if (error) {
      console.log('❌ Error creating student:', error);
      return;
    }
    
    console.log('✅ Test student created successfully');
    console.log('Email: teststudent2@voxa.com');
    console.log('Password: Test123456');
    console.log('User ID:', user.id);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestStudent();
