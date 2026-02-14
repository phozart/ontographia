/**
 * PromptPanel - Display research prompts with copy and tracking functionality
 *
 * Core philosophy: "AI generates prompts, humans do the thinking"
 *
 * This panel displays rendered research prompts that users can copy to external
 * AI tools (Claude, ChatGPT, Perplexity, etc.) for research.
 *
 * Features:
 * - Rendered prompt with context
 * - Copy to Clipboard button
 * - Suggested AI tools with links
 * - Mark as Researched button
 * - Research notes capture
 *
 * @module components/coaching/PromptPanel
 */

import React, { useState, useCallback } from 'react';
import styles from './PromptPanel.module.css';

// Icons - using text placeholders for compatibility
const CopyIcon = () => <span style={{ fontSize: '1.2em' }}>&#128203;</span>;
const CheckIcon = () => <span style={{ fontSize: '1.2em', color: '#22c55e' }}>&#10003;</span>;
const ExternalLinkIcon = () => <span style={{ fontSize: '0.9em' }}>&#8599;</span>;
const ResearchIcon = () => <span style={{ fontSize: '1.2em' }}>&#128218;</span>;
const LightbulbIcon = () => <span style={{ fontSize: '1.2em' }}>&#128161;</span>;
const CloseIcon = () => <span style={{ fontSize: '1.2em' }}>&#10005;</span>;
const ExpandIcon = () => <span style={{ fontSize: '1em' }}>&#9660;</span>;
const CollapseIcon = () => <span style={{ fontSize: '1em' }}>&#9650;</span>;

/**
 * AI Source button component
 */
function AISourceButton({ source, onClick }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.sourceButton}
      style={{ '--source-color': source.color }}
      onClick={onClick}
      title={source.description}
    >
      <span className={styles.sourceName}>{source.name}</span>
      <ExternalLinkIcon />
    </a>
  );
}

/**
 * Single prompt card component
 */
function PromptCard({
  prompt,
  onCopy,
  onMarkResearched,
  onNotesChange,
  isExpanded,
  onToggleExpand
}) {
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState(prompt.notes || '');
  const [showNotes, setShowNotes] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt.renderedPrompt || prompt.rendered_prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      if (onCopy) {
        onCopy(prompt.id);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [prompt, onCopy]);

  const handleMarkResearched = useCallback(() => {
    if (onMarkResearched) {
      onMarkResearched(prompt.id, notes);
    }
  }, [prompt.id, notes, onMarkResearched]);

  const handleNotesChange = useCallback((e) => {
    setNotes(e.target.value);
    if (onNotesChange) {
      onNotesChange(prompt.id, e.target.value);
    }
  }, [prompt.id, onNotesChange]);

  const promptText = prompt.renderedPrompt || prompt.rendered_prompt || '';
  const title = prompt.title || prompt.template?.title || 'Research Prompt';
  const sources = prompt.sources || prompt.suggestedSources || [];
  const status = prompt.status || 'generated';

  return (
    <div className={`${styles.promptCard} ${styles[`status_${status}`]}`}>
      {/* Header */}
      <div className={styles.promptHeader}>
        <div className={styles.promptTitle}>
          <LightbulbIcon />
          <h4>{title}</h4>
          {status === 'researched' && (
            <span className={styles.researchedBadge}>Researched</span>
          )}
        </div>
        <button
          className={styles.expandButton}
          onClick={onToggleExpand}
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
        </button>
      </div>

      {/* Prompt Content */}
      <div className={`${styles.promptContent} ${isExpanded ? styles.expanded : ''}`}>
        <pre className={styles.promptText}>
          {isExpanded ? promptText : truncateText(promptText, 300)}
        </pre>
      </div>

      {/* Actions Bar */}
      <div className={styles.actionsBar}>
        {/* Copy Button */}
        <button
          className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
          onClick={handleCopy}
          disabled={copied}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
        </button>

        {/* AI Source Links */}
        <div className={styles.sourcesSection}>
          <span className={styles.sourcesLabel}>Research with:</span>
          <div className={styles.sourceLinks}>
            {sources.map((source) => (
              <AISourceButton key={source.id} source={source} />
            ))}
          </div>
        </div>
      </div>

      {/* Research Status Section */}
      {status !== 'researched' && (
        <div className={styles.researchSection}>
          <button
            className={styles.notesToggle}
            onClick={() => setShowNotes(!showNotes)}
          >
            {showNotes ? 'Hide notes' : 'Add research notes'}
          </button>

          {showNotes && (
            <div className={styles.notesArea}>
              <textarea
                value={notes}
                onChange={handleNotesChange}
                placeholder="Capture key findings from your research..."
                rows={3}
              />
            </div>
          )}

          <button
            className={styles.markResearchedButton}
            onClick={handleMarkResearched}
          >
            <ResearchIcon />
            <span>Mark as Researched</span>
          </button>
        </div>
      )}

      {/* Show notes if researched */}
      {status === 'researched' && prompt.notes && (
        <div className={styles.researchNotes}>
          <strong>Research Notes:</strong>
          <p>{prompt.notes}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Main PromptPanel component
 */
export default function PromptPanel({
  prompts = [],
  title = 'Research Prompts',
  subtitle = 'AI generates prompts, you do the thinking',
  onCopy,
  onMarkResearched,
  onNotesChange,
  onClose,
  loading = false,
  error = null,
  emptyMessage = 'No prompts available for this context.',
  collapsible = true,
  defaultExpanded = true
}) {
  const [panelExpanded, setPanelExpanded] = useState(defaultExpanded);
  const [expandedPrompts, setExpandedPrompts] = useState(new Set());

  const togglePromptExpand = useCallback((promptId) => {
    setExpandedPrompts(prev => {
      const next = new Set(prev);
      if (next.has(promptId)) {
        next.delete(promptId);
      } else {
        next.add(promptId);
      }
      return next;
    });
  }, []);

  // Group prompts by status
  const activePrompts = prompts.filter(p => p.status !== 'researched');
  const researchedPrompts = prompts.filter(p => p.status === 'researched');

  return (
    <div className={styles.panel}>
      {/* Panel Header */}
      <div className={styles.panelHeader}>
        <div className={styles.panelTitleArea}>
          <h3 className={styles.panelTitle}>
            <ResearchIcon />
            {title}
          </h3>
          {subtitle && <p className={styles.panelSubtitle}>{subtitle}</p>}
        </div>

        <div className={styles.panelControls}>
          {collapsible && (
            <button
              className={styles.collapseButton}
              onClick={() => setPanelExpanded(!panelExpanded)}
              title={panelExpanded ? 'Collapse panel' : 'Expand panel'}
            >
              {panelExpanded ? <CollapseIcon /> : <ExpandIcon />}
            </button>
          )}
          {onClose && (
            <button
              className={styles.closeButton}
              onClick={onClose}
              title="Close panel"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      {/* Panel Content */}
      {panelExpanded && (
        <div className={styles.panelContent}>
          {/* Loading State */}
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Generating research prompts...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={styles.errorState}>
              <p>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && prompts.length === 0 && (
            <div className={styles.emptyState}>
              <LightbulbIcon />
              <p>{emptyMessage}</p>
            </div>
          )}

          {/* Active Prompts */}
          {!loading && !error && activePrompts.length > 0 && (
            <div className={styles.promptsSection}>
              {activePrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id || prompt.promptId}
                  prompt={prompt}
                  onCopy={onCopy}
                  onMarkResearched={onMarkResearched}
                  onNotesChange={onNotesChange}
                  isExpanded={expandedPrompts.has(prompt.id || prompt.promptId)}
                  onToggleExpand={() => togglePromptExpand(prompt.id || prompt.promptId)}
                />
              ))}
            </div>
          )}

          {/* Researched Prompts (collapsed by default) */}
          {!loading && !error && researchedPrompts.length > 0 && (
            <div className={styles.researchedSection}>
              <details>
                <summary className={styles.researchedSummary}>
                  <CheckIcon />
                  <span>{researchedPrompts.length} completed research{researchedPrompts.length !== 1 ? 'es' : ''}</span>
                </summary>
                <div className={styles.promptsSection}>
                  {researchedPrompts.map((prompt) => (
                    <PromptCard
                      key={prompt.id || prompt.promptId}
                      prompt={prompt}
                      isExpanded={expandedPrompts.has(prompt.id || prompt.promptId)}
                      onToggleExpand={() => togglePromptExpand(prompt.id || prompt.promptId)}
                    />
                  ))}
                </div>
              </details>
            </div>
          )}

          {/* Philosophy reminder */}
          <div className={styles.philosophyNote}>
            <p>
              <strong>Remember:</strong> These prompts help you ask better questions.
              Use external AI tools to research, then bring insights back here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for sidebar use
 */
export function PromptPanelCompact({
  prompts = [],
  onGeneratePrompts,
  onSelectPrompt,
  loading = false
}) {
  return (
    <div className={styles.compactPanel}>
      <div className={styles.compactHeader}>
        <LightbulbIcon />
        <span>Research Prompts</span>
        {prompts.length > 0 && (
          <span className={styles.promptCount}>{prompts.length}</span>
        )}
      </div>

      {loading ? (
        <div className={styles.compactLoading}>Loading...</div>
      ) : prompts.length > 0 ? (
        <ul className={styles.compactList}>
          {prompts.slice(0, 5).map((prompt) => (
            <li
              key={prompt.id || prompt.promptId}
              onClick={() => onSelectPrompt?.(prompt)}
              className={styles.compactItem}
            >
              <span className={styles.compactItemTitle}>
                {prompt.title || prompt.template?.title}
              </span>
              {prompt.status === 'researched' && <CheckIcon />}
            </li>
          ))}
          {prompts.length > 5 && (
            <li className={styles.compactMore}>
              +{prompts.length - 5} more
            </li>
          )}
        </ul>
      ) : (
        <button
          className={styles.generateButton}
          onClick={onGeneratePrompts}
        >
          Generate Research Prompts
        </button>
      )}
    </div>
  );
}

// Helper function
function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
