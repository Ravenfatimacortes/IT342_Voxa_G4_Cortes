import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, Pin, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PostFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
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

      if (surveyResponse.ok) {
        const survey = await surveyResponse.json();
        
        // Then create the post linking to the survey
        const postResponse = await fetch('/api/v1/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...newPost,
            surveyId: survey.id
          })
        });

        if (postResponse.ok) {
          setNewPost({ content: '', type: 'general', title: '' });
          setShowCreatePost(false);
          setShowSurveyMaker(false);
          setShowQuestionModal(false);
          setSurveyQuestions([]);
          fetchPosts();
        }
      }
    } catch (error) {
      console.error('Error creating survey post:', error);
    }
  };

  const likePost = async (postId) => {
    try {
      await fetch(`/api/v1/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchPosts();
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

  const PostCard = ({ post, onLike, onComment, currentUser }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    const handleComment = (e) => {
      e.preventDefault();
      if (newComment.trim()) {
        onComment(post.id, newComment);
        setNewComment('');
      }
    };

    const isLiked = post.postLikes && Array.isArray(post.postLikes) ? post.postLikes.some(like => like.userId === currentUser?.id) : false;
    const likeCount = post.postLikes && Array.isArray(post.postLikes) ? post.postLikes.length : 0;
    const commentCount = post.comments && Array.isArray(post.comments) ? post.comments.length : 0;

    return (
      <div className="bg-white rounded-lg shadow">
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
                <h3 className="font-semibold">
                  {post.user?.firstName} {post.user?.lastName}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {post.isPinned && <Pin className="w-4 h-4 text-primary-600" />}
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Post Content */}
          <div className="mt-4">
            {post.title && (
              <h4 className="font-semibold text-lg mb-2">{post.title}</h4>
            )}
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            
            {/* Post Type Badge */}
            <div className="mt-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                post.type === 'survey' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
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
          <div className="flex items-center justify-between py-2 border-y">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                isLiked ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{commentCount}</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
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
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                {post.comments && Array.isArray(post.comments) && post.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 text-sm font-medium">
                        {comment.user?.firstName?.[0] || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium text-sm">
                          {comment.user?.firstName} {comment.user?.lastName}
                        </p>
                        <p className="text-gray-700 mt-1">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold">
              {user?.firstName?.[0] || 'U'}
            </span>
          </div>
          <button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="flex-1 text-left text-gray-500 hover:bg-gray-50 rounded-full px-4 py-2 transition"
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
              className="w-full p-2 border rounded-lg"
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
                className="w-full p-2 border rounded-lg"
                required
              />
            )}

            <textarea
              placeholder={newPost.type === 'survey' ? 'Survey description...' : 'Share your thoughts...'}
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="w-full p-3 border rounded-lg resize-none"
              rows={4}
              required
            />

            {/* Survey Maker */}
            {showSurveyMaker && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Survey Questions</h4>
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
                  <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{qIndex + 1}. {question.text}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Type: {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                        </p>
                        {question.type === 'multiple' && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Options:</p>
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
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">No questions yet</p>
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
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
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
          currentUser={user}
        />
      ))}

      {/* Question Creation Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text
                </label>
                <input
                  type="text"
                  placeholder="Enter your question"
                  value={currentQuestion.text}
                  onChange={(e) => updateCurrentQuestion('text', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <select
                  value={currentQuestion.type}
                  onChange={(e) => updateCurrentQuestion('type', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="multiple">Multiple Choice</option>
                  <option value="text">Text Answer</option>
                  <option value="rating">Rating Scale</option>
                </select>
              </div>

              {currentQuestion.type === 'multiple' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
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
                      className="w-full p-2 border rounded-lg mb-2"
                      required
                    />
                  ))}
                </div>
              )}

              {currentQuestion.type === 'rating' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating Scale
                  </label>
                  <select className="w-full p-2 border rounded-lg">
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
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
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
    </div>
  );
};

export default PostFeed;
