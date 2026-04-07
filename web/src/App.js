import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AuthCallback from './pages/auth/AuthCallback';

// Public pages
import About from './pages/About';
import Help from './pages/Help';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Support from './pages/Support';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import TakeSurvey from './components/Survey/TakeSurvey';
import TakeSurveyRefactored from './components/Survey/TakeSurveyRefactored';
import MyResponses from './pages/student/MyResponses';
import ResponseDetails from './pages/student/ResponseDetails';

// Faculty pages
import FacultyDashboard from './pages/faculty/Dashboard';
import FacultyDashboardRefactored from './pages/faculty/DashboardRefactored';
import SurveyManagement from './pages/faculty/SurveyManagement';
import CreateSurvey from './pages/faculty/CreateSurvey';
import EditSurvey from './pages/faculty/EditSurvey';
import SurveyResponses from './pages/faculty/SurveyResponses';
import ResponseView from './pages/faculty/ResponseView';

// Profile pages
import Profile from './pages/Profile';

// Common pages
import NotFound from './pages/NotFound';
import DesignPatternsDemo from './pages/DesignPatternsDemo';

// Debug: Log App component mounting
console.log('App component is mounting...');

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/about" element={<About />} />
            <Route path="/help" element={<Help />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/support" element={<Support />} />
            <Route path="/patterns-demo" element={<DesignPatternsDemo />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Default redirect based on role */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Student routes */}
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="survey/:id" element={<TakeSurveyRefactored />} />
              <Route path="survey/:id/original" element={<TakeSurvey />} />
              <Route path="my-responses" element={<MyResponses />} />
              <Route path="my-responses/:id" element={<ResponseDetails />} />
              
              {/* Faculty routes */}
              <Route path="faculty/dashboard" element={<FacultyDashboardRefactored />} />
              <Route path="faculty/dashboard/original" element={<FacultyDashboard />} />
              <Route path="faculty/surveys" element={<SurveyManagement />} />
              <Route path="faculty/surveys/new" element={<CreateSurvey />} />
              <Route path="faculty/surveys/:id/edit" element={<EditSurvey />} />
              <Route path="faculty/surveys/:id/responses" element={<SurveyResponses />} />
              <Route path="faculty/surveys/:id/responses/:userId" element={<ResponseView />} />
              
              {/* Profile */}
              <Route path="profile" element={<Profile />} />
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
