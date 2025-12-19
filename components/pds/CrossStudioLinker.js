// components/pds/CrossStudioLinker.js
// Cross-Studio Linker - Links PDS artefacts with other studio artefacts
// Phase 7: SRS Integration

import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePDS } from './PDSContext';
import { useAuth } from '../AuthContext';
import { useProjects } from '../ProjectContext';
import { CROSS_STUDIO_RELATIONSHIPS, SRS_READINESS_CRITERIA } from '../../lib/pds-pmbok-mapping';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import LaunchIcon from '@mui/icons-material/Launch';

// Studio configurations
const STUDIOS = {
  srs: { name: 'Strategic Reasoning', color: '#8b5cf6', endpoint: '/api/srs' },
  dwd: { name: 'Dynamic Work Design', color: '#f59e0b', endpoint: '/api/dwd' },
  ba: { name: 'Requirements', color: '#3b82f6', endpoint: '/api/artefacts' },
  ea: { name: 'Enterprise Architecture', color: '#10b981', endpoint: '/api/ea' },
};

export default function CrossStudioLinker({
  isOpen,
  onClose,
  sourceArtefact,
  existingLinks = [],
  onLinkCreated,
}) {
  const { createRelationship } = usePDS();
  const { user, role } = useAuth();
  const { activeProject } = useProjects();

  const [selectedStudio, setSelectedStudio] = useState('srs');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableArtefacts, setAvailableArtefacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [linking, setLinking] = useState(false);

  const authHeaders = useMemo(() => ({
    'x-user': user || '',
    'x-role': role || '',
  }), [user, role]);

  // Get applicable relationship types for source artefact
  const applicableRelationships = useMemo(() => {
    if (!sourceArtefact) return [];

    const sourceType = sourceArtefact.artefact_type;
    const relationships = [];

    // Find relationships where this artefact type can be the target
    Object.entries(CROSS_STUDIO_RELATIONSHIPS).forEach(([key, rels]) => {
      rels.forEach(rel => {
        if (rel.toType === sourceType) {
          relationships.push({
            ...rel,
            studio: key.split('_')[0],
          });
        }
      });
    });

    return relationships;
  }, [sourceArtefact]);

  // Fetch artefacts from selected studio
  const fetchStudioArtefacts = useCallback(async () => {
    if (!activeProject?.id || !selectedStudio) return;

    setLoading(true);
    setError(null);

    try {
      let endpoint = '';
      let params = new URLSearchParams({ projectId: activeProject.id });

      switch (selectedStudio) {
        case 'srs':
          endpoint = '/api/srs/decisions';
          break;
        case 'dwd':
          endpoint = '/api/dwd/artefacts';
          break;
        case 'ba':
          endpoint = `/api/projects/${activeProject.id}/artefacts`;
          params.set('domain', 'ba');
          break;
        case 'ea':
          endpoint = '/api/ea/elements';
          break;
        default:
          throw new Error(`Unknown studio: ${selectedStudio}`);
      }

      const res = await fetch(`${endpoint}?${params}`, { headers: authHeaders });

      if (!res.ok) {
        console.warn(`${selectedStudio} API returned error:`, res.status);
        setAvailableArtefacts([]);
        return;
      }

      const data = await res.json();
      const artefacts = data.decisions || data.artefacts || data.elements || data.items || [];

      // Filter and map to common format
      setAvailableArtefacts(artefacts.map(a => ({
        id: a.id,
        name: a.name || a.title,
        type: a.artefact_type || a.type || a.element_type,
        description: a.description || a.summary,
        status: a.status,
        readinessScore: a.readiness_score || a.custom_fields?.readiness_score,
        studio: selectedStudio,
        original: a,
      })));

    } catch (err) {
      console.error(`Error fetching ${selectedStudio} artefacts:`, err);
      setError(err.message);
      setAvailableArtefacts([]);
    } finally {
      setLoading(false);
    }
  }, [activeProject?.id, selectedStudio, authHeaders]);

  // Load artefacts when studio changes
  useEffect(() => {
    if (isOpen) {
      fetchStudioArtefacts();
    }
  }, [isOpen, fetchStudioArtefacts]);

  // Filter artefacts by search
  const filteredArtefacts = useMemo(() => {
    if (!searchQuery.trim()) return availableArtefacts;

    const query = searchQuery.toLowerCase();
    return availableArtefacts.filter(a =>
      a.name?.toLowerCase().includes(query) ||
      a.type?.toLowerCase().includes(query) ||
      a.description?.toLowerCase().includes(query)
    );
  }, [availableArtefacts, searchQuery]);

  // Check if artefact is already linked
  const isLinked = useCallback((artefactId) => {
    return existingLinks.some(link =>
      link.from_artefact_id === artefactId ||
      link.to_artefact_id === artefactId
    );
  }, [existingLinks]);

  // Validate SRS decision readiness
  const validateSRSDecision = useCallback((decision) => {
    return SRS_READINESS_CRITERIA.validate(decision.original || decision);
  }, []);

  // Create link to selected artefact
  const handleCreateLink = async (targetArtefact, relationshipType) => {
    if (!sourceArtefact || !targetArtefact) return;

    setLinking(true);
    setError(null);

    try {
      await createRelationship(
        targetArtefact.id,
        sourceArtefact.id,
        relationshipType,
        `Linked from ${STUDIOS[selectedStudio]?.name || selectedStudio}`
      );

      onLinkCreated?.();
      onClose();

    } catch (err) {
      console.error('Error creating link:', err);
      setError(err.message);
    } finally {
      setLinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="pds-cross-linker" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pds-cross-linker__header">
          <div>
            <h2>Link to Other Studios</h2>
            {sourceArtefact && (
              <p className="pds-cross-linker__source">
                Linking: <strong>{sourceArtefact.name}</strong>
              </p>
            )}
          </div>
          <button
            className="pds-cross-linker__close"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Studio tabs */}
        <div className="pds-cross-linker__tabs">
          {Object.entries(STUDIOS).map(([key, studio]) => (
            <button
              key={key}
              className={`pds-cross-linker__tab ${selectedStudio === key ? 'active' : ''}`}
              onClick={() => setSelectedStudio(key)}
              style={{ '--studio-color': studio.color }}
            >
              {studio.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="pds-cross-linker__search">
          <SearchIcon />
          <input
            type="text"
            placeholder={`Search ${STUDIOS[selectedStudio]?.name || ''} artefacts...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Content */}
        <div className="pds-cross-linker__content">
          {error && (
            <div className="pds-cross-linker__error">
              <WarningIcon />
              {error}
            </div>
          )}

          {loading ? (
            <div className="pds-cross-linker__loading">
              Loading artefacts...
            </div>
          ) : filteredArtefacts.length === 0 ? (
            <div className="pds-cross-linker__empty">
              No artefacts found in {STUDIOS[selectedStudio]?.name}
            </div>
          ) : (
            <div className="pds-cross-linker__list">
              {filteredArtefacts.map(artefact => {
                const linked = isLinked(artefact.id);
                const srsValidation = selectedStudio === 'srs' ?
                  validateSRSDecision(artefact) : null;

                return (
                  <div
                    key={artefact.id}
                    className={`pds-cross-linker__item ${linked ? 'linked' : ''}`}
                  >
                    <div className="pds-cross-linker__item-info">
                      <div className="pds-cross-linker__item-header">
                        <span className="pds-cross-linker__item-name">
                          {artefact.name}
                        </span>
                        <span
                          className="pds-cross-linker__item-type"
                          style={{ backgroundColor: STUDIOS[selectedStudio]?.color }}
                        >
                          {artefact.type?.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {artefact.description && (
                        <p className="pds-cross-linker__item-desc">
                          {artefact.description.substring(0, 100)}
                          {artefact.description.length > 100 ? '...' : ''}
                        </p>
                      )}

                      {/* SRS Decision readiness indicator */}
                      {srsValidation && (
                        <div className={`pds-cross-linker__readiness ${srsValidation.isReady ? 'ready' : 'not-ready'}`}>
                          {srsValidation.isReady ? (
                            <>
                              <CheckCircleIcon fontSize="small" />
                              <span>Ready ({srsValidation.score}%)</span>
                            </>
                          ) : (
                            <>
                              <WarningIcon fontSize="small" />
                              <span>
                                Not ready - {srsValidation.issues[0]}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pds-cross-linker__item-actions">
                      {linked ? (
                        <span className="pds-cross-linker__linked-badge">
                          <CheckCircleIcon fontSize="small" />
                          Linked
                        </span>
                      ) : (
                        <button
                          className="pds-cross-linker__link-btn"
                          onClick={() => handleCreateLink(
                            artefact,
                            selectedStudio === 'srs' ? 'originated_from' : 'relates_to'
                          )}
                          disabled={linking || (srsValidation && !srsValidation.isReady)}
                        >
                          <LinkIcon fontSize="small" />
                          {linking ? 'Linking...' : 'Link'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pds-cross-linker__footer">
          <p>
            {selectedStudio === 'srs' ? (
              <>
                <strong>Note:</strong> SRS decisions must have a readiness score of at least {SRS_READINESS_CRITERIA.requiredScore}%
                and status "{SRS_READINESS_CRITERIA.requiredStatus}" to be linked.
              </>
            ) : (
              <>
                <strong>Tip:</strong> Linking artefacts helps maintain traceability across studios.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
