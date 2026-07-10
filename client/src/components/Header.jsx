import React from 'react';
import logo from '../images/logo.svg';
import { User, LogOut, LayoutDashboard, Home } from 'lucide-react';

export default function Header({ user, onAuthClick, onLogout, view, setView }) {
  return (
    <header className="header flex justify-between items-center padding-xy">
      <div className="flex items-center gap-10">
        <div className="logo cursor-pointer" onClick={() => setView('home')}>
          <img src={logo} alt="Shortly Logo" />
        </div>
        
        {user && (
          <nav className="header-nav hidden md:flex items-center gap-6">
            <button 
              className={`nav-link-btn ${view === 'home' ? 'active-nav' : ''}`} 
              onClick={() => setView('home')}
            >
              <Home size={16} />
              Home
            </button>
            <button 
              className={`nav-link-btn ${view === 'dashboard' ? 'active-nav' : ''}`} 
              onClick={() => setView('dashboard')}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>
          </nav>
        )}
      </div>

      <div className="header-actions flex items-center gap-4">
        {user ? (
          <div className="user-profile-header flex items-center gap-4">
            {/* Mobile Navigation icons */}
            <button 
              className={`nav-link-icon-btn md:hidden ${view === 'home' ? 'active-nav' : ''}`} 
              onClick={() => setView('home')}
              title="Home"
            >
              <Home size={18} />
            </button>
            <button 
              className={`nav-link-icon-btn md:hidden ${view === 'dashboard' ? 'active-nav' : ''}`} 
              onClick={() => setView('dashboard')}
              title="Dashboard"
            >
              <LayoutDashboard size={18} />
            </button>

            <div className="user-details hidden sm:flex items-center gap-2">
              <div className="avatar">
                <User size={14} />
              </div>
              <span className="user-email" title={user.email}>
                {user.email.length > 20 ? `${user.email.slice(0, 18)}...` : user.email}
              </span>
            </div>

            <button className="btn-logout flex items-center gap-1" onClick={onLogout}>
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="auth-buttons flex items-center gap-4">
            <button className="btn-login" onClick={onAuthClick}>
              Login
            </button>
            <button className="btn-signup" onClick={onAuthClick}>
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}