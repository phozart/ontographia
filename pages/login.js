import { useState, useEffect } from 'react';
import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import { useAuth } from '../components/AuthContext';
import { LogoWordmark } from '../components/Logo';

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
  const [challenge, setChallenge] = useState({ a: 0, b: 0 });
  const [hydrated, setHydrated] = useState(false);
  const [answer, setAnswer] = useState('');

  // Avoid SSR/CSR mismatch by seeding the challenge after mount
  useEffect(() => {
    setChallenge(nextChallenge());
    setHydrated(true);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hydrated) return;
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
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'top',
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Grid container spacing={4} alignItems="center" maxWidth="lg">
        <Grid item xs={12} md={6}>
          <Stack spacing={2.5} sx={{ maxWidth: 560, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LogoWordmark width={520} height={140} color="var(--text)" />
            </Box>
            <Typography variant="body1">
              Ontographia helps you model concepts, map relationships, and keep meaning consistent as work crosses teams.
              It blends semantic modeling, graph navigation, and relationship analysis into one studio, so you can see
              how ideas connect and how changes ripple through your ecosystem.
            </Typography>
            <Typography variant="body1">
              Use it to align vocabulary, surface implicit assumptions, and make reasoning visible. Whether you are
              documenting a business process or exploring a philosophical taxonomy, Ontographia gives you a coherent
              landscape of nodes, links, and context that stays in sync as your organization evolves.
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Ready to explore? Sign in to browse models, traverse graphs, and manage the knowledge that powers your
              work.
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: { xs: 1, md: 0 } }}>
          <Paper
            elevation={4}
            sx={{
              p: { xs: 3, md: 4 },
              background: 'var(--bg-alt)',
              border: '1px solid var(--border)',
              borderRadius: 3,
              boxShadow: 'var(--shadow)',
              maxWidth: 460,
              mx: 'auto',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Login
            </Typography>
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
              <button type="submit" className="btn" disabled={loading || !hydrated}>
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
