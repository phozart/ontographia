// components/ba/blocks/HeadingBlock.js
// Heading block component (H1, H2, H3)

import { useState, useRef, useEffect } from 'react';

export default function HeadingBlock({ content, onChange, onDelete, isEditing }) {
  const { level = 2, text = '' } = content || {};
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleTextChange = (e) => {
    onChange({ ...content, text: e.target.value });
  };

  const handleLevelChange = (newLevel) => {
    onChange({ ...content, level: newLevel });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && text === '') {
      e.preventDefault();
      onDelete?.();
    }
  };

  if (!isEditing) {
    const Tag = `h${level}`;
    return (
      <div className="block-heading-view">
        <Tag className={`block-heading h${level}`}>
          {text || <span className="placeholder">Heading {level}</span>}
        </Tag>
      </div>
    );
  }

  return (
    <div className="block-heading-edit">
      <div className="heading-level-selector">
        {[1, 2, 3].map((l) => (
          <button
            key={l}
            className={`level-btn ${level === l ? 'active' : ''}`}
            onClick={() => handleLevelChange(l)}
            type="button"
          >
            H{l}
          </button>
        ))}
      </div>
      <input
        ref={inputRef}
        type="text"
        className={`heading-input h${level}`}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={`Heading ${level}`}
      />
    </div>
  );
}
