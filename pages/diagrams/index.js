// pages/diagrams/index.js
// Board Home Page - List and manage boards

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../components/AuthContext';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Chip,
  Avatar,
  AvatarGroup,
  Divider,
  Pagination,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ListViewIcon from '@mui/icons-material/ViewList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DuplicateIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import TimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import NewBoardDialog from '../../components/diagrams/NewBoardDialog';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const ITEMS_PER_PAGE = 12;

export default function DiagramsHomePage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [boards, setBoards] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('updated_at');
  const [page, setPage] = useState(1);
  const [newBoardOpen, setNewBoardOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuBoard, setMenuBoard] = useState(null);

  // Fetch boards
  const fetchBoards = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        offset: ((page - 1) * ITEMS_PER_PAGE).toString(),
        orderBy: sortBy,
        orderDirection: 'DESC',
      });
      if (search) params.append('search', search);

      const res = await fetch(`/api/boards?${params}`, {
        headers: {
          'x-user': user,
          'x-role': role,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch boards');

      const data = await res.json();
      setBoards(data.boards);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  }, [user, role, page, search, sortBy]);

  useEffect(() => {
    if (user) {
      fetchBoards();
    }
  }, [user, fetchBoards]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/diagrams');
    }
  }, [authLoading, user, router]);

  // Handle board creation
  const handleCreateBoard = async (boardData) => {
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user': user,
          'x-role': role,
        },
        body: JSON.stringify(boardData),
      });

      if (!res.ok) throw new Error('Failed to create board');

      const newBoard = await res.json();
      setNewBoardOpen(false);
      router.push(`/diagrams/${newBoard.id}`);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  // Handle board deletion
  const handleDeleteBoard = async () => {
    if (!boardToDelete) return;

    try {
      const res = await fetch(`/api/boards/${boardToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'x-user': user,
          'x-role': role,
        },
      });

      if (!res.ok) throw new Error('Failed to delete board');

      setDeleteConfirmOpen(false);
      setBoardToDelete(null);
      fetchBoards();
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };

  // Handle board duplication
  const handleDuplicateBoard = async (board) => {
    try {
      const res = await fetch(`/api/boards/${board.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user': user,
          'x-role': role,
        },
        body: JSON.stringify({ name: `${board.name} (Copy)` }),
      });

      if (!res.ok) throw new Error('Failed to duplicate board');

      fetchBoards();
      setMenuAnchor(null);
    } catch (error) {
      console.error('Error duplicating board:', error);
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <Grid container spacing={3}>
      {Array.from({ length: 8 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Card>
            <Skeleton variant="rectangular" height={140} />
            <CardContent>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="40%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render board card
  const renderBoardCard = (board) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={board.id}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
        }}
      >
        <CardActionArea onClick={() => router.push(`/diagrams/${board.id}`)}>
          <CardMedia
            sx={{
              height: 140,
              bgcolor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {board.thumbnail ? (
              <img
                src={board.thumbnail}
                alt={board.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                }}
              >
                <Typography variant="h4" sx={{ opacity: 0.5 }}>
                  {board.name.charAt(0).toUpperCase()}
                </Typography>
              </Box>
            )}
          </CardMedia>
        </CardActionArea>

        <CardContent sx={{ flexGrow: 1, pt: 1.5, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                noWrap
                sx={{ fontWeight: 500, cursor: 'pointer' }}
                onClick={() => router.push(`/diagrams/${board.id}`)}
              >
                {board.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {formatRelativeTime(board.updatedAt)}
                </Typography>
              </Box>
            </Box>

            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setMenuAnchor(e.currentTarget);
                setMenuBoard(board);
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>

          {board.memberCount > 1 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 12 } }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PersonIcon sx={{ fontSize: 14 }} />
                </Avatar>
              </AvatarGroup>
              <Typography variant="caption" color="text.secondary">
                {board.memberCount} members
              </Typography>
            </Box>
          )}

          {board.userRole && (
            <Chip
              label={board.userRole}
              size="small"
              sx={{ mt: 1, textTransform: 'capitalize' }}
              color={board.userRole === 'owner' ? 'primary' : 'default'}
            />
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  if (authLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {renderSkeleton()}
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>Diagram Studio | Ontographia</title>
        <meta name="description" content="Create and collaborate on diagrams" />
      </Head>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Diagram Studio
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewBoardOpen(true)}
            size="large"
          >
            New Board
          </Button>
        </Box>

        {/* Search and filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search boards..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="updated_at">Last modified</MenuItem>
              <MenuItem value="created_at">Date created</MenuItem>
              <MenuItem value="name">Name</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, value) => value && setViewMode(value)}
            size="small"
          >
            <ToggleButton value="grid">
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton value="list">
              <ListViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Board grid */}
        {loading ? (
          renderSkeleton()
        ) : boards.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              bgcolor: 'grey.50',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {search ? 'No boards found' : 'No boards yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {search
                ? 'Try adjusting your search terms'
                : 'Create your first board to get started'}
            </Typography>
            {!search && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setNewBoardOpen(true)}
              >
                Create Board
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {boards.map(renderBoardCard)}
          </Grid>
        )}

        {/* Pagination */}
        {total > ITEMS_PER_PAGE && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={Math.ceil(total / ITEMS_PER_PAGE)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Container>

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            router.push(`/diagrams/${menuBoard?.id}`);
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDuplicateBoard(menuBoard)}>
          <ListItemIcon>
            <DuplicateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            // TODO: Implement share dialog
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setBoardToDelete(menuBoard);
            setDeleteConfirmOpen(true);
            setMenuAnchor(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* New Board Dialog */}
      <NewBoardDialog
        open={newBoardOpen}
        onClose={() => setNewBoardOpen(false)}
        onCreate={handleCreateBoard}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Board"
        message={`Are you sure you want to delete "${boardToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteBoard}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setBoardToDelete(null);
        }}
      />
    </>
  );
}
