import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="navbar-brand">⚡ Eventify</NavLink>
        <div className="navbar-links">
          <NavLink to="/events" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Browse Events
          </NavLink>
          {user ? (
            <>
              <NavLink
                to="/my-registrations"
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                My Registrations
              </NavLink>
              <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', padding: '0 0.25rem' }}>
                Hi, {user.name.split(' ')[0]}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Login
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
