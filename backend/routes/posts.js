const express = require('express');
const { auth } = require('../middleware/auth');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const User = require('../models/User');

const router = express.Router();

// Get all posts (Facebook-style feed)
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'profileImageUrl']
        },
        {
          model: Comment,
          as: 'comments',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'profileImageUrl']
          }],
          order: [['createdAt', 'ASC']]
        },
        {
          model: Like,
          as: 'postLikes',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName']
          }]
        }
      ],
      order: [['isPinned', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new post
router.post('/', auth, async (req, res) => {
  try {
    const { content, type, title, surveyId, tags } = req.body;

    const post = await Post.create({
      userId: req.user.userId,
      content,
      type: type || 'general',
      title,
      surveyId,
      tags: tags || []
    });

    const createdPost = await Post.findByPk(post.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'profileImageUrl']
      }]
    });

    res.status(201).json(createdPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Like/Unlike post
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { type = 'like' } = req.body;

    const existingLike = await Like.findOne({
      where: { postId, userId: req.user.userId }
    });

    if (existingLike) {
      await existingLike.destroy();
      res.json({ liked: false });
    } else {
      await Like.create({
        postId,
        userId: req.user.userId,
        type
      });
      res.json({ liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add comment to post
router.post('/:postId/comments', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;

    const comment = await Comment.create({
      postId,
      userId: req.user.userId,
      content,
      parentId
    });

    const createdComment = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'profileImageUrl']
      }]
    });

    res.status(201).json(createdComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete post (only author or admin)
router.delete('/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await post.destroy();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
