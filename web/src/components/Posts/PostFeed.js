import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MoreHorizontal, Pin, Send, Trash2, Edit3, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PostFeed = () => {
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
  const [showSurveyMaker, setShowSurveyMaker] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    type: 'multiple',
    options: ['', '']
  });
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

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
      console.log('🔍 Frontend received posts data:', JSON.stringify(data, null, 2));
      setPosts(Array.isArray(data) ? data : []);
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
        setShowSurveyMaker(false);
        setShowQuestionModal(false);
        setSurveyQuestions([]);
        fetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const createSurveyPost = async (e) => {
    e.preventDefault();
    try {
      console.log('=== SURVEY POST CREATION ATTEMPT ===');
      console.log('New post data:', newPost);
      console.log('Survey questions:', surveyQuestions);
      
      // First create the survey
      const surveyResponse = await fetch('/api/v1/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: newPost.title,
          description: newPost.content,
          questions: surveyQuestions
        })
      });

      console.log('Survey response status:', surveyResponse.status);

      if (surveyResponse.ok) {
        const survey = await surveyResponse.json();
        console.log('✅ Survey created:', survey);
        
        // Then create the post linking to the survey
        const postData = {
          content: newPost.content,
          type: newPost.type,
          title: newPost.title,
          surveyId: survey.id
        };
        console.log('Creating post with data:', postData);

        const postResponse = await fetch('/api/v1/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(postData)
        });

        console.log('Post response status:', postResponse.status);

        if (postResponse.ok) {
          const post = await postResponse.json();
          console.log('✅ Post created:', post);
          
          setNewPost({ content: '', type: 'general', title: '' });
          setShowCreatePost(false);
          setShowSurveyMaker(false);
          setShowQuestionModal(false);
          setSurveyQuestions([]);
          fetchPosts();
        } else {
          const postError = await postResponse.json();
          console.error('❌ Post creation failed:', postError);
        }
      } else {
        const surveyError = await surveyResponse.json();
        console.error('❌ Survey creation failed:', surveyError);
      }
    } catch (error) {
      console.error('❌ Error creating survey post:', error);
    }
  };

  const likePost = async (postId) => {
    try {
      const response = await fetch(`/api/v1/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Like response:', result);
        
        // Update the local state immediately for better UX
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                hasUserLiked: result.liked,
                likesCount: result.likesCount,
                postLikes: result.liked ? 
                  [...(post.postLikes || []), { user_id: user?.id }] : 
                  (post.postLikes || []).filter(like => like.user_id !== user?.id)
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
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
        fetchPosts(); // Refresh the posts list
      } else {
        const error = await response.json();
        console.error('Delete comment error:', error.error);
        alert(error.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
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
        fetchPosts(); // Refresh the posts list
      } else {
        const error = await response.json();
        console.error('Delete post error:', error.error);
        alert(error.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const updatePost = async (postId, updateData) => {
    try {
      const response = await fetch(`/api/v1/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        fetchPosts(); // Refresh the posts list
        setShowEditModal(false);
        setEditingPost(null);
      } else {
        const error = await response.json();
        console.error('Update post error:', error.error);
        alert(error.error || 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post');
    }
  };

  const addQuestion = () => {
    setShowQuestionModal(true);
    setCurrentQuestion({
      text: '',
      type: 'multiple',
      options: ['', '']
    });
  };

  const saveQuestion = () => {
    if (currentQuestion.text.trim()) {
      setSurveyQuestions([...surveyQuestions, {
        id: Date.now(),
        ...currentQuestion
      }]);
      setShowQuestionModal(false);
      setCurrentQuestion({
        text: '',
        type: 'multiple',
        options: ['', '']
      });
    }
  };

  const updateCurrentQuestion = (field, value) => {
    setCurrentQuestion({ ...currentQuestion, [field]: value });
  };

  const updateCurrentOption = (optionIndex, value) => {
    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.map((opt, idx) => idx === optionIndex ? value : opt)
    });
  };

  const addCurrentOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, '']
    });
  };

  const removeQuestion = (id) => {
    setSurveyQuestions(surveyQuestions.filter(q => q.id !== id));
  };

  if (loading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  const PostCard = ({ post, onLike, onComment, onDelete, onUpdate, onDeleteComment, currentUser }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    
    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (showDropdown && !event.target.closest('.relative')) {
          setShowDropdown(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    const handleComment = (e) => {
      e.preventDefault();
      if (newComment.trim()) {
        onComment(post.id, newComment);
        setNewComment('');
      }
    };

    const handleDelete = () => {
      if (window.confirm('Are you sure you want to delete this post?')) {
        onDelete(post.id);
        setShowDropdown(false);
      }
    };

    const handleEdit = () => {
      onUpdate(post);
      setShowDropdown(false);
    };

    const handleDeleteComment = (commentId) => {
      if (window.confirm('Are you sure you want to delete this comment?')) {
        onDeleteComment(commentId);
      }
    };

    // Use the new backend-provided like status and counts
    const isLiked = post.hasUserLiked || false;
    const likeCount = post.likesCount || 0;
    const commentCount = post.commentsCount || 0;
    
    // Debug logging to check user IDs and post structure
    console.log('Full post object:', post);
    console.log('Post hasUserLiked:', post.hasUserLiked);
    console.log('Post likesCount:', post.likesCount);
    console.log('Post userId:', post.userId, 'type:', typeof post.userId);
    console.log('Post user object:', post.user);
    console.log('Current user ID:', currentUser?.id, 'type:', typeof currentUser?.id);
    console.log('Current user role:', currentUser?.role);
    
    // Try multiple comparison approaches
    const userIdMatch = post.userId === currentUser?.id;
    const userIdStringMatch = String(post.userId) === String(currentUser?.id);
    const userObjectMatch = post.user?.id === currentUser?.id;
    const userObjectStringMatch = String(post.user?.id) === String(currentUser?.id);
    
    console.log('Comparison results:');
    console.log('- Direct ID match:', userIdMatch);
    console.log('- String ID match:', userIdStringMatch);
    console.log('- User object ID match:', userObjectMatch);
    console.log('- User object string match:', userObjectStringMatch);
    
    const canDelete = userIdStringMatch || userObjectStringMatch || currentUser?.role === 'admin';
    const canEdit = userIdStringMatch || userObjectStringMatch || currentUser?.role === 'admin';

    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow border border-gray-700/50">
        {/* Post Header */}
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold">
                  {post.user?.firstName?.[0] || 'U'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {post.user?.firstName || post.user?.email?.split('@')[0] || 'Unknown'} {post.user?.lastName || ''}
                  {(post.user?.role === 'teacher' || post.user?.role === 'faculty') && (
                    <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Teacher</span>
                  )}
                </h3>
                <p className="text-sm text-gray-400">
                  Posted {formatDate(post.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {post.isPinned && <Pin className="w-4 h-4 text-primary-600" />}
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700/50 z-10">
                    {canEdit && (
                      <button
                        onClick={handleEdit}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center space-x-2 rounded-t-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit Post</span>
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Post</span>
                      </button>
                    )}
                    {!canEdit && !canDelete && (
                      <div className="w-full text-left px-4 py-2 text-gray-400">
                        No actions available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="mt-4">
            {post.title && (
              <h4 className="font-semibold text-lg mb-2">{post.title}</h4>
            )}
            <p className="text-gray-200 whitespace-pre-wrap">{post.content}</p>
            
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
          </div>
        </div>

        {/* Post Actions */}
        <div className="px-6 pb-4">
          <div className="flex items-center space-x-4 py-2 border-y">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                isLiked ? 'text-red-600' : 'text-gray-600 hover:bg-gray-700/30'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:bg-gray-700/30 rounded-lg transition"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{commentCount}</span>
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 space-y-4">
              {/* Add Comment */}
              <form onSubmit={handleComment} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {post.comments && Array.isArray(post.comments) && post.comments.map((comment) => {
                  const canDeleteComment = comment.user_id === currentUser?.id || currentUser?.role === 'admin';
                  return (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 text-sm font-medium">
                          {comment.user?.firstName?.[0] || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-700/50 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {comment.user?.firstName} {comment.user?.lastName}
                              </p>
                              <p className="text-gray-200 mt-1">{comment.content}</p>
                            </div>
                            {canDeleteComment && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 ml-2"
                                title="Delete comment"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow border border-gray-700/50 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold">
              {user?.firstName?.[0] || 'U'}
            </span>
          </div>
          <button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="flex-1 text-left text-gray-400 hover:bg-gray-700/50 rounded-full px-4 py-2 transition"
          >
            What's on your mind, {user?.firstName}?
          </button>
        </div>

        {showCreatePost && (
          <form onSubmit={newPost.type === 'survey' ? createSurveyPost : createPost} className="space-y-4 border-t pt-4">
            <select
              value={newPost.type}
              onChange={(e) => {
                setNewPost({ ...newPost, type: e.target.value });
                setShowSurveyMaker(e.target.value === 'survey');
              }}
              className="w-full p-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white"
            >
              <option value="general">General Post</option>
              <option value="survey">Survey Related</option>
            </select>

            {newPost.type === 'survey' && (
              <input
                type="text"
                placeholder="Survey title (required)"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="w-full p-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white placeholder-gray-400"
                required
              />
            )}

            <textarea
              placeholder={newPost.type === 'survey' ? 'Survey description...' : 'Share your thoughts...'}
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="w-full p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg resize-none text-white placeholder-gray-400"
              rows={4}
              required
            />

            {/* Survey Maker */}
            {showSurveyMaker && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Survey Questions</h4>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>

                {/* Questions List */}
                {surveyQuestions.map((question, qIndex) => (
                  <div key={question.id} className="border border-gray-700/50 rounded-lg p-4 bg-gray-800/50 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-white">{qIndex + 1}. {question.text}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Type: {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                        </p>
                        {question.type === 'multiple' && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-400">Options:</p>
                            {question.options.map((option, oIndex) => (
                              <p key={oIndex} className="text-sm text-gray-500 ml-4">
                                • {option || '(Empty option)'}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="ml-2 px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                {surveyQuestions.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-600 rounded-lg bg-gray-800/30 backdrop-blur-sm">
                    <p className="text-gray-300">No questions yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click "Create" to add your first question</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreatePost(false);
                  setShowSurveyMaker(false);
                  setShowQuestionModal(false);
                  setSurveyQuestions([]);
                }}
                className="px-4 py-2 text-gray-400 hover:bg-gray-700/30 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {newPost.type === 'survey' ? 'Create Survey Post' : 'Post'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Posts Feed */}
      {Array.isArray(posts) && posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={likePost}
          onComment={addComment}
          onDelete={deletePost}
          onUpdate={setEditingPost}
          onDeleteComment={deleteComment}
          currentUser={user}
        />
      ))}

      {/* Question Creation Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Question</h3>
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Question Text
                </label>
                <input
                  type="text"
                  placeholder="Enter your question"
                  value={currentQuestion.text}
                  onChange={(e) => updateCurrentQuestion('text', e.target.value)}
                  className="w-full p-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Question Type
                </label>
                <select
                  value={currentQuestion.type}
                  onChange={(e) => updateCurrentQuestion('type', e.target.value)}
                  className="w-full p-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white"
                >
                  <option value="multiple">Multiple Choice</option>
                  <option value="text">Text Answer</option>
                  <option value="rating">Rating Scale</option>
                </select>
              </div>

              {currentQuestion.type === 'multiple' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Answer Options
                    </label>
                    <button
                      type="button"
                      onClick={addCurrentOption}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Add Option
                    </button>
                  </div>
                  {currentQuestion.options.map((option, oIndex) => (
                    <input
                      key={oIndex}
                      type="text"
                      placeholder={`Option ${oIndex + 1}`}
                      value={option}
                      onChange={(e) => updateCurrentOption(oIndex, e.target.value)}
                      className="w-full p-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg mb-2 text-white placeholder-gray-400"
                      required
                    />
                  ))}
                </div>
              )}

              {currentQuestion.type === 'rating' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rating Scale
                  </label>
                  <select className="w-full p-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white">
                    <option>1-5 Scale</option>
                    <option>1-10 Scale</option>
                    <option>1-100 Scale</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="px-4 py-2 text-gray-400 hover:bg-gray-700/30 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Post</h3>
              <button
                onClick={() => {
                  setEditingPost(null);
                  setShowEditModal(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              updatePost(editingPost.id, {
                content: editingPost.content,
                title: editingPost.title,
                type: editingPost.type,
                tags: editingPost.tags
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Post Type
                </label>
                <select
                  value={editingPost.type}
                  onChange={(e) => setEditingPost({ ...editingPost, type: e.target.value })}
                  className="w-full p-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white"
                >
                  <option value="general">General Post</option>
                  <option value="survey">Survey Related</option>
                  <option value="question">Question</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Post title"
                  value={editingPost.title || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="w-full p-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  placeholder="Share your thoughts..."
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg resize-none text-white placeholder-gray-400"
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPost(null);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 text-gray-400 hover:bg-gray-700/30 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Update Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostFeed;
