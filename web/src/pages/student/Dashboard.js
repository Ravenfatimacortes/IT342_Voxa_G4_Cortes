import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
<<<<<<< HEAD
import { 
  Grid3x3, 
  FileText, 
  User, 
  HelpCircle, 
  Search, 
  Bell,
  ChevronDown,
  Clock,
  CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
=======
import { FileText, Clock, CheckCircle, Search, Bell, HelpCircle, Grid3x3, MessageSquare, User, Plus } from 'lucide-react';

const Dashboard = () => {
  const { api, user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [completedSurveys, setCompletedSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for demonstration
  const mockStats = {
    pending: 3,
    completed: 8,
    responseRate: 94
  };

  const mockAvailableSurveys = [
    {
      id: 1,
      title: 'End-of-Term Course Evaluation',
      description: 'Rate the quality of instruction and course materials',
      questions: 12,
      status: 'urgent',
<<<<<<< HEAD
      icon: '📊',
      iconColor: 'blue'
=======
      createdAt: '2026-03-01'
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
    },
    {
      id: 2,
      title: 'Campus Facilities Feedback',
      description: 'Share your thoughts on library resources and study spaces',
      questions: 8,
      status: 'new',
<<<<<<< HEAD
      icon: '💬',
      iconColor: 'purple'
=======
      createdAt: '2026-03-02'
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
    },
    {
      id: 3,
      title: 'Student Wellness Check-In',
      description: 'A short survey to help us understand student wellbeing',
      questions: 6,
      status: 'open',
<<<<<<< HEAD
      icon: '🎓',
      iconColor: 'orange'
=======
      createdAt: '2026-03-03'
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
    }
  ];

  const mockCompletedSurveys = [
    {
      id: 4,
      title: 'Faculty Performance Survey - 2nd Sem',
      questions: 10,
      submittedAt: '2026-02-14',
      timeAgo: '2 weeks ago',
      status: 'completed'
    },
    {
      id: 5,
      title: 'Online Learning Experience Survey',
      questions: 15,
      submittedAt: '2026-01-30',
      timeAgo: '1 month ago',
      status: 'completed'
    },
    {
      id: 6,
      title: 'Library Services Satisfaction Survey',
      questions: 7,
      submittedAt: '2026-01-10',
      timeAgo: '2 months ago',
      status: 'completed'
    }
  ];

<<<<<<< HEAD
  const getStatusBadge = (status) => {
    const badges = {
      urgent: { class: 'badge-urgent', label: 'Urgent' },
      new: { class: 'badge-new', label: 'New' },
      open: { class: 'badge-open', label: 'Open' },
      completed: { class: 'badge-done', label: 'Completed' }
=======
  useEffect(() => {
    // Use mock data for now
    setSurveys(mockAvailableSurveys);
    setCompletedSurveys(mockCompletedSurveys);
    setLoading(false);
    
    // Uncomment when API is ready
    // fetchSurveys();
  }, [activeTab]);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await api.get('/surveys', {
        params: { 
          status: activeTab === 'completed' ? 'completed' : 'available',
          limit: 20
        }
      });
      setSurveys(response.data.surveys);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      urgent: { bg: 'bg-red-600', text: 'text-white', label: 'Urgent' },
      new: { bg: 'bg-blue-500', text: 'text-white', label: 'New' },
      open: { bg: 'bg-green-600', text: 'text-white', label: 'Open' },
      completed: { bg: 'bg-gray-600', text: 'text-gray-300', label: 'Completed' }
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
    };
    return badges[status] || badges.open;
  };

<<<<<<< HEAD
  const getIconColorClass = (color) => {
    const colors = {
      blue: 'icon-blue',
      purple: 'icon-purple',
      green: 'icon-green',
      orange: 'icon-orange'
    };
    return colors[color] || 'icon-blue';
=======
  const getSurveyIcon = (title) => {
    if (title.includes('Course Evaluation')) {
      return <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
        <FileText className="h-4 w-4 text-white" />
      </div>;
    }
    if (title.includes('Campus Facilities')) {
      return <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
        <MessageSquare className="h-4 w-4 text-white" />
      </div>;
    }
    if (title.includes('Wellness')) {
      return <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
        <User className="h-4 w-4 text-white" />
      </div>;
    }
    return <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center">
      <FileText className="h-4 w-4 text-white" />
    </div>;
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

<<<<<<< HEAD
  const getUserName = () => {
    return user?.user_metadata?.name?.split(' ')[0] || 
           user?.email?.split('@')[0] || 
           'User';
  };

  const getUserInitials = () => {
    const name = user?.user_metadata?.name || user?.email || 'U';
    if (name.includes('@')) {
      return name.charAt(0).toUpperCase();
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#070d1a', color: '#e8eaf0' }}>
      {/* Background Effects */}
      <div className="glow-left"></div>
      <div className="glow-right"></div>
      <svg className="waves" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#4a7fcc" strokeWidth="1" fill="none" opacity="0.18">
          <path d="M-100 100 Q200 80 400 100 Q600 120 800 100 Q1000 80 1200 100 Q1400 120 1600 100"/>
          <path d="M-100 160 Q200 140 400 160 Q600 180 800 160 Q1000 140 1200 160 Q1400 180 1600 160"/>
          <path d="M-100 220 Q200 200 400 220 Q600 240 800 220 Q1000 200 1200 220 Q1400 240 1600 220"/>
          <path d="M-100 280 Q200 260 400 280 Q600 300 800 280 Q1000 260 1200 280 Q1400 300 1600 280"/>
          <path d="M-100 340 Q200 320 400 340 Q600 360 800 340 Q1000 320 1200 340 Q1400 360 1600 340"/>
          <path d="M-100 400 Q200 380 400 400 Q600 420 800 400 Q1000 380 1200 400 Q1400 420 1600 400"/>
        </g>
      </svg>

      <div className="shell">
        {/* Header */}
        <header>
          <div className="header-left">
            <span className="logo">Voxa</span>
          </div>
          <div className="header-center">
            <div className="search-box">
              <Search width="15" height="15" />
              <input 
                type="text" 
                placeholder="Search surveys..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="header-right">
            <div className="icon-btn">
              <Bell width="16" height="16" />
              <div className="notif-dot"></div>
            </div>
            <div className="user-btn">
              <div className="avatar">{getUserInitials()}</div>
              <span className="user-name">{getUserName()}</span>
              <ChevronDown width="12" height="12" />
            </div>
          </div>
        </header>

        <div className="body">
          {/* Sidebar */}
          <aside>
            <span className="nav-section-label">Menu</span>

            <Link to="/dashboard" className="nav-item active">
              <Grid3x3 width="16" height="16" />
              Dashboard
            </Link>

            <Link to="/my-responses" className="nav-item">
              <FileText width="16" height="16" />
              My Surveys
              <span className="nav-badge">{mockStats.pending}</span>
            </Link>

            <Link to="/profile" className="nav-item">
              <User width="16" height="16" />
              Profile
            </Link>

            <span className="nav-section-label" style={{marginTop: '20px'}}>Settings</span>

            <Link to="/help" className="nav-item">
              <HelpCircle width="16" height="16" />
              Help & Support
            </Link>
          </aside>

          {/* Main Content */}
          <main>
            {/* Welcome Banner */}
            <div className="welcome-banner">
              <div className="welcome-text">
                <h2>{getGreeting()}, {getUserName()}! 👋</h2>
                <p>You have {mockStats.pending} pending surveys to complete. Keep up the great work!</p>
              </div>
              <div className="welcome-stats">
                <div className="stat-pill">
                  <span className="num">{mockStats.pending}</span>
                  <span className="lbl">Pending</span>
                </div>
                <div className="stat-pill">
                  <span className="num">{mockStats.completed}</span>
                  <span className="lbl">Completed</span>
                </div>
                <div className="stat-pill">
                  <span className="num">{mockStats.responseRate}%</span>
                  <span className="lbl">Response Rate</span>
                </div>
              </div>
            </div>

            {/* Available Surveys */}
            <div className="section-header">
              <h3>📋 Available Surveys</h3>
              <Link className="see-all" to="/my-responses">View all →</Link>
            </div>

            <div className="survey-grid">
              {mockAvailableSurveys.map((survey) => {
                const badge = getStatusBadge(survey.status);
                const iconClass = getIconColorClass(survey.iconColor);
                return (
                  <div key={survey.id} className="survey-card">
                    <div className="card-top">
                      <div className={`card-icon ${iconClass}`}>{survey.icon}</div>
                      <span className={`badge ${badge.class}`}>{badge.label}</span>
                    </div>
                    <div className="card-title">{survey.title}</div>
                    <div className="card-desc">{survey.description}</div>
                    <div className="card-footer">
                      <div className="q-count">
                        <Clock width="13" height="13" />
                        {survey.questions} questions
                      </div>
                      <Link 
                        to={`/survey/${survey.id}`}
                        className="btn-take"
                      >
                        Take Survey
                      </Link>
=======
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">Voxa</h1>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 p-4">
          <div className="mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Menu</p>
            <nav className="space-y-2">
              <Link
                to="/dashboard"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white"
              >
                <Grid3x3 className="h-4 w-4 mr-3" />
                Dashboard
              </Link>
              <Link
                to="/my-responses"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <FileText className="h-4 w-4 mr-3" />
                My Surveys
                <span className="ml-auto bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <User className="h-4 w-4 mr-3" />
                Profile
              </Link>
            </nav>
          </div>
          
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Settings</p>
            <Link
              to="/help"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-3" />
              Help & Support
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-white">Voxa</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search surveys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              
              {/* User Profile */}
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'JS'}
                  </span>
                </div>
                <span className="text-sm font-medium text-white">
                  {user?.fullName || 'Juan Santos'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Greeting */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Good morning, {user?.firstName || 'Juan'}!
            </h2>
            <p className="text-blue-200">You have {mockStats.pending} pending surveys to complete</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-600 rounded-lg p-6">
              <p className="text-3xl font-bold text-white">{mockStats.pending}</p>
              <p className="text-blue-100">Pending</p>
            </div>
            <div className="bg-blue-600 rounded-lg p-6">
              <p className="text-3xl font-bold text-white">{mockStats.completed}</p>
              <p className="text-blue-100">Completed</p>
            </div>
            <div className="bg-blue-600 rounded-lg p-6">
              <p className="text-3xl font-bold text-white">{mockStats.responseRate}%</p>
              <p className="text-blue-100">Response Rate</p>
            </div>
          </div>

          {/* Available Surveys */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center mr-2">
                <FileText className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Available Surveys</h3>
            </div>
            
            <div className="space-y-4">
              {mockAvailableSurveys.map((survey) => {
                const badge = getStatusBadge(survey.status);
                return (
                  <div key={survey.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getSurveyIcon(survey.title)}
                          <h4 className="text-lg font-medium text-white">{survey.title}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </div>
                        
                        <p className="text-gray-300 mb-3">{survey.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                          <span>{survey.questions} questions</span>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <Link
                          to={`/survey/${survey.id}`}
                          className="inline-flex items-center px-4 py-2 border border-blue-400 text-sm font-medium rounded-lg text-blue-400 hover:bg-blue-400 hover:text-white transition-colors"
                        >
                          Take Survey
                        </Link>
                      </div>
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
                    </div>
                  </div>
                );
              })}
            </div>
<<<<<<< HEAD

            {/* Completed Surveys */}
            <div className="section-header">
              <h3>✅ Completed Surveys</h3>
              <Link className="see-all" to="/my-responses">View all →</Link>
            </div>

            <div className="completed-list">
              {mockCompletedSurveys.map((survey) => (
                <div key={survey.id} className="completed-item">
                  <div className="completed-icon">
                    <CheckCircle width="18" height="18" />
                  </div>
                  <div className="completed-info">
                    <div className="title">{survey.title}</div>
                    <div className="meta">{survey.questions} questions &nbsp;·&nbsp; Submitted {formatDate(survey.submittedAt)}</div>
                  </div>
                  <div className="completed-right">
                    <span className="badge badge-done">Completed</span>
                    <span className="completed-date">{survey.timeAgo}</span>
=======
          </div>

          {/* Completed Surveys */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Completed Surveys</h3>
            </div>
            
            <div className="space-y-4">
              {mockCompletedSurveys.map((survey) => (
                <div key={survey.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h4 className="text-lg font-medium text-white">{survey.title}</h4>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <span>{survey.questions} questions</span>
                        <span>Submitted {formatDate(survey.submittedAt)}</span>
                        <span>{survey.timeAgo}</span>
                      </div>
                      
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-gray-300">
                        Completed
                      </span>
                    </div>
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
                  </div>
                </div>
              ))}
            </div>
<<<<<<< HEAD
          </main>
        </div>

        {/* Footer */}
        <footer>
          <div className="footer-links">
            <Link to="/about">About Voxa</Link>
            <Link to="/help">Help Center</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Use</Link>
            <Link to="/support">Contact Support</Link>
          </div>
          <div className="copyright">© 2026 Voxa. All rights reserved.</div>
        </footer>
      </div>

      <style jsx>{`
        *, *::before, *::after { 
          box-sizing: border-box; 
          margin: 0; 
          padding: 0; 
        }

        :root {
          --bg: #070d1a;
          --bg2: #0b1425;
          --card: rgba(255,255,255,0.05);
          --card-border: rgba(255,255,255,0.08);
          --blue: #3b82f6;
          --blue-bright: #60a5fa;
          --text: #e8eaf0;
          --text-muted: #6b7a9a;
          --sidebar-w: 220px;
          --header-h: 60px;
        }

        body {
          font-family: 'Inter', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
          margin: 0;
          padding: 0;
          width: 100vw;
        }

        /* Background Effects */
        .glow-left {
          position: fixed;
          top: 20%;
          left: -100px;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(30,60,160,0.35) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .glow-right {
          position: fixed;
          bottom: 10%;
          right: -80px;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(30,100,200,0.3) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .waves {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          opacity: 0.18;
          pointer-events: none;
        }

        .shell {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          width: 100vw;
        }

        /* Header */
        header {
          height: var(--header-h);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px 0 0;
          background: rgba(7,13,26,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--card-border);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
          width: var(--sidebar-w);
          padding-left: 24px;
          flex-shrink: 0;
        }

        .logo {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.5px;
        }

        .header-center {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 0 24px;
          max-width: 520px;
        }

        .search-box {
          width: 100%;
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--card-border);
          border-radius: 10px;
          padding: 8px 14px;
          gap: 10px;
        }

        .search-box input {
          background: none;
          border: none;
          outline: none;
          font-size: 13px;
          color: var(--text);
          font-family: 'Inter', sans-serif;
          width: 100%;
        }

        .search-box input::placeholder { color: var(--text-muted); }

        .header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--card-border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
          color: var(--text-muted);
          position: relative;
        }

        .icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .notif-dot {
          position: absolute;
          top: 6px; right: 6px;
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--blue);
          border: 1.5px solid var(--bg);
        }

        .user-btn {
          display: flex;
          align-items: center;
          gap: 9px;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--card-border);
          border-radius: 10px;
          padding: 6px 12px 6px 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .user-btn:hover { background: rgba(255,255,255,0.1); }

        .avatar {
          width: 28px; height: 28px;
          border-radius: 8px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #fff;
        }

        .user-name { font-size: 13px; font-weight: 500; color: var(--text); }

        /* Body Layout */
        .body {
          display: flex;
          flex: 1;
          width: 100%;
        }

        /* Sidebar */
        aside {
          width: var(--sidebar-w);
          flex-shrink: 0;
          background: rgba(7,13,26,0.7);
          backdrop-filter: blur(10px);
          border-right: 1px solid var(--card-border);
          padding: 24px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: sticky;
          top: var(--header-h);
          height: calc(100vh - var(--header-h));
          overflow-y: auto;
        }

        .nav-section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.2px;
          color: var(--text-muted);
          text-transform: uppercase;
          padding: 0 10px;
          margin: 10px 0 6px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-muted);
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          text-decoration: none;
        }

        .nav-item:hover { background: rgba(255,255,255,0.06); color: var(--text); }

        .nav-item.active {
          background: rgba(59,130,246,0.15);
          color: var(--blue-bright);
          border: 1px solid rgba(59,130,246,0.2);
        }

        .nav-item svg { flex-shrink: 0; }

        .nav-badge {
          margin-left: auto;
          background: var(--blue);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 20px;
        }

        /* Main Content */
        main {
          flex: 1;
          padding: 32px 36px;
          overflow-y: auto;
          width: 100%;
          max-width: none;
        }

        /* Welcome Banner */
        .welcome-banner {
          background: linear-gradient(120deg, rgba(30,60,160,0.45) 0%, rgba(59,130,246,0.2) 100%);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 16px;
          padding: 28px 32px;
          margin-bottom: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          overflow: hidden;
          position: relative;
        }

        .welcome-banner::before {
          content: '';
          position: absolute;
          right: -40px; top: -40px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: rgba(59,130,246,0.1);
        }

        .welcome-text h2 {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .welcome-text p {
          font-size: 13.5px;
          color: var(--text-muted);
        }

        .welcome-stats {
          display: flex;
          gap: 24px;
        }

        .stat-pill {
          text-align: center;
          background: rgba(255,255,255,0.07);
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 12px 20px;
        }

        .stat-pill .num {
          font-size: 22px;
          font-weight: 700;
          color: var(--blue-bright);
          display: block;
        }

        .stat-pill .lbl {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
          display: block;
        }

        /* Section Headers */
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .section-header h3 {
          font-size: 16px;
          font-weight: 600;
        }

        .see-all {
          font-size: 12px;
          color: var(--blue);
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s;
        }

        .see-all:hover { color: var(--blue-bright); }

        /* Survey Grid */
        .survey-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 40px;
        }

        .survey-card {
          background: var(--card);
          border: 1px solid var(--card-border);
          border-radius: 14px;
          padding: 22px 22px 18px;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .survey-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--blue), #8b5cf6);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .survey-card:hover {
          border-color: rgba(59,130,246,0.35);
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.35);
        }

        .survey-card:hover::before { opacity: 1; }

        .card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .card-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .icon-blue { background: rgba(59,130,246,0.15); }
        .icon-purple { background: rgba(139,92,246,0.15); }
        .icon-green { background: rgba(16,185,129,0.15); }
        .icon-orange { background: rgba(245,158,11,0.15); }

        .badge {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.3px;
        }

        .badge-open { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.25); }
        .badge-new { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.25); }
        .badge-urgent { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
        .badge-done { background: rgba(107,114,128,0.15); color: #9ca3af; border: 1px solid rgba(107,114,128,0.2); }

        .card-title {
          font-size: 14.5px;
          font-weight: 600;
          margin-bottom: 6px;
          line-height: 1.4;
        }

        .card-desc {
          font-size: 12.5px;
          color: var(--text-muted);
          line-height: 1.55;
          margin-bottom: 16px;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid var(--card-border);
        }

        .q-count {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .btn-take {
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid rgba(59,130,246,0.4);
          background: rgba(59,130,246,0.12);
          color: var(--blue-bright);
          cursor: pointer;
          transition: background 0.2s;
          font-family: 'Inter', sans-serif;
          text-decoration: none;
        }

        .btn-take:hover { background: rgba(59,130,246,0.25); }

        /* Completed List */
        .completed-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 40px;
        }

        .completed-item {
          background: var(--card);
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: border-color 0.2s;
        }

        .completed-item:hover { border-color: rgba(255,255,255,0.12); }

        .completed-icon {
          width: 36px; height: 36px;
          border-radius: 9px;
          background: rgba(16,185,129,0.12);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .completed-info { flex: 1; }

        .completed-info .title {
          font-size: 13.5px;
          font-weight: 600;
          margin-bottom: 3px;
        }

        .completed-info .meta {
          font-size: 12px;
          color: var(--text-muted);
        }

        .completed-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .completed-date {
          font-size: 11px;
          color: var(--text-muted);
        }

        /* Footer */
        footer {
          background: rgba(7,13,26,0.9);
          backdrop-filter: blur(10px);
          border-top: 1px solid var(--card-border);
          padding: 20px 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        .footer-links {
          display: flex;
          gap: 22px;
        }

        .footer-links a {
          font-size: 12px;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-links a:hover { color: var(--text); }

        .copyright {
          font-size: 12px;
          color: var(--text-muted);
        }
      `}</style>
=======
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 border-t border-gray-700 px-6 py-8 mt-12">
          <div className="flex flex-wrap justify-center space-x-8 text-sm text-gray-400">
            <Link to="/about" className="hover:text-white transition-colors">About Voxa</Link>
            <Link to="/help" className="hover:text-white transition-colors">Help Center</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link to="/support" className="hover:text-white transition-colors">Contact Support</Link>
          </div>
          <div className="text-center text-sm text-gray-500 mt-6">
            © 2026 Voxa. All rights reserved.
          </div>
        </footer>
      </div>
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
    </div>
  );
};

export default Dashboard;
