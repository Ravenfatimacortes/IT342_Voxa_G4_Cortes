const { supabaseAdmin } = require('../config/database');

// Like model — backed by Supabase (no Sequelize)
const Like = {};

Like.create = async ({ postId, userId }) => {
  const { data, error } = await supabaseAdmin
    .from('post_likes')
    .insert([{ post_id: postId, user_id: userId }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

Like.delete = async ({ postId, userId }) => {
  const { error } = await supabaseAdmin
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);
  if (error) throw error;
  return true;
};

Like.findByPostAndUser = async ({ postId, userId }) => {
  const { data, error } = await supabaseAdmin
    .from('post_likes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data;
};

module.exports = Like;
