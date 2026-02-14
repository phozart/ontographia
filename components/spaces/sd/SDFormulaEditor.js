// components/sd/SDFormulaEditor.js
// EPIC 3.8 - Formula Editor (Structured Expressions)
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import FunctionsIcon from '@mui/icons-material/Functions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Supported functions and operators
export const FORMULA_FUNCTIONS = {
  min: { args: 2, description: 'Returns the smaller of two values' },
  max: { args: 2, description: 'Returns the larger of two values' },
  abs: { args: 1, description: 'Returns absolute value' },
  sqrt: { args: 1, description: 'Returns square root' },
  exp: { args: 1, description: 'Returns e raised to the power' },
  log: { args: 1, description: 'Returns natural logarithm' },
  clamp: { args: 3, description: 'Clamps value between min and max' },
  if: { args: 3, description: 'Conditional: if(condition, then, else)' },
};

export const FORMULA_OPERATORS = ['+', '-', '*', '/', '^', '(', ')', '<', '>', '<=', '>=', '==', '!='];

// Simple formula parser/validator
export function validateFormula(formula, availableVariables = []) {
  if (!formula || formula.trim() === '') {
    return { valid: true, errors: [], dependencies: [] };
  }

  const errors = [];
  const dependencies = [];
  const tokens = tokenizeFormula(formula);

  // Check for balanced parentheses
  let parenCount = 0;
  tokens.forEach(token => {
    if (token === '(') parenCount++;
    if (token === ')') parenCount--;
    if (parenCount < 0) {
      errors.push({ type: 'syntax', message: 'Unbalanced parentheses' });
    }
  });
  if (parenCount !== 0) {
    errors.push({ type: 'syntax', message: 'Unbalanced parentheses' });
  }

  // Check for unknown identifiers
  const identifierPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  tokens.forEach(token => {
    if (identifierPattern.test(token)) {
      // It's an identifier - check if it's a known function or variable
      const lowerToken = token.toLowerCase();
      if (FORMULA_FUNCTIONS[lowerToken]) {
        // It's a function - OK
      } else if (availableVariables.includes(token)) {
        dependencies.push(token);
      } else {
        // Check case-insensitive
        const match = availableVariables.find(v => v.toLowerCase() === lowerToken);
        if (match) {
          dependencies.push(match);
        } else {
          errors.push({ type: 'unknown', message: `Unknown variable: ${token}`, token });
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    dependencies: [...new Set(dependencies)],
  };
}

// Tokenize formula into components
function tokenizeFormula(formula) {
  const tokens = [];
  let current = '';
  const chars = formula.split('');

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    if ('+-*/^(),<>=!'.includes(char)) {
      if (current) {
        tokens.push(current);
        current = '';
      }

      // Handle multi-char operators
      if ((char === '<' || char === '>' || char === '=' || char === '!') && chars[i + 1] === '=') {
        tokens.push(char + '=');
        i++;
      } else {
        tokens.push(char);
      }
      continue;
    }

    current += char;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

// Formula Editor Component
export default function SDFormulaEditor({
  value = '',
  onChange,
  availableVariables = [],
  placeholder = 'Enter formula...',
  label = 'Formula',
  showHelp = true,
  rows = 3,
}) {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteFilter, setAutocompleteFilter] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const textareaRef = useRef(null);

  // Validate formula
  const validation = useMemo(() => {
    return validateFormula(value, availableVariables);
  }, [value, availableVariables]);

  // Filter autocomplete suggestions
  const suggestions = useMemo(() => {
    const filter = autocompleteFilter.toLowerCase();
    const vars = availableVariables
      .filter(v => v.toLowerCase().includes(filter))
      .map(v => ({ type: 'variable', name: v }));
    const funcs = Object.entries(FORMULA_FUNCTIONS)
      .filter(([name]) => name.includes(filter))
      .map(([name, info]) => ({ type: 'function', name, ...info }));
    return [...vars, ...funcs].slice(0, 10);
  }, [autocompleteFilter, availableVariables]);

  // Handle input change
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    onChange?.(newValue);

    // Check for autocomplete trigger
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const match = textBeforeCursor.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);

    if (match) {
      setAutocompleteFilter(match[0]);
      setShowAutocomplete(true);
      setCursorPosition(cursorPos);
    } else {
      setShowAutocomplete(false);
      setAutocompleteFilter('');
    }
  }, [onChange]);

  // Insert autocomplete suggestion
  const insertSuggestion = useCallback((suggestion) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const beforeMatch = value.slice(0, cursorPosition).replace(/[a-zA-Z_][a-zA-Z0-9_]*$/, '');
    const afterCursor = value.slice(cursorPosition);

    let insertText = suggestion.name;
    if (suggestion.type === 'function') {
      insertText = `${suggestion.name}(`;
    }

    const newValue = beforeMatch + insertText + afterCursor;
    onChange?.(newValue);
    setShowAutocomplete(false);

    // Set cursor position after insert
    setTimeout(() => {
      const newPos = beforeMatch.length + insertText.length;
      textarea.setSelectionRange(newPos, newPos);
      textarea.focus();
    }, 0);
  }, [value, cursorPosition, onChange]);

  // Handle keyboard navigation in autocomplete
  const handleKeyDown = useCallback((e) => {
    if (showAutocomplete && suggestions.length > 0) {
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        insertSuggestion(suggestions[0]);
      } else if (e.key === 'Escape') {
        setShowAutocomplete(false);
      }
    }
  }, [showAutocomplete, suggestions, insertSuggestion]);

  return (
    <div className="sd-formula-editor">
      <div className="formula-header">
        <FunctionsIcon fontSize="small" />
        <span className="formula-label">{label}</span>
        {showHelp && (
          <button
            className="help-btn"
            onClick={() => setShowHelpPanel(!showHelpPanel)}
            title="Formula help"
          >
            <HelpOutlineIcon fontSize="small" />
          </button>
        )}
        <span className={`validation-status ${validation.valid ? 'valid' : 'invalid'}`}>
          {validation.valid ? (
            <CheckCircleIcon fontSize="small" />
          ) : (
            <ErrorIcon fontSize="small" />
          )}
        </span>
      </div>

      <div className="formula-input-container">
        <textarea
          ref={textareaRef}
          className={`formula-input ${!validation.valid ? 'has-error' : ''}`}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
          placeholder={placeholder}
          rows={rows}
          spellCheck={false}
        />

        {/* Autocomplete dropdown */}
        {showAutocomplete && suggestions.length > 0 && (
          <div className="autocomplete-dropdown">
            {suggestions.map((suggestion, idx) => (
              <div
                key={`${suggestion.type}-${suggestion.name}`}
                className={`autocomplete-item ${idx === 0 ? 'selected' : ''}`}
                onClick={() => insertSuggestion(suggestion)}
              >
                <span className={`item-type ${suggestion.type}`}>
                  {suggestion.type === 'function' ? 'fn' : 'var'}
                </span>
                <span className="item-name">{suggestion.name}</span>
                {suggestion.description && (
                  <span className="item-desc">{suggestion.description}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validation errors */}
      {!validation.valid && (
        <div className="formula-errors">
          {validation.errors.map((error, idx) => (
            <div key={idx} className="error-item">
              <ErrorIcon fontSize="small" />
              <span>{error.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Dependencies */}
      {validation.dependencies.length > 0 && (
        <div className="formula-dependencies">
          <span className="dep-label">Uses:</span>
          {validation.dependencies.map(dep => (
            <span key={dep} className="dep-tag">{dep}</span>
          ))}
        </div>
      )}

      {/* Help panel */}
      {showHelpPanel && (
        <div className="formula-help">
          <div className="help-section">
            <h4>Operators</h4>
            <div className="help-items">
              {FORMULA_OPERATORS.map(op => (
                <span key={op} className="help-item">{op}</span>
              ))}
            </div>
          </div>
          <div className="help-section">
            <h4>Functions</h4>
            <div className="help-functions">
              {Object.entries(FORMULA_FUNCTIONS).map(([name, info]) => (
                <div key={name} className="help-function">
                  <span className="fn-name">{name}()</span>
                  <span className="fn-desc">{info.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .sd-formula-editor {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .formula-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-muted);
        }

        .formula-label {
          flex: 1;
        }

        .help-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }

        .help-btn:hover {
          background: var(--border);
          color: var(--text);
        }

        .validation-status {
          display: flex;
          align-items: center;
        }

        .validation-status.valid {
          color: #10b981;
        }

        .validation-status.invalid {
          color: #ef4444;
        }

        .formula-input-container {
          position: relative;
        }

        .formula-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 13px;
          line-height: 1.5;
          resize: vertical;
        }

        .formula-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-soft);
        }

        .formula-input.has-error {
          border-color: #ef4444;
        }

        .autocomplete-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 100;
          max-height: 200px;
          overflow-y: auto;
        }

        .autocomplete-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          cursor: pointer;
          transition: background 0.1s;
        }

        .autocomplete-item:hover,
        .autocomplete-item.selected {
          background: var(--bg);
        }

        .item-type {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .item-type.variable {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        .item-type.function {
          background: rgba(139, 92, 246, 0.15);
          color: #8b5cf6;
        }

        .item-name {
          font-family: monospace;
          font-size: 13px;
          color: var(--text);
        }

        .item-desc {
          font-size: 11px;
          color: var(--text-muted);
          margin-left: auto;
        }

        .formula-errors {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .error-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #ef4444;
        }

        .formula-dependencies {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .dep-label {
          font-size: 11px;
          color: var(--text-muted);
        }

        .dep-tag {
          font-size: 11px;
          padding: 2px 8px;
          background: var(--bg);
          border-radius: 4px;
          font-family: monospace;
          color: var(--text);
        }

        .formula-help {
          padding: 12px;
          background: var(--bg);
          border-radius: 6px;
          border: 1px solid var(--border);
        }

        .help-section {
          margin-bottom: 12px;
        }

        .help-section:last-child {
          margin-bottom: 0;
        }

        .help-section h4 {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0 0 8px 0;
        }

        .help-items {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .help-item {
          padding: 4px 8px;
          background: var(--panel);
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
        }

        .help-functions {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .help-function {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .fn-name {
          font-family: monospace;
          font-size: 12px;
          font-weight: 600;
          color: #8b5cf6;
          min-width: 80px;
        }

        .fn-desc {
          font-size: 11px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
