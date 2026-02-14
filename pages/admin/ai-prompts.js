/**
 * AI Prompts Management Page (Admin Only)
 *
 * Allows administrators to view, edit, and version AI prompt templates
 * used in Blueprint Studio's AI-assisted design feature.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'next/router';

// Icons
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RestoreIcon from '@mui/icons-material/Restore';
import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import WarningIcon from '@mui/icons-material/Warning';

export default function AIPromptsPage() {
  const { role } = useAuth();
  const router = useRouter();

  // State
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['critical-thinking', 'context', 'schema']);
  const [isDirty, setIsDirty] = useState(false);

  // Load prompts
  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/admin/ai-prompts');
      if (res.ok) {
        const data = await res.json();
        setPrompts(data.prompts || []);
        if (data.prompts?.length > 0 && !selectedPrompt) {
          setSelectedPrompt(data.prompts[0]);
          setEditedContent(data.prompts[0].content);
        }
      }
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
    }
  };

  // Select a prompt
  const handleSelectPrompt = useCallback((prompt) => {
    if (isDirty && !confirm('You have unsaved changes. Discard them?')) {
      return;
    }
    setSelectedPrompt(prompt);
    setEditedContent(prompt.content);
    setIsDirty(false);
  }, [isDirty]);

  // Edit content
  const handleContentChange = useCallback((value) => {
    setEditedContent(value);
    setIsDirty(value !== selectedPrompt?.content);
  }, [selectedPrompt]);

  // Save prompt
  const handleSave = async () => {
    if (!selectedPrompt || !isDirty) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/ai-prompts/${selectedPrompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent }),
      });

      if (res.ok) {
        const data = await res.json();
        setSaveSuccess(true);
        setIsDirty(false);
        setTimeout(() => setSaveSuccess(false), 2000);
        // Refresh prompts list
        fetchPrompts();
      } else {
        alert('Failed to save prompt');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save prompt');
    } finally {
      setIsSaving(false);
    }
  };

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [editedContent]);

  // Restore version
  const handleRestore = async (version) => {
    if (!confirm(`Restore to version ${version.version}? This will replace the current content.`)) {
      return;
    }
    setEditedContent(version.content);
    setIsDirty(true);
  };

  // Toggle section
  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Admin-only access
  if (role !== 'admin') {
    return (
      <div className="ai-prompts-denied">
        <h2>Access Denied</h2>
        <p>This page is only available to administrators.</p>
        <button className="btn btn-primary" onClick={() => router.push('/')}>Go Home</button>
      </div>
    );
  }

  // Parse prompt sections for structured view
  const promptSections = selectedPrompt ? parsePromptSections(editedContent) : [];

  return (
    <div className="ai-prompts-page">
      {/* Header */}
      <header className="aip-header">
        <div className="aip-header-left">
          <AutoAwesomeIcon className="aip-icon" />
          <div>
            <h1>AI Prompts Management</h1>
            <p>Configure and version AI prompt templates for Blueprint Studio</p>
          </div>
        </div>
        <div className="aip-header-actions">
          <button
            className={`btn btn-icon ${copied ? 'success' : ''}`}
            onClick={handleCopy}
            title="Copy prompt to clipboard"
            disabled={!selectedPrompt}
          >
            {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            className="btn btn-icon"
            onClick={() => setShowVersions(!showVersions)}
            title="View version history"
            disabled={!selectedPrompt}
          >
            <HistoryIcon fontSize="small" />
            <span>History</span>
          </button>
          <button
            className={`btn btn-primary ${saveSuccess ? 'success' : ''}`}
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : saveSuccess ? (
              <>
                <CheckIcon fontSize="small" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <SaveIcon fontSize="small" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="aip-layout">
        {/* Sidebar - Prompt list */}
        <aside className="aip-sidebar">
          <div className="aip-sidebar-header">
            <h3>Prompt Templates</h3>
          </div>
          <div className="aip-prompt-list">
            {prompts.map((prompt) => (
              <button
                key={prompt.id}
                className={`aip-prompt-item ${selectedPrompt?.id === prompt.id ? 'active' : ''}`}
                onClick={() => handleSelectPrompt(prompt)}
              >
                <span className="prompt-name">{prompt.name}</span>
                <span className="prompt-meta">v{prompt.version}</span>
              </button>
            ))}
            {prompts.length === 0 && (
              <div className="aip-empty">No prompts found</div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="aip-main">
          {selectedPrompt ? (
            <>
              {/* Prompt info bar */}
              <div className="aip-info-bar">
                <div className="info-left">
                  <span className="prompt-type">{selectedPrompt.type}</span>
                  <span className="prompt-version">Version {selectedPrompt.version}</span>
                  {isDirty && (
                    <span className="unsaved-indicator">
                      <WarningIcon fontSize="small" />
                      Unsaved changes
                    </span>
                  )}
                </div>
                <div className="info-right">
                  <span className="char-count">{editedContent.length.toLocaleString()} characters</span>
                </div>
              </div>

              {/* Editor */}
              <div className="aip-editor">
                <textarea
                  className="prompt-textarea"
                  value={editedContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Enter prompt content..."
                  spellCheck={false}
                />
              </div>

              {/* Structured sections view */}
              <div className="aip-sections">
                <h4>Prompt Sections</h4>
                <div className="sections-list">
                  {promptSections.map((section) => (
                    <div
                      key={section.id}
                      className={`section-item ${expandedSections.includes(section.id) ? 'expanded' : ''}`}
                    >
                      <button
                        className="section-header"
                        onClick={() => toggleSection(section.id)}
                      >
                        {expandedSections.includes(section.id) ? (
                          <ExpandLessIcon fontSize="small" />
                        ) : (
                          <ExpandMoreIcon fontSize="small" />
                        )}
                        <span className="section-title">{section.title}</span>
                        <span className="section-lines">{section.lineCount} lines</span>
                      </button>
                      {expandedSections.includes(section.id) && (
                        <div className="section-content">
                          <pre>{section.content}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="aip-no-selection">
              <AutoAwesomeIcon className="empty-icon" />
              <h3>Select a Prompt Template</h3>
              <p>Choose a prompt from the sidebar to view and edit its content.</p>
            </div>
          )}
        </main>

        {/* Version history sidebar */}
        {showVersions && selectedPrompt && (
          <aside className="aip-versions">
            <div className="versions-header">
              <h3>Version History</h3>
              <button
                className="btn btn-icon-small"
                onClick={() => setShowVersions(false)}
              >
                &times;
              </button>
            </div>
            <div className="versions-list">
              {(selectedPrompt.versions || []).map((version, idx) => (
                <div key={version.id || idx} className="version-item">
                  <div className="version-info">
                    <span className="version-number">v{version.version}</span>
                    <span className="version-date">{formatDate(version.created_at)}</span>
                  </div>
                  <div className="version-actions">
                    <button
                      className="btn btn-small"
                      onClick={() => handleRestore(version)}
                      title="Restore this version"
                    >
                      <RestoreIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              ))}
              {(!selectedPrompt.versions || selectedPrompt.versions.length === 0) && (
                <div className="versions-empty">No previous versions</div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// Parse prompt content into sections
function parsePromptSections(content) {
  if (!content) return [];

  const sections = [];
  const lines = content.split('\n');
  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    // Detect section headers (## SECTION_NAME)
    const headerMatch = line.match(/^##\s+(.+)/);
    if (headerMatch) {
      // Save previous section
      if (currentSection) {
        sections.push({
          ...currentSection,
          content: currentContent.join('\n'),
          lineCount: currentContent.length,
        });
      }
      // Start new section
      currentSection = {
        id: headerMatch[1].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        title: headerMatch[1],
      };
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    sections.push({
      ...currentSection,
      content: currentContent.join('\n'),
      lineCount: currentContent.length,
    });
  }

  return sections;
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
