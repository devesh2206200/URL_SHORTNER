import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../images/logo.svg';
import { User, LogOut, LayoutDashboard, Home } from 'lucide-react';

export default function Header({ user, onAuthClick, onLogout }) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="header flex justify-between items-center padding-xy">
      <div className="flex items-center gap-10">
        <Link to="/" className="logo cursor-pointer">
          <img src={logo} alt="Shortly Logo" />
        </Link>
        
        {user && (
          <nav className="header-nav hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`nav-link-btn ${currentPath === '/' ? 'active-nav' : ''}`} 
            >
              <Home size={16} />
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className={`nav-link-btn ${currentPath === '/dashboard' ? 'active-nav' : ''}`} 
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          </nav>
        )}
      </div>

      <div className="header-actions flex items-center gap-4">
        {user ? (
          <div className="user-profile-header flex items-center gap-4">
            {/* Mobile Navigation icons */}
            <Link 
              to="/" 
              className={`nav-link-icon-btn md:hidden ${currentPath === '/' ? 'active-nav' : ''}`} 
              title="Home"
            >
              <Home size={18} />
            </Link>
            <Link 
              to="/dashboard" 
              className={`nav-link-icon-btn md:hidden ${currentPath === '/dashboard' ? 'active-nav' : ''}`} 
              title="Dashboard"
            >
              <LayoutDashboard size={18} />
            </Link>

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