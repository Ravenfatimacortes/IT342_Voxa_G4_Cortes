const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { supabaseAdmin } = require('../../../config/database');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const User = require('../../auth/models/User');


// Get all posts (Facebook-style feed)
router.get('/', auth, async (req, res) => {
  try {
    console.log('=== GET POSTS ATTEMPT ===');
    console.log('User from auth:', req.user);
    
    const posts = await Post.findAll({ 
      currentUserId: req.user.userId,
      userId: req.query.userId 
    });
    console.log('✅ Posts retrieved successfully:', posts);

    res.json(posts);
  } catch (error) {
    console.error('❌ Get posts error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Create new post
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== POST CREATION ATTEMPT ===');
    console.log('Request body:', req.body);
    console.log('User from auth:', req.user);
    
    const { content, type, title, surveyId, tags } = req.body;

    const postData = {
      userId: req.user.userId,
      content,
      type: type || 'general',
      title,
      surveyId,
      tags: tags || []
    };
    
    console.log('Post data to create:', postData);

    const post = await Post.createPost(postData);
    console.log('✅ Post created successfully:', post);

    res.status(201).json(post);
  } catch (error) {
    console.error('❌ Create post error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Like/Unlike post (Facebook-style)
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const { postId } = req.params;

    const existingLike = await Like.findByPostAndUser({
      postId: parseInt(postId),
      userId: req.user.userId
    });

    if (existingLike) {
      // Unlike
      await Like.delete({
        postId: parseInt(postId),
        userId: req.user.userId
      });
      
      // Get updated like count
      const { data: likes } = await supabaseAdmin
        .from('post_likes')
        .select('id')
        .eq('post_id', parseInt(postId));
      
      res.json({ 
        liked: false, 
        likesCount: likes ? likes.length : 0,
        message: 'Post unliked'
      });
    } else {
      // Like
      await Like.create({
        postId: parseInt(postId),
        userId: req.user.userId
      });
      
      // Get updated like count
      const { data: likes } = await supabaseAdmin
        .from('post_likes')
        .select('id')
        .eq('post_id', parseInt(postId));
      
      res.json({ 
        liked: true, 
        likesCount: likes ? likes.length : 0,
        message: 'Post liked'
      });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add comment to post
router.post('/:postId/comments', auth, async (req, res) => {
  try {
    console.log('=== ADD COMMENT ATTEMPT ===');
    console.log('Request body:', req.body);
    console.log('Post ID:', req.params.postId);
    console.log('User ID:', req.user.userId);
    
    const { postId } = req.params;
    const { content } = req.body;

    const comment = await Comment.create({
      postId: parseInt(postId),
      userId: req.user.userId,
      content
    });

    console.log('✅ Comment created successfully:', comment);
    res.status(201).json(comment);
  } catch (error) {
    console.error('❌ Add comment error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Delete comment
router.delete('/comments/:commentId', auth, async (req, res) => {
  try {
    console.log('=== DELETE COMMENT ATTEMPT ===');
    console.log('Comment ID:', req.params.commentId);
    console.log('User ID:', req.user.userId);
    
    const { commentId } = req.params;

    // First check if the comment exists and belongs to the user
    const { data: comment, error: fetchError } = await supabaseAdmin
      .from('post_comments')
      .select('*')
      .eq('id', parseInt(commentId))
      .single();

    if (fetchError || !comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if the user owns the comment
    if (comment.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Delete the comment
    await Comment.delete(parseInt(commentId));

    console.log('✅ Comment deleted successfully');
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('❌ Delete comment error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Update post (only author or admin)
router.put('/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, title, type, tags } = req.body;

    const post = await Post.findById(parseInt(postId));
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedPost = await Post.updatePost(parseInt(postId), {
      content,
      title,
      type,
      tags
    });

    res.json(updatedPost);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete post (only author or admin)
router.delete('/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(parseInt(postId));
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Post.deletePost(parseInt(postId));
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
