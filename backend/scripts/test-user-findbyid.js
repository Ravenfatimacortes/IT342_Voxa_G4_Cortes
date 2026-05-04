require('dotenv').config();
const User = require('../models/User');

async function testUserFindById() {
  try {
    console.log('Testing User.findById with ID 37...');
    
    const user = await User.findById(37);
    console.log('✅ User found:', user);
  } catch (error) {
    console.error('❌ Error finding user:', error);
    console.error('Error stack:', error.stack);
  }
}

testUserFindById();
