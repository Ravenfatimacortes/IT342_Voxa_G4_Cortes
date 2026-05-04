require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function listComments() {
  try {
    console.log('Listing all comments...');
    
    const { data, error } = await supabaseAdmin
      .from('post_comments')
      .select('*')
      .order('created_at', 'desc');
    
    if (error) {
      console.error('Error listing comments:', error);
    } else {
      console.log('✅ Comments found:');
      if (data && data.length > 0) {
        data.forEach(comment => console.log(`- ID: ${comment.id}, Post ID: ${comment.post_id}, Content: ${comment.content.substring(0, 50)}...`));
      } else {
        console.log('No comments found');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listComments();
