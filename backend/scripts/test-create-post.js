require('dotenv').config();
const Post = require('../models/Post');

async function testCreatePost() {
  try {
    console.log('Testing Post.createPost...');
    
    const postData = {
      userId: 37,
      content: 'This is a test post! 🎉',
      type: 'general',
      title: 'My First Post'
    };
    
    const post = await Post.createPost(postData);
    console.log('✅ Post created successfully:', post);
  } catch (error) {
    console.error('❌ Error creating post:', error);
    console.error('Error stack:', error.stack);
  }
}

testCreatePost();
