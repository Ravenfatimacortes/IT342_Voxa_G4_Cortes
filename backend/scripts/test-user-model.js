require('dotenv').config();
const User = require('../models/User');

async function testUserModel() {
  try {
    console.log('=== Testing User Model Methods ===');
    
    // Test findByEmail
    console.log('Testing findByEmail...');
    const existingUser = await User.findByEmail('testreg@voxa.com');
    console.log('Existing user result:', existingUser);
    
    // Test create
    console.log('Testing create...');
    const newUser = await User.create({
      firstName: 'Model',
      lastName: 'Test',
      email: 'modeltest@voxa.com',
      password: 'Test123456',
      role: 'student'
    });
    console.log('Created user:', newUser);
    
  } catch (error) {
    console.log('❌ User model error:', error.message);
  }
}

testUserModel();
