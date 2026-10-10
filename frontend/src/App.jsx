import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import Results from './pages/Results';
import HistoryPage from './pages/History';
import About from './pages/About';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';

// Strict Auth Guard to prevent unauthenticated analysis access
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('authenticity_user');
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="app-layout" style={{ background: '#020617', color: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main className="main-content" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Protected Routes - Requires Sign In */}
            <Route path="/analyze" element={
              <ProtectedRoute>
                <Analyze />
              </ProtectedRoute>
            } />
            <Route path="/results/:analysisId" element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            } />

            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;