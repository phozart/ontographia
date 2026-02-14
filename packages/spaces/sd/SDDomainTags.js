// components/sd/SDDomainTags.js
// EPIC 4 - Lightweight Domain Linking (4.1-4.8)
import { useState, useCallback, useMemo } from 'react';
import LabelIcon from '@mui/icons-material/Label';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

// Predefined tag colors
const TAG_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b',
];

// Hook for managing domain tags
export function useDomainTags(initialTags = {}) {
  const [tags, setTags] = useState(initialTags);
  const [tagColorMap, setTagColorMap] = useState({});

  // Get or assign color for a tag
  const getTagColor = useCallback((tagName) => {
    if (tagColorMap[tagName]) return tagColorMap[tagName];

    // Assign a new color based on hash
    const hash = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = TAG_COLORS[hash % TAG_COLORS.length];

    setTagColorMap(prev => ({ ...prev, [tagName]: color }));
    return color;
  }, [tagColorMap]);

  // Add a new tag to the system
  const addTag = useCallback((tagName) => {
    if (!tagName || tags[tagName]) return;
    setTags(prev => ({
      ...prev,
      [tagName]: { name: tagName, color: getTagColor(tagName) },
    }));
  }, [tags, getTagColor]);

  // Rename a tag
  const renameTag = useCallback((oldName, newName) => {
    if (!newName || oldName === newName || tags[newName]) return false;
    setTags(prev => {
      const updated = { ...prev };
      const tagData = updated[oldName];
      delete updated[oldName];
      updated[newName] = { ...tagData, name: newName };
      return updated;
    });
    return true;
  }, [tags]);

  // Delete a tag
  const deleteTag = useCallback((tagName) => {
    setTags(prev => {
      const updated = { ...prev };
      delete updated[tagName];
      return updated;
    });
  }, []);

  // Set tag color
  const setTagColor = useCallback((tagName, color) => {
    setTags(prev => ({
      ...prev,
      [tagName]: { ...prev[tagName], color },
    }));
    setTagColorMap(prev => ({ ...prev, [tagName]: color }));
  }, []);

  // Get all unique tags from elements
  const getUsedTags = useCallback((elements) => {
    const used = new Set();
    elements.forEach(el => {
      if (el.domainTag) used.add(el.domainTag);
    });
    return Array.from(used);
  }, []);

  return {
    tags,
    setTags,
    tagColorMap,
    getTagColor,
    addTag,
    renameTag,
    deleteTag,
    setTagColor,
    getUsedTags,
  };
}

// Tag Input Component for element properties
export function DomainTagInput({
  value = '',
  onChange,
  availableTags = [],
  onAddTag,
  placeholder = 'Add domain tag...',
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredTags = useMemo(() => {
    if (!inputValue) return availableTags;
    return availableTags.filter(tag =>
      tag.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [inputValue, availableTags]);

  const handleSelect = (tag) => {
    onChange?.(tag);
    setInputValue(tag);
    setIsEditing(false);
    setShowSuggestions(false);
  };

  const handleCreate = () => {
    if (inputValue && !availableTags.includes(inputValue)) {
      onAddTag?.(inputValue);
    }
    onChange?.(inputValue);
    setIsEditing(false);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    onChange?.('');
    setInputValue('');
  };

  if (!isEditing && value) {
    return (
      <div className="domain-tag-display">
        <LocalOfferIcon fontSize="small" />
        <span className="tag-value">{value}</span>
        <button className="edit-btn" onClick={() => setIsEditing(true)}>
          <EditIcon fontSize="small" />
        </button>
        <button className="clear-btn" onClick={handleClear}>
          <CloseIcon fontSize="small" />
        </button>

        <style jsx>{`
          .domain-tag-display {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 6px;
          }

          .tag-value {
            flex: 1;
            font-size: 13px;
            color: var(--text);
          }

          .edit-btn, .clear-btn {
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

          .edit-btn:hover, .clear-btn:hover {
            background: var(--border);
            color: var(--text);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="domain-tag-input">
      <div className="input-wrapper">
        <SearchIcon fontSize="small" />
        <input
          type="text"
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          autoFocus={isEditing}
        />
        {inputValue && (
          <button
            className="create-btn"
            onClick={handleCreate}
            title="Use this tag"
          >
            <AddIcon fontSize="small" />
          </button>
        )}
      </div>

      {showSuggestions && (filteredTags.length > 0 || inputValue) && (
        <div className="suggestions-dropdown">
          {filteredTags.map(tag => (
            <div
              key={tag}
              className="suggestion-item"
              onClick={() => handleSelect(tag)}
            >
              <LocalOfferIcon fontSize="small" />
              <span>{tag}</span>
            </div>
          ))}
          {inputValue && !filteredTags.includes(inputValue) && (
            <div className="suggestion-item create" onClick={handleCreate}>
              <AddIcon fontSize="small" />
              <span>Create "{inputValue}"</span>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .domain-tag-input {
          position: relative;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 6px;
        }

        .input-wrapper input {
          flex: 1;
          border: none;
          background: transparent;
          color: var(--text);
          font-size: 13px;
          outline: none;
        }

        .create-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          background: var(--accent);
          color: white;
          cursor: pointer;
        }

        .suggestions-dropdown {
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

        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 13px;
          color: var(--text);
          transition: background 0.1s;
        }

        .suggestion-item:hover {
          background: var(--bg);
        }

        .suggestion-item.create {
          border-top: 1px solid var(--border);
          color: var(--accent);
        }
      `}</style>
    </div>
  );
}

// Domain Filter Panel
export default function SDDomainTags({
  elements = [],
  tags = {},
  tagColorMap = {},
  selectedTags = [],
  onSelectTag,
  onClearSelection,
  showTagLabels = true,
  onToggleTagLabels,
  showGroupBoundaries = false,
  onToggleGroupBoundaries,
  onRenameTag,
  onDeleteTag,
  onSetTagColor,
  collapsed = false,
  onToggleCollapse,
}) {
  const [editingTag, setEditingTag] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Get used tags with counts
  const usedTags = useMemo(() => {
    const counts = {};
    elements.forEach(el => {
      if (el.domainTag) {
        counts[el.domainTag] = (counts[el.domainTag] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        color: tagColorMap[name] || tags[name]?.color || '#64748b',
      }))
      .sort((a, b) => b.count - a.count);
  }, [elements, tags, tagColorMap]);

  // Filter tags by search
  const filteredTags = useMemo(() => {
    if (!searchQuery) return usedTags;
    return usedTags.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [usedTags, searchQuery]);

  const handleToggleTag = (tagName) => {
    if (selectedTags.includes(tagName)) {
      onSelectTag?.(selectedTags.filter(t => t !== tagName));
    } else {
      onSelectTag?.([...selectedTags, tagName]);
    }
  };

  const startEditing = (tag) => {
    setEditingTag(tag.name);
    setEditValue(tag.name);
  };

  const saveEdit = () => {
    if (editValue && editValue !== editingTag) {
      onRenameTag?.(editingTag, editValue);
    }
    setEditingTag(null);
    setEditValue('');
  };

  return (
    <div className="sd-domain-tags">
      <div className="tags-header" onClick={onToggleCollapse}>
        <LocalOfferIcon fontSize="small" />
        <span className="tags-title">Domain Tags</span>
        {selectedTags.length > 0 && (
          <span className="selected-count">{selectedTags.length}</span>
        )}
      </div>

      {!collapsed && (
        <div className="tags-content">
          {/* Search */}
          <div className="tags-search">
            <SearchIcon fontSize="small" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tags..."
            />
          </div>

          {/* Display options */}
          <div className="display-options">
            <label className="option-toggle">
              <input
                type="checkbox"
                checked={showTagLabels}
                onChange={e => onToggleTagLabels?.(e.target.checked)}
              />
              <span>Show tag labels</span>
            </label>
            <label className="option-toggle">
              <input
                type="checkbox"
                checked={showGroupBoundaries}
                onChange={e => onToggleGroupBoundaries?.(e.target.checked)}
              />
              <span>Show group boundaries</span>
            </label>
          </div>

          {/* Tags list */}
          <div className="tags-list">
            {filteredTags.length === 0 ? (
              <div className="no-tags">
                <LocalOfferIcon />
                <p>No tags in this model</p>
                <p className="hint">Add tags to elements to organize your diagram</p>
              </div>
            ) : (
              filteredTags.map(tag => (
                <div
                  key={tag.name}
                  className={`tag-item ${selectedTags.includes(tag.name) ? 'selected' : ''}`}
                >
                  {editingTag === tag.name ? (
                    <div className="tag-edit">
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={e => e.key === 'Enter' && saveEdit()}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <>
                      <div
                        className="tag-color"
                        style={{ backgroundColor: tag.color }}
                        onClick={() => handleToggleTag(tag.name)}
                      />
                      <span
                        className="tag-name"
                        onClick={() => handleToggleTag(tag.name)}
                      >
                        {tag.name}
                      </span>
                      <span className="tag-count">{tag.count}</span>
                      <div className="tag-actions">
                        <button onClick={() => startEditing(tag)} title="Rename">
                          <EditIcon fontSize="small" />
                        </button>
                        <button onClick={() => onDeleteTag?.(tag.name)} title="Delete">
                          <DeleteIcon fontSize="small" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Clear selection */}
          {selectedTags.length > 0 && (
            <button className="clear-selection-btn" onClick={onClearSelection}>
              Clear selection ({selectedTags.length})
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .sd-domain-tags {
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--panel);
          overflow: hidden;
        }

        .tags-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg);
          cursor: pointer;
          user-select: none;
        }

        .tags-title {
          flex: 1;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
        }

        .selected-count {
          padding: 2px 8px;
          background: var(--accent);
          color: white;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }

        .tags-content {
          padding: 12px;
        }

        .tags-search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          margin-bottom: 12px;
          color: var(--text-muted);
        }

        .tags-search input {
          flex: 1;
          border: none;
          background: transparent;
          color: var(--text);
          font-size: 13px;
          outline: none;
        }

        .display-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }

        .option-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text);
          cursor: pointer;
        }

        .option-toggle input {
          width: 14px;
          height: 14px;
          accent-color: var(--accent);
        }

        .tags-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: 250px;
          overflow-y: auto;
        }

        .no-tags {
          text-align: center;
          padding: 20px;
          color: var(--text-muted);
        }

        .no-tags :global(svg) {
          font-size: 32px;
          opacity: 0.3;
          margin-bottom: 8px;
        }

        .no-tags p {
          margin: 4px 0;
          font-size: 12px;
        }

        .no-tags .hint {
          opacity: 0.7;
        }

        .tag-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .tag-item:hover {
          background: var(--bg);
        }

        .tag-item.selected {
          background: var(--accent-soft);
        }

        .tag-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          cursor: pointer;
        }

        .tag-name {
          flex: 1;
          font-size: 13px;
          color: var(--text);
          cursor: pointer;
        }

        .tag-count {
          font-size: 11px;
          color: var(--text-muted);
          padding: 2px 6px;
          background: var(--bg);
          border-radius: 4px;
        }

        .tag-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .tag-item:hover .tag-actions {
          opacity: 1;
        }

        .tag-actions button {
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

        .tag-actions button:hover {
          background: var(--border);
          color: var(--text);
        }

        .tag-edit {
          flex: 1;
        }

        .tag-edit input {
          width: 100%;
          padding: 4px 8px;
          border: 1px solid var(--accent);
          border-radius: 4px;
          background: var(--bg);
          color: var(--text);
          font-size: 13px;
          outline: none;
        }

        .clear-selection-btn {
          width: 100%;
          margin-top: 12px;
          padding: 8px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: transparent;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-selection-btn:hover {
          background: var(--bg);
          color: var(--text);
        }
      `}</style>
    </div>
  );
}
