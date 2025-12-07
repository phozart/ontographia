import { useEffect, useMemo, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box, Button, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useAuth } from '../../components/AuthContext';
import { LogoSpinner } from '../../components/Logo';

export default function AdminUsersPage() {
  const { role } = useAuth();
  const [isDemo, setIsDemo] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', password: '', role: 'viewer' });
  const [saving, setSaving] = useState(false);
  const [pwUpdates, setPwUpdates] = useState({});

  const columns = useMemo(
    () => [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'username', headerName: 'Username', flex: 1, minWidth: 140 },
      {
        field: 'role',
        headerName: 'Role',
        width: 150,
        renderCell: params => (
          <Select
            size="small"
            value={params.value}
            onChange={e => handleUpdate(params.row.id, { role: e.target.value })}
            fullWidth
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="editor">Editor</MenuItem>
            <MenuItem value="viewer">Viewer</MenuItem>
          </Select>
        ),
      },
      {
        field: 'password',
        headerName: 'New password',
        flex: 1,
        minWidth: 160,
        sortable: false,
        filterable: false,
        renderCell: params => (
          <TextField
            size="small"
            type="password"
            value={pwUpdates[params.row.id] || ''}
            onChange={e => setPwUpdates(p => ({ ...p, [params.row.id]: e.target.value }))}
            placeholder="Enter new password"
            fullWidth
          />
        ),
      },
      { field: 'createdAt', headerName: 'Created', width: 160 },
      { field: 'updatedAt', headerName: 'Updated', width: 160 },
      {
        field: 'lastLoginAt',
        headerName: 'Last login',
        width: 160,
        valueGetter: params => (params && params.value ? params.value : '-'),
      },
      {
        field: 'loginCount',
        headerName: 'Logins',
        width: 100,
        type: 'number',
        valueGetter: params => (params && params.value !== undefined && params.value !== null ? params.value : 0),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 180,
        sortable: false,
        filterable: false,
        renderCell: params => (
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                const pwd = pwUpdates[params.row.id];
                if (pwd && pwd.length >= 4) {
                  handleUpdate(params.row.id, { password: pwd });
                  setPwUpdates(p => ({ ...p, [params.row.id]: '' }));
                }
              }}
            >
              Save pwd
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              Delete
            </Button>
          </Box>
        ),
      },
    ],
    [pwUpdates]
  );

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsDemo(document.cookie.includes('demo_mode=1'));
    }
    if (role !== 'admin') return;
    loadUsers();
  }, [role]);

  async function loadUsers() {
    setError('');
    setLoading(true);
    try {
      if (isDemo) {
        setUsers([
          {
            id: 'demo',
            username: 'demo',
            role: 'admin',
            createdAt: '-',
            updatedAt: '-',
            lastLoginAt: '-',
            loginCount: 0,
          },
        ]);
        return;
      }
      const res = await fetch('/api/admin/users', { headers: { 'x-role': 'admin' } });
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': 'admin' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create user');
      }
      setForm({ username: '', password: '', role: 'viewer' });
      loadUsers();
    } catch (e) {
      setError(e.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (isDemo) return;
    if (!window.confirm('Delete this user?')) return;
    try {
      if (isDemo) {
        setUsers(prev => prev.filter(u => u.id !== id));
        return;
      }
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-role': 'admin' },
        body: JSON.stringify({ id }),
      });
      if (res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete');
      }
      loadUsers();
    } catch (e) {
      setError(e.message || 'Failed to delete');
    }
  }

  async function handleUpdate(id, updates) {
    try {
      if (isDemo) return;
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-role': 'admin' },
        body: JSON.stringify({ id, updates }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update');
      }
      loadUsers();
    } catch (e) {
      setError(e.message || 'Failed to update');
    }
  }

  if (role !== 'admin') {
    return <p style={{ padding: 16 }}>Access denied. Admins only.</p>;
  }

  return (
    <div className="app-body" style={{ justifyContent: 'center' }}>
      <main className="main" style={{ width: '100%', maxWidth: 1100, margin: '0 auto', padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Admin: Users</h2>
        {error && <p className="error-msg">{error}</p>}
        <section style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Create user</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <label>
              Username
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </label>
            <label>
              Role
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </label>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn" type="submit" disabled={saving || isDemo}>
                {saving ? 'Saving...' : 'Create'}
              </button>
            </div>
          </form>
        </section>
        <section>
          <h3 style={{ marginBottom: 8 }}>Users</h3>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <LogoSpinner label="Loading users..." />
            </div>
          ) : (
            <Box sx={{ height: 520, width: '100%', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)', borderRadius: 2, overflow: 'hidden' }}>
              <DataGrid
                rows={users}
                getRowId={row => row.id}
                columns={columns}
                density="comfortable"
                disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 300 },
                  },
                }}
                sx={{
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: 'var(--panel)' },
                  '& .MuiDataGrid-cell:focus': { outline: 'none' },
                }}
              />
            </Box>
          )}
        </section>
      </main>
    </div>
  );
}
