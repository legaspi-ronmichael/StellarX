import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Leagues from './pages/Leagues.jsx';
import LeagueDetail from './pages/LeagueDetail.jsx';
import LeagueCreate from './pages/LeagueCreate.jsx';
import Teams from './pages/Teams.jsx';
import TeamDetail from './pages/TeamDetail.jsx';
import Ledger from './pages/Ledger.jsx';
import PublicExplorer from './pages/PublicExplorer.jsx';
import Profile from './pages/Profile.jsx';
import Loading from './components/Loading.jsx';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <Loading />;

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/explorer" element={<PublicExplorer />} />
          <Route path="/leagues" element={<Leagues />} />
          <Route path="/leagues/:id" element={<LeagueDetail />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leagues/new"
            element={
              <ProtectedRoute roles={['admin']}>
                <LeagueCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <Teams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams/:id"
            element={
              <ProtectedRoute>
                <TeamDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ledger"
            element={
              <ProtectedRoute>
                <Ledger />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
