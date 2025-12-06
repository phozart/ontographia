import { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import BrandPoster from '../components/BrandPoster';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nextChallenge = () => ({
    a: Math.floor(Math.random() * 8) + 2, // 2-9
    b: Math.floor(Math.random() * 8) + 2,
  });
  const [challenge, setChallenge] = useState(nextChallenge);
  const [answer, setAnswer] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const expected = challenge.a + challenge.b;
    if (Number(answer) !== expected) {
      setError('Please solve the math check to continue.');
      setChallenge(nextChallenge());
      setAnswer('');
      return;
    }
    setLoading(true);
    try {
      await login({ username, password });
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-body" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <main
        className="main"
        style={{
          width: '100%',
          maxWidth: 420,
          margin: '0 auto',
          padding: 16,
          background: 'var(--bg-alt)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      boxShadow: 'var(--shadow)',
    }}
  >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <BrandPoster width={260} />
        </div>
        <h2 style={{ marginTop: 0 }}>Login</h2>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>
          <label>
            Role is assigned by admin
          </label>
          <label>
            Human check: {challenge.a} + {challenge.b} = ?
            <input
              type="number"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              required
              placeholder="Your answer"
              min="0"
            />
          </label>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </main>
    </div>
  );
}
