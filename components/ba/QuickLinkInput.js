// components/ba/QuickLinkInput.js
// Type-ahead search input for quickly linking requirements

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  useRequirements,
  REQUIREMENT_TYPES,
  REQUIREMENT_RELATIONSHIPS,
} from '../RequirementContext';
import { RequirementTypeBadge } from './RequirementManager';
import SearchIcon from '@mui/icons-material/Search';
import LinkIcon from '@mui/icons-material/Link';

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function QuickLinkInput({ requirement, existingRelationships }) {
  const { requirements, createRelationship } = useRequirements();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastLinked, setLastLinked] = useState(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const debouncedQuery = useDebounce(query, 150);

  // Get IDs of already-linked requirements
  const linkedIds = useMemo(() => {
    const ids = new Set([requirement.id]);
    existingRelationships?.forEach((rel) => {
      ids.add(rel.sourceId);
      ids.add(rel.targetId);
    });
    return ids;
  }, [requirement.id, existingRelationships]);

  // Filter available requirements
  const filteredRequirements = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const term = debouncedQuery.toLowerCase();
    return requirements
      .filter((r) => {
        // Exclude current requirement and already linked ones
        if (linkedIds.has(r.id)) return false;
        // Search by ID, title, or type
        return (
          r.displayId?.toLowerCase().includes(term) ||
          r.title?.toLowerCase().includes(term) ||
          REQUIREMENT_TYPES[r.type]?.shortName?.toLowerCase().includes(term) ||
          REQUIREMENT_TYPES[r.type]?.name?.toLowerCase().includes(term)
        );
      })
      .slice(0, 8); // Limit results
  }, [requirements, debouncedQuery, linkedIds]);

  // Determine best relationship type based on requirement types
  const determineRelationshipType = (sourceReq, targetReq) => {
    const sourceType = REQUIREMENT_TYPES[sourceReq.type];
    const targetType = REQUIREMENT_TYPES[targetReq.type];

    if (!sourceType || !targetType) return 'DERIVES_FROM';

    // If target is at a higher level, current derives from target
    if (targetType.level < sourceType.level) {
      return 'DERIVES_FROM';
    }
    // If target is at same or lower level, target derives from current
    return 'DERIVES_FROM';
  };

  // Handle link creation
  const handleCreateLink = (targetReq) => {
    const sourceType = REQUIREMENT_TYPES[requirement.type];
    const targetType = REQUIREMENT_TYPES[targetReq.type];

    // Determine direction based on hierarchy
    let fromId, toId;
    if (targetType.level < sourceType.level) {
      // Current requirement derives from target (target is parent)
      fromId = targetReq.id;
      toId = requirement.id;
    } else {
      // Target derives from current (current is parent)
      fromId = requirement.id;
      toId = targetReq.id;
    }

    createRelationship('DERIVES_FROM', fromId, toId);

    // Show success feedback
    setLastLinked(targetReq);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    // Clear input
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(0);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || filteredRequirements.length === 0) {
      if (e.key === 'ArrowDown' && query) {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredRequirements.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredRequirements[selectedIndex]) {
          handleCreateLink(filteredRequirements[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setQuery('');
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const selectedEl = listRef.current.children[selectedIndex];
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, isOpen]);

  // Open dropdown when typing
  useEffect(() => {
    if (debouncedQuery.trim() && filteredRequirements.length > 0) {
      setIsOpen(true);
      setSelectedIndex(0);
    } else {
      setIsOpen(false);
    }
  }, [debouncedQuery, filteredRequirements.length]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.parentElement.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="quick-link">
      <div className="quick-link__input-wrapper">
        <SearchIcon fontSize="small" className="quick-link__icon" />
        <input
          ref={inputRef}
          type="text"
          className="quick-link__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && filteredRequirements.length > 0 && setIsOpen(true)}
          placeholder="Link requirement..."
        />
        {showSuccess && (
          <span className="quick-link__success">
            <LinkIcon fontSize="small" /> Linked!
          </span>
        )}
      </div>

      {isOpen && filteredRequirements.length > 0 && (
        <div className="quick-link__dropdown" ref={listRef}>
          {filteredRequirements.map((req, index) => {
            const typeDef = REQUIREMENT_TYPES[req.type];
            const isParent = typeDef?.level < (REQUIREMENT_TYPES[requirement.type]?.level || 0);

            return (
              <button
                key={req.id}
                type="button"
                className={`quick-link__item ${index === selectedIndex ? 'is-selected' : ''}`}
                onClick={() => handleCreateLink(req)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <RequirementTypeBadge type={req.type} size="small" />
                <span className="quick-link__item-id">{req.displayId}</span>
                <span className="quick-link__item-title">{req.title}</span>
                <span className="quick-link__item-direction">
                  {isParent ? '↑ parent' : '↓ child'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {isOpen && filteredRequirements.length === 0 && debouncedQuery && (
        <div className="quick-link__dropdown quick-link__dropdown--empty">
          <span>No matching requirements</span>
        </div>
      )}
    </div>
  );
}
