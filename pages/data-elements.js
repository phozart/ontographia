import { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Paper } from '@mui/material';
import DataElementsTree from '../components/DataElementsTree';
import DataElementDetails from '../components/DataElementDetails';
import { useAuth } from '../components/AuthContext';

export default function DataElementsPage() {
  const { role } = useAuth();
  const canEdit = role === 'admin' || role === 'editor';
  const [nodes, setNodes] = useState([]);
  const [rels, setRels] = useState([]);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [nRes, rRes] = await Promise.all([fetch('/api/nodes'), fetch('/api/relationships')]);
        if (nRes.ok) setNodes(await nRes.json());
        if (rRes.ok) setRels(await rRes.json());
      } catch (e) {
        console.error('Failed to load data elements', e);
      }
    }
    load();
  }, []);

  const dataElements = useMemo(() => (nodes || []).filter(n => n && n.id), [nodes]);

  const elementMap = useMemo(() => {
    const map = new Map();
    dataElements.forEach(n => {
      if (n.id) map.set(n.id, n);
    });
    return map;
  }, [dataElements]);

  const childrenMap = useMemo(() => {
    const map = new Map();
    rels.forEach(r => {
      const child = elementMap.get(r.targetId);
      const parent = elementMap.get(r.sourceId);
      if (!parent || !child) return;
      if (!map.has(parent.id)) map.set(parent.id, []);
      map.get(parent.id).push(child);
    });
    return map;
  }, [rels, elementMap]);

  const roots = useMemo(() => {
    const hasParent = new Set();
    rels.forEach(r => {
      if (elementMap.has(r.targetId) && elementMap.has(r.sourceId)) {
        hasParent.add(r.targetId);
      }
    });
    return dataElements.filter(n => !hasParent.has(n.id));
  }, [rels, dataElements, elementMap]);

  useEffect(() => {
    if (!selectedId && dataElements.length > 0) {
      setSelectedId(roots[0]?.id || dataElements[0].id);
    }
  }, [dataElements, roots, selectedId]);

  const selectedElement = selectedId ? elementMap.get(selectedId) : null;

  return (
    <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 120px)', minHeight: 400, p: 2 }}>
      <Paper
        elevation={1}
        sx={{
          width: '30%',
          minWidth: 260,
          maxWidth: 360,
          p: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DataElementsTree
          elements={roots}
          childrenMap={childrenMap}
          selectedId={selectedId}
          onSelect={id => setSelectedId(id)}
          getLabel={n => n.label || n.name}
        />
      </Paper>
      <Grid item xs display="flex">
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <DataElementDetails element={selectedElement} onEdit={canEdit ? () => {} : null} />
        </Box>
      </Grid>
    </Box>
  );
}
