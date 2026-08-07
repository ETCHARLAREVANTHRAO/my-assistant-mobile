import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Chat from './pages/Chat';
import Documents from './pages/Documents';
import Learning from './pages/Learning';
import Doubts from './pages/Doubts';
import RevisionPlanner from './pages/RevisionPlanner';
import Resources from './pages/Resources';
import AIFeatures from './pages/AIFeatures';
import Community from './pages/Community';
import ExamInfo from './pages/ExamInfo';
import Motivation from './pages/Motivation';
import Revision from './pages/Revision';
import QuizSetup from './pages/QuizSetup';
import QuizResults from './pages/QuizResults';
import MockTestSession from './pages/MockTestSession';
import MockTestResults from './pages/MockTestResults';
import PYQHome from './pages/PYQHome';
import PYQInstructions from './pages/PYQInstructions';
import PYQSession from './pages/PYQSession';
import PYQResult from './pages/PYQResult';
import PYQReview from './pages/PYQReview';
import Progress from './pages/Progress';
import Downloads from './pages/Downloads';
import Settings from './pages/Settings';
import Account from './pages/Account';
import UsageDashboard from './pages/UsageDashboard';
import AdminDriveSync from './pages/AdminDriveSync';
import AdminContent from './pages/AdminContent';
import AdminDashboard from './pages/AdminDashboard';

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
      <Route path="/learning" element={<ProtectedRoute><Learning /></ProtectedRoute>} />
      <Route path="/doubts" element={<ProtectedRoute><Doubts /></ProtectedRoute>} />
      <Route path="/revision-planner" element={<ProtectedRoute><RevisionPlanner /></ProtectedRoute>} />
      <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
      <Route path="/ai" element={<ProtectedRoute><AIFeatures /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/exam-info" element={<ProtectedRoute><ExamInfo /></ProtectedRoute>} />
      <Route path="/motivation" element={<ProtectedRoute><Motivation /></ProtectedRoute>} />
      <Route path="/revision" element={<ProtectedRoute><Revision /></ProtectedRoute>} />
      <Route path="/quiz" element={<ProtectedRoute><QuizSetup /></ProtectedRoute>} />
      <Route path="/quiz/results" element={<ProtectedRoute><QuizResults /></ProtectedRoute>} />
      <Route path="/mock-test" element={<ProtectedRoute><MockTestSession /></ProtectedRoute>} />
      <Route path="/mock-test/results" element={<ProtectedRoute><MockTestResults /></ProtectedRoute>} />
      <Route path="/pyq" element={<ProtectedRoute><PYQHome /></ProtectedRoute>} />
      <Route path="/pyq/:paperId/instructions" element={<ProtectedRoute><PYQInstructions /></ProtectedRoute>} />
      <Route path="/pyq/attempt/:attemptId" element={<ProtectedRoute><PYQSession /></ProtectedRoute>} />
      <Route path="/pyq/result/:attemptId" element={<ProtectedRoute><PYQResult /></ProtectedRoute>} />
      <Route path="/pyq/review/:attemptId" element={<ProtectedRoute><PYQReview /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
      <Route path="/downloads" element={<ProtectedRoute><Downloads /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
      <Route path="/usage" element={<ProtectedRoute><UsageDashboard /></ProtectedRoute>} />
      <Route path="/admin/drive-sync" element={<ProtectedRoute><AdminDriveSync /></ProtectedRoute>} />
      <Route path="/admin/content" element={<ProtectedRoute><AdminContent /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

function App() {
  const Router = window.location.protocol === 'file:' ? HashRouter : BrowserRouter;

  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;









