// components/diagrams/NewBoardDialog.js
// Dialog for creating a new board

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Skeleton,
} from '@mui/material';
import BlankIcon from '@mui/icons-material/Description';
import TemplateIcon from '@mui/icons-material/ContentCopy';

// Diagram type options
const DIAGRAM_TYPES = [
  { id: 'process-flow', name: 'Process Flow', icon: 'workflow' },
  { id: 'bpmn', name: 'BPMN', icon: 'process' },
  { id: 'uml-class', name: 'UML Class', icon: 'class' },
  { id: 'erd', name: 'Entity Relationship', icon: 'database' },
  { id: 'mind-map', name: 'Mind Map', icon: 'mind' },
  { id: 'flowchart', name: 'Flowchart', icon: 'flow' },
  { id: 'org-chart', name: 'Organization Chart', icon: 'org' },
  { id: 'sticky-notes', name: 'Sticky Notes', icon: 'sticky' },
];

export default function NewBoardDialog({ open, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [startFrom, setStartFrom] = useState('blank');
  const [diagramType, setDiagramType] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [error, setError] = useState('');

  // Fetch templates when template mode is selected
  useEffect(() => {
    if (startFrom === 'template' && templates.length === 0) {
      setLoadingTemplates(true);
      fetch('/api/boards/templates')
        .then((res) => res.json())
        .then((data) => {
          setTemplates(data);
          setLoadingTemplates(false);
        })
        .catch((err) => {
          console.error('Error fetching templates:', err);
          setLoadingTemplates(false);
        });
    }
  }, [startFrom, templates.length]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName('');
      setStartFrom('blank');
      setDiagramType('');
      setSelectedTemplate(null);
      setError('');
    }
  }, [open]);

  const handleCreate = () => {
    if (!name.trim()) {
      setError('Board name is required');
      return;
    }

    const boardData = {
      name: name.trim(),
      settings: diagramType ? { defaultPack: diagramType } : undefined,
    };

    if (startFrom === 'template' && selectedTemplate) {
      boardData.templateId = selectedTemplate.id;
    }

    onCreate(boardData);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>Create New Board</DialogTitle>

      <DialogContent>
        {/* Board Name */}
        <TextField
          autoFocus
          label="Board Name"
          fullWidth
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          onKeyPress={handleKeyPress}
          error={!!error}
          helperText={error}
          sx={{ mt: 1, mb: 3 }}
        />

        {/* Start From Options */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Start From</FormLabel>
          <RadioGroup
            row
            value={startFrom}
            onChange={(e) => setStartFrom(e.target.value)}
          >
            <FormControlLabel
              value="blank"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BlankIcon fontSize="small" />
                  <span>Blank board</span>
                </Box>
              }
            />
            <FormControlLabel
              value="template"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TemplateIcon fontSize="small" />
                  <span>Template</span>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>

        {/* Diagram Type (for blank boards) */}
        {startFrom === 'blank' && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Diagram Type (optional)</InputLabel>
            <Select
              value={diagramType}
              label="Diagram Type (optional)"
              onChange={(e) => setDiagramType(e.target.value)}
            >
              <MenuItem value="">
                <em>None - Choose later</em>
              </MenuItem>
              {DIAGRAM_TYPES.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Template Selection */}
        {startFrom === 'template' && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Select a template
            </Typography>
            {loadingTemplates ? (
              <Grid container spacing={2}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid item xs={6} key={i}>
                    <Skeleton variant="rectangular" height={100} />
                  </Grid>
                ))}
              </Grid>
            ) : templates.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No templates available
              </Typography>
            ) : (
              <Grid container spacing={2} sx={{ maxHeight: 300, overflow: 'auto' }}>
                {templates.map((template) => (
                  <Grid item xs={6} key={template.id}>
                    <Card
                      variant={selectedTemplate?.id === template.id ? 'outlined' : 'elevation'}
                      sx={{
                        border: selectedTemplate?.id === template.id ? 2 : 0,
                        borderColor: 'primary.main',
                      }}
                    >
                      <CardActionArea onClick={() => setSelectedTemplate(template)}>
                        <Box
                          sx={{
                            height: 60,
                            bgcolor: 'grey.100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {template.thumbnail ? (
                            <img
                              src={template.thumbnail}
                              alt={template.name}
                              style={{ height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Typography variant="h6" color="text.secondary">
                              {template.name.charAt(0)}
                            </Typography>
                          )}
                        </Box>
                        <CardContent sx={{ py: 1 }}>
                          <Typography variant="body2" noWrap>
                            {template.name}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={!name.trim() || (startFrom === 'template' && !selectedTemplate)}
        >
          Create Board
        </Button>
      </DialogActions>
    </Dialog>
  );
}
