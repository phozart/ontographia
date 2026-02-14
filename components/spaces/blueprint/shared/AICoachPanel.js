// components/spaces/blueprint/shared/AICoachPanel.js
// Persistent AI coaching side panel for Blueprint Studio
// Stage-aware prompts, sends initiative context to /api/ai/generate

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useBlueprint, BPS_STAGE_INFO } from '../BlueprintContext';
import { getCoachPrompts, interpolatePrompt } from '../../../../lib/prompts/blueprintCoach';

// MUI Icons
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function AICoachPanel({ isOpen, onClose }) {
  const { activeInitiative } = useBlueprint();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestionsExpanded, setSuggestionsExpanded] = useState(true);
  const messagesEndRef = useRef(null);

  const currentStage = activeInitiative?.status || activeInitiative?.stage || 'idea';

  // Get stage-appropriate prompt suggestions
  const suggestions = useMemo(
    () => getCoachPrompts(currentStage),
    [currentStage]
  );

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send a message to the AI
  const sendMessage = useCallback(async (prompt) => {
    if (!prompt?.trim()) return;

    const userMessage = { role: 'user', content: prompt, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      // Interpolate any template variables
      const interpolated = activeInitiative
        ? interpolatePrompt(prompt, activeInitiative)
        : prompt;

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: interpolated,
          type: 'initiative-analysis',
          temperature: 0.7,
          maxTokens: 2000,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || `AI service error (${res.status})`);
      }

      const data = await res.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.text || data.content || data.result || JSON.stringify(data),
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err.message);
      setMessages(prev => [...prev, {
        role: 'error',
        content: err.message,
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [activeInitiative]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    sendMessage(suggestion.prompt);
    setSuggestionsExpanded(false);
  }, [sendMessage]);

  // Handle custom message submit
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (inputText.trim() && !loading) {
      sendMessage(inputText);
    }
  }, [inputText, loading, sendMessage]);

  // Copy message to clipboard
  const handleCopy = useCallback((content) => {
    navigator.clipboard?.writeText(content).catch(() => {});
  }, []);

  // Clear conversation
  const handleClear = useCallback(() => {
    setMessages([]);
    setError(null);
    setSuggestionsExpanded(true);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="ai-coach-panel">
      {/* Header */}
      <div className="ai-coach-header">
        <div className="ai-coach-header-title">
          <AutoAwesomeIcon style={{ color: '#C9A227' }} />
          <div>
            <h3>AI Coach</h3>
            {activeInitiative && (
              <span className="ai-coach-header-context">
                {activeInitiative.display_id} — {BPS_STAGE_INFO[currentStage]?.name} Stage
              </span>
            )}
          </div>
        </div>
        <div className="ai-coach-header-actions">
          {messages.length > 0 && (
            <button
              className="ai-coach-icon-btn"
              onClick={handleClear}
              title="Clear conversation"
            >
              <DeleteIcon fontSize="small" />
            </button>
          )}
          <button className="ai-coach-icon-btn" onClick={onClose} title="Close">
            <CloseIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="ai-coach-suggestions">
          <button
            className="ai-coach-suggestions-toggle"
            onClick={() => setSuggestionsExpanded(prev => !prev)}
          >
            <LightbulbIcon style={{ fontSize: 16, color: '#C9A227' }} />
            <span>Stage Prompts ({suggestions.length})</span>
            {suggestionsExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </button>
          {suggestionsExpanded && (
            <div className="ai-coach-suggestions-list">
              {suggestions.map(s => (
                <button
                  key={s.id}
                  className="ai-coach-suggestion"
                  onClick={() => handleSuggestionClick(s)}
                  disabled={loading}
                >
                  <span className="ai-coach-suggestion-title">{s.title}</span>
                  <span className="ai-coach-suggestion-desc">{s.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No initiative warning */}
      {!activeInitiative && (
        <div className="ai-coach-notice">
          <LightbulbIcon style={{ fontSize: 18, color: '#C9A227' }} />
          <span>Select an initiative for stage-specific coaching prompts.</span>
        </div>
      )}

      {/* Messages */}
      <div className="ai-coach-messages">
        {messages.length === 0 && (
          <div className="ai-coach-empty">
            <AutoAwesomeIcon style={{ fontSize: 32, color: '#E2E0DB' }} />
            <p>Ask a question or select a prompt above to get AI coaching for your initiative.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`ai-coach-message ai-coach-message--${msg.role}`}
          >
            {msg.role === 'assistant' && (
              <div className="ai-coach-message-header">
                <AutoAwesomeIcon style={{ fontSize: 14, color: '#C9A227' }} />
                <span>AI Coach</span>
                <button
                  className="ai-coach-copy-btn"
                  onClick={() => handleCopy(msg.content)}
                  title="Copy to clipboard"
                >
                  <ContentCopyIcon style={{ fontSize: 12 }} />
                </button>
              </div>
            )}
            <div className="ai-coach-message-content">
              {msg.content.split('\n').map((line, j) => (
                <p key={j}>{line || '\u00A0'}</p>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="ai-coach-message ai-coach-message--loading">
            <div className="ai-coach-typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="ai-coach-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={activeInitiative
            ? `Ask about ${activeInitiative.name}...`
            : 'Ask the AI coach...'
          }
          disabled={loading}
          className="ai-coach-input-field"
        />
        <button
          type="submit"
          className="ai-coach-send-btn"
          disabled={!inputText.trim() || loading}
        >
          <SendIcon fontSize="small" />
        </button>
      </form>
    </div>
  );
}
