// components/spaces/blueprint/shared/InitiativeSelector.js
// Compact initiative selector for stage view headers
// Refined minimalist design - precision tool aesthetic

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useBlueprint } from '../BlueprintContext';

// MUI Icons
import SearchIcon from '@mui/icons-material/Search';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

const STATUS_ICON = {
  open: FolderOpenIcon,
  closed: FolderIcon,
  on_hold: FolderIcon,
};

export default function InitiativeSelector({
  onSelect,
  placeholder = 'Select initiative...',
  className = '',
}) {
  const { initiatives, activeInitiative, setActiveInitiative, setSelectedId } = useBlueprint();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filter initiatives based on search
  const filteredInitiatives = useMemo(() => {
    if (!searchQuery.trim()) return initiatives;

    const query = searchQuery.toLowerCase();
    return initiatives.filter(init =>
      init.name.toLowerCase().includes(query) ||
      (init.display_id && init.display_id.toLowerCase().includes(query))
    );
  }, [initiatives, searchQuery]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset highlight when filter changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredInitiatives]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          Math.min(prev + 1, filteredInitiatives.length - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredInitiatives[highlightedIndex]) {
          handleSelect(filteredInitiatives[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
      default:
        break;
    }
  }, [isOpen, filteredInitiatives, highlightedIndex]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlighted = listRef.current.querySelector('.highlighted');
      if (highlighted) {
        highlighted.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = useCallback((initiative) => {
    setActiveInitiative(initiative);
    setSelectedId(initiative.id);
    onSelect?.(initiative);
    setIsOpen(false);
    setSearchQuery('');
  }, [setActiveInitiative, setSelectedId, onSelect]);

  const handleClear = useCallback((e) => {
    e.stopPropagation();
    setActiveInitiative(null);
    setSelectedId(null);
    onSelect?.(null);
  }, [setActiveInitiative, setSelectedId, onSelect]);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Render selected state (compact pill)
  if (activeInitiative && !isOpen) {
    const status = activeInitiative.initiative_status || activeInitiative.status || 'open';
    const StatusIcon = STATUS_ICON[status] || FolderOpenIcon;

    return (
      <div
        ref={containerRef}
        className={`initiative-selector initiative-selector--selected ${className}`}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="combobox"
        aria-expanded={false}
        aria-haspopup="listbox"
      >
        <button
          className="initiative-selector-trigger"
          onClick={handleToggle}
          type="button"
        >
          <StatusIcon className="initiative-selector-status-icon" data-status={status} />
          <span className="initiative-selector-id">{activeInitiative.display_id}</span>
          <span className="initiative-selector-name">{activeInitiative.name}</span>
          <KeyboardArrowDownIcon className="initiative-selector-chevron" />
        </button>
        <button
          className="initiative-selector-clear"
          onClick={handleClear}
          title="Clear selection"
          type="button"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`initiative-selector ${isOpen ? 'initiative-selector--open' : ''} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger / Search Input */}
      <div className="initiative-selector-trigger-area">
        {isOpen ? (
          <div className="initiative-selector-search">
            <SearchIcon className="initiative-selector-search-icon" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or ID..."
              className="initiative-selector-search-input"
              role="combobox"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              aria-controls="initiative-selector-list"
            />
            <button
              className="initiative-selector-close"
              onClick={() => { setIsOpen(false); setSearchQuery(''); }}
              type="button"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
        ) : (
          <button
            className="initiative-selector-trigger initiative-selector-trigger--empty"
            onClick={handleToggle}
            type="button"
            tabIndex={0}
            role="combobox"
            aria-expanded={false}
            aria-haspopup="listbox"
          >
            <FolderOpenIcon className="initiative-selector-placeholder-icon" />
            <span className="initiative-selector-placeholder">{placeholder}</span>
            <KeyboardArrowDownIcon className="initiative-selector-chevron" />
          </button>
        )}
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="initiative-selector-dropdown">
          <ul
            ref={listRef}
            className="initiative-selector-list"
            id="initiative-selector-list"
            role="listbox"
          >
            {filteredInitiatives.length === 0 ? (
              <li className="initiative-selector-empty">
                {searchQuery ? 'No initiatives match your search' : 'No initiatives available'}
              </li>
            ) : (
              filteredInitiatives.map((init, index) => {
                const status = init.initiative_status || init.status || 'open';
                const StatusIcon = STATUS_ICON[status] || FolderOpenIcon;
                const isHighlighted = index === highlightedIndex;
                const isSelected = activeInitiative?.id === init.id;

                return (
                  <li
                    key={init.id}
                    className={`initiative-selector-item ${isHighlighted ? 'highlighted' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(init)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <StatusIcon className="initiative-selector-item-icon" data-status={status} />
                    <span className="initiative-selector-item-id">{init.display_id}</span>
                    <span className="initiative-selector-item-name">{init.name}</span>
                    {isSelected && <CheckIcon className="initiative-selector-item-check" />}
                  </li>
                );
              })
            )}
          </ul>
          {initiatives.length > 5 && (
            <div className="initiative-selector-hint">
              {filteredInitiatives.length} of {initiatives.length} initiatives
            </div>
          )}
        </div>
      )}
    </div>
  );
}
