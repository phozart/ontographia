// components/spaces/blueprint/ai-design/steps/ImportStep.js
// Step 3: Paste AI JSON response for import

import { useState, useEffect, useCallback } from 'react';
import { parseAndValidate } from '../../../../../lib/blueprint/ai-import-schema';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

export default function ImportStep({ jsonData, onJsonParsed, onValidate }) {
  const [inputValue, setInputValue] = useState(jsonData || '');
  const [parseResult, setParseResult] = useState(null);
  const [isParsing, setIsParsing] = useState(false);

  // Parse JSON when input changes (debounced)
  useEffect(() => {
    if (!inputValue.trim()) {
      setParseResult(null);
      onJsonParsed(null, null);
      onValidate(false);
      return;
    }

    setIsParsing(true);
    const timer = setTimeout(() => {
      const result = parseAndValidate(inputValue);
      setParseResult(result);
      onJsonParsed(result.valid ? result.sanitized : null, result);
      onValidate(result.valid);
      setIsParsing(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, onJsonParsed, onValidate]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputValue(text);
    } catch (err) {
      // Clipboard API not available or permission denied
      console.warn('Could not read clipboard:', err);
    }
  }, []);

  const handleClear = useCallback(() => {
    setInputValue('');
    setParseResult(null);
  }, []);

  const getStatusIcon = () => {
    if (isParsing) {
      return <span className="status-loading">Parsing...</span>;
    }
    if (!parseResult) return null;
    if (parseResult.valid) {
      return (
        <span className="status-success">
          <CheckCircleIcon fontSize="small" />
          <span>Valid JSON</span>
        </span>
      );
    }
    return (
      <span className="status-error">
        <ErrorIcon fontSize="small" />
        <span>{parseResult.errors.length} error(s)</span>
      </span>
    );
  };

  return (
    <div className="ai-wizard-step import-step">
      <div className="step-intro">
        <p>
          Paste the JSON response from the AI below. The system will validate
          the structure and check for potential issues.
        </p>
      </div>

      <div className="import-actions-top">
        <button className="paste-btn" onClick={handlePaste} title="Paste from clipboard">
          <ContentPasteIcon fontSize="small" />
          <span>Paste from Clipboard</span>
        </button>
        {inputValue && (
          <button className="clear-btn" onClick={handleClear}>
            Clear
          </button>
        )}
        <div className="parse-status">{getStatusIcon()}</div>
      </div>

      <div className="json-input-container">
        <textarea
          className={`json-input ${parseResult && !parseResult.valid ? 'has-error' : ''} ${parseResult?.valid ? 'is-valid' : ''}`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Paste the AI's JSON response here...

Example start:
{
  "meta": {
    "confidence_level": "medium",
    ...
  },
  "idea": {
    "refined_description": "...",
    ...
  },
  ...
}`}
          rows={15}
          spellCheck={false}
        />
      </div>

      {parseResult && parseResult.errors.length > 0 && (
        <div className="parse-errors">
          <h4>Validation Errors</h4>
          <ul>
            {parseResult.errors.map((error, idx) => (
              <li key={idx} className="error-item">
                <span className="error-code">{error.code}</span>
                <span className="error-message">{error.message}</span>
                <span className="error-path">{error.path}</span>
              </li>
            ))}
          </ul>
          <p className="error-hint">
            Please fix these errors in your AI response or try generating a new response.
          </p>
        </div>
      )}

      {parseResult?.valid && parseResult.warnings?.length > 0 && (
        <div className="parse-warnings">
          <h4>Warnings ({parseResult.warnings.length})</h4>
          <p className="warning-intro">
            These items may need review but won't block the import.
          </p>
          <ul>
            {parseResult.warnings.slice(0, 3).map((warning, idx) => (
              <li key={idx} className="warning-item">
                <span className="warning-message">{warning.message}</span>
                {warning.suggestion && (
                  <span className="warning-suggestion">{warning.suggestion}</span>
                )}
              </li>
            ))}
            {parseResult.warnings.length > 3 && (
              <li className="warning-more">
                +{parseResult.warnings.length - 3} more warnings (will show in next step)
              </li>
            )}
          </ul>
        </div>
      )}

      {parseResult?.valid && (
        <div className="parse-success">
          <CheckCircleIcon fontSize="small" />
          <span>JSON is valid and ready for import. Click Next to review and select sections.</span>
        </div>
      )}

      <div className="step-tip">
        <strong>Troubleshooting:</strong> If you see parse errors, make sure you copied
        the complete JSON response. It should start with <code>{'{'}</code> and end with <code>{'}'}</code>.
        Sometimes AI responses include markdown code blocks - the system will try to extract the JSON automatically.
      </div>
    </div>
  );
}
