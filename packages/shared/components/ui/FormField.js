// components/ui/FormField.js
// Shared Form Field components with consistent styling and validation

import { useState, useId } from 'react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import styles from './FormField.module.css';

/**
 * FormField - Unified form field wrapper with label, hint, error states
 *
 * @param {string} type - 'text' | 'textarea' | 'select' | 'number' | 'date' | 'email' | 'password'
 * @param {string} label - Field label
 * @param {string} value - Current value
 * @param {function} onChange - Change handler (receives value, not event)
 * @param {string} error - Error message
 * @param {string} hint - Helper text
 * @param {boolean} required - Required field
 * @param {Array} options - Options for select type [{value, label}]
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Disabled state
 * @param {number} rows - Rows for textarea (default 3)
 * @param {number} maxLength - Max characters
 * @param {number} min - Min value for number
 * @param {number} max - Max value for number
 * @param {string} className - Additional classes
 */
export function FormField({
  type = 'text',
  label,
  value,
  onChange,
  error,
  hint,
  required = false,
  options = [],
  placeholder,
  disabled = false,
  rows = 3,
  maxLength,
  min,
  max,
  step,
  className = '',
  autoFocus = false,
  name,
}) {
  const id = useId();
  const [showHint, setShowHint] = useState(false);

  const handleChange = (e) => {
    const newValue = type === 'number'
      ? (e.target.value === '' ? '' : parseFloat(e.target.value))
      : e.target.value;
    onChange?.(newValue);
  };

  const fieldClasses = [
    styles.field,
    error && styles.fieldError,
    disabled && styles.fieldDisabled,
    className,
  ].filter(Boolean).join(' ');

  const inputClasses = [
    styles.input,
    error && styles.inputError,
  ].filter(Boolean).join(' ');

  const renderInput = () => {
    const commonProps = {
      id,
      name: name || id,
      value: value ?? '',
      onChange: handleChange,
      disabled,
      placeholder,
      autoFocus,
      'aria-invalid': !!error,
      'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            className={`${inputClasses} ${styles.textarea}`}
            rows={rows}
            maxLength={maxLength}
          />
        );

      case 'select':
        return (
          <select {...commonProps} className={inputClasses}>
            <option value="">{placeholder || 'Select...'}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            className={inputClasses}
            min={min}
            max={max}
            step={step}
          />
        );

      case 'date':
        return (
          <input
            {...commonProps}
            type="date"
            className={inputClasses}
          />
        );

      default:
        return (
          <input
            {...commonProps}
            type={type}
            className={inputClasses}
            maxLength={maxLength}
          />
        );
    }
  };

  const characterCount = maxLength && typeof value === 'string' ? value.length : null;

  return (
    <div className={fieldClasses}>
      {/* Label row */}
      {label && (
        <div className={styles.labelRow}>
          <label htmlFor={id} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
          {hint && (
            <button
              type="button"
              className={styles.hintBtn}
              onClick={() => setShowHint(!showHint)}
              aria-label="Toggle hint"
            >
              <HelpOutlineIcon />
            </button>
          )}
        </div>
      )}

      {/* Hint tooltip */}
      {hint && showHint && (
        <div className={styles.hintBox}>
          {hint}
        </div>
      )}

      {/* Input */}
      <div className={styles.inputWrapper}>
        {renderInput()}
        {error && (
          <ErrorOutlineIcon className={styles.errorIcon} />
        )}
        {!error && value && type !== 'select' && type !== 'textarea' && (
          <CheckCircleIcon className={styles.successIcon} />
        )}
      </div>

      {/* Bottom row - error or character count */}
      <div className={styles.bottomRow}>
        {error && (
          <span id={`${id}-error`} className={styles.errorText} role="alert">
            {error}
          </span>
        )}
        {characterCount !== null && (
          <span className={styles.charCount}>
            {characterCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * FormGroup - Group multiple fields with a heading
 */
export function FormGroup({ title, description, children, className = '' }) {
  return (
    <div className={`${styles.group} ${className}`.trim()}>
      {title && <h3 className={styles.groupTitle}>{title}</h3>}
      {description && <p className={styles.groupDesc}>{description}</p>}
      <div className={styles.groupFields}>
        {children}
      </div>
    </div>
  );
}

/**
 * FormRow - Horizontal row of fields
 */
export function FormRow({ children, className = '' }) {
  return (
    <div className={`${styles.row} ${className}`.trim()}>
      {children}
    </div>
  );
}

/**
 * FormActions - Footer with form buttons
 */
export function FormActions({ children, className = '' }) {
  return (
    <div className={`${styles.actions} ${className}`.trim()}>
      {children}
    </div>
  );
}

/**
 * ArrayField - Field for managing array of strings
 */
export function ArrayField({
  label,
  value = [],
  onChange,
  placeholder = 'Add item...',
  error,
  hint,
  required = false,
  maxItems,
  className = '',
}) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim() && (!maxItems || value.length < maxItems)) {
      onChange?.([...value, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemove = (index) => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className={`${styles.field} ${className}`.trim()}>
      {label && (
        <div className={styles.labelRow}>
          <label className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        </div>
      )}

      {/* Tags */}
      {value.length > 0 && (
        <div className={styles.tags}>
          {value.map((item, index) => (
            <span key={index} className={styles.tag}>
              {item}
              <button
                type="button"
                className={styles.tagRemove}
                onClick={() => handleRemove(index)}
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className={styles.arrayInput}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.input}
          disabled={maxItems && value.length >= maxItems}
        />
        <button
          type="button"
          className={styles.addBtn}
          onClick={handleAdd}
          disabled={!inputValue.trim() || (maxItems && value.length >= maxItems)}
        >
          Add
        </button>
      </div>

      {hint && <p className={styles.hintText}>{hint}</p>}
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
