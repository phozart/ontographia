import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Box, Paper, Typography, Button, Chip } from '@mui/material';
import { useAuth } from '../../components/AuthContext';
import BrandPoster from '../../components/BrandPoster';
import LoginIcon from '@mui/icons-material/Login';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LoopIcon from '@mui/icons-material/Loop';

const features = [
  { icon: <ArchitectureIcon />, title: 'Enterprise Architecture', desc: 'Map capabilities and applications' },
  { icon: <AssignmentIcon />, title: 'Requirements Management', desc: 'Trace from needs to delivery' },
  { icon: <LoopIcon />, title: 'System Dynamics', desc: 'Model feedback loops' },
];

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Math challenge for bot protection
  const nextChallenge = () => ({
    a: Math.floor(Math.random() * 8) + 2,
    b: Math.floor(Math.random() * 8) + 2,
  });
  const [challenge, setChallenge] = useState({ a: 0, b: 0 });
  const [hydrated, setHydrated] = useState(false);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    setChallenge(nextChallenge());
    setHydrated(true);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace('/home');
    }
  }, [user, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hydrated) return;
    setError('');

    const expected = challenge.a + challenge.b;
    if (Number(answer) !== expected) {
      setError('Please solve the math check correctly.');
      setChallenge(nextChallenge());
      setAnswer('');
      return;
    }

    setLoading(true);
    try {
      await login({ username, password });
    } catch (err) {
      setError(err?.message || 'Login failed. Please check your credentials.');
      setChallenge(nextChallenge());
      setAnswer('');
    } finally {
      setLoading(false);
    }
  }

  if (user) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Typography>Redirecting...</Typography>
      </Box>
    );
  }

  return (
    <Box className="login-page">
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-brand">
          <div className="login-brand-content">
            <BrandPoster width={180} color="white" />
            <h1>Welcome to Ontographia</h1>
            <p className="login-tagline">
              Connect your organization's knowledge into a living, navigable graph.
            </p>

            <div className="login-features">
              {features.map((f, i) => (
                <div key={i} className="login-feature">
                  <span className="login-feature-icon">{f.icon}</span>
                  <div>
                    <strong>{f.title}</strong>
                    <span>{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="login-form-side">
          <div className="login-form-container">
            <div className="login-form-header">
              <LoginIcon className="login-form-icon" />
              <h2>Sign In</h2>
              <p>Enter your credentials to access your workspace</p>
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="answer">
                  Verify: What is {challenge.a} + {challenge.b}?
                </label>
                <input
                  type="number"
                  id="answer"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  required
                  placeholder="Your answer"
                  min="0"
                />
              </div>

              <button
                type="submit"
                className="login-submit"
                disabled={loading || !hydrated}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="login-footer">
              <p>
                Don't have an account? Contact your administrator.
              </p>
              <Link href="/" className="login-back-link">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
}
