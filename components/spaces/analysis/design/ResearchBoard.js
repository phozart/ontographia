// components/spaces/analysis/design/ResearchBoard.js
// Atomic UX Research Board - Studies, Observations, and Insights
// Follows the "nuggets" pattern for atomic UX research

import { useState, useMemo, useCallback } from 'react';
import { useAnalysis } from '../AnalysisContext';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ScienceIcon from '@mui/icons-material/Science';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import PersonIcon from '@mui/icons-material/Person';
import BarChartIcon from '@mui/icons-material/BarChart';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import LabelIcon from '@mui/icons-material/Label';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// ============ CONSTANTS ============

const STUDY_TYPES = {
  interview: { label: 'Interview', icon: 'mic', color: '#8b5cf6' },
  survey: { label: 'Survey', icon: 'poll', color: '#06b6d4' },
  usability_test: { label: 'Usability Test', icon: 'touch', color: '#f59e0b' },
  diary_study: { label: 'Diary Study', icon: 'book', color: '#ec4899' },
  field_study: { label: 'Field Study', icon: 'explore', color: '#14b8a6' },
  analytics: { label: 'Analytics Review', icon: 'chart', color: '#64748b' },
};

const EVIDENCE_TYPES = {
  quote: { label: 'Quote', icon: FormatQuoteIcon, color: '#8b5cf6' },
  behavior: { label: 'Behavior', icon: VisibilityIcon, color: '#f59e0b' },
  metric: { label: 'Metric', icon: BarChartIcon, color: '#06b6d4' },
};

const CONFIDENCE_LEVELS = {
  Low: { color: '#A54D4D', label: 'Low' },
  Medium: { color: '#C9A227', label: 'Medium' },
  High: { color: '#5B8A6A', label: 'High' },
};

const THEME_COLORS = [
  '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#14b8a6',
  '#ef4444', '#84cc16', '#f97316', '#64748b', '#a78bfa',
];

// ============ STUDY FORM MODAL ============

function StudyFormModal({ study, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: study?.name || '',
    description: study?.description || '',
    studyType: study?.studyType || 'interview',
    participantCount: study?.participantCount || 0,
    dateStarted: study?.dateStarted || '',
    dateCompleted: study?.dateCompleted || '',
    researchQuestions: study?.researchQuestions || [],
    status: study?.status || 'In Progress',
  });

  const [newQuestion, setNewQuestion] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setFormData(prev => ({
        ...prev,
        researchQuestions: [...prev.researchQuestions, newQuestion.trim()]
      }));
      setNewQuestion('');
    }
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      researchQuestions: prev.researchQuestions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...study, ...formData });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="research-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{study?.id ? 'Edit Study' : 'Create Research Study'}</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-form">
            <div className="form-section">
              <h4>Study Details</h4>

              <div className="form-group">
                <label>Study Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Q1 User Interview Series"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="What is this study investigating?"
                  rows={2}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Study Type</label>
                  <select
                    value={formData.studyType}
                    onChange={(e) => handleChange('studyType', e.target.value)}
                  >
                    {Object.entries(STUDY_TYPES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Participants</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.participantCount}
                    onChange={(e) => handleChange('participantCount', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date Started</label>
                  <input
                    type="date"
                    value={formData.dateStarted}
                    onChange={(e) => handleChange('dateStarted', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Date Completed</label>
                  <input
                    type="date"
                    value={formData.dateCompleted}
                    onChange={(e) => handleChange('dateCompleted', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Research Questions</h4>
              <div className="list-items">
                {formData.researchQuestions.map((q, i) => (
                  <div key={i} className="list-item">
                    <span>{q}</span>
                    <button type="button" onClick={() => removeQuestion(i)}>&times;</button>
                  </div>
                ))}
              </div>
              <div className="add-list-item">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Add a research question..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQuestion())}
                />
                <button type="button" onClick={addQuestion}>
                  <AddIcon fontSize="small" />
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              {study?.id ? 'Save Changes' : 'Create Study'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ OBSERVATION FORM MODAL ============

function ObservationFormModal({ observation, studies, onSave, onClose }) {
  const [formData, setFormData] = useState({
    text: observation?.text || '',
    source: observation?.source || '',
    evidenceType: observation?.evidenceType || 'quote',
    studyId: observation?.studyId || '',
    tags: observation?.tags || [],
    participant: observation?.participant || '',
  });

  const [newTag, setNewTag] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...observation, ...formData });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="research-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{observation?.id ? 'Edit Observation' : 'Add Observation'}</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-form">
            <div className="form-section">
              <div className="form-group">
                <label>Observation / Quote *</label>
                <textarea
                  value={formData.text}
                  onChange={(e) => handleChange('text', e.target.value)}
                  placeholder="What was observed, said, or measured?"
                  rows={3}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Evidence Type</label>
                  <select
                    value={formData.evidenceType}
                    onChange={(e) => handleChange('evidenceType', e.target.value)}
                  >
                    {Object.entries(EVIDENCE_TYPES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Study</label>
                  <select
                    value={formData.studyId}
                    onChange={(e) => handleChange('studyId', e.target.value)}
                  >
                    <option value="">Select study...</option>
                    {studies.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Participant / Source</label>
                  <input
                    type="text"
                    value={formData.participant}
                    onChange={(e) => handleChange('participant', e.target.value)}
                    placeholder="e.g., P01, Analytics Dashboard"
                  />
                </div>
                <div className="form-group">
                  <label>Source Context</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => handleChange('source', e.target.value)}
                    placeholder="e.g., Interview Q3, Session replay"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Theme Tags</label>
                <div className="rb-tag-list">
                  {formData.tags.map((tag, i) => (
                    <span
                      key={tag}
                      className="rb-tag"
                      style={{ backgroundColor: THEME_COLORS[i % THEME_COLORS.length] + '20', color: THEME_COLORS[i % THEME_COLORS.length] }}
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>&times;</button>
                    </span>
                  ))}
                </div>
                <div className="add-list-item">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add theme tag..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button type="button" onClick={addTag}>
                    <AddIcon fontSize="small" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              {observation?.id ? 'Save Changes' : 'Add Observation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ INSIGHT FORM MODAL ============

function InsightFormModal({ insight, observations, personas, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: insight?.title || '',
    description: insight?.description || '',
    confidence: insight?.confidence || 'Medium',
    impact: insight?.impact || 'Medium',
    linkedObservationIds: insight?.linkedObservationIds || [],
    linkedPersonaIds: insight?.linkedPersonaIds || [],
    recommendations: insight?.recommendations || [],
  });

  const [newRec, setNewRec] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleObservation = (id) => {
    setFormData(prev => ({
      ...prev,
      linkedObservationIds: prev.linkedObservationIds.includes(id)
        ? prev.linkedObservationIds.filter(x => x !== id)
        : [...prev.linkedObservationIds, id]
    }));
  };

  const togglePersona = (id) => {
    setFormData(prev => ({
      ...prev,
      linkedPersonaIds: prev.linkedPersonaIds.includes(id)
        ? prev.linkedPersonaIds.filter(x => x !== id)
        : [...prev.linkedPersonaIds, id]
    }));
  };

  const addRecommendation = () => {
    if (newRec.trim()) {
      setFormData(prev => ({
        ...prev,
        recommendations: [...prev.recommendations, newRec.trim()]
      }));
      setNewRec('');
    }
  };

  const removeRecommendation = (index) => {
    setFormData(prev => ({
      ...prev,
      recommendations: prev.recommendations.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...insight, ...formData });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="research-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{insight?.id ? 'Edit Insight' : 'Synthesize Insight'}</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-form">
            <div className="form-section">
              <h4>Insight Details</h4>

              <div className="form-group">
                <label>Insight Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Users struggle with onboarding navigation"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Detailed insight explanation..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Confidence</label>
                  <select
                    value={formData.confidence}
                    onChange={(e) => handleChange('confidence', e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Impact</label>
                  <select
                    value={formData.impact}
                    onChange={(e) => handleChange('impact', e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Supporting Evidence ({formData.linkedObservationIds.length} observations)</h4>
              <div className="rb-checklist">
                {observations.slice(0, 15).map(obs => (
                  <label key={obs.id} className="rb-check-item">
                    <input
                      type="checkbox"
                      checked={formData.linkedObservationIds.includes(obs.id)}
                      onChange={() => toggleObservation(obs.id)}
                    />
                    <span className="rb-check-text">
                      {obs.text?.substring(0, 80)}{obs.text?.length > 80 ? '...' : ''}
                    </span>
                  </label>
                ))}
                {observations.length === 0 && (
                  <p className="form-hint">No observations available. Add observations first.</p>
                )}
              </div>
            </div>

            {personas.length > 0 && (
              <div className="form-section">
                <h4>Linked Personas</h4>
                <div className="rb-checklist">
                  {personas.map(p => (
                    <label key={p.id} className="rb-check-item">
                      <input
                        type="checkbox"
                        checked={formData.linkedPersonaIds.includes(p.id)}
                        onChange={() => togglePersona(p.id)}
                      />
                      <span className="rb-check-text">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="form-section">
              <h4>Recommendations</h4>
              <div className="list-items">
                {formData.recommendations.map((rec, i) => (
                  <div key={i} className="list-item">
                    <span>{rec}</span>
                    <button type="button" onClick={() => removeRecommendation(i)}>&times;</button>
                  </div>
                ))}
              </div>
              <div className="add-list-item">
                <input
                  type="text"
                  value={newRec}
                  onChange={(e) => setNewRec(e.target.value)}
                  placeholder="Add a recommendation..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRecommendation())}
                />
                <button type="button" onClick={addRecommendation}>
                  <AddIcon fontSize="small" />
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              {insight?.id ? 'Save Changes' : 'Create Insight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ OBSERVATION CARD ============

function ObservationCard({ observation, allThemes, onEdit, onDelete, onDragStart }) {
  const EvidenceIcon = EVIDENCE_TYPES[observation.evidenceType]?.icon || VisibilityIcon;
  const evidenceColor = EVIDENCE_TYPES[observation.evidenceType]?.color || '#64748b';

  return (
    <div
      className="rb-observation-card"
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, observation)}
    >
      <div className="rb-obs-header">
        <span className="rb-obs-evidence" style={{ color: evidenceColor }}>
          <EvidenceIcon style={{ fontSize: 14 }} />
          {EVIDENCE_TYPES[observation.evidenceType]?.label || 'Observation'}
        </span>
        <div className="rb-obs-actions">
          <button onClick={() => onEdit(observation)} title="Edit">
            <EditIcon style={{ fontSize: 14 }} />
          </button>
          <button onClick={() => onDelete(observation)} title="Delete">
            <DeleteIcon style={{ fontSize: 14 }} />
          </button>
        </div>
      </div>

      <p className="rb-obs-text">
        {observation.evidenceType === 'quote' && <>&ldquo;</>}
        {observation.text}
        {observation.evidenceType === 'quote' && <>&rdquo;</>}
      </p>

      {observation.participant && (
        <div className="rb-obs-source">
          <PersonIcon style={{ fontSize: 12 }} />
          <span>{observation.participant}</span>
          {observation.source && <span className="rb-obs-context">({observation.source})</span>}
        </div>
      )}

      {observation.tags?.length > 0 && (
        <div className="rb-obs-tags">
          {observation.tags.map((tag, i) => {
            const themeIdx = allThemes.indexOf(tag);
            const color = THEME_COLORS[(themeIdx >= 0 ? themeIdx : i) % THEME_COLORS.length];
            return (
              <span
                key={tag}
                className="rb-obs-tag"
                style={{ backgroundColor: color + '20', color: color }}
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ INSIGHT CARD ============

function InsightCard({ insight, observationCount, onEdit, onDelete }) {
  const confColor = CONFIDENCE_LEVELS[insight.confidence]?.color || '#9C9A94';

  return (
    <div className="rb-insight-card">
      <div className="rb-insight-header">
        <LightbulbIcon style={{ fontSize: 16, color: '#C9A227' }} />
        <div className="rb-insight-actions">
          <button onClick={() => onEdit(insight)} title="Edit">
            <EditIcon style={{ fontSize: 14 }} />
          </button>
          <button onClick={() => onDelete(insight)} title="Delete">
            <DeleteIcon style={{ fontSize: 14 }} />
          </button>
        </div>
      </div>

      <h4 className="rb-insight-title">{insight.title || insight.name}</h4>

      {insight.description && (
        <p className="rb-insight-desc">{insight.description}</p>
      )}

      <div className="rb-insight-meta">
        <span className="rb-insight-evidence">
          <VisibilityIcon style={{ fontSize: 12 }} />
          {observationCount} evidence
        </span>
        <span className="rb-insight-confidence" style={{ color: confColor }}>
          {insight.confidence} confidence
        </span>
        {insight.impact && (
          <span className="rb-insight-impact">
            <TrendingUpIcon style={{ fontSize: 12 }} />
            {insight.impact} impact
          </span>
        )}
      </div>

      {insight.recommendations?.length > 0 && (
        <div className="rb-insight-recs">
          {insight.recommendations.slice(0, 2).map((rec, i) => (
            <div key={i} className="rb-insight-rec">
              <span className="rb-rec-bullet">&#8594;</span>
              {rec}
            </div>
          ))}
          {insight.recommendations.length > 2 && (
            <span className="rb-insight-more">+{insight.recommendations.length - 2} more</span>
          )}
        </div>
      )}
    </div>
  );
}

// ============ STUDY LIST ITEM ============

function StudyItem({ study, isSelected, observationCount, onSelect, onEdit, onDelete }) {
  const typeInfo = STUDY_TYPES[study.studyType] || STUDY_TYPES.interview;

  return (
    <div
      className={`rb-study-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(study)}
    >
      <div className="rb-study-color" style={{ backgroundColor: typeInfo.color }} />
      <div className="rb-study-info">
        <div className="rb-study-name">{study.name}</div>
        <div className="rb-study-meta">
          <span className="rb-study-type">{typeInfo.label}</span>
          <span className="rb-study-sep">&middot;</span>
          <span>{study.participantCount || 0} participants</span>
          <span className="rb-study-sep">&middot;</span>
          <span>{observationCount} obs.</span>
        </div>
      </div>
      <div className="rb-study-actions">
        <button onClick={(e) => { e.stopPropagation(); onEdit(study); }} title="Edit">
          <EditIcon style={{ fontSize: 14 }} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(study); }} title="Delete">
          <DeleteIcon style={{ fontSize: 14 }} />
        </button>
      </div>
    </div>
  );
}

// ============ MAIN RESEARCH BOARD ============

export default function ResearchBoard({ onSelect }) {
  const {
    getArtefactsByType,
    createArtefact,
    updateArtefact,
    deleteArtefact,
    artefacts,
    relationships,
  } = useAnalysis();

  // State
  const [selectedStudyId, setSelectedStudyId] = useState(null);
  const [filterTheme, setFilterTheme] = useState('all');
  const [filterEvidence, setFilterEvidence] = useState('all');
  const [filterParticipant, setFilterParticipant] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [editingStudy, setEditingStudy] = useState(null);
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [editingObservation, setEditingObservation] = useState(null);
  const [showInsightModal, setShowInsightModal] = useState(false);
  const [editingInsight, setEditingInsight] = useState(null);

  // Get all research findings (observations + insights stored as RF artefacts)
  const allFindings = useMemo(() => getArtefactsByType('ResearchFinding'), [getArtefactsByType]);

  // Separate studies, observations, and insights based on metadata
  const studies = useMemo(() =>
    allFindings.filter(f => f.findingType === 'study'),
    [allFindings]
  );

  const observations = useMemo(() =>
    allFindings.filter(f => f.findingType === 'observation'),
    [allFindings]
  );

  const insights = useMemo(() =>
    allFindings.filter(f => f.findingType === 'insight'),
    [allFindings]
  );

  const personas = useMemo(() => getArtefactsByType('Persona'), [getArtefactsByType]);

  // All unique themes from observations
  const allThemes = useMemo(() => {
    const themeSet = new Set();
    observations.forEach(obs => {
      obs.tags?.forEach(tag => themeSet.add(tag));
    });
    return Array.from(themeSet).sort();
  }, [observations]);

  // All unique participants
  const allParticipants = useMemo(() => {
    const pSet = new Set();
    observations.forEach(obs => {
      if (obs.participant) pSet.add(obs.participant);
    });
    return Array.from(pSet).sort();
  }, [observations]);

  // Filter observations
  const filteredObservations = useMemo(() => {
    let result = observations;

    // Filter by study
    if (selectedStudyId) {
      result = result.filter(obs => obs.studyId === selectedStudyId);
    }

    // Filter by theme
    if (filterTheme !== 'all') {
      result = result.filter(obs => obs.tags?.includes(filterTheme));
    }

    // Filter by evidence type
    if (filterEvidence !== 'all') {
      result = result.filter(obs => obs.evidenceType === filterEvidence);
    }

    // Filter by participant
    if (filterParticipant !== 'all') {
      result = result.filter(obs => obs.participant === filterParticipant);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(obs =>
        obs.text?.toLowerCase().includes(query) ||
        obs.participant?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [observations, selectedStudyId, filterTheme, filterEvidence, filterParticipant, searchQuery]);

  // Count observations per study
  const observationsByStudy = useMemo(() => {
    const map = {};
    observations.forEach(obs => {
      if (obs.studyId) {
        map[obs.studyId] = (map[obs.studyId] || 0) + 1;
      }
    });
    return map;
  }, [observations]);

  // Stats
  const stats = useMemo(() => {
    const linkedArtefactIds = new Set();
    insights.forEach(ins => {
      ins.linkedPersonaIds?.forEach(id => linkedArtefactIds.add(id));
    });

    return {
      observations: observations.length,
      insights: insights.length,
      themes: allThemes.length,
      linkedArtefacts: linkedArtefactIds.size,
    };
  }, [observations, insights, allThemes]);

  // ---- Handlers ----

  const handleCreateStudy = () => {
    setEditingStudy(null);
    setShowStudyModal(true);
  };

  const handleEditStudy = (study) => {
    setEditingStudy(study);
    setShowStudyModal(true);
  };

  const handleSaveStudy = async (data) => {
    const payload = { ...data, findingType: 'study' };
    if (data.id) {
      await updateArtefact(data.id, payload);
    } else {
      await createArtefact('ResearchFinding', payload);
    }
    setShowStudyModal(false);
    setEditingStudy(null);
  };

  const handleDeleteStudy = async (study) => {
    if (confirm(`Delete study "${study.name}"?`)) {
      await deleteArtefact(study.id);
      if (selectedStudyId === study.id) setSelectedStudyId(null);
    }
  };

  const handleCreateObservation = () => {
    setEditingObservation(selectedStudyId ? { studyId: selectedStudyId } : null);
    setShowObservationModal(true);
  };

  const handleEditObservation = (obs) => {
    setEditingObservation(obs);
    setShowObservationModal(true);
  };

  const handleSaveObservation = async (data) => {
    const payload = {
      ...data,
      findingType: 'observation',
      name: data.text?.substring(0, 60) || 'Observation',
    };
    if (data.id) {
      await updateArtefact(data.id, payload);
    } else {
      await createArtefact('ResearchFinding', payload);
    }
    setShowObservationModal(false);
    setEditingObservation(null);
  };

  const handleDeleteObservation = async (obs) => {
    if (confirm('Delete this observation?')) {
      await deleteArtefact(obs.id);
    }
  };

  const handleCreateInsight = () => {
    setEditingInsight(null);
    setShowInsightModal(true);
  };

  const handleEditInsight = (insight) => {
    setEditingInsight(insight);
    setShowInsightModal(true);
  };

  const handleSaveInsight = async (data) => {
    const payload = {
      ...data,
      findingType: 'insight',
      name: data.title || 'Insight',
    };
    if (data.id) {
      await updateArtefact(data.id, payload);
    } else {
      await createArtefact('ResearchFinding', payload);
    }
    setShowInsightModal(false);
    setEditingInsight(null);
  };

  const handleDeleteInsight = async (insight) => {
    if (confirm(`Delete insight "${insight.title || insight.name}"?`)) {
      await deleteArtefact(insight.id);
    }
  };

  const handleObservationDragStart = (e, obs) => {
    e.dataTransfer.setData('text/plain', obs.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Render empty state
  if (allFindings.length === 0 && studies.length === 0) {
    return (
      <div className="research-board">
        <div className="gallery-empty">
          <ScienceIcon style={{ fontSize: 64, opacity: 0.3 }} />
          <h3>Start a Research Study</h3>
          <p>Create a research study to capture observations and derive insights.</p>
          <button className="btn-primary" onClick={handleCreateStudy}>
            <AddIcon fontSize="small" />
            Create Research Study
          </button>
        </div>

        {showStudyModal && (
          <StudyFormModal
            study={editingStudy}
            onSave={handleSaveStudy}
            onClose={() => setShowStudyModal(false)}
          />
        )}

        <style jsx>{`
          .research-board {
            height: 100%;
            display: flex;
            flex-direction: column;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="research-board">
      {/* Stats Bar */}
      <div className="rb-stats-bar">
        <div className="rb-stat">
          <VisibilityIcon style={{ fontSize: 14 }} />
          <span className="rb-stat-value">{stats.observations}</span>
          <span className="rb-stat-label">observations</span>
        </div>
        <div className="rb-stat">
          <LightbulbIcon style={{ fontSize: 14 }} />
          <span className="rb-stat-value">{stats.insights}</span>
          <span className="rb-stat-label">insights</span>
        </div>
        <div className="rb-stat">
          <LabelIcon style={{ fontSize: 14 }} />
          <span className="rb-stat-value">{stats.themes}</span>
          <span className="rb-stat-label">themes</span>
        </div>
        <div className="rb-stat">
          <LinkIcon style={{ fontSize: 14 }} />
          <span className="rb-stat-value">{stats.linkedArtefacts}</span>
          <span className="rb-stat-label">linked</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rb-filter-bar">
        <div className="toolbar-search">
          <input
            type="text"
            placeholder="Search observations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="toolbar-filters">
          <FilterListIcon fontSize="small" style={{ color: '#9C9A94' }} />
          <select value={filterTheme} onChange={(e) => setFilterTheme(e.target.value)}>
            <option value="all">All Themes</option>
            {allThemes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterEvidence} onChange={(e) => setFilterEvidence(e.target.value)}>
            <option value="all">All Evidence</option>
            {Object.entries(EVIDENCE_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select value={filterParticipant} onChange={(e) => setFilterParticipant(e.target.value)}>
            <option value="all">All Participants</option>
            {allParticipants.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Three-panel layout */}
      <div className="rb-panels">
        {/* Left: Studies */}
        <div className="rb-panel rb-studies-panel">
          <div className="rb-panel-header">
            <h4>Studies</h4>
            <button className="btn-primary btn-small" onClick={handleCreateStudy}>
              <AddIcon style={{ fontSize: 14 }} />
              New
            </button>
          </div>

          <div className="rb-panel-content">
            <div
              className={`rb-study-item ${selectedStudyId === null ? 'selected' : ''}`}
              onClick={() => setSelectedStudyId(null)}
            >
              <div className="rb-study-color" style={{ backgroundColor: '#9C9A94' }} />
              <div className="rb-study-info">
                <div className="rb-study-name">All Studies</div>
                <div className="rb-study-meta">
                  <span>{observations.length} total observations</span>
                </div>
              </div>
            </div>

            {studies.map(study => (
              <StudyItem
                key={study.id}
                study={study}
                isSelected={selectedStudyId === study.id}
                observationCount={observationsByStudy[study.id] || 0}
                onSelect={(s) => setSelectedStudyId(s.id)}
                onEdit={handleEditStudy}
                onDelete={handleDeleteStudy}
              />
            ))}
          </div>
        </div>

        {/* Middle: Observations */}
        <div className="rb-panel rb-observations-panel">
          <div className="rb-panel-header">
            <h4>Observations ({filteredObservations.length})</h4>
            <button className="btn-primary btn-small" onClick={handleCreateObservation}>
              <AddIcon style={{ fontSize: 14 }} />
              Add
            </button>
          </div>

          <div className="rb-panel-content">
            {filteredObservations.length === 0 ? (
              <div className="rb-panel-empty">
                <VisibilityIcon style={{ fontSize: 32, opacity: 0.3 }} />
                <p>No observations yet. Capture what you see, hear, and measure.</p>
                <button className="btn-secondary btn-small" onClick={handleCreateObservation}>
                  Add Observation
                </button>
              </div>
            ) : (
              <div className="rb-observations-grid">
                {filteredObservations.map(obs => (
                  <ObservationCard
                    key={obs.id}
                    observation={obs}
                    allThemes={allThemes}
                    onEdit={handleEditObservation}
                    onDelete={handleDeleteObservation}
                    onDragStart={handleObservationDragStart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Insights */}
        <div className="rb-panel rb-insights-panel">
          <div className="rb-panel-header">
            <h4>Insights ({insights.length})</h4>
            <button className="btn-primary btn-small" onClick={handleCreateInsight}>
              <AddIcon style={{ fontSize: 14 }} />
              New
            </button>
          </div>

          <div className="rb-panel-content">
            {insights.length === 0 ? (
              <div className="rb-panel-empty">
                <LightbulbIcon style={{ fontSize: 32, opacity: 0.3 }} />
                <p>Synthesize observations into actionable insights.</p>
                <button className="btn-secondary btn-small" onClick={handleCreateInsight}>
                  Create Insight
                </button>
              </div>
            ) : (
              insights.map(ins => (
                <InsightCard
                  key={ins.id}
                  insight={ins}
                  observationCount={ins.linkedObservationIds?.length || 0}
                  onEdit={handleEditInsight}
                  onDelete={handleDeleteInsight}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showStudyModal && (
        <StudyFormModal
          study={editingStudy}
          onSave={handleSaveStudy}
          onClose={() => { setShowStudyModal(false); setEditingStudy(null); }}
        />
      )}

      {showObservationModal && (
        <ObservationFormModal
          observation={editingObservation}
          studies={studies}
          onSave={handleSaveObservation}
          onClose={() => { setShowObservationModal(false); setEditingObservation(null); }}
        />
      )}

      {showInsightModal && (
        <InsightFormModal
          insight={editingInsight}
          observations={observations}
          personas={personas}
          onSave={handleSaveInsight}
          onClose={() => { setShowInsightModal(false); setEditingInsight(null); }}
        />
      )}

      <style jsx>{`
        .research-board {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-alt, #FDFCFA);
        }

        /* Stats Bar */
        .rb-stats-bar {
          display: flex;
          gap: 24px;
          padding: 10px 20px;
          border-bottom: 1px solid var(--border, #E2E0DB);
          background: var(--panel, #F0EFEC);
        }
        .rb-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--text-muted, #5C5A54);
        }
        .rb-stat-value {
          font-weight: 600;
          color: var(--text, #1F1E1B);
        }

        /* Filter Bar */
        .rb-filter-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 8px 20px;
          border-bottom: 1px solid var(--border, #E2E0DB);
          background: var(--panel, #F0EFEC);
        }
        .rb-filter-bar .toolbar-search {
          flex: 1;
          max-width: 240px;
        }
        .rb-filter-bar .toolbar-search input {
          width: 100%;
          padding: 6px 10px;
          border: 1px solid var(--border, #E2E0DB);
          border-radius: 4px;
          font-size: 0.8125rem;
          background: var(--bg-alt, #FDFCFA);
          color: var(--text, #1F1E1B);
        }
        .rb-filter-bar .toolbar-filters {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rb-filter-bar .toolbar-filters select {
          padding: 6px 8px;
          border: 1px solid var(--border, #E2E0DB);
          border-radius: 4px;
          font-size: 0.75rem;
          background: var(--bg-alt, #FDFCFA);
          color: var(--text, #1F1E1B);
        }

        /* Three-panel layout */
        .rb-panels {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .rb-panel {
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border, #E2E0DB);
          overflow: hidden;
        }
        .rb-panel:last-child {
          border-right: none;
        }
        .rb-studies-panel {
          width: 240px;
          min-width: 200px;
          flex-shrink: 0;
        }
        .rb-observations-panel {
          flex: 1;
          min-width: 300px;
        }
        .rb-insights-panel {
          width: 280px;
          min-width: 240px;
          flex-shrink: 0;
        }

        /* Panel Header */
        .rb-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border, #E2E0DB);
          background: var(--panel, #F0EFEC);
        }
        .rb-panel-header h4 {
          font-size: 0.8125rem;
          font-weight: 600;
          margin: 0;
          color: var(--text, #1F1E1B);
        }
        .rb-panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }
        .rb-panel-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 32px 16px;
          gap: 8px;
        }
        .rb-panel-empty p {
          font-size: 0.75rem;
          color: var(--text-muted, #5C5A54);
          margin: 0;
        }

        /* Study Items */
        .rb-study-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 2px;
          transition: background 0.1s ease;
        }
        .rb-study-item:hover {
          background: var(--bg-hover, #F5F4F2);
        }
        .rb-study-item.selected {
          background: var(--accent-soft, rgba(71, 69, 63, 0.12));
        }
        .rb-study-color {
          width: 4px;
          height: 32px;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .rb-study-info {
          flex: 1;
          min-width: 0;
        }
        .rb-study-name {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text, #1F1E1B);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rb-study-meta {
          font-size: 0.6875rem;
          color: var(--text-muted, #5C5A54);
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
        }
        .rb-study-sep {
          opacity: 0.5;
        }
        .rb-study-actions {
          display: flex;
          gap: 2px;
          opacity: 0;
          transition: opacity 0.1s ease;
        }
        .rb-study-item:hover .rb-study-actions {
          opacity: 1;
        }
        .rb-study-actions button {
          padding: 4px;
          border: none;
          background: none;
          cursor: pointer;
          color: var(--text-muted, #5C5A54);
          border-radius: 4px;
        }
        .rb-study-actions button:hover {
          background: var(--border, #E2E0DB);
        }

        /* Observation Cards */
        .rb-observations-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .rb-observation-card {
          padding: 10px 12px;
          background: var(--bg-alt, #FDFCFA);
          border: 1px solid var(--border, #E2E0DB);
          border-radius: 4px;
          cursor: grab;
          transition: box-shadow 0.1s ease, transform 0.1s ease;
        }
        .rb-observation-card:hover {
          box-shadow: var(--shadow-sm, 0 1px 2px rgba(31, 30, 27, 0.04));
          transform: translateY(-1px);
        }
        .rb-observation-card:active {
          cursor: grabbing;
        }
        .rb-obs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .rb-obs-evidence {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.6875rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .rb-obs-actions {
          display: flex;
          gap: 2px;
          opacity: 0;
          transition: opacity 0.1s ease;
        }
        .rb-observation-card:hover .rb-obs-actions {
          opacity: 1;
        }
        .rb-obs-actions button {
          padding: 3px;
          border: none;
          background: none;
          cursor: pointer;
          color: var(--text-muted, #5C5A54);
          border-radius: 4px;
        }
        .rb-obs-actions button:hover {
          background: var(--border, #E2E0DB);
        }
        .rb-obs-text {
          font-size: 0.8125rem;
          line-height: 1.4;
          color: var(--text, #1F1E1B);
          margin: 0 0 6px;
        }
        .rb-obs-source {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.6875rem;
          color: var(--text-muted, #5C5A54);
          margin-bottom: 6px;
        }
        .rb-obs-context {
          opacity: 0.7;
        }
        .rb-obs-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .rb-obs-tag {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.625rem;
          font-weight: 500;
        }

        /* Tag list in forms */
        .rb-tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 8px;
        }
        .rb-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        .rb-tag button {
          border: none;
          background: none;
          cursor: pointer;
          padding: 0;
          font-size: 0.875rem;
          line-height: 1;
          opacity: 0.7;
          color: inherit;
        }
        .rb-tag button:hover {
          opacity: 1;
        }

        /* Checklist in insight form */
        .rb-checklist {
          max-height: 160px;
          overflow-y: auto;
          border: 1px solid var(--border, #E2E0DB);
          border-radius: 4px;
          padding: 4px;
        }
        .rb-check-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 6px 8px;
          cursor: pointer;
          border-radius: 4px;
          font-size: 0.8125rem;
        }
        .rb-check-item:hover {
          background: var(--bg-hover, #F5F4F2);
        }
        .rb-check-item input[type="checkbox"] {
          margin-top: 2px;
          flex-shrink: 0;
        }
        .rb-check-text {
          flex: 1;
          font-size: 0.75rem;
          color: var(--text, #1F1E1B);
          line-height: 1.3;
        }

        /* Insight Cards */
        .rb-insight-card {
          padding: 10px 12px;
          background: var(--bg-alt, #FDFCFA);
          border: 1px solid var(--border, #E2E0DB);
          border-radius: 4px;
          margin-bottom: 8px;
          transition: box-shadow 0.1s ease;
        }
        .rb-insight-card:hover {
          box-shadow: var(--shadow-sm, 0 1px 2px rgba(31, 30, 27, 0.04));
        }
        .rb-insight-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .rb-insight-actions {
          display: flex;
          gap: 2px;
          opacity: 0;
          transition: opacity 0.1s ease;
        }
        .rb-insight-card:hover .rb-insight-actions {
          opacity: 1;
        }
        .rb-insight-actions button {
          padding: 3px;
          border: none;
          background: none;
          cursor: pointer;
          color: var(--text-muted, #5C5A54);
          border-radius: 4px;
        }
        .rb-insight-actions button:hover {
          background: var(--border, #E2E0DB);
        }
        .rb-insight-title {
          font-size: 0.8125rem;
          font-weight: 600;
          margin: 0 0 4px;
          color: var(--text, #1F1E1B);
        }
        .rb-insight-desc {
          font-size: 0.75rem;
          color: var(--text-muted, #5C5A54);
          margin: 0 0 8px;
          line-height: 1.3;
        }
        .rb-insight-meta {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }
        .rb-insight-evidence,
        .rb-insight-confidence,
        .rb-insight-impact {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 0.6875rem;
          font-weight: 500;
        }
        .rb-insight-evidence {
          color: var(--text-muted, #5C5A54);
        }
        .rb-insight-impact {
          color: var(--text-muted, #5C5A54);
        }
        .rb-insight-recs {
          border-top: 1px solid var(--border, #E2E0DB);
          padding-top: 6px;
          margin-top: 4px;
        }
        .rb-insight-rec {
          font-size: 0.6875rem;
          color: var(--text-muted, #5C5A54);
          padding: 2px 0;
          display: flex;
          gap: 4px;
        }
        .rb-rec-bullet {
          color: var(--success, #5B8A6A);
          flex-shrink: 0;
        }
        .rb-insight-more {
          font-size: 0.625rem;
          color: var(--text-faint, #9C9A94);
        }

        /* Modal overrides */
        .research-form-modal {
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          background: var(--panel, #F0EFEC);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .research-form-modal .modal-form {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }
      `}</style>
    </div>
  );
}

export { StudyFormModal, ObservationFormModal, InsightFormModal, ObservationCard, InsightCard, STUDY_TYPES, EVIDENCE_TYPES, CONFIDENCE_LEVELS };
