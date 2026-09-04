import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '24px'
    }}>
      <div className="glass-card" style={{ maxWidth: '440px', padding: '40px 32px' }}>
        <Droplet size={48} color="var(--accent-cyan)" style={{ margin: '0 auto 16px' }} />
        <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>404</h1>
        <h2 style={{ fontSize: '1.4rem', margin: '8px 0 12px' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
          The page you are looking for doesn't exist or has moved.
        </p>
        <Link to="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <Home size={18} /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
