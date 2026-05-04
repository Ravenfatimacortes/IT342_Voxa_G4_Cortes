import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MoreHorizontal, Pin, Send, Trash2, Edit3, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const FacultyPostFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Unknown date';
    }
    
    const date = new Date(dateString);
    
    // Check if date is invalid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };
  const [newPost, setNewPost] = useState({ content: '', type: 'general', title: '' });
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/v1/posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      console.log('Posts data:', data);
      
      // Ensure each post has the hasUserLiked property
      const postsWithLikeStatus = Array.isArray(data) ? data.map(post => ({
        ...post,
        hasUserLiked: post.hasUserLiked || false,
        likesCount: post.likesCount || 0
      })) : [];
      
      setPosts(postsWithLikeStatus);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newPost)
      });

      if (response.ok) {
        setNewPost({ content: '', type: 'general', title: '' });
        setShowCreatePost(false);
        fetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const likePost = async (postId) => {
    try {
      const response = await fetch(`/api/v1/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, hasUserLiked: data.hasUserLiked, likesCount: data.likesCount }
            : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const deletePost = async (postId) => {
    try {
      const response = await fetch(`/api/v1/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const updatePost = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/v1/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: editingPost.content,
          type: editingPost.type
        })
      });

      if (response.ok) {
        setPosts(posts.map(post => 
          post.id === editingPost.id 
            ? { ...post, content: editingPost.content }
            : post
        ));
        setShowEditModal(false);
        setEditingPost(null);
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const addComment = async (postId, content) => {
    try {
      await fetch(`/api/v1/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      });
      
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(`/api/v1/posts/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Create Post Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-md border border-gray-700/50 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium">
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="flex-1 text-left text-gray-400 hover:text-gray-200 bg-gray-700/50 rounded-full px-4 py-2 hover:bg-gray-700/70 transition-colors"
          >
            Share an update with your students...
          </button>
        </div>

        {showCreatePost && (
          <form onSubmit={createPost} className="space-y-4 border-t pt-4">
            <textarea
              placeholder="Share your thoughts..."
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="w-full p-3 border border-gray-600 rounded-lg resize-none bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="4"
              required
            />

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setShowCreatePost(false);
                  setNewPost({ content: '', type: 'general', title: '' });
                }}
                className="px-4 py-2 text-gray-300 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Post
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-md border border-gray-700/50 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <MessageCircle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
            <p className="text-gray-400">Be the first to share something with your students!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-md border border-gray-700/50 p-6">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {post.user?.firstName?.[0] || post.user?.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">
                      {post.user?.firstName || post.user?.email?.split('@')[0] || 'Unknown'} {post.user?.lastName || ''}
                      {(post.user?.role === 'teacher' || post.user?.role === 'faculty') && (
                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Teacher</span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-400">
                      Posted {formatDate(post.createdAt)}
                    </p>
                  </div>
                </div>
                
                {post.user?.id === user?.id && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingPost(post);
                        setShowEditModal(true);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-200 mb-4">{post.content}</p>
              </div>

              {/* Post Type Badge */}
              <div className="mt-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  post.type === 'survey' ? 'bg-blue-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                </span>
                {post.type === 'survey' && post.surveyId && (
                  <Link 
                  to={`/survey/${post.surveyId}`}
                  className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
                >
                  Take Survey →
                </Link>
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center space-x-4 mt-6 pt-4 border-t">
                <button
                  onClick={() => likePost(post.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    post.hasUserLiked 
                      ? 'text-red-600 hover:text-red-700' 
                      : 'text-gray-400 hover:text-red-600 hover:bg-gray-700/30'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${post.hasUserLiked ? 'fill-red-600 text-red-600' : ''} transition-colors`} />
                  <span className={`text-sm font-medium ${post.hasUserLiked ? 'text-red-600' : 'text-gray-400'}`}>
                    {post.likesCount || 0}
                  </span>
                </button>
                
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-700/30 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">{post.comments?.length || 0}</span>
                </div>
              </div>

              {/* Comments Section */}
              {post.comments && post.comments.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <h5 className="font-medium text-white mb-3">Comments</h5>
                  <div className="space-y-3">
                    {post.comments.map(comment => (
                      <div key={comment.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 text-sm font-medium">
                            {comment.user?.firstName?.[0] || comment.user?.email?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <h6 className="text-sm font-medium text-white">
                                {comment.user?.firstName} {comment.user?.lastName}
                              </h6>
                              {comment.user?.id === user?.id && (
                                <button
                                  onClick={() => deleteComment(comment.id)}
                                  className="text-gray-400 hover:text-red-600 transition-colors"
                                  title="Delete comment"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-gray-200">{comment.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Comment Section */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 text-sm font-medium">
                      {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && commentInputs[post.id]?.trim()) {
                            addComment(post.id, commentInputs[post.id]);
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => {
                          if (commentInputs[post.id]?.trim()) {
                            addComment(post.id, commentInputs[post.id]);
                          }
                        }}
                        disabled={!commentInputs[post.id]?.trim()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Post Modal */}
      {showEditModal && editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 max-w-lg w-full border border-gray-700/50">
            <h3 className="text-lg font-medium text-white mb-4">Edit Post</h3>
            <form onSubmit={updatePost}>
              <textarea
                value={editingPost.content}
                onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                className="w-full p-3 border border-gray-600 rounded-lg resize-none bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="4"
                required
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPost(null);
                  }}
                  className="px-4 py-2 text-gray-300 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyPostFeed;
