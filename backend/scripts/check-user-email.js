require('dotenv').config();
const User = require('../models/User');

async function checkUserEmail() {
  try {
    console.log('Checking user with email posttest@voxa.com...');
    
    const user = await User.findByEmail('posttest@voxa.com');
    console.log('✅ User found by email:', user);
  } catch (error) {
    console.error('❌ Error finding user by email:', error);
    console.error('Error stack:', error.stack);
  }
}

checkUserEmail();
