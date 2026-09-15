import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout.jsx';
import Login from './pages/login.jsx';
import Signup from './pages/signup.jsx';
import Onboarding from './pages/onboarding.jsx';
import Dashboard from './pages/dashboard.jsx';
import Schedule from './pages/schedule.jsx';
import Family from './pages/family.jsx';
import Settings from './pages/settings.jsx';
import authService from './services/authService';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    authService.isAuthenticated()
  );

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((user) => {
      setIsAuthenticated(!!user);
    });

    return unsubscribe;
  }, []);

  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

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
      </Routes>
    </Router>
  );
}

export default App;