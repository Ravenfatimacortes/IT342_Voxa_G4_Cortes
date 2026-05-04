require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function checkUsers() {
  try {
    console.log('=== Checking Users ===');
    
    // Get all users
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role')
      .limit(10);
    
    if (error) {
      console.log('❌ Error fetching users:', error.message);
      return;
    }
    
    console.log('✅ Users found:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.first_name} ${user.last_name}, Role: ${user.role}`);
    });
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

checkUsers();
