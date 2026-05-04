require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function testApiEndpoint() {
  try {
    console.log('🔍 Testing API endpoint directly...');
    
    // Simulate the Post.findAll call
    const filters = { currentUserId: 48 }; // Use faculty user ID from debug
    
    let query = supabaseAdmin
      .from('posts')
      .select(`
        *,
        user:users(id, first_name, last_name, email, role),
        comments:post_comments(*, user:users(id, first_name, last_name, email, role)),
        postLikes:post_likes(*, user:users(id, first_name, last_name, email, role))
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Query error:', error);
      return;
    }
    
    console.log('✅ Raw data received:', JSON.stringify(data, null, 2));
    
    // Process the data exactly like the Post model does
    const processedData = data.map(post => {
      const hasUserLiked = filters.currentUserId && 
        post.postLikes && 
        post.postLikes.some(like => like.user_id === filters.currentUserId);
      
      const transformedPost = {
        ...post,
        user: post.user ? {
          id: post.user.id,
          firstName: post.user.first_name,
          lastName: post.user.last_name,
          email: post.user.email,
          role: post.user.role
        } : null,
        hasUserLiked: !!hasUserLiked,
        likesCount: post.postLikes ? post.postLikes.length : 0,
        commentsCount: post.comments ? post.comments.length : 0,
        postLikes: post.postLikes
      };
      
      if (transformedPost.comments) {
        transformedPost.comments = transformedPost.comments.map(comment => ({
          ...comment,
          user: comment.user ? {
            id: comment.user.id,
            firstName: comment.user.first_name,
            lastName: comment.user.last_name,
            email: comment.user.email,
            role: comment.user.role
          } : null
        }));
      }
      
      return transformedPost;
    });
    
    console.log('✅ Processed data (what frontend should receive):');
    console.log(JSON.stringify(processedData, null, 2));
    
    // Test the user data specifically
    if (processedData.length > 0) {
      const firstPost = processedData[0];
      console.log('\n🔍 First post user data:');
      console.log('User object:', firstPost.user);
      console.log('First name:', firstPost.user?.firstName);
      console.log('Last name:', firstPost.user?.lastName);
      console.log('Full name would be:', `${firstPost.user?.firstName || 'Unknown'} ${firstPost.user?.lastName || ''}`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testApiEndpoint();
