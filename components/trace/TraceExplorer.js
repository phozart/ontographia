// components/trace/TraceExplorer.js
// Main Trace Explorer component - THE "aha moment" feature for cross-space value

import { useState, useCallback, useEffect, useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ClearIcon from '@mui/icons-material/Clear';
import HistoryIcon from '@mui/icons-material/History';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import TraceGraph from './TraceGraph';
import ImpactSummary from './ImpactSummary';
import { useDomains } from '../DomainContext';

// Space metadata for filtering
const SPACES = [
  { id: 'ba', label: 'Business Analysis', color: '#3b82f6' },
  { id: 'ea', label: 'Enterprise Architecture', color: '#8b5cf6' },
  { id: 'pds', label: 'Project Design', color: '#10b981' },
  { id: 'portfolio', label: 'Portfolio', color: '#06b6d4' },
  { id: 'pdw', label: 'Product Design', color: '#f59e0b' },
  { id: 'dwd', label: 'Work Design', color: '#f43f5e' },
];

/**
 * Artefact search with autocomplete
 */
function ArtefactSearch({ onSelect, domainId }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          limit: '10',
        });
        if (domainId) params.set('domainId', domainId);

        const res = await fetch(`/api/cross-studio/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || data || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, domainId]);

  const handleSelect = (artefact) => {
    setQuery(artefact.name);
    setShowResults(false);
    onSelect(artefact);
  };

  return (
    <div className="trace-search">
      <div className="trace-search__input-container">
        <SearchIcon className="trace-search__icon" />
        <input
          type="text"
          className="trace-search__input"
          placeholder="Search for an artefact to explore..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
        />
        {query && (
          <button
            className="trace-search__clear"
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
          >
            <ClearIcon fontSize="small" />
          </button>
        )}
        {loading && <div className="trace-search__spinner" />}
      </div>

      {showResults && results.length > 0 && (
        <div className="trace-search__results">
          {results.map((item) => (
            <button
              key={item.id}
              className="trace-search__result"
              onClick={() => handleSelect(item)}
            >
              <span
                className="trace-search__result-dot"
                style={{ backgroundColor: getSpaceColor(item.space || inferSpace(item.artefact_type || item.type)) }}
              />
              <div className="trace-search__result-content">
                <span className="trace-search__result-name">{item.name}</span>
                <span className="trace-search__result-type">
                  {item.artefact_type || item.type}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Direction filter buttons
 */
function DirectionFilter({ direction, onChange }) {
  return (
    <div className="trace-direction">
      <button
        className={`trace-direction__btn ${direction === 'upstream' ? 'trace-direction__btn--active' : ''}`}
        onClick={() => onChange('upstream')}
        title="Show upstream dependencies (what this depends on)"
      >
        <ArrowBackIcon fontSize="small" />
        Upstream
      </button>
      <button
        className={`trace-direction__btn ${direction === 'both' ? 'trace-direction__btn--active' : ''}`}
        onClick={() => onChange('both')}
        title="Show all connections"
      >
        <SwapHorizIcon fontSize="small" />
        Both
      </button>
      <button
        className={`trace-direction__btn ${direction === 'downstream' ? 'trace-direction__btn--active' : ''}`}
        onClick={() => onChange('downstream')}
        title="Show downstream dependents (what depends on this)"
      >
        Downstream
        <ArrowForwardIcon fontSize="small" />
      </button>
    </div>
  );
}

/**
 * Depth slider
 */
function DepthControl({ depth, onChange }) {
  return (
    <div className="trace-depth">
      <label className="trace-depth__label">
        Depth: <strong>{depth}</strong> level{depth !== 1 ? 's' : ''}
      </label>
      <input
        type="range"
        className="trace-depth__slider"
        min="1"
        max="5"
        value={depth}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      />
      <div className="trace-depth__marks">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={depth >= n ? 'active' : ''}>{n}</span>
        ))}
      </div>
    </div>
  );
}

/**
 * History of explored artefacts
 */
function ExplorationHistory({ history, onSelect, onClear }) {
  if (history.length === 0) return null;

  return (
    <div className="trace-history">
      <div className="trace-history__header">
        <HistoryIcon fontSize="small" />
        <span>Recent</span>
        <button className="trace-history__clear" onClick={onClear}>Clear</button>
      </div>
      <div className="trace-history__items">
        {history.slice(0, 5).map((item) => (
          <button
            key={item.id}
            className="trace-history__item"
            onClick={() => onSelect(item)}
          >
            <span
              className="trace-history__dot"
              style={{ backgroundColor: getSpaceColor(item.space) }}
            />
            <span className="trace-history__name">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Helper to get space color
 */
function getSpaceColor(space) {
  const colors = {
    ba: '#3b82f6', ea: '#8b5cf6', cap: '#14b8a6', pds: '#10b981',
    srs: '#6366f1', portfolio: '#06b6d4', pdw: '#f59e0b', dwd: '#f43f5e',
    sd: '#f97316', perf: '#34d399', cm: '#8b5cf6', ks: '#64748b',
  };
  return colors[space] || '#6b7280';
}

/**
 * Infer space from type
 */
function inferSpace(type) {
  const map = {
    'BusinessRequirement': 'ba', 'StakeholderRequirement': 'ba', 'UserStory': 'ba',
    'Capability': 'ea', 'Application': 'ea', 'BusinessService': 'cap',
    'Project': 'pds', 'Initiative': 'portfolio', 'WorkItem': 'dwd',
  };
  return map[type] || 'ba';
}

/**
 * Main TraceExplorer component
 */
export default function TraceExplorer() {
  const { activeDomain } = useDomains();

  // State
  const [selectedArtefact, setSelectedArtefact] = useState(null);
  const [direction, setDirection] = useState('both');
  const [depth, setDepth] = useState(3);
  const [traceData, setTraceData] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [spaceFilters, setSpaceFilters] = useState([]);

  // Load trace when artefact or options change
  const loadTrace = useCallback(async (artefactId) => {
    if (!artefactId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch trace data
      const traceRes = await fetch(
        `/api/graph/trace?artefactId=${artefactId}&direction=${direction}&depth=${depth}`
      );

      if (!traceRes.ok) {
        throw new Error('Failed to load trace');
      }

      const trace = await traceRes.json();
      setTraceData(trace);

      // Optionally fetch impact analysis
      const impactRes = await fetch(
        `/api/graph/impact?artefactId=${artefactId}&direction=${direction}`
      );

      if (impactRes.ok) {
        const impact = await impactRes.json();
        setImpactData(impact);
      }
    } catch (err) {
      console.error('Trace error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [direction, depth]);

  // Handle artefact selection
  const handleSelectArtefact = useCallback((artefact) => {
    const normalizedArtefact = {
      id: artefact.id,
      name: artefact.name,
      type: artefact.artefact_type || artefact.type,
      space: artefact.space || inferSpace(artefact.artefact_type || artefact.type),
    };

    setSelectedArtefact(normalizedArtefact);

    // Add to history if not already at top
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.id !== normalizedArtefact.id);
      return [normalizedArtefact, ...filtered].slice(0, 10);
    });

    loadTrace(artefact.id);
  }, [loadTrace]);

  // Handle re-center on node click
  const handleNodeDoubleClick = useCallback((node) => {
    handleSelectArtefact({
      id: node.id,
      name: node.name,
      artefact_type: node.type,
      space: node.space,
    });
  }, [handleSelectArtefact]);

  // Reload when direction or depth changes
  useEffect(() => {
    if (selectedArtefact) {
      loadTrace(selectedArtefact.id);
    }
  }, [direction, depth, selectedArtefact, loadTrace]);

  // Filter trace data by space
  const filteredTraceData = useMemo(() => {
    if (!traceData || spaceFilters.length === 0) return traceData;

    const filteredNodes = traceData.nodes.filter(
      (node) => node.id === selectedArtefact?.id || spaceFilters.includes(node.space)
    );
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = traceData.edges.filter(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );

    return {
      ...traceData,
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }, [traceData, spaceFilters, selectedArtefact]);

  return (
    <div className="trace-explorer">
      {/* Header */}
      <div className="trace-explorer__header">
        <div className="trace-explorer__title">
          <h1>Trace Explorer</h1>
          <p>Discover how artefacts connect across all spaces</p>
        </div>
      </div>

      {/* Controls */}
      <div className="trace-explorer__controls">
        <div className="trace-explorer__search-row">
          <ArtefactSearch onSelect={handleSelectArtefact} domainId={activeDomain} />

          <button
            className={`trace-explorer__filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterListIcon fontSize="small" />
            Filters
          </button>

          {selectedArtefact && (
            <button
              className="trace-explorer__refresh-btn"
              onClick={() => loadTrace(selectedArtefact.id)}
              disabled={loading}
            >
              <RefreshIcon fontSize="small" />
            </button>
          )}
        </div>

        <div className="trace-explorer__options-row">
          <DirectionFilter direction={direction} onChange={setDirection} />
          <DepthControl depth={depth} onChange={setDepth} />
        </div>

        {/* Space filters */}
        {showFilters && (
          <div className="trace-explorer__filters">
            <div className="trace-filter-group">
              <span className="trace-filter-group__label">Filter by space:</span>
              <div className="trace-filter-group__chips">
                {SPACES.map((space) => (
                  <button
                    key={space.id}
                    className={`trace-filter-chip ${spaceFilters.includes(space.id) ? 'active' : ''}`}
                    style={{ '--chip-color': space.color }}
                    onClick={() => {
                      setSpaceFilters((prev) =>
                        prev.includes(space.id)
                          ? prev.filter((s) => s !== space.id)
                          : [...prev, space.id]
                      );
                    }}
                  >
                    <span
                      className="trace-filter-chip__dot"
                      style={{ backgroundColor: space.color }}
                    />
                    {space.label}
                  </button>
                ))}
              </div>
              {spaceFilters.length > 0 && (
                <button
                  className="trace-filter-group__clear"
                  onClick={() => setSpaceFilters([])}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}

        {/* History */}
        <ExplorationHistory
          history={history}
          onSelect={handleSelectArtefact}
          onClear={() => setHistory([])}
        />
      </div>

      {/* Main content */}
      <div className="trace-explorer__content">
        {/* Graph visualization */}
        <div className="trace-explorer__graph">
          <TraceGraph
            traceData={filteredTraceData}
            sourceId={selectedArtefact?.id}
            onNodeClick={(node) => console.log('Clicked:', node)}
            onNodeDoubleClick={handleNodeDoubleClick}
            loading={loading}
            direction={direction}
          />

          {error && (
            <div className="trace-explorer__error">
              <span>{error}</span>
              <button onClick={() => selectedArtefact && loadTrace(selectedArtefact.id)}>
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Impact summary sidebar */}
        <div className="trace-explorer__sidebar">
          <ImpactSummary
            summary={traceData?.summary}
            impactData={impactData}
            source={traceData?.source || selectedArtefact}
            direction={direction}
            loading={loading}
          />

          {/* Quick actions */}
          {selectedArtefact && (
            <div className="trace-explorer__actions">
              <h4>Actions</h4>
              <button
                className="trace-action-btn"
                onClick={() => {
                  const space = selectedArtefact.space || 'ba';
                  window.open(`/app/spaces/${space}/repository`, '_blank');
                }}
              >
                <OpenInNewIcon fontSize="small" />
                Open in {selectedArtefact.space?.toUpperCase() || 'Space'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hint for first-time users */}
      {!selectedArtefact && !loading && (
        <div className="trace-explorer__hint">
          <div className="trace-explorer__hint-content">
            <h3>Cross-Space Traceability</h3>
            <p>
              See how requirements trace to capabilities, decisions connect to projects,
              and changes ripple across your entire model.
            </p>
            <ul>
              <li>Search for any artefact to start exploring</li>
              <li>Double-click a node to re-center the view</li>
              <li>Use depth controls to expand or focus the trace</li>
              <li>Filter by space to focus on specific connections</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
