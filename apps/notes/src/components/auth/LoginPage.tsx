/**
 * Login Page
 * Simple login form for MVP
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Mail, Lock, User } from 'lucide-react';
import '../../styles/auth.css';

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <FileText size={48} className="auth-logo" />
          <h1>AuraOS Notes</h1>
          <p>AI-powered note-taking for the modern age</p>
        </div>

        <div className="auth-form-container">
          <div className="auth-tabs">
            <button
              className={isLogin ? 'active' : ''}
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
            >
              Login
            </button>
            <button
              className={!isLogin ? 'active' : ''}
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">
                  <User size={18} />
                  <span>Name</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">
                <Mail size={18} />
                <span>Email</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <Lock size={18} />
                <span>Password</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="demo-note">
              <strong>Demo Mode:</strong> Use any email and password to login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
