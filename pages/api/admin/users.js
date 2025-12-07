import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  recordLogin,
  ensureSeedAdmin,
} from '../../../lib/userStore';

function isAdmin(req) {
  return req.headers['x-role'] === 'admin';
}

export default async function handler(req, res) {
  await ensureSeedAdmin();
  if (!isAdmin(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method === 'GET') {
    const users = await listUsers();
    return res.status(200).json(users);
  }

  if (req.method === 'POST') {
    const { username, role, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const user = await createUser({ username, role, password, id: username });
    return res.status(201).json(user);
  }

  if (req.method === 'PUT') {
    const { id, updates } = req.body || {};
    if (!id || !updates) return res.status(400).json({ error: 'id and updates required' });
    const user = await updateUser(id, updates);
    if (!user) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(user);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });
    const ok = await deleteUser(id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    return res.status(204).end();
  }

  if (req.method === 'PATCH') {
    const { username } = req.body || {};
    if (!username) return res.status(400).json({ error: 'username required' });
    const user = await recordLogin(username);
    if (!user) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(user);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
