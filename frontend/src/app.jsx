import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout.jsx';
import Login from './pages/login.jsx';
import Signup from './pages/signup.jsx';
import ForgotPassword from './pages/forgotPassword.jsx';
import Onboarding from './pages/onboarding.jsx';
import Dashboard from './pages/dashboard.jsx';
import Schedule from './pages/schedule.jsx';
import Family from './pages/family.jsx';
import Settings from './pages/settings.jsx';
import authService from './services/authService';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((user) => {
      setIsAuthenticated(!!user);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <Router>
      {authLoading ? (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" aria-label="Loading authentication" />
        </div>
      ) : <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes */}
        <Route
          path="/onboarding"
          element={
            isAuthenticated ? (
              <Onboarding />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/family" element={<Family />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>}
    </Router>
  );
}

export default App;