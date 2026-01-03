import { useState } from 'react';
import apiService from '../../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.login(email, password);
      onLogin(response.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px' }}>🎓</span>
            <h1 style={{ fontWeight: 'bold', fontSize: '20px', color: '#0f172a', margin: 0 }}>
              Student Attachment System
            </h1>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
            Sign in
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Enter your email and password to continue
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px', 
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px', 
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={{ fontSize: '14px', color: '#dc2626', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              backgroundColor: loading ? '#9ca3af' : '#0f172a', 
              color: 'white', 
              padding: '12px', 
              borderRadius: '8px', 
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxSizing: 'border-box'
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', margin: '0 0 8px 0', fontWeight: '500' }}>Demo accounts:</p>
          <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
            <div style={{ marginBottom: '4px' }}><strong>Student:</strong> student@university.edu / student123</div>
            <div style={{ marginBottom: '4px' }}><strong>Company:</strong> company@techcorp.com / company123</div>
            <div><strong>Admin:</strong> admin@system.com / admin123</div>
          </div>
        </div>

        {/* Back to home and Sign up */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>
              Don't have an account?{' '}
              <a href="/register" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: '500' }}>
                Sign up
              </a>
            </span>
          </div>
          <a href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}