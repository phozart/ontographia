// components/spaces/blueprint/views/IdeasBoard.js
// Initiative Board - Clean, intuitive design

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useBlueprint, BPS_STAGE_INFO } from '../BlueprintContext';
import ProductIdeaCard from '../initiative/ProductIdeaCard';
import { QuickCaptureModal } from '../initiative/InitiativeModal';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Status icons
const STATUS_ICON = {
  open: FolderOpenIcon,
  closed: FolderIcon,
  on_hold: FolderIcon,
};

// Simple initiative card - click to open, expand to see product ideas
function InitiativeCard({
  initiative,
  productIdeas,
  expanded,
  onToggle,
  onOpen,
  onEdit,
  onDelete,
  onGenerateWithAI,
}) {
  const status = initiative.initiative_status || initiative.status || 'open';
  const StatusIcon = STATUS_ICON[status] || FolderOpenIcon;
  const totalIdeas = productIdeas.length;

  // Progress bar data
  const stageCounts = useMemo(() => {
    const counts = {};
    productIdeas.forEach(pi => {
      const stage = pi.stage || 'idea';
      counts[stage] = (counts[stage] || 0) + 1;
    });
    return counts;
  }, [productIdeas]);

  return (
    <div className={`initiative-card-v2 ${expanded ? 'expanded' : ''}`}>
      {/* Main clickable area - opens detail view */}
      <div className="initiative-card-main" onClick={() => onOpen(initiative)}>
        <div className="initiative-card-left">
          <StatusIcon className="initiative-status-icon" data-status={status} />
          <div className="initiative-card-info">
            <div className="initiative-card-header">
              <span className="initiative-id">{initiative.display_id}</span>
              {totalIdeas > 0 && (
                <span className="initiative-idea-count">{totalIdeas} idea{totalIdeas !== 1 ? 's' : ''}</span>
              )}
            </div>
            <h3 className="initiative-name">{initiative.name}</h3>
            {(initiative.strategic_context?.problem_statement || initiative.idea?.description) && (
              <p className="initiative-description">
                {(initiative.strategic_context?.problem_statement || initiative.idea?.description).substring(0, 120)}
                {(initiative.strategic_context?.problem_statement || initiative.idea?.description).length > 120 ? '...' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="initiative-card-actions">
          <button
            className="initiative-action-btn"
            onClick={(e) => { e.stopPropagation(); onEdit?.(initiative); }}
            title="Edit initiative"
          >
            <EditIcon fontSize="small" />
          </button>
          <button
            className="initiative-action-btn initiative-action-btn--danger"
            onClick={(e) => { e.stopPropagation(); onDelete?.(initiative); }}
            title="Delete initiative"
          >
            <DeleteIcon fontSize="small" />
          </button>
          <button
            className={`initiative-expand-btn ${expanded ? 'expanded' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            title={expanded ? 'Collapse' : 'Show product ideas'}
          >
            <ExpandMoreIcon />
          </button>
        </div>
      </div>

      {/* Progress bar - only show if there are ideas */}
      {totalIdeas > 0 && (
        <div className="initiative-progress">
          {['idea', 'explore', 'assess', 'case', 'approval'].map(stage => {
            const count = stageCounts[stage] || 0;
            const width = (count / totalIdeas) * 100;
            if (width === 0) return null;
            return (
              <div
                key={stage}
                className="progress-segment"
                style={{
                  width: `${width}%`,
                  backgroundColor: BPS_STAGE_INFO[stage]?.color,
                }}
                title={`${BPS_STAGE_INFO[stage]?.name}: ${count}`}
              />
            );
          })}
        </div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div className="initiative-card-expanded">
          {totalIdeas === 0 ? (
            <div className="initiative-empty-state">
              <p>No product ideas yet</p>
              <button className="btn btn-primary" onClick={() => onGenerateWithAI(initiative)}>
                <AutoAwesomeIcon fontSize="small" />
                Generate with AI
              </button>
            </div>
          ) : (
            <div className="initiative-ideas-grid">
              {productIdeas.map(idea => (
                <ProductIdeaCard
                  key={idea.id}
                  productIdea={idea}
                  compact
                  showActions={false}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function IdeasBoard({
  onSelectInitiative,
  onEditInitiative,
  onDeleteInitiative,
  onNavigate,
  onCreateInitiative,
  onOpenAIWizard,
}) {
  const {
    initiatives,
    productIdeas,
    fetchProductIdeasForInitiative,
  } = useBlueprint();

  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Auto-expand if only one initiative
  useEffect(() => {
    if (initiatives.length === 1 && !expandedId) {
      setExpandedId(initiatives[0].id);
    }
  }, [initiatives, expandedId]);

  // Fetch product ideas when expanded
  useEffect(() => {
    if (expandedId) {
      fetchProductIdeasForInitiative(expandedId);
    }
  }, [expandedId, fetchProductIdeasForInitiative]);

  // Group product ideas by initiative
  const productIdeasByInitiative = useMemo(() => {
    const grouped = {};
    productIdeas.forEach(pi => {
      const initId = pi.initiative_id;
      if (!grouped[initId]) grouped[initId] = [];
      grouped[initId].push(pi);
    });
    return grouped;
  }, [productIdeas]);

  // Handlers
  const handleOpen = useCallback((initiative) => {
    // Navigate directly to discovery view with initiative
    // onNavigate handles setting active initiative and URL in one go
    onNavigate?.('discovery', initiative);
  }, [onNavigate]);

  const handleToggle = useCallback((id) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const handleGenerateWithAI = useCallback((initiative) => {
    onSelectInitiative?.(initiative);
    onOpenAIWizard?.(initiative);
  }, [onSelectInitiative, onOpenAIWizard]);

  // Empty state
  if (initiatives.length === 0) {
    return (
      <div className="initiative-board-empty-state">
        <div className="empty-icon">
          <LightbulbIcon />
        </div>
        <h2>No initiatives yet</h2>
        <p>Create your first strategic initiative to start exploring product opportunities</p>
        <button
          className="btn btn-primary btn-lg"
          onClick={onCreateInitiative || (() => setQuickCaptureOpen(true))}
        >
          <AddIcon fontSize="small" />
          Create Initiative
        </button>
        <QuickCaptureModal
          isOpen={quickCaptureOpen}
          onClose={() => setQuickCaptureOpen(false)}
          onCreated={(initiative) => {
            setExpandedId(initiative.id);
            onSelectInitiative?.(initiative);
          }}
        />
      </div>
    );
  }

  return (
    <div className="initiative-board-v2">
      {/* Simple header with just the add button */}
      <div className="initiative-board-header-v2">
        <button
          className="btn btn-primary"
          onClick={onCreateInitiative || (() => setQuickCaptureOpen(true))}
        >
          <AddIcon fontSize="small" />
          New Initiative
        </button>
      </div>

      {/* Initiative list */}
      <div className="initiative-list">
        {initiatives.map(initiative => (
          <InitiativeCard
            key={initiative.id}
            initiative={initiative}
            productIdeas={productIdeasByInitiative[initiative.id] || []}
            expanded={expandedId === initiative.id}
            onToggle={() => handleToggle(initiative.id)}
            onOpen={handleOpen}
            onEdit={onEditInitiative}
            onDelete={onDeleteInitiative}
            onGenerateWithAI={handleGenerateWithAI}
          />
        ))}
      </div>

      <QuickCaptureModal
        isOpen={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
        onCreated={(initiative) => {
          setExpandedId(initiative.id);
          onSelectInitiative?.(initiative);
        }}
      />
    </div>
  );
}
