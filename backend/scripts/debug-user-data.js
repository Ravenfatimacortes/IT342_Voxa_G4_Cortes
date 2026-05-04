require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function debugUserData() {
  try {
    console.log('🔍 Debugging user data in posts...');
    
    // Test 1: Check if users table has data
    console.log('\n=== Testing users table ===');
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, email, role')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Users table error:', usersError);
    } else {
      console.log('✅ Users found:', users.length);
      console.log('Sample user:', JSON.stringify(users[0], null, 2));
    }
    
    // Test 2: Check posts table
    console.log('\n=== Testing posts table ===');
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .limit(3);
    
    if (postsError) {
      console.error('❌ Posts table error:', postsError);
    } else {
      console.log('✅ Posts found:', posts.length);
      console.log('Sample post:', JSON.stringify(posts[0], null, 2));
    }
    
    // Test 3: Test the user relationship (this is the key test)
    console.log('\n=== Testing user relationship ===');
    const { data: postsWithUsers, error: relationshipError } = await supabaseAdmin
      .from('posts')
      .select(`
        id,
        content,
        user_id,
        user:users(id, first_name, last_name, email, role)
      `)
      .limit(3);
    
    if (relationshipError) {
      console.error('❌ Relationship error:', relationshipError);
    } else {
      console.log('✅ Posts with users found:', postsWithUsers.length);
      console.log('Sample post with user:', JSON.stringify(postsWithUsers[0], null, 2));
    }
    
    // Test 4: Test the exact query from Post model
    console.log('\n=== Testing exact Post model query ===');
    const { data: exactQuery, error: exactError } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        user:users(id, first_name, last_name, email, role),
        comments:post_comments(*, user:users(id, first_name, last_name, email, role)),
        postLikes:post_likes(*, user:users(id, first_name, last_name, email, role))
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(2);
    
    if (exactError) {
      console.error('❌ Exact query error:', exactError);
    } else {
      console.log('✅ Exact query results:', exactQuery.length);
      console.log('Sample exact result:', JSON.stringify(exactQuery[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

debugUserData();
