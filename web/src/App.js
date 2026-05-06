import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import Layout from './components/Layout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AuthSuccess from './pages/auth/AuthSuccess';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Public pages
import About from './pages/About';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import TakeSurvey from './pages/student/TakeSurvey';
import MyResponses from './pages/student/MyResponses';
import ResponseDetails from './pages/student/ResponseDetails';

// Faculty pages
import FacultyDashboard from './pages/faculty/Dashboard';
import FacultyFeed from './pages/faculty/Feed';
import SurveyManagement from './pages/faculty/SurveyManagement';
import CreateSurvey from './pages/faculty/CreateSurvey';
import EditSurvey from './pages/faculty/EditSurvey';
import SurveyResponses from './pages/faculty/SurveyResponses';
import ResponseView from './pages/faculty/ResponseView';
import ResponseOverview from './pages/faculty/ResponseOverview';
import SurveyDetails from './pages/faculty/SurveyDetails';

// Profile pages
import Profile from './pages/Profile';

// Common pages
import NotFound from './pages/NotFound';

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
