import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Droplet, BarChart3, Shield, LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'rgba(7, 13, 24, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0 24px'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px'
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          color: 'inherit'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-deep-blue))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0, 229, 255, 0.4)'
          }}>
            <Droplet size={22} color="#040912" fill="#040912" />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.3rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg, #ffffff, var(--accent-cyan))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              HydroTrack
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '8px'
        }} className="desktop-nav">
          <Link
            to="/dashboard"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/dashboard') ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              background: isActive('/dashboard') ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Droplet size={18} />
            Today's Log
          </Link>

          <Link
            to="/history"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/history') ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              background: isActive('/history') ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <BarChart3 size={18} />
            History & Trends
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: isActive('/admin') ? '#a78bfa' : 'var(--text-secondary)',
                background: isActive('/admin') ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Shield size={18} />
              Admin Portal
            </Link>
          )}
        </div>

        {/* Right side Profile & Logout */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '16px'
        }} className="desktop-nav">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '6px 14px',
            borderRadius: '9999px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: isAdmin ? 'rgba(139, 92, 246, 0.3)' : 'rgba(0, 229, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserIcon size={16} color={isAdmin ? '#c4b5fd' : '#38bdf8'} />
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {user?.name || 'User'}
              </span>
            </div>
            <span className={isAdmin ? 'badge badge-admin' : 'badge badge-user'} style={{ fontSize: '0.7rem' }}>
              {isAdmin ? 'Admin' : 'User'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Log Out"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'block',
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: 'var(--bg-secondary)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <div>
              <div style={{ fontWeight: 700 }}>{user?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</div>
            </div>
            <span className={isAdmin ? 'badge badge-admin' : 'badge badge-user'}>
              {isAdmin ? 'Admin' : 'User'}
            </span>
          </div>

          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              padding: '10px',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Today's Log
          </Link>
          <Link
            to="/history"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              padding: '10px',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Intake History
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '10px',
                color: '#a78bfa',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Admin Portal
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="btn btn-danger btn-sm"
            style={{ marginTop: '8px' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
