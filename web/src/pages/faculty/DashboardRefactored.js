/**
 * Faculty Dashboard - Modern UI Design
 * Similar to student dashboard but tailored for faculty needs
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  BarChart3, 
  Users, 
  FileText, 
  Clock, 
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  Bell,
  User,
  LogOut,
  Home,
  FileCheck,
  Settings,
  HelpCircle
} from 'lucide-react';

const FacultyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState('dashboard');

  // Mock data for faculty dashboard
  const [stats, setStats] = useState({
    totalSurveys: 12,
    activeSurveys: 3,
    totalResponses: 247,
    avgCompletionRate: 78
  });

  const [recentSurveys, setRecentSurveys] = useState([
    {
      id: 1,
      title: 'Course Evaluation - CS101',
      type: 'Course Evaluation',
      status: 'active',
      responses: 45,
      totalStudents: 60,
      created: '2024-01-15',
      deadline: '2024-01-30'
    },
    {
      id: 2,
      title: 'Mid-term Feedback Survey',
      type: 'Feedback',
      status: 'draft',
      responses: 0,
      totalStudents: 0,
      created: '2024-01-18',
      deadline: '2024-02-15'
    },
    {
      id: 3,
      title: 'Lab Equipment Usage',
      type: 'Research',
      status: 'completed',
      responses: 89,
      totalStudents: 120,
      created: '2024-01-10',
      deadline: '2024-01-20'
    }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, message: 'CS101 survey deadline approaching', type: 'warning', time: '2 hours ago' },
    { id: 2, message: 'New responses received for Lab Equipment survey', type: 'success', time: '5 hours ago' },
    { id: 3, message: 'Course evaluation report is ready', type: 'info', time: '1 day ago' }
  ]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'F';
    const names = user.name.split(' ');
    return names.map(name => name[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <TrendingUp className="w-4 h-4" />;
      case 'draft': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'surveys', label: 'My Surveys', icon: FileText },
    { id: 'responses', label: 'Responses', icon: FileCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ];

  const handleNavClick = (itemId) => {
    setActiveNav(itemId);
    // Navigate to corresponding page
    switch (itemId) {
      case 'surveys':
        navigate('/faculty/surveys');
        break;
      case 'responses':
        navigate('/faculty/surveys/responses');
        break;
      case 'analytics':
        // Navigate to analytics page when implemented
        break;
      case 'settings':
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  const handleCreateSurvey = () => {
    navigate('/faculty/surveys/new');
  };

  const handleViewSurvey = (surveyId) => {
    navigate(`/faculty/surveys/${surveyId}/edit`);
  };

  const handleViewResponses = (surveyId) => {
    navigate(`/faculty/surveys/${surveyId}/responses`);
  };

  // CSS-in-JS for faculty dashboard
  const facultyDashboardStyles = `
    :root {
      --bg: #070d1a;
      --card: rgba(15, 23, 42, 0.6);
      --card-border: rgba(59, 130, 246, 0.1);
      --text: #e2e8f0;
      --text-secondary: #94a3b8;
      --sidebar-w: 220px;
      --header-h: 68px;
      --primary: #3b82f6;
      --primary-dark: #2563eb;
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

    .shell {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 100vw;
    }

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
      color: var(--text);
      font-size: 14px;
      flex: 1;
    }

    .search-box input::placeholder {
      color: var(--text-secondary);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .icon-btn {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--card-border);
      color: var(--text);
      cursor: pointer;
      transition: all 0.2s;
    }

    .icon-btn:hover {
      background: rgba(255,255,255,0.1);
      border-color: var(--primary);
    }

    .notification-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 18px;
      height: 18px;
      background: #ef4444;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
    }

    .user-avatar {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .user-avatar:hover {
      background: var(--primary-dark);
    }

    .body {
      display: flex;
      flex: 1;
      width: 100%;
    }

    aside {
      width: var(--sidebar-w);
      flex-shrink: 0;
      background: rgba(7,13,26,0.7);
      backdrop-filter: blur(10px);
      border-right: 1px solid var(--card-border);
      padding: 24px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 10px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
      font-weight: 500;
    }

    .nav-item:hover {
      background: rgba(255,255,255,0.05);
      color: var(--text);
    }

    .nav-item.active {
      background: rgba(59,130,246,0.15);
      color: var(--primary);
      border: 1px solid rgba(59,130,246,0.2);
    }

    .nav-item svg {
      width: 18px;
      height: 18px;
    }

    .nav-item .badge {
      margin-left: auto;
      background: rgba(59,130,246,0.2);
      color: var(--primary);
      padding: 2px 7px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
    }

    main {
      flex: 1;
      padding: 32px 36px;
      overflow-y: auto;
      width: 100%;
      max-width: none;
    }

    .welcome-banner {
      background: linear-gradient(120deg, rgba(30,60,160,0.45) 0%, rgba(59,130,246,0.2) 100%);
      border: 1px solid rgba(59,130,246,0.2);
      border-radius: 16px;
      padding: 28px 32px;
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }

    .welcome-content h1 {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 8px;
    }

    .welcome-content p {
      color: #cbd5e1;
      font-size: 16px;
    }

    .welcome-stats {
      display: flex;
      gap: 24px;
    }

    .stat-pill {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 12px;
      padding: 12px 18px;
      text-align: center;
    }

    .stat-pill .value {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      display: block;
    }

    .stat-pill .label {
      font-size: 12px;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .glow-orb {
      position: absolute;
      top: -50px;
      right: -50px;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 20px;
      backdrop-filter: blur(10px);
      transition: all 0.3s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      border-color: rgba(59,130,246,0.3);
      box-shadow: 0 8px 32px rgba(59,130,246,0.1);
    }

    .stat-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .stat-card-title {
      font-size: 14px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .stat-card-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-card-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }

    .stat-card-change {
      font-size: 13px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .stat-card-change.positive {
      color: #10b981;
    }

    .stat-card-change.negative {
      color: #ef4444;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 32px;
    }

    .surveys-section {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }

    .section-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
    }

    .create-btn {
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .create-btn:hover {
      background: var(--primary-dark);
    }

    .survey-list {
      padding: 0;
    }

    .survey-item {
      padding: 20px 24px;
      border-bottom: 1px solid var(--card-border);
      transition: all 0.2s;
      cursor: pointer;
    }

    .survey-item:hover {
      background: rgba(255,255,255,0.02);
    }

    .survey-item:last-child {
      border-bottom: none;
    }

    .survey-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .survey-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }

    .survey-meta {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .survey-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--card-border);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: rgba(255,255,255,0.1);
      color: var(--text);
    }

    .survey-stats {
      display: flex;
      gap: 16px;
      margin-top: 12px;
    }

    .survey-stat {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .notifications-section {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }

    .notification-list {
      padding: 0;
    }

    .notification-item {
      padding: 16px 20px;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      gap: 12px;
      transition: all 0.2s;
    }

    .notification-item:hover {
      background: rgba(255,255,255,0.02);
    }

    .notification-item:last-child {
      border-bottom: none;
    }

    .notification-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notification-icon.warning {
      background: rgba(245,158,11,0.1);
      color: #f59e0b;
    }

    .notification-icon.success {
      background: rgba(16,185,129,0.1);
      color: #10b981;
    }

    .notification-icon.info {
      background: rgba(59,130,246,0.1);
      color: #3b82f6;
    }

    .notification-content {
      flex: 1;
    }

    .notification-message {
      font-size: 14px;
      color: var(--text);
      margin-bottom: 4px;
      line-height: 1.4;
    }

    .notification-time {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }

    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
      
      .welcome-stats {
        display: none;
      }
    }
  `;

  return (
    <>
      <style>{facultyDashboardStyles}</style>
      <div className="shell">
        <div className="glow-left"></div>
        <div className="glow-right"></div>
        <div className="waves"></div>
        
        <header>
          <div className="header-left">
            <div className="logo">Voxa Faculty</div>
          </div>
          
          <div className="header-center">
            <div className="search-box">
              <Search className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search surveys, responses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="header-right">
            <div className="icon-btn" style={{ position: 'relative' }}>
              <Bell className="w-4 h-4" />
              <div className="notification-badge">3</div>
            </div>
            
            <div className="user-avatar">
              {getUserInitials()}
            </div>
          </div>
        </header>

        <div className="body">
          <aside>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.id} 
                  className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.id === 'surveys' && <span className="badge">12</span>}
                </div>
              );
            })}
          </aside>

          <main>
            <div className="welcome-banner">
              <div className="welcome-content">
                <h1>{getGreeting()}, {user?.name || 'Faculty'}!</h1>
                <p>Manage your surveys and analyze student responses</p>
              </div>
              
              <div className="welcome-stats">
                <div className="stat-pill">
                  <span className="value">{stats.totalSurveys}</span>
                  <span className="label">Total Surveys</span>
                </div>
                <div className="stat-pill">
                  <span className="value">{stats.activeSurveys}</span>
                  <span className="label">Active</span>
                </div>
                <div className="stat-pill">
                  <span className="value">{stats.totalResponses}</span>
                  <span className="label">Responses</span>
                </div>
              </div>
              
              <div className="glow-orb"></div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Total Surveys</span>
                  <div className="stat-card-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div className="stat-card-value">{stats.totalSurveys}</div>
                <div className="stat-card-change positive">
                  <TrendingUp className="w-4 h-4" />
                  <span>+2 this month</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Active Surveys</span>
                  <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="stat-card-value">{stats.activeSurveys}</div>
                <div className="stat-card-change positive">
                  <TrendingUp className="w-4 h-4" />
                  <span>1 added this week</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Total Responses</span>
                  <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="stat-card-value">{stats.totalResponses}</div>
                <div className="stat-card-change positive">
                  <TrendingUp className="w-4 h-4" />
                  <span>+45 this week</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Avg. Completion Rate</span>
                  <div className="stat-card-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
                    <BarChart3 className="w-5 h-5" />
                  </div>
                </div>
                <div className="stat-card-value">{stats.avgCompletionRate}%</div>
                <div className="stat-card-change negative">
                  <TrendingUp className="w-4 h-4" style={{ transform: 'rotate(180deg)' }} />
                  <span>-3% from last month</span>
                </div>
              </div>
            </div>

            <div className="content-grid">
              <div className="surveys-section">
                <div className="section-header">
                  <h2 className="section-title">Recent Surveys</h2>
                  <button className="create-btn" onClick={handleCreateSurvey}>
                    <Plus className="w-4 h-4" />
                    Create Survey
                  </button>
                </div>
                
                <div className="survey-list">
                  {recentSurveys.map(survey => (
                    <div key={survey.id} className="survey-item">
                      <div className="survey-header">
                        <div>
                          <div className="survey-title">{survey.title}</div>
                          <div className="survey-meta">
                            {survey.type} • Created {survey.created}
                          </div>
                        </div>
                        <div className="survey-actions">
                          <div 
                            className="action-btn" 
                            onClick={() => handleViewSurvey(survey.id)}
                            title="Edit Survey"
                          >
                            <Edit className="w-4 h-4" />
                          </div>
                          <div 
                            className="action-btn" 
                            onClick={() => handleViewResponses(survey.id)}
                            title="View Responses"
                          >
                            <Eye className="w-4 h-4" />
                          </div>
                          <div className="action-btn" title="More Options">
                            <MoreVertical className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="status-badge" style={{ 
                        backgroundColor: getStatusColor(survey.status).replace('text-', '').replace('bg-', 'rgba('),
                        color: 'var(--text)'
                      }}>
                        {getStatusIcon(survey.status)}
                        <span>{survey.status}</span>
                      </div>
                      
                      <div className="survey-stats">
                        <div className="survey-stat">
                          <Users className="w-4 h-4" />
                          <span>{survey.responses}/{survey.totalStudents} responses</span>
                        </div>
                        <div className="survey-stat">
                          <Calendar className="w-4 h-4" />
                          <span>Due {survey.deadline}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="notifications-section">
                <div className="section-header">
                  <h2 className="section-title">Notifications</h2>
                </div>
                
                <div className="notification-list">
                  {notifications.map(notification => (
                    <div key={notification.id} className="notification-item">
                      <div className={`notification-icon ${notification.type}`}>
                        {notification.type === 'warning' && <AlertCircle className="w-4 h-4" />}
                        {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
                        {notification.type === 'info' && <Bell className="w-4 h-4" />}
                      </div>
                      <div className="notification-content">
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">{notification.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default FacultyDashboard;
