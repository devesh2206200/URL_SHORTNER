import React, { useState } from 'react';
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
  const [view, setView] = useState('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  function handleAuthSuccess(newToken, newUser) {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setView('dashboard');
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setView('home');
  }

  return (
    <>
      <Header user={user} onAuthClick={() => setIsAuthModalOpen(true)} onLogout={handleLogout} view={view} setView={setView} />

      {view === 'home' ? (
        <><Hero /><Main token={token} /></>
      ) : (
        <Dashboard token={token} onLogout={handleLogout} />
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onAuthSuccess={handleAuthSuccess} />
    </>
  );
}

export default App;