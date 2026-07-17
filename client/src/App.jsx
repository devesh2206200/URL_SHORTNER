import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from './components/Header';
import Hero from './components/Hero';
import Main from './components/Main';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  function handleAuthSuccess(newToken, newUser) {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    toast.success(`Welcome back, ${newUser.email}!`);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully.');
  }

  return (
    <BrowserRouter>
      <Header 
        user={user} 
        onAuthClick={() => setIsAuthModalOpen(true)} 
        onLogout={handleLogout} 
      />

      <Routes>
        <Route 
          path="/" 
          element={
            <>
              <Hero />
              <Main token={token} />
            </>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            token ? (
              <Dashboard token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        {/* Styled Fallback / 404 Route */}
        <Route 
          path="*" 
          element={
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <h1 className="text-6xl font-extrabold text-gray-800">404</h1>
              <p className="text-xl text-gray-600 mt-4">Oops! The page you are looking for doesn't exist.</p>
              <Navigate to="/" replace />
            </div>
          } 
        />
      </Routes>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={handleAuthSuccess} 
      />
    </BrowserRouter>
  );
}

export default App;