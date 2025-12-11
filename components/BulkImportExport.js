// components/BulkImportExport.js
// Bulk import/export functionality for nodes and relationships
import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

export default function BulkImportExport({
  visible = false,
  onClose,
  nodes = [],
  relationships = [],
  nodeTypes = [],
  relationshipTypes = [],
  activeDomain,
  onDataChanged,
}) {
  const [tab, setTab] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const fileInputRef = useRef(null);

  // Export nodes as JSON
  const exportNodesJSON = () => {
    const data = nodes.map(n => ({
      id: n.id,
      name: n.name || n.label,
      typeId: n.typeId,
      typeName: n.typeName,
      description: n.description,
      layer: n.layer,
      properties: n.properties,
    }));
    downloadJSON(data, 'nodes-export.json');
  };

  // Export relationships as JSON
  const exportRelationshipsJSON = () => {
    const data = relationships.map(r => ({
      id: r.id,
      type: r.type,
      sourceId: r.sourceId,
      targetId: r.targetId,
      sourceName: nodes.find(n => n.id === r.sourceId)?.name,
      targetName: nodes.find(n => n.id === r.targetId)?.name,
      properties: r.properties,
    }));
    downloadJSON(data, 'relationships-export.json');
  };

  // Export full graph as JSON
  const exportFullGraph = () => {
    const data = {
      exportDate: new Date().toISOString(),
      domain: activeDomain,
      nodeTypes,
      relationshipTypes,
      nodes: nodes.map(n => ({
        id: n.id,
        name: n.name || n.label,
        typeId: n.typeId,
        typeName: n.typeName,
        description: n.description,
        layer: n.layer,
        properties: n.properties,
      })),
      relationships: relationships.map(r => ({
        id: r.id,
        type: r.type,
        sourceId: r.sourceId,
        targetId: r.targetId,
        properties: r.properties,
      })),
    };
    downloadJSON(data, 'graph-export.json');
  };

  // Export nodes as CSV
  const exportNodesCSV = () => {
    const headers = ['id', 'name', 'typeId', 'typeName', 'description', 'layer'];
    const rows = nodes.map(n => [
      n.id,
      escapeCsv(n.name || n.label || ''),
      n.typeId || '',
      n.typeName || '',
      escapeCsv(n.description || ''),
      n.layer || '',
    ]);
    downloadCSV([headers, ...rows], 'nodes-export.csv');
  };

  // Export relationships as CSV
  const exportRelationshipsCSV = () => {
    const headers = ['id', 'type', 'sourceId', 'targetId', 'sourceName', 'targetName'];
    const rows = relationships.map(r => [
      r.id,
      r.type || '',
      r.sourceId,
      r.targetId,
      nodes.find(n => n.id === r.sourceId)?.name || '',
      nodes.find(n => n.id === r.targetId)?.name || '',
    ]);
    downloadCSV([headers, ...rows], 'relationships-export.csv');
  };

  // Download helpers
  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (rows, filename) => {
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const escapeCsv = (str) => {
    if (!str) return '';
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const filename = file.name.toLowerCase();

    try {
      if (filename.endsWith('.json')) {
        const data = JSON.parse(text);
        setPreviewData({
          type: 'json',
          filename: file.name,
          data,
          nodes: Array.isArray(data) ? data : (data.nodes || []),
          relationships: data.relationships || [],
        });
      } else if (filename.endsWith('.csv')) {
        const rows = parseCSV(text);
        const headers = rows[0];
        const records = rows.slice(1).map(row => {
          const obj = {};
          headers.forEach((h, i) => obj[h] = row[i]);
          return obj;
        });
        setPreviewData({
          type: 'csv',
          filename: file.name,
          headers,
          records,
          nodes: records.filter(r => r.name && r.typeId),
          relationships: records.filter(r => r.sourceId && r.targetId),
        });
      }
    } catch (err) {
      setImportResult({ success: false, message: 'Failed to parse file: ' + err.message });
    }

    e.target.value = '';
  };

  // Parse CSV
  const parseCSV = (text) => {
    const lines = text.split('\n');
    return lines.map(line => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    }).filter(row => row.some(cell => cell));
  };

  // Import data
  const handleImport = async () => {
    if (!previewData) return;

    setImporting(true);
    setImportProgress(0);
    setImportResult(null);

    const nodesToImport = previewData.nodes || [];
    const relsToImport = previewData.relationships || [];
    const total = nodesToImport.length + relsToImport.length;
    let processed = 0;
    let created = { nodes: 0, relationships: 0 };
    let errors = [];

    try {
      // Import nodes
      for (const node of nodesToImport) {
        try {
          const res = await fetch('/api/nodes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: node.name || node.label,
              typeId: node.typeId,
              description: node.description,
              layer: node.layer,
              domain: activeDomain,
            }),
          });
          if (res.ok) {
            created.nodes++;
          } else {
            const err = await res.json().catch(() => ({}));
            errors.push(`Node "${node.name}": ${err.error || 'Failed'}`);
          }
        } catch (e) {
          errors.push(`Node "${node.name}": ${e.message}`);
        }
        processed++;
        setImportProgress(Math.round((processed / total) * 100));
      }

      // Import relationships
      for (const rel of relsToImport) {
        try {
          const res = await fetch('/api/relationships', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: rel.type,
              sourceId: rel.sourceId,
              targetId: rel.targetId,
              domain: activeDomain,
            }),
          });
          if (res.ok) {
            created.relationships++;
          } else {
            const err = await res.json().catch(() => ({}));
            errors.push(`Relationship: ${err.error || 'Failed'}`);
          }
        } catch (e) {
          errors.push(`Relationship: ${e.message}`);
        }
        processed++;
        setImportProgress(Math.round((processed / total) * 100));
      }

      setImportResult({
        success: errors.length === 0,
        message: `Created ${created.nodes} nodes and ${created.relationships} relationships.${errors.length > 0 ? ` ${errors.length} errors.` : ''}`,
        errors: errors.slice(0, 5),
      });

      if (created.nodes > 0 || created.relationships > 0) {
        onDataChanged?.();
      }
    } catch (e) {
      setImportResult({ success: false, message: 'Import failed: ' + e.message });
    } finally {
      setImporting(false);
      setPreviewData(null);
    }
  };

  if (!visible) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <Paper
        onClick={e => e.stopPropagation()}
        sx={{
          width: 700,
          maxWidth: '95vw',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
        }}
      >
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid var(--border)',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Import / Export Data
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid var(--border)' }}>
          <Tab label="Export" />
          <Tab label="Import" />
        </Tabs>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {/* Export Tab */}
          {tab === 0 && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Export as JSON
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={exportFullGraph}
                    size="small"
                  >
                    Full Graph
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={exportNodesJSON}
                    size="small"
                  >
                    Nodes Only ({nodes.length})
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={exportRelationshipsJSON}
                    size="small"
                  >
                    Relationships Only ({relationships.length})
                  </Button>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Export as CSV
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={exportNodesCSV}
                    size="small"
                  >
                    Nodes CSV
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={exportRelationshipsCSV}
                    size="small"
                  >
                    Relationships CSV
                  </Button>
                </Stack>
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Current data:</strong> {nodes.length} nodes, {relationships.length} relationships, {nodeTypes.length} node types
                </Typography>
              </Alert>
            </Stack>
          )}

          {/* Import Tab */}
          {tab === 1 && (
            <Stack spacing={2}>
              {/* File upload */}
              <Box
                sx={{
                  border: '2px dashed var(--border)',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'var(--accent)', background: 'var(--accent-soft)' },
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadFileIcon sx={{ fontSize: 48, color: 'var(--text-muted)', mb: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Click to upload or drag and drop
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports JSON and CSV files
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  hidden
                  onChange={handleFileSelect}
                />
              </Box>

              {/* Preview */}
              {previewData && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Preview: {previewData.filename}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      label={`${previewData.nodes?.length || 0} nodes`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`${previewData.relationships?.length || 0} relationships`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </Stack>

                  {previewData.nodes?.length > 0 && (
                    <Box sx={{ maxHeight: 200, overflow: 'auto', mb: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Type ID</TableCell>
                            <TableCell>Layer</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {previewData.nodes.slice(0, 5).map((n, i) => (
                            <TableRow key={i}>
                              <TableCell>{n.name || n.label}</TableCell>
                              <TableCell>{n.typeId}</TableCell>
                              <TableCell>{n.layer}</TableCell>
                            </TableRow>
                          ))}
                          {previewData.nodes.length > 5 && (
                            <TableRow>
                              <TableCell colSpan={3} sx={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                ...and {previewData.nodes.length - 5} more
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </Box>
                  )}

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      onClick={handleImport}
                      disabled={importing || (!previewData.nodes?.length && !previewData.relationships?.length)}
                    >
                      Import Data
                    </Button>
                    <Button variant="outlined" onClick={() => setPreviewData(null)}>
                      Cancel
                    </Button>
                  </Stack>
                </Paper>
              )}

              {/* Progress */}
              {importing && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Importing... {importProgress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={importProgress} />
                </Box>
              )}

              {/* Result */}
              {importResult && (
                <Alert
                  severity={importResult.success ? 'success' : 'warning'}
                  icon={importResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
                >
                  <Typography variant="body2">{importResult.message}</Typography>
                  {importResult.errors?.length > 0 && (
                    <Box sx={{ mt: 1, fontSize: 12 }}>
                      {importResult.errors.map((e, i) => (
                        <div key={i}>• {e}</div>
                      ))}
                    </Box>
                  )}
                </Alert>
              )}

              {/* Template info */}
              <Alert severity="info">
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  CSV Template for Nodes:
                </Typography>
                <code style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>
                  name,typeId,description,layer
                </code>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  CSV Template for Relationships:
                </Typography>
                <code style={{ fontSize: 11, display: 'block' }}>
                  type,sourceId,targetId
                </code>
              </Alert>
            </Stack>
          )}
        </Box>
      </Paper>
    </div>
  );
}
