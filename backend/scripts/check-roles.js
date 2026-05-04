require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function checkRoles() {
  try {
    console.log('=== Checking User Roles ===');
    
    // Get all users with their roles
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role')
      .limit(10);
    
    if (error) {
      console.log('❌ Error fetching users:', error.message);
      return;
    }
    
    console.log('✅ Users and their roles:');
    users.forEach(user => {
      console.log(`- Email: ${user.email}, Role: "${user.role}" (type: ${typeof user.role})`);
    });
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkRoles();
