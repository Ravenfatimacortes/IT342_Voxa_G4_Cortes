require('dotenv').config();
const Post = require('../models/Post');

async function testPostModel() {
  try {
    console.log('Testing Post.findAll...');
    const posts = await Post.findAll();
    console.log('✅ Posts found:', posts);
    console.log('Posts count:', posts ? posts.length : 0);
  } catch (error) {
    console.error('❌ Error testing Post.findAll:', error);
    console.error('Error stack:', error.stack);
  }
}

testPostModel();
