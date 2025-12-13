// components/ba/blocks/DiagramBlock.js
// Embed diagram from workspace block - supports both artefact diagrams and global diagrams

import { useState, useEffect, useMemo } from 'react';
import ImageIcon from '@mui/icons-material/Image';
import SearchIcon from '@mui/icons-material/Search';
import { useArtefacts } from '../../ArtefactContext';

export default function DiagramBlock({ content, onChange, onDelete, isEditing, artefactId }) {
  const { diagrams: artefactDiagrams = [] } = useArtefacts();
  const { diagramId, diagramName } = content || {};
  const [globalDiagrams, setGlobalDiagrams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Combine artefact diagrams and global diagrams
  const allDiagrams = useMemo(() => {
    // Get diagrams linked to current artefact (if any)
    const currentArtefactDiagrams = artefactId
      ? artefactDiagrams.filter(d => d.artefactId === artefactId).map(d => ({ ...d, source: 'artefact' }))
      : [];

    // Get all artefact diagrams (for document context)
    const allArtefactDiagrams = artefactDiagrams.map(d => ({ ...d, source: 'artefact' }));

    // Global diagrams from API
    const globalWithSource = globalDiagrams.map(d => ({ ...d, source: 'global' }));

    // Combine: current artefact first, then other artefact diagrams, then global
    const combined = [...currentArtefactDiagrams];

    // Add other artefact diagrams (not from current artefact)
    allArtefactDiagrams.forEach(d => {
      if (!combined.find(c => c.id === d.id)) {
        combined.push(d);
      }
    });

    // Add global diagrams
    globalWithSource.forEach(d => {
      if (!combined.find(c => c.id === d.id)) {
        combined.push(d);
      }
    });

    return combined;
  }, [artefactDiagrams, globalDiagrams, artefactId]);

  // Load global diagrams from API
  useEffect(() => {
    if (isEditing) {
      loadGlobalDiagrams();
    }
  }, [isEditing]);

  const loadGlobalDiagrams = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/diagrams');
      if (res.ok) {
        const data = await res.json();
        setGlobalDiagrams(data);
      }
    } catch (err) {
      console.error('Failed to load diagrams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDiagram = (diagram) => {
    onChange({
      ...content,
      diagramId: diagram.id,
      diagramName: diagram.name,
    });
  };

  const handleClear = () => {
    onChange({ ...content, diagramId: null, diagramName: null });
  };

  const filteredDiagrams = allDiagrams.filter((d) =>
    !searchTerm || d.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isEditing && diagramId) {
    return (
      <div className="block-diagram-view">
        <div className="diagram-embed-header">
          <ImageIcon fontSize="small" />
          <span>{diagramName || 'Diagram'}</span>
        </div>
        <div className="diagram-embed-placeholder">
          <ImageIcon style={{ fontSize: 48 }} />
          <span>Diagram: {diagramName || diagramId}</span>
          <span className="hint">Click to view in diagram workspace</span>
        </div>
      </div>
    );
  }

  if (!isEditing && !diagramId) {
    return (
      <div className="block-diagram-empty">
        <ImageIcon />
        <span>No diagram selected</span>
      </div>
    );
  }

  return (
    <div className="block-diagram-edit">
      {diagramId ? (
        <div className="selected-diagram">
          <ImageIcon fontSize="small" />
          <span>{diagramName || 'Selected diagram'}</span>
          <button className="clear-btn" onClick={handleClear} type="button">
            Change
          </button>
        </div>
      ) : (
        <>
          <div className="diagram-search">
            <SearchIcon fontSize="small" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search diagrams..."
            />
          </div>
          <div className="diagram-list">
            {loading ? (
              <div className="loading">Loading diagrams...</div>
            ) : filteredDiagrams.length === 0 ? (
              <div className="no-results">
                {allDiagrams.length === 0 ? 'No diagrams available' : 'No diagrams found'}
              </div>
            ) : (
              filteredDiagrams.map((d) => (
                <button
                  key={d.id}
                  className="diagram-option"
                  onClick={() => handleSelectDiagram(d)}
                  type="button"
                >
                  <ImageIcon fontSize="small" />
                  <span className="diagram-option-name">{d.name || 'Untitled'}</span>
                  <span className="diagram-option-type">{d.type || d.diagram_type || 'diagram'}</span>
                  {d.source === 'artefact' && (
                    <span className="diagram-source-badge artefact">Artefact</span>
                  )}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
