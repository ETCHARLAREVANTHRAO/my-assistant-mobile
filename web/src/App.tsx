import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Chat from './pages/Chat';
import Documents from './pages/Documents';
import RevisionPlanner from './pages/RevisionPlanner';
import QuizSetup from './pages/QuizSetup';
import QuizResults from './pages/QuizResults';
import MockTestSession from './pages/MockTestSession';
import MockTestResults from './pages/MockTestResults';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import Account from './pages/Account';
import UsageDashboard from './pages/UsageDashboard';

function RootRedirect() {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={currentUser ? '/chat' : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
      <Route path="/revision-planner" element={<ProtectedRoute><RevisionPlanner /></ProtectedRoute>} />
      <Route path="/quiz" element={<ProtectedRoute><QuizSetup /></ProtectedRoute>} />
      <Route path="/quiz/results" element={<ProtectedRoute><QuizResults /></ProtectedRoute>} />
      <Route path="/mock-test" element={<ProtectedRoute><MockTestSession /></ProtectedRoute>} />
      <Route path="/mock-test/results" element={<ProtectedRoute><MockTestResults /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
      <Route path="/usage" element={<ProtectedRoute><UsageDashboard /></ProtectedRoute>} />

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
