require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function checkCommentsTable() {
  try {
    console.log('Checking post_comments table structure...');
    
    // Get a sample comment to see the structure
    const { data, error } = await supabaseAdmin
      .from('post_comments')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error checking post_comments table:', error);
    } else {
      console.log('✅ Post comments table structure:');
      if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
        console.log('Sample comment:', data[0]);
      } else {
        console.log('No comments found in table');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCommentsTable();
