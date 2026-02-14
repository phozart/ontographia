// components/ba/blocks/ParagraphBlock.js
// Paragraph/text block component

import { useRef, useEffect } from 'react';

export default function ParagraphBlock({ content, onChange, onDelete, onAddBlock, isEditing }) {
  const { text = '' } = content || {};
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleTextChange = (e) => {
    onChange({ ...content, text: e.target.value });
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && text === '') {
      e.preventDefault();
      onDelete?.();
    }
    if (e.key === 'Enter' && e.shiftKey) {
      // Allow shift+enter for new line
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddBlock?.('paragraph');
    }
  };

  if (!isEditing) {
    return (
      <div className="block-paragraph-view">
        {text ? (
          <p className="block-paragraph">{text}</p>
        ) : (
          <p className="block-paragraph placeholder">Type your text here...</p>
        )}
      </div>
    );
  }

  return (
    <div className="block-paragraph-edit">
      <textarea
        ref={textareaRef}
        className="paragraph-input"
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your text here..."
        rows={1}
      />
    </div>
  );
}
