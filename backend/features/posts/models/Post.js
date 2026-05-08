const { supabaseAdmin } = require('../../../config/database');

// Post model — backed by Supabase (no Sequelize)
const Post = {};

// Supabase CRUD methods
Post.createPost = async (postData) => {
  const { content, userId, type = 'general', title, surveyId, tags = [] } = postData;
  
  const { data, error } = await supabaseAdmin
    .from('posts')
    .insert([
      {
        user_id: userId,
        content,
        type,
        title,
        survey_id: surveyId,
        is_pinned: false
      }
    ])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

Post.updatePost = async (id, updateData) => {
  const updateFields = {};
  
  if (updateData.content) updateFields.content = updateData.content;
  if (updateData.title) updateFields.title = updateData.title;
  if (updateData.type) updateFields.type = updateData.type;
  if (updateData.tags) updateFields.tags = updateData.tags;
  if (updateData.isPinned !== undefined) updateFields.is_pinned = updateData.isPinned;
  
  const { data, error } = await supabaseAdmin
    .from('posts')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

Post.deletePost = async (id) => {
  const { error } = await supabaseAdmin
    .from('posts')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

Post.findById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) return null;
  return data;
};

Post.findAll = async (filters = {}) => {
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
  
  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Process posts to add like status for current user
  const processedData = data.map(post => {
    const hasUserLiked = filters.currentUserId && 
      post.postLikes && 
      post.postLikes.some(like => like.user_id === filters.currentUserId);
    
    // Transform user data structure to match frontend expectations
    const transformedPost = {
      ...post,
      createdAt: post.created_at, // Convert created_at to createdAt for frontend
      updatedAt: post.updated_at, // Convert updated_at to updatedAt for frontend
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
      postLikes: post.postLikes // Keep for compatibility with existing frontend code
    };
    
    // Transform comments user data too
    if (transformedPost.comments) {
      transformedPost.comments = transformedPost.comments.map(comment => ({
        ...comment,
        createdAt: comment.created_at, // Convert created_at to createdAt for frontend
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
  
  return processedData;
};

module.exports = Post;
