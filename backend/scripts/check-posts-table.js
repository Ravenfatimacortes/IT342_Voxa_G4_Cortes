require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function checkPostsTable() {
  try {
    console.log('Checking posts table structure...');
    
    // Get a sample post to see the structure
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error checking posts table:', error);
    } else {
      console.log('✅ Posts table structure:');
      if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
        console.log('Sample post:', data[0]);
      } else {
        console.log('No posts found in table');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPostsTable();
