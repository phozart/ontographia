// components/ui/UniversalSearch.js
// Cmd+K universal search overlay — searches artefacts and graph nodes.

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import HubIcon from '@mui/icons-material/Hub';
import AssignmentIcon from '@mui/icons-material/Assignment';
import styles from './UniversalSearch.module.css';

const SOURCE_ICONS = {
  artefact: AssignmentIcon,
  graph_node: HubIcon,
};

const SOURCE_LABELS = {
  artefact: 'Artefact',
  graph_node: 'Graph Node',
};

export default function UniversalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const router = useRouter();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search/universal?q=${encodeURIComponent(query)}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          setResults(data?.results || []);
          setSelectedIndex(0);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      navigateTo(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [results, selectedIndex, onClose]);

  const navigateTo = useCallback((item) => {
    onClose();
    if (item.href) {
      router.push(item.href);
    }
  }, [onClose, router]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Search input */}
        <div className={styles.inputRow}>
          <SearchIcon style={{ fontSize: 18, color: '#9C9A94' }} />
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder="Search artefacts, graph nodes..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className={styles.closeButton} onClick={onClose}>
            <CloseIcon style={{ fontSize: 16 }} />
          </button>
        </div>

        {/* Results */}
        <div className={styles.results}>
          {loading && (
            <div className={styles.loadingText}>Searching...</div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className={styles.emptyText}>No results found.</div>
          )}

          {!loading && results.map((item, idx) => {
            const Icon = SOURCE_ICONS[item.source] || AssignmentIcon;
            return (
              <div
                key={`${item.source}-${item.id}`}
                className={`${styles.resultItem} ${idx === selectedIndex ? styles.selected : ''}`}
                onClick={() => navigateTo(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <Icon style={{ fontSize: 16, color: item.type_color || '#9C9A94', flexShrink: 0 }} />
                <div className={styles.resultInfo}>
                  <span className={styles.resultName}>{item.name}</span>
                  <span className={styles.resultMeta}>
                    {item.type && <span className={styles.resultType}>{item.type}</span>}
                    <span className={styles.resultSource}>{SOURCE_LABELS[item.source] || item.source}</span>
                  </span>
                </div>
                {item.status && (
                  <span className={styles.resultStatus}>{item.status}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.hint}>
            <kbd className={styles.kbd}>&uarr;&darr;</kbd> navigate
            <kbd className={styles.kbd}>Enter</kbd> open
            <kbd className={styles.kbd}>Esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
