import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import Layout from './components/Layout';

// Auth pages
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import AuthSuccess from './features/auth/pages/AuthSuccess';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import ResetPassword from './features/auth/pages/ResetPassword';

// Public pages
import About from './features/users/pages/About';

// Student pages
import StudentDashboard from './features/users/pages/StudentDashboard';
import TakeSurvey from './features/surveys/pages/TakeSurvey';
import MyResponses from './features/surveys/pages/MyResponses';
import ResponseDetails from './features/surveys/pages/ResponseDetails';

// Faculty pages
import FacultyDashboard from './features/admin/pages/Dashboard';
import FacultyFeed from './features/posts/pages/Feed';
import SurveyManagement from './features/surveys/pages/SurveyManagement';
import CreateSurvey from './features/surveys/pages/CreateSurvey';
import EditSurvey from './features/surveys/pages/EditSurvey';
import SurveyResponses from './features/surveys/pages/SurveyResponses';
import ResponseView from './features/surveys/pages/ResponseView';
import ResponseOverview from './features/surveys/pages/ResponseOverview';
import SurveyDetails from './features/surveys/pages/SurveyDetails';

// Profile pages
import Profile from './features/users/pages/Profile';

// Common pages
import NotFound from './features/users/pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Default redirect based on role */}
              <Route index element={<RoleBasedRedirect />} />
              
              {/* Student routes - restricted to student role only */}
              <Route path="dashboard" element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </RoleBasedRoute>
              } />
              <Route path="survey/:id" element={<TakeSurvey />} />
              <Route path="my-responses" element={<MyResponses />} />
              <Route path="my-responses/:id" element={<ResponseDetails />} />
              
              {/* Faculty routes - restricted to teacher/faculty roles only */}
              <Route path="faculty/*" element={
                <RoleBasedRoute allowedRoles={['teacher', 'faculty']}>
                  <Routes>
                    <Route path="dashboard" element={<FacultyDashboard />} />
                    <Route path="feed" element={<FacultyFeed />} />
                    <Route path="surveys" element={<SurveyManagement />} />
                    <Route path="surveys/new" element={<CreateSurvey />} />
                    <Route path="surveys/:id" element={<SurveyDetails />} />
                    <Route path="surveys/:id/edit" element={<EditSurvey />} />
                    <Route path="responses" element={<ResponseOverview />} />
                    <Route path="surveys/:id/responses" element={<SurveyResponses />} />
                    <Route path="surveys/:id/responses/:userId" element={<ResponseView />} />
                  </Routes>
                </RoleBasedRoute>
              } />
              
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
