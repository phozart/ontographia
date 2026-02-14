// pages/diagrams/[id].js
// Board Editor Page

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../components/AuthContext';
import Head from 'next/head';
import {
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import BackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import ShareIcon from '@mui/icons-material/Share';
import PeopleIcon from '@mui/icons-material/People';
import BoardSettingsPanel from '../../components/diagrams/BoardSettingsPanel';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function BoardEditorPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id: boardId } = router.query;

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch board data
  const fetchBoard = useCallback(async () => {
    if (!boardId || !user) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        headers: {
          'x-user': user,
          'x-role': role,
        },
      });
      if (!res.ok) {
        if (res.status === 404) {
          setError('Board not found');
        } else if (res.status === 403) {
          setError('You do not have access to this board');
        } else {
          throw new Error('Failed to load board');
        }
        return;
      }

      const data = await res.json();
      setBoard(data);
    } catch (err) {
      console.error('Error fetching board:', err);
      setError('Failed to load board');
    } finally {
      setLoading(false);
    }
  }, [boardId, user, role]);

  useEffect(() => {
    if (user && boardId) {
      fetchBoard();
    }
  }, [user, boardId, fetchBoard]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/diagrams/${boardId}`);
    }
  }, [authLoading, user, router, boardId]);

  // Update board
  const handleUpdateBoard = async (updates) => {
    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user': user,
          'x-role': role,
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Failed to update board');

      const updatedBoard = await res.json();
      setBoard(updatedBoard);
      setSnackbar({ open: true, message: 'Board updated', severity: 'success' });
    } catch (err) {
      console.error('Error updating board:', err);
      setSnackbar({ open: true, message: 'Failed to update board', severity: 'error' });
      throw err;
    }
  };

  // Delete board
  const handleDeleteBoard = async () => {
    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: 'DELETE',
        headers: {
          'x-user': user,
          'x-role': role,
        },
      });

      if (!res.ok) throw new Error('Failed to delete board');

      router.push('/diagrams');
    } catch (err) {
      console.error('Error deleting board:', err);
      setSnackbar({ open: true, message: 'Failed to delete board', severity: 'error' });
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h5" color="text.secondary">
          {error}
        </Typography>
        <Button
          variant="contained"
          startIcon={<BackIcon />}
          onClick={() => router.push('/diagrams')}
        >
          Back to Boards
        </Button>
      </Box>
    );
  }

  if (!board) return null;

  return (
    <>
      <Head>
        <title>{board.name} | Diagram Studio</title>
      </Head>

      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          {/* Left section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.push('/diagrams')} size="small">
              <BackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {board.name}
            </Typography>
          </Box>

          {/* Right section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ShareIcon />}
              onClick={() => {
                // TODO: Open share dialog
              }}
            >
              Share
            </Button>

            <IconButton
              size="small"
              onClick={() => {
                // TODO: Open members panel
              }}
            >
              <PeopleIcon />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => setSettingsOpen(true)}
            >
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Canvas Area - Placeholder for now */}
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: board.settings?.backgroundColor || '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Grid pattern if enabled */}
          {board.settings?.gridEnabled && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                  linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
                `,
                backgroundSize: `${board.settings?.gridSize || 20}px ${board.settings?.gridSize || 20}px`,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Canvas placeholder */}
          <Typography variant="body1" color="text.secondary">
            Canvas will be rendered here
          </Typography>
        </Box>
      </Box>

      {/* Settings Panel */}
      <BoardSettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        board={board}
        onUpdate={handleUpdateBoard}
        onDelete={() => {
          setSettingsOpen(false);
          setDeleteConfirmOpen(true);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Board"
        message={`Are you sure you want to delete "${board.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteBoard}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
