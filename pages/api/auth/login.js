import { verifyUser, ensureSeedAdmin } from '../../../lib/userStore';

export default async function handler(req, res) {
  try {
    await ensureSeedAdmin();
  } catch (err) {
    console.error('Seed admin failed', err);
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }
  try {
    const user = await verifyUser(username, password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    return res.status(200).json(user);
  } catch (err) {
    console.error('Login handler error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
