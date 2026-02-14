// components/spaces/blueprint/ai-design/steps/ValidateStep.js
// Step 4: Show validation results with errors and warnings

import { useEffect } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

export default function ValidateStep({ validationResult, onValidate }) {
  useEffect(() => {
    // This step is valid if the JSON passed parsing (errors shown on previous step)
    onValidate(validationResult?.valid !== false);
  }, [validationResult, onValidate]);

  if (!validationResult) {
    return (
      <div className="ai-wizard-step validate-step">
        <div className="step-intro">
          <p>No validation data available. Please go back and import JSON first.</p>
        </div>
      </div>
    );
  }

  const { valid, errors, warnings, sanitized } = validationResult;
  const hasWarnings = warnings && warnings.length > 0;
  const hasErrors = errors && errors.length > 0;

  return (
    <div className="ai-wizard-step validate-step">
      <div className="step-intro">
        <p>
          Review the validation results below. The system has checked for structural
          issues and potential hallucinations in the AI response.
        </p>
      </div>

      {/* Overall Status */}
      <div className={`validation-status ${valid ? (hasWarnings ? 'status-warning' : 'status-success') : 'status-error'}`}>
        {valid ? (
          hasWarnings ? (
            <>
              <WarningIcon />
              <div className="status-text">
                <strong>Validation Passed with Warnings</strong>
                <span>{warnings.length} item(s) flagged for review</span>
              </div>
            </>
          ) : (
            <>
              <CheckCircleIcon />
              <div className="status-text">
                <strong>Validation Passed</strong>
                <span>All checks passed successfully</span>
              </div>
            </>
          )
        ) : (
          <>
            <ErrorIcon />
            <div className="status-text">
              <strong>Validation Failed</strong>
              <span>{errors.length} error(s) must be fixed</span>
            </div>
          </>
        )}
      </div>

      {/* Errors Section */}
      {hasErrors && (
        <div className="validation-section errors-section">
          <h4>
            <ErrorIcon fontSize="small" />
            Errors ({errors.length})
          </h4>
          <p className="section-description">
            These issues must be fixed before importing. Go back and correct the JSON response.
          </p>
          <div className="validation-items">
            {errors.map((error, idx) => (
              <div key={idx} className="validation-item error-item">
                <div className="item-header">
                  <span className="item-code">{error.code}</span>
                  <span className="item-path">{error.path}</span>
                </div>
                <div className="item-message">{error.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings Section */}
      {hasWarnings && (
        <div className="validation-section warnings-section">
          <h4>
            <WarningIcon fontSize="small" />
            Warnings ({warnings.length})
          </h4>
          <p className="section-description">
            These items have been flagged for review but won't block the import.
            Consider validating these assumptions with real data.
          </p>
          <div className="validation-items">
            {warnings.map((warning, idx) => (
              <div key={idx} className="validation-item warning-item">
                <div className="item-header">
                  <span className="item-code">{warning.code}</span>
                  <span className="item-path">{warning.path}</span>
                </div>
                <div className="item-message">{warning.message}</div>
                {warning.suggestion && (
                  <div className="item-suggestion">
                    <InfoIcon fontSize="small" />
                    <span>{warning.suggestion}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Summary */}
      {valid && !hasWarnings && (
        <div className="validation-section success-section">
          <h4>
            <CheckCircleIcon fontSize="small" />
            All Checks Passed
          </h4>
          <ul className="success-checks">
            <li>JSON structure is valid</li>
            <li>Required sections are present</li>
            <li>Market sizing hierarchy is correct (TAM {'>'} SAM {'>'} SOM)</li>
            <li>Scores are within valid ranges (1-5)</li>
            <li>No obvious hallucination indicators detected</li>
          </ul>
        </div>
      )}

      {/* Auto-corrections */}
      {sanitized && (
        <div className="validation-section corrections-section">
          <h4>
            <InfoIcon fontSize="small" />
            Auto-Corrections Applied
          </h4>
          <p className="section-description">
            The following automatic fixes have been applied to the data:
          </p>
          <ul className="correction-list">
            <li>Scores clamped to 1-5 range</li>
            <li>RICE confidence clamped to 0-100%</li>
            <li>Horizon value normalized to lowercase</li>
            <li>Single values converted to arrays where needed</li>
          </ul>
        </div>
      )}

      <div className="step-tip">
        <strong>Note:</strong> Warnings are informational and highlight areas where the AI
        may have been overly optimistic or made assumptions. You can still proceed with
        the import and adjust values manually later.
      </div>
    </div>
  );
}
