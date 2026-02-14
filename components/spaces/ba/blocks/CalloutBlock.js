// components/ba/blocks/CalloutBlock.js
// Callout block component (info, warning, tip, error)

import { useRef, useEffect } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ErrorIcon from '@mui/icons-material/Error';

const CALLOUT_VARIANTS = {
  info: {
    id: 'info',
    name: 'Info',
    icon: InfoIcon,
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
  },
  warning: {
    id: 'warning',
    name: 'Warning',
    icon: WarningIcon,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
  },
  tip: {
    id: 'tip',
    name: 'Tip',
    icon: LightbulbIcon,
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.1)',
  },
  error: {
    id: 'error',
    name: 'Error',
    icon: ErrorIcon,
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
  },
};

export default function CalloutBlock({ content, onChange, onDelete, isEditing }) {
  const { variant = 'info', title = '', text = '' } = content || {};
  const variantDef = CALLOUT_VARIANTS[variant] || CALLOUT_VARIANTS.info;
  const Icon = variantDef.icon;
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing, text]);

  const handleTextChange = (e) => {
    onChange({ ...content, text: e.target.value });
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleTitleChange = (e) => {
    onChange({ ...content, title: e.target.value });
  };

  const handleVariantChange = (newVariant) => {
    onChange({ ...content, variant: newVariant });
  };

  if (!isEditing) {
    return (
      <div
        className="block-callout-view"
        style={{ backgroundColor: variantDef.bg, borderLeftColor: variantDef.color }}
      >
        <div className="callout-header">
          <Icon style={{ color: variantDef.color }} fontSize="small" />
          <span className="callout-title" style={{ color: variantDef.color }}>
            {title || variantDef.name}
          </span>
        </div>
        {text && <p className="callout-text">{text}</p>}
      </div>
    );
  }

  return (
    <div className="block-callout-edit">
      <div className="variant-selector">
        {Object.values(CALLOUT_VARIANTS).map((v) => {
          const VIcon = v.icon;
          return (
            <button
              key={v.id}
              className={`variant-btn ${variant === v.id ? 'active' : ''}`}
              onClick={() => handleVariantChange(v.id)}
              style={{
                borderColor: variant === v.id ? v.color : 'transparent',
                backgroundColor: variant === v.id ? v.bg : 'transparent',
              }}
              type="button"
            >
              <VIcon style={{ color: v.color }} fontSize="small" />
              <span>{v.name}</span>
            </button>
          );
        })}
      </div>

      <div
        className="callout-preview"
        style={{ backgroundColor: variantDef.bg, borderLeftColor: variantDef.color }}
      >
        <div className="callout-header">
          <Icon style={{ color: variantDef.color }} fontSize="small" />
          <input
            type="text"
            className="callout-title-input"
            value={title}
            onChange={handleTitleChange}
            placeholder={variantDef.name}
            style={{ color: variantDef.color }}
          />
        </div>
        <textarea
          ref={textareaRef}
          className="callout-text-input"
          value={text}
          onChange={handleTextChange}
          placeholder="Callout content..."
          rows={1}
        />
      </div>
    </div>
  );
}
