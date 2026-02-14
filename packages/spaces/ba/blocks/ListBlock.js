// components/ba/blocks/ListBlock.js
// List block component (bullet or numbered)

import { useRef, useEffect } from 'react';

export default function ListBlock({ content, onChange, onDelete, isEditing }) {
  const { listType = 'bullet', items = [''] } = content || {};
  const inputRefs = useRef([]);

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange({ ...content, items: newItems });
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Add new item after current
      const newItems = [...items];
      newItems.splice(index + 1, 0, '');
      onChange({ ...content, items: newItems });
      // Focus new item after render
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    }
    if (e.key === 'Backspace' && items[index] === '') {
      e.preventDefault();
      if (items.length === 1) {
        // Delete the whole block if it's the last empty item
        onDelete?.();
      } else {
        // Remove this item
        const newItems = items.filter((_, i) => i !== index);
        onChange({ ...content, items: newItems });
        // Focus previous item
        setTimeout(() => {
          inputRefs.current[Math.max(0, index - 1)]?.focus();
        }, 0);
      }
    }
  };

  const toggleListType = () => {
    onChange({ ...content, listType: listType === 'bullet' ? 'numbered' : 'bullet' });
  };

  if (!isEditing) {
    const ListTag = listType === 'numbered' ? 'ol' : 'ul';
    return (
      <div className="block-list-view">
        <ListTag className={`block-list ${listType}`}>
          {items.map((item, index) => (
            <li key={index}>{item || <span className="placeholder">List item</span>}</li>
          ))}
        </ListTag>
      </div>
    );
  }

  return (
    <div className="block-list-edit">
      <div className="list-type-toggle">
        <button
          className={`type-btn ${listType === 'bullet' ? 'active' : ''}`}
          onClick={toggleListType}
          type="button"
        >
          • Bullet
        </button>
        <button
          className={`type-btn ${listType === 'numbered' ? 'active' : ''}`}
          onClick={toggleListType}
          type="button"
        >
          1. Numbered
        </button>
      </div>
      <div className="list-items">
        {items.map((item, index) => (
          <div key={index} className="list-item-row">
            <span className="list-marker">
              {listType === 'numbered' ? `${index + 1}.` : '•'}
            </span>
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              className="list-item-input"
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              placeholder="List item"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
