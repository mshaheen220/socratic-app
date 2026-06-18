import { useState } from 'react';
import { login } from '../../services/api';

export default function Auth({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { ok, data, error } = await login(username, password);

      if (!ok) throw new Error(error || 'Authentication failed');
      onLogin(data.token, data.username, data.role);
    } catch (err) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-card auth-card">
      <div className="auth-header">
        <div className="auth-logo-container">
          <img src="/images/mindframe-logo.png" alt="Mindframe Logo" width="64" height="64" className="auth-logo" />
        </div>
        <h1 className="auth-title">Mindframe</h1>
      </div>
      {error && <p className="auth-error">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="auth-input"
        />
        <button type="submit" className="nav-btn primary auth-submit" disabled={loading}>
          {loading ? 'Please wait...' : 'Login'}
        </button>
      </form>
    </div>
  );
}