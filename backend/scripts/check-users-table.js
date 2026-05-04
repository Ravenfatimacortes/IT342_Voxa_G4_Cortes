require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function checkUsersTable() {
  try {
    console.log('Checking users table structure...');
    
    // Get a sample user to see the structure
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error checking users table:', error);
    } else {
      console.log('✅ Users table structure:');
      if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
        console.log('Sample user:', data[0]);
      } else {
        console.log('No users found in table');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsersTable();
