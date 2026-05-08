const { supabaseAdmin } = require('../../../config/database');

// Comment model — backed by Supabase (no Sequelize)
const Comment = {};

Comment.create = async ({ postId, userId, content }) => {
  const { data, error } = await supabaseAdmin
    .from('post_comments')
    .insert([{ post_id: postId, user_id: userId, content }])
    .select(`
      *,
      user:users(id, first_name, last_name)
    `)
    .single();
  if (error) throw error;
  return data;
};

Comment.findByPost = async (postId) => {
  const { data, error } = await supabaseAdmin
    .from('post_comments')
    .select('*, user:users(id, first_name, last_name)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

Comment.delete = async (id) => {
  const { error } = await supabaseAdmin
    .from('post_comments')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

module.exports = Comment;
