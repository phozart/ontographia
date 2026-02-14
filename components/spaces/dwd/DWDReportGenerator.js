// components/dwd/DWDReportGenerator.js
// Report generator modal for DWD cases
// Allows export to HTML, Markdown, and JSON formats

import { useState, useMemo } from 'react';
import { useDWD } from './DWDContext';

// MUI
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import PreviewIcon from '@mui/icons-material/Preview';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import ArticleIcon from '@mui/icons-material/Article';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SchoolIcon from '@mui/icons-material/School';

// Export utilities
import {
  DWD_EXPORT_TEMPLATES,
  exportDWDCaseToHTML,
  exportDWDCaseToMarkdown,
  exportDWDCaseToJSON,
  downloadDWDExport,
} from '../../../lib/dwd-exportUtils';

const FORMAT_OPTIONS = [
  { id: 'html', name: 'HTML', icon: <DescriptionIcon />, description: 'Styled report for viewing/printing' },
  { id: 'markdown', name: 'Markdown', icon: <ArticleIcon />, description: 'Plain text for documentation' },
  { id: 'json', name: 'JSON', icon: <CodeIcon />, description: 'Structured data for import/analysis' },
];

const TEMPLATE_ICONS = {
  full: <DescriptionIcon />,
  executive: <SummarizeIcon />,
  technical: <AnalyticsIcon />,
  learning: <SchoolIcon />,
};

export default function DWDReportGenerator({ open, onClose }) {
  const { activeCase, artefacts, relationships } = useDWD();

  const [selectedTemplate, setSelectedTemplate] = useState('full');
  const [selectedFormat, setSelectedFormat] = useState('html');
  const [sections, setSections] = useState(
    DWD_EXPORT_TEMPLATES.full.sections.map(s => ({ ...s }))
  );
  const [previewContent, setPreviewContent] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Get related artefacts for active case
  const caseArtefacts = useMemo(() => {
    if (!activeCase) return [];
    // Get artefacts related to this case
    const relatedIds = relationships
      .filter(r => r.source_id === activeCase.id || r.target_id === activeCase.id)
      .map(r => r.source_id === activeCase.id ? r.target_id : r.source_id);
    return artefacts.filter(a => relatedIds.includes(a.id) || a.custom_fields?.case_id === activeCase.id);
  }, [activeCase, artefacts, relationships]);

  // Handle template change
  const handleTemplateChange = (event, newTemplate) => {
    if (newTemplate) {
      setSelectedTemplate(newTemplate);
      setSections(DWD_EXPORT_TEMPLATES[newTemplate].sections.map(s => ({ ...s })));
    }
  };

  // Handle section toggle
  const handleSectionToggle = (sectionId) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, included: !s.included } : s
    ));
  };

  // Generate preview
  const handlePreview = () => {
    if (!activeCase) return;

    const options = { sections };
    let content;

    switch (selectedFormat) {
      case 'html':
        content = exportDWDCaseToHTML(activeCase, caseArtefacts, relationships, options);
        break;
      case 'markdown':
        content = exportDWDCaseToMarkdown(activeCase, caseArtefacts, relationships, options);
        break;
      case 'json':
        content = exportDWDCaseToJSON(activeCase, caseArtefacts, relationships, options);
        break;
    }

    setPreviewContent(content);
    setShowPreview(true);
  };

  // Handle download
  const handleDownload = () => {
    if (!activeCase) return;

    const options = { sections };
    downloadDWDExport(selectedFormat, activeCase, caseArtefacts, relationships, options);
  };

  // Count included sections
  const includedCount = sections.filter(s => s.included).length;

  if (!open) return null;

  return (
    <>
      <Dialog
        open={open && !showPreview}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Export Case Report</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {!activeCase ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                Please select a work situation (case) before exporting.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Case Info */}
              <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Exporting Case
                </Typography>
                <Typography variant="h6">{activeCase.title}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip size="small" label={`${caseArtefacts.length} artefacts`} />
                  <Chip
                    size="small"
                    label={activeCase.custom_fields?.status || 'active'}
                    color={activeCase.custom_fields?.status === 'resolved' ? 'success' : 'primary'}
                    variant="outlined"
                  />
                </Box>
              </Box>

              {/* Template Selection */}
              <Typography variant="subtitle2" gutterBottom>
                Report Template
              </Typography>
              <Tabs
                value={selectedTemplate}
                onChange={handleTemplateChange}
                sx={{ mb: 2 }}
              >
                {Object.entries(DWD_EXPORT_TEMPLATES).map(([key, template]) => (
                  <Tab
                    key={key}
                    value={key}
                    icon={TEMPLATE_ICONS[key]}
                    label={template.name}
                    iconPosition="start"
                    sx={{ minHeight: 48 }}
                  />
                ))}
              </Tabs>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {DWD_EXPORT_TEMPLATES[selectedTemplate].description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Section Selection */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">
                  Sections ({includedCount} selected)
                </Typography>
                <Box>
                  <Button
                    size="small"
                    onClick={() => setSections(prev => prev.map(s => ({ ...s, included: true })))}
                  >
                    Select All
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setSections(prev => prev.map(s => ({ ...s, included: false })))}
                  >
                    Clear All
                  </Button>
                </Box>
              </Box>

              <FormGroup sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                {sections.map(section => (
                  <FormControlLabel
                    key={section.id}
                    control={
                      <Checkbox
                        checked={section.included}
                        onChange={() => handleSectionToggle(section.id)}
                        size="small"
                      />
                    }
                    label={section.name}
                    sx={{
                      m: 0,
                      p: 1,
                      bgcolor: section.included ? 'action.selected' : 'transparent',
                      borderRadius: 1,
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                ))}
              </FormGroup>

              <Divider sx={{ my: 2 }} />

              {/* Format Selection */}
              <Typography variant="subtitle2" gutterBottom>
                Export Format
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {FORMAT_OPTIONS.map(format => (
                  <Box
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    sx={{
                      flex: 1,
                      p: 2,
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: selectedFormat === format.id ? 'primary.main' : 'divider',
                      bgcolor: selectedFormat === format.id ? 'primary.main' : 'transparent',
                      color: selectedFormat === format.id ? 'primary.contrastText' : 'text.primary',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Box sx={{ mb: 1, '& svg': { fontSize: 28 } }}>{format.icon}</Box>
                    <Typography variant="subtitle2">{format.name}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: selectedFormat === format.id ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                      }}
                    >
                      {format.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handlePreview}
            startIcon={<PreviewIcon />}
            disabled={!activeCase || includedCount === 0}
          >
            Preview
          </Button>
          <Button
            variant="contained"
            onClick={handleDownload}
            startIcon={<DownloadIcon />}
            disabled={!activeCase || includedCount === 0}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Preview: {activeCase?.title}</Typography>
            <IconButton onClick={() => setShowPreview(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedFormat === 'html' ? (
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <iframe
                srcDoc={previewContent}
                style={{
                  width: '100%',
                  height: '600px',
                  border: 'none',
                }}
                title="Report Preview"
              />
            </Box>
          ) : (
            <Box
              component="pre"
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: '600px',
                fontSize: '12px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {previewContent}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Close Preview</Button>
          <Button
            variant="contained"
            onClick={handleDownload}
            startIcon={<DownloadIcon />}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
