import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import LoginPage from './pages/LoginPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import TutorCourseManager from './pages/TutorCourseManager';
import ResourcesPage from './pages/ResourcesPage';

/** Route guard: requires login */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Route guard: only tutors can access */
function ProtectedTutorRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'tutor') return <Navigate to="/courses" replace />;
  return <>{children}</>;
}

/** Shared layout with Navbar + Chatbot for authenticated pages */
function AuthenticatedLayout() {
  return (
    <ProtectedRoute>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Chatbot />
    </ProtectedRoute>
  );
}

/** All application routes */
function AppRoutes() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<AuthenticatedLayout />}>
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailsPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route
            path="/tutor/manage-courses"
            element={
              <ProtectedTutorRoute>
                <TutorCourseManager />
              </ProtectedTutorRoute>
            }
          />
        </Route>
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
