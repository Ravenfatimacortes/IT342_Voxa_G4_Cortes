require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function listPosts() {
  try {
    console.log('Listing all posts...');
    
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('id, content')
      .order('created_at', 'desc');
    
    if (error) {
      console.error('Error listing posts:', error);
    } else {
      console.log('✅ Posts found:');
      if (data && data.length > 0) {
        data.forEach(post => console.log(`- ID: ${post.id}, Content: ${post.content.substring(0, 50)}...`));
      } else {
        console.log('No posts found');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listPosts();
