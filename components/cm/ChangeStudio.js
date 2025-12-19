// components/cm/ChangeStudio.js
// Main Change Studio workspace component

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  useChange,
  CHANGE_TYPES,
  IMPACT_LEVELS,
  IMPACT_CATEGORIES,
  READINESS_LEVELS,
  ASSESSMENT_STATUS,
  RISK_STATUS,
  PCT_GROUPS,
  PCT_QUESTIONS,
  getPCTScoreColor,
} from './ChangeContext';
import { useProjects } from '../ProjectContext';
import { useAuth } from '../AuthContext';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import CategoryIcon from '@mui/icons-material/Category';
import CropFreeIcon from '@mui/icons-material/CropFree';
import GroupsIcon from '@mui/icons-material/Groups';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';

// ============ NAVIGATION STRUCTURE ============

const NAV_GROUPS = [
  {
    id: 'context',
    name: 'Context & Scope',
    color: '#3b82f6',
    views: [
      { id: 'definition', name: 'Change Definition', icon: <DescriptionIcon fontSize="small" /> },
      { id: 'type', name: 'Change Type & Characteristics', icon: <CategoryIcon fontSize="small" /> },
      { id: 'scope', name: 'Scope & Boundaries', icon: <CropFreeIcon fontSize="small" /> },
    ],
  },
  {
    id: 'stakeholders',
    name: 'Stakeholders & Impact',
    color: '#8b5cf6',
    views: [
      { id: 'stakeholder-groups', name: 'Stakeholder Groups', icon: <GroupsIcon fontSize="small" /> },
      { id: 'impact-assessment', name: 'Impact Assessment', icon: <AssessmentIcon fontSize="small" /> },
      { id: 'impact-heatmap', name: 'Impact Heatmap', icon: <BarChartIcon fontSize="small" /> },
    ],
  },
  {
    id: 'assessments',
    name: 'Readiness & Assessments',
    color: '#f59e0b',
    views: [
      { id: 'assessment-dashboard', name: 'Assessment Dashboard', icon: <DashboardIcon fontSize="small" /> },
      { id: 'pct-assessment', name: 'PCT Assessment', icon: <TrendingUpIcon fontSize="small" /> },
      { id: 'readiness-scorecard', name: 'Readiness Scorecard', icon: <AssessmentIcon fontSize="small" /> },
    ],
  },
  {
    id: 'risks',
    name: 'Risk & Resistance',
    color: '#dc2626',
    views: [
      { id: 'change-risks', name: 'Change Risks', icon: <WarningIcon fontSize="small" /> },
      { id: 'resistance-map', name: 'Resistance Map', icon: <ErrorIcon fontSize="small" /> },
    ],
  },
];

// ============ OVERVIEW DASHBOARD ============

function OverviewDashboard({ onNavigate }) {
  const {
    changeContext,
    stakeholderGroups,
    assessments,
    risks,
    complexityLevel,
    overallReadiness,
    coverageGaps,
    stakeholdersAtRisk,
    openAssessments,
    unaddressedRisks,
  } = useChange();

  // Summary cards data
  const summaryCards = [
    {
      id: 'open-assessments',
      label: 'Open Assessments',
      value: openAssessments.length,
      color: openAssessments.length > 0 ? '#f59e0b' : '#22c55e',
      onClick: () => onNavigate('assessment-dashboard'),
    },
    {
      id: 'pct-score',
      label: 'PCT Score',
      value: overallReadiness ? `${overallReadiness.percentage}%` : 'N/A',
      color: overallReadiness
        ? overallReadiness.percentage < 40 ? '#dc2626'
          : overallReadiness.percentage < 70 ? '#f59e0b'
          : '#22c55e'
        : '#9ca3af',
      onClick: () => onNavigate('pct-assessment'),
    },
    {
      id: 'stakeholders-at-risk',
      label: 'Stakeholders at Risk',
      value: stakeholdersAtRisk.length,
      color: stakeholdersAtRisk.length > 0 ? '#dc2626' : '#22c55e',
      onClick: () => onNavigate('stakeholder-groups'),
    },
    {
      id: 'complexity',
      label: 'Complexity',
      value: complexityLevel.level,
      color: complexityLevel.color,
      onClick: () => onNavigate('type'),
    },
    {
      id: 'unaddressed-risks',
      label: 'Unaddressed Risks',
      value: unaddressedRisks.length,
      color: unaddressedRisks.length > 0 ? '#dc2626' : unaddressedRisks.length > 2 ? '#f59e0b' : '#22c55e',
      onClick: () => onNavigate('change-risks'),
    },
    {
      id: 'coverage-gaps',
      label: 'Coverage Gaps',
      value: coverageGaps.length,
      color: coverageGaps.length > 0 ? '#f59e0b' : '#22c55e',
      onClick: null,
    },
  ];

  return (
    <div className="cm-overview">
      {/* Header */}
      <div className="cm-overview-header">
        <h1>Change Studio Overview</h1>
        {changeContext ? (
          <p className="subtitle">{changeContext.title}</p>
        ) : (
          <p className="subtitle">No change context defined yet</p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="cm-summary-cards">
        {summaryCards.map(card => (
          <button
            key={card.id}
            className="cm-summary-card"
            onClick={card.onClick}
            disabled={!card.onClick}
            style={{ '--card-color': card.color }}
          >
            <span className="card-value">{card.value}</span>
            <span className="card-label">{card.label}</span>
          </button>
        ))}
      </div>

      {/* Main Panels Grid */}
      <div className="cm-panels-grid">
        {/* Active Assessments Panel */}
        <div className="cm-panel">
          <div className="panel-header">
            <h3>Active Assessments</h3>
            <button className="panel-action" onClick={() => onNavigate('assessment-dashboard')}>
              <AddIcon fontSize="small" /> New
            </button>
          </div>
          <div className="panel-content">
            {openAssessments.length === 0 ? (
              <p className="empty-text">No active assessments</p>
            ) : (
              <div className="assessment-list">
                {openAssessments.slice(0, 5).map(assessment => (
                  <button
                    key={assessment.id}
                    className="assessment-item"
                    onClick={() => onNavigate('pct-assessment', assessment.id)}
                  >
                    <span className="assessment-name">{assessment.name}</span>
                    <span className="assessment-type">{assessment.templateType}</span>
                    <span
                      className="assessment-status"
                      style={{ backgroundColor: ASSESSMENT_STATUS[assessment.status]?.color }}
                    >
                      {ASSESSMENT_STATUS[assessment.status]?.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stakeholders Requiring Attention */}
        <div className="cm-panel">
          <div className="panel-header">
            <h3>Stakeholders Requiring Attention</h3>
            <button className="panel-action" onClick={() => onNavigate('stakeholder-groups')}>
              View All
            </button>
          </div>
          <div className="panel-content">
            {stakeholdersAtRisk.length === 0 ? (
              <p className="empty-text">No stakeholders at risk</p>
            ) : (
              <div className="stakeholder-list">
                {stakeholdersAtRisk.slice(0, 5).map(group => (
                  <button
                    key={group.id}
                    className="stakeholder-item"
                    onClick={() => onNavigate('stakeholder-groups', group.id)}
                  >
                    <span className="stakeholder-name">{group.name}</span>
                    <span
                      className="impact-badge"
                      style={{ backgroundColor: IMPACT_LEVELS[group.impactLevel]?.color }}
                    >
                      {group.impactLevel}
                    </span>
                    <span
                      className="readiness-badge"
                      style={{ backgroundColor: READINESS_LEVELS[group.readinessLevel]?.color }}
                    >
                      {group.readinessLevel}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Change Coverage Gaps */}
        <div className="cm-panel">
          <div className="panel-header">
            <h3>Change Coverage Gaps</h3>
          </div>
          <div className="panel-content">
            {coverageGaps.length === 0 ? (
              <div className="all-complete">
                <CheckCircleIcon style={{ color: '#22c55e', fontSize: 32 }} />
                <p>All areas covered!</p>
              </div>
            ) : (
              <div className="coverage-checklist">
                {[
                  { id: 'definition', label: 'Change Definition documented', section: 'definition' },
                  { id: 'stakeholders', label: 'Stakeholder groups identified (min 3)', section: 'stakeholder-groups' },
                  { id: 'impact', label: 'Impact assessment completed', section: 'impact-assessment' },
                  { id: 'pct', label: 'PCT Assessment completed', section: 'pct-assessment' },
                  { id: 'sponsorship', label: 'Sponsorship model defined', section: 'definition' },
                ].map(item => {
                  const isComplete = !coverageGaps.find(g => g.id === item.id);
                  return (
                    <button
                      key={item.id}
                      className={`coverage-item ${isComplete ? 'complete' : 'incomplete'}`}
                      onClick={() => onNavigate(item.section)}
                    >
                      {isComplete ? (
                        <CheckCircleIcon fontSize="small" style={{ color: '#22c55e' }} />
                      ) : (
                        <ErrorIcon fontSize="small" style={{ color: '#f59e0b' }} />
                      )}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="cm-panel">
          <div className="panel-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="panel-content">
            <div className="quick-actions">
              {!changeContext && (
                <button className="quick-action-btn primary" onClick={() => onNavigate('definition')}>
                  <PlayArrowIcon fontSize="small" />
                  <span>Start Change Definition</span>
                </button>
              )}
              {changeContext && (
                <>
                  <button className="quick-action-btn" onClick={() => onNavigate('pct-assessment')}>
                    <AddIcon fontSize="small" />
                    <span>New PCT Assessment</span>
                  </button>
                  <button className="quick-action-btn" onClick={() => onNavigate('stakeholder-groups')}>
                    <GroupsIcon fontSize="small" />
                    <span>Add Stakeholder Group</span>
                  </button>
                  <button className="quick-action-btn" onClick={() => onNavigate('change-risks')}>
                    <WarningIcon fontSize="small" />
                    <span>Log Change Risk</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ CHANGE DEFINITION SCREEN ============

function ChangeDefinitionScreen() {
  const { changeContext, createChangeContext, updateChangeContext, loading } = useChange();
  const [isEditing, setIsEditing] = useState(!changeContext);
  const [formData, setFormData] = useState({
    title: '',
    changeStatement: '',
    businessDriver: '',
    desiredFutureState: '',
    currentStateSummary: '',
    ownerId: '',
    sponsorId: '',
    startDate: '',
    targetDate: '',
  });

  useEffect(() => {
    if (changeContext) {
      setFormData({
        title: changeContext.title || '',
        changeStatement: changeContext.changeStatement || '',
        businessDriver: changeContext.businessDriver || '',
        desiredFutureState: changeContext.desiredFutureState || '',
        currentStateSummary: changeContext.currentStateSummary || '',
        ownerId: changeContext.ownerId || '',
        sponsorId: changeContext.sponsorId || '',
        startDate: changeContext.startDate || '',
        targetDate: changeContext.targetDate || '',
      });
      setIsEditing(false);
    }
  }, [changeContext]);

  const handleSave = async () => {
    if (changeContext) {
      await updateChangeContext(formData);
    } else {
      await createChangeContext(formData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (changeContext) {
      setFormData({
        title: changeContext.title || '',
        changeStatement: changeContext.changeStatement || '',
        businessDriver: changeContext.businessDriver || '',
        desiredFutureState: changeContext.desiredFutureState || '',
        currentStateSummary: changeContext.currentStateSummary || '',
        ownerId: changeContext.ownerId || '',
        sponsorId: changeContext.sponsorId || '',
        startDate: changeContext.startDate || '',
        targetDate: changeContext.targetDate || '',
      });
      setIsEditing(false);
    }
  };

  return (
    <div className="cm-screen">
      <div className="cm-screen-header">
        <div className="header-left">
          <h1>Change Definition</h1>
          <p className="subtitle">Capture the narrative description of what is changing</p>
        </div>
        <div className="header-actions">
          {isEditing ? (
            <>
              <button className="btn-secondary" onClick={handleCancel} disabled={!changeContext}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => setIsEditing(true)}>
              <EditIcon fontSize="small" /> Edit
            </button>
          )}
        </div>
      </div>

      <div className="cm-screen-body">
        <div className="cm-form-main">
          {/* Change Title */}
          <div className="form-field">
            <label className="field-label required">Change Title</label>
            {isEditing ? (
              <input
                type="text"
                className="field-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Short name for the change"
                maxLength={100}
              />
            ) : (
              <div className="field-value">{changeContext?.title || <span className="empty">Not defined</span>}</div>
            )}
          </div>

          {/* Change Statement */}
          <div className="form-field">
            <label className="field-label required">Change Statement</label>
            <p className="field-hint">What is changing for people? Focus on the human experience, not the technical deliverable.</p>
            {isEditing ? (
              <textarea
                className="field-textarea"
                value={formData.changeStatement}
                onChange={(e) => setFormData({ ...formData, changeStatement: e.target.value })}
                placeholder="Describe what is changing in human terms..."
                rows={4}
                maxLength={2000}
              />
            ) : (
              <div className="field-value rich-text">
                {changeContext?.changeStatement || <span className="empty">Not defined</span>}
              </div>
            )}
          </div>

          {/* Business Driver */}
          <div className="form-field">
            <label className="field-label required">Business Driver</label>
            <p className="field-hint">Why is this change happening?</p>
            {isEditing ? (
              <textarea
                className="field-textarea"
                value={formData.businessDriver}
                onChange={(e) => setFormData({ ...formData, businessDriver: e.target.value })}
                placeholder="Explain the business reasons driving this change..."
                rows={3}
                maxLength={1000}
              />
            ) : (
              <div className="field-value rich-text">
                {changeContext?.businessDriver || <span className="empty">Not defined</span>}
              </div>
            )}
          </div>

          {/* Desired Future State */}
          <div className="form-field">
            <label className="field-label required">Desired Future State</label>
            <p className="field-hint">What does success look like?</p>
            {isEditing ? (
              <textarea
                className="field-textarea"
                value={formData.desiredFutureState}
                onChange={(e) => setFormData({ ...formData, desiredFutureState: e.target.value })}
                placeholder="Describe the target state after the change..."
                rows={3}
                maxLength={1000}
              />
            ) : (
              <div className="field-value rich-text">
                {changeContext?.desiredFutureState || <span className="empty">Not defined</span>}
              </div>
            )}
          </div>

          {/* Current State Summary */}
          <div className="form-field">
            <label className="field-label">Current State Summary</label>
            <p className="field-hint">Description of today's reality (optional)</p>
            {isEditing ? (
              <textarea
                className="field-textarea"
                value={formData.currentStateSummary}
                onChange={(e) => setFormData({ ...formData, currentStateSummary: e.target.value })}
                placeholder="Describe the current state..."
                rows={3}
                maxLength={1000}
              />
            ) : (
              <div className="field-value rich-text">
                {changeContext?.currentStateSummary || <span className="empty">Not defined</span>}
              </div>
            )}
          </div>

          {/* Dates Row */}
          <div className="form-row">
            <div className="form-field half">
              <label className="field-label">Start Date</label>
              {isEditing ? (
                <input
                  type="date"
                  className="field-input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              ) : (
                <div className="field-value">
                  {changeContext?.startDate
                    ? new Date(changeContext.startDate).toLocaleDateString()
                    : <span className="empty">Not set</span>}
                </div>
              )}
            </div>
            <div className="form-field half">
              <label className="field-label">Target Completion</label>
              {isEditing ? (
                <input
                  type="date"
                  className="field-input"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                />
              ) : (
                <div className="field-value">
                  {changeContext?.targetDate
                    ? new Date(changeContext.targetDate).toLocaleDateString()
                    : <span className="empty">Not set</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Guidance Sidebar */}
        <aside className="cm-guidance-sidebar">
          <div className="guidance-card">
            <h4>Writing a Good Change Statement</h4>
            <p>Focus on the human experience, not the technical deliverable.</p>
            <div className="guidance-examples">
              <div className="example bad">
                <span className="label">Don't:</span>
                <span>"Implement SAP S/4HANA"</span>
              </div>
              <div className="example good">
                <span className="label">Do:</span>
                <span>"Finance teams will use a new system for all purchasing, approvals, and reporting—replacing familiar spreadsheet-based processes"</span>
              </div>
            </div>
          </div>

          <div className="guidance-card">
            <h4>Key Questions to Answer</h4>
            <ul>
              <li>What will people experience differently?</li>
              <li>What skills or behaviours will change?</li>
              <li>What will success feel like?</li>
              <li>Why should people care about this change?</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ============ STAKEHOLDER GROUPS SCREEN ============

function StakeholderGroupsScreen() {
  const {
    stakeholderGroups,
    createStakeholderGroup,
    updateStakeholderGroup,
    deleteStakeholderGroup,
    loading,
  } = useChange();

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    size: '',
    impactLevel: 'medium',
    influenceLevel: 'medium',
    currentState: '',
    desiredState: '',
    representative: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      size: '',
      impactLevel: 'medium',
      influenceLevel: 'medium',
      currentState: '',
      desiredState: '',
      representative: '',
    });
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    const created = await createStakeholderGroup(formData);
    if (created) {
      resetForm();
      setIsCreating(false);
      setSelectedGroup(created);
    }
  };

  const handleUpdate = async () => {
    if (!selectedGroup || !formData.name.trim()) return;
    await updateStakeholderGroup(selectedGroup.id, formData);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this stakeholder group?')) {
      await deleteStakeholderGroup(id);
      if (selectedGroup?.id === id) {
        setSelectedGroup(null);
      }
    }
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setIsCreating(false);
    setFormData({
      name: group.name || '',
      description: group.description || '',
      size: group.size || '',
      impactLevel: group.impactLevel || 'medium',
      influenceLevel: group.influenceLevel || 'medium',
      currentState: group.currentState || '',
      desiredState: group.desiredState || '',
      representative: group.representative || '',
    });
  };

  const handleStartCreate = () => {
    setSelectedGroup(null);
    setIsCreating(true);
    resetForm();
  };

  return (
    <div className="cm-screen">
      <div className="cm-screen-header">
        <div className="header-left">
          <h1>Stakeholder Groups</h1>
          <p className="subtitle">Identify and characterize groups affected by the change</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleStartCreate}>
            <AddIcon fontSize="small" /> Add Group
          </button>
        </div>
      </div>

      <div className="cm-screen-body cm-split-layout">
        {/* Left: List of groups */}
        <div className="cm-list-panel">
          <div className="list-header">
            <span className="list-count">{stakeholderGroups.length} groups</span>
          </div>
          <div className="list-items">
            {stakeholderGroups.length === 0 ? (
              <div className="empty-list">
                <GroupsIcon style={{ fontSize: 48, opacity: 0.3 }} />
                <p>No stakeholder groups defined yet</p>
                <button className="btn-link" onClick={handleStartCreate}>Create your first group</button>
              </div>
            ) : (
              stakeholderGroups.map(group => (
                <button
                  key={group.id}
                  className={`list-item ${selectedGroup?.id === group.id ? 'selected' : ''}`}
                  onClick={() => handleSelectGroup(group)}
                >
                  <div className="item-main">
                    <span className="item-name">{group.name}</span>
                    <span className="item-meta">{group.size || '?'} people</span>
                  </div>
                  <div className="item-badges">
                    <span className={`badge badge-impact-${group.impactLevel}`}>
                      {group.impactLevel}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Detail/Form panel */}
        <div className="cm-detail-panel">
          {!selectedGroup && !isCreating ? (
            <div className="empty-detail">
              <p>Select a stakeholder group to view details, or create a new one.</p>
            </div>
          ) : (
            <div className="detail-form">
              <div className="form-header">
                <h3>{isCreating ? 'New Stakeholder Group' : 'Edit Stakeholder Group'}</h3>
                {selectedGroup && (
                  <button className="btn-danger-text" onClick={() => handleDelete(selectedGroup.id)}>
                    Delete
                  </button>
                )}
              </div>

              <div className="form-field">
                <label className="field-label required">Group Name</label>
                <input
                  type="text"
                  className="field-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Finance Team, Field Sales"
                />
              </div>

              <div className="form-field">
                <label className="field-label">Description</label>
                <textarea
                  className="field-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this stakeholder group..."
                  rows={2}
                />
              </div>

              <div className="form-row">
                <div className="form-field third">
                  <label className="field-label">Size</label>
                  <input
                    type="number"
                    className="field-input"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="Est. people"
                  />
                </div>
                <div className="form-field third">
                  <label className="field-label">Impact Level</label>
                  <select
                    className="field-select"
                    value={formData.impactLevel}
                    onChange={(e) => setFormData({ ...formData, impactLevel: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-field third">
                  <label className="field-label">Influence</label>
                  <select
                    className="field-select"
                    value={formData.influenceLevel}
                    onChange={(e) => setFormData({ ...formData, influenceLevel: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">Current State</label>
                <textarea
                  className="field-textarea"
                  value={formData.currentState}
                  onChange={(e) => setFormData({ ...formData, currentState: e.target.value })}
                  placeholder="How does this group work today?"
                  rows={2}
                />
              </div>

              <div className="form-field">
                <label className="field-label">Desired Future State</label>
                <textarea
                  className="field-textarea"
                  value={formData.desiredState}
                  onChange={(e) => setFormData({ ...formData, desiredState: e.target.value })}
                  placeholder="How will this group work after the change?"
                  rows={2}
                />
              </div>

              <div className="form-field">
                <label className="field-label">Key Representative</label>
                <input
                  type="text"
                  className="field-input"
                  value={formData.representative}
                  onChange={(e) => setFormData({ ...formData, representative: e.target.value })}
                  placeholder="Contact person for this group"
                />
              </div>

              <div className="form-actions">
                {isCreating ? (
                  <>
                    <button className="btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleCreate} disabled={loading || !formData.name.trim()}>
                      {loading ? 'Creating...' : 'Create Group'}
                    </button>
                  </>
                ) : (
                  <button className="btn-primary" onClick={handleUpdate} disabled={loading || !formData.name.trim()}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ PCT ASSESSMENT SCREEN ============
// 4 groups of 10 questions each, scored 1-3
// Group totals: 10-19 = Red (High risk), 20-24 = Amber (Alert), 25-30 = Green (Strength)

function PCTAssessmentScreen() {
  const {
    stakeholderGroups,
    assessments,
    createAssessment,
    updateAssessment,
    loading,
  } = useChange();

  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState('leadership');
  const [formData, setFormData] = useState({
    name: '',
    stakeholderGroupId: '',
    responses: {}, // { questionId: score (1-3) }
  });

  const groupIds = ['leadership', 'project', 'change', 'success'];

  // Initialize empty responses
  const initializeResponses = () => {
    const responses = {};
    groupIds.forEach(groupId => {
      PCT_QUESTIONS[groupId].forEach(q => {
        responses[q.id] = 0; // 0 = not answered
      });
    });
    return responses;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      stakeholderGroupId: '',
      responses: initializeResponses(),
    });
    setExpandedGroup('leadership');
  };

  // Calculate group score (sum of 10 questions, each 1-3, max 30)
  const getGroupScore = (groupId) => {
    const questions = PCT_QUESTIONS[groupId];
    let total = 0;
    let answered = 0;
    questions.forEach(q => {
      const score = formData.responses[q.id] || 0;
      if (score > 0) {
        total += score;
        answered++;
      }
    });
    // Return actual score only if all questions answered
    return { total, answered, complete: answered === questions.length };
  };

  // Handle question score change
  const handleScoreChange = (questionId, score) => {
    setFormData(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [questionId]: score,
      },
    }));
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) return;

    // Calculate final scores
    const scores = {};
    groupIds.forEach(groupId => {
      const { total } = getGroupScore(groupId);
      scores[`${groupId}Score`] = total;
    });

    const data = {
      name: formData.name,
      stakeholderGroupId: formData.stakeholderGroupId,
      responses: formData.responses,
      ...scores,
    };

    const created = await createAssessment(data);
    if (created) {
      resetForm();
      setIsCreating(false);
      setSelectedAssessment(created);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAssessment) return;

    const scores = {};
    groupIds.forEach(groupId => {
      const { total } = getGroupScore(groupId);
      scores[`${groupId}Score`] = total;
    });

    await updateAssessment(selectedAssessment.id, {
      name: formData.name,
      stakeholderGroupId: formData.stakeholderGroupId,
      responses: formData.responses,
      ...scores,
    });
  };

  const handleSelectAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    setIsCreating(false);
    setFormData({
      name: assessment.name || '',
      stakeholderGroupId: assessment.stakeholderGroupId || '',
      responses: assessment.responses || initializeResponses(),
    });
    setExpandedGroup('leadership');
  };

  const handleStartCreate = () => {
    setSelectedAssessment(null);
    setIsCreating(true);
    resetForm();
  };

  // Get stakeholder name by ID
  const getStakeholderName = (id) => {
    return stakeholderGroups.find(g => g.id === id)?.name || 'Unknown';
  };

  // Toggle accordion group
  const toggleGroup = (groupId) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
  };

  // Calculate total progress
  const getTotalProgress = () => {
    let answered = 0;
    let total = 0;
    groupIds.forEach(groupId => {
      const { answered: a } = getGroupScore(groupId);
      answered += a;
      total += PCT_QUESTIONS[groupId].length;
    });
    return { answered, total };
  };

  // Get overall score (average of 4 group scores)
  const getOverallScore = () => {
    let totalScore = 0;
    let groupsComplete = 0;
    groupIds.forEach(groupId => {
      const { total, complete } = getGroupScore(groupId);
      if (complete) {
        totalScore += total;
        groupsComplete++;
      }
    });
    return groupsComplete === 4 ? Math.round(totalScore / 4) : null;
  };

  // Render the triangle visualization
  const renderTriangle = () => {
    const leadership = getGroupScore('leadership');
    const project = getGroupScore('project');
    const change = getGroupScore('change');
    const success = getGroupScore('success');

    const getBoxStyle = (score) => {
      const { bg } = getPCTScoreColor(score);
      return { fill: bg };
    };

    return (
      <svg className="pct-triangle" viewBox="0 0 320 300" preserveAspectRatio="xMidYMid meet">
        {/* Outer triangle */}
        <polygon points="160,20 20,260 300,260" fill="#c7cbe6" stroke="#c7cbe6" strokeWidth="1"/>
        {/* Inner inverted triangle */}
        <polygon points="160,120 80,260 240,260" fill="var(--panel, #ffffff)" stroke="var(--panel, #ffffff)" strokeWidth="1"/>

        {/* Labels */}
        <text className="tri-label" x="160" y="16" textAnchor="middle" fontSize="11">Leadership/Sponsorship</text>
        <text className="tri-label" x="36" y="280" textAnchor="middle" fontSize="11">Project</text>
        <text className="tri-label" x="284" y="280" textAnchor="middle" fontSize="11">Change</text>

        {/* Score boxes */}
        <rect x="140" y="42" width="40" height="24" rx="4" ry="4" style={getBoxStyle(leadership.total)}/>
        <text x="160" y="59" textAnchor="middle" fontSize="14" className="tri-score">{leadership.complete ? leadership.total : '-'}</text>

        <rect x="36" y="236" width="40" height="24" rx="4" ry="4" style={getBoxStyle(project.total)}/>
        <text x="56" y="253" textAnchor="middle" fontSize="14" className="tri-score">{project.complete ? project.total : '-'}</text>

        <rect x="244" y="236" width="40" height="24" rx="4" ry="4" style={getBoxStyle(change.total)}/>
        <text x="264" y="253" textAnchor="middle" fontSize="14" className="tri-score">{change.complete ? change.total : '-'}</text>

        {/* Center Success box */}
        <rect x="140" y="133" width="40" height="26" rx="4" ry="4" style={getBoxStyle(success.total)}/>
        <text x="160" y="150" textAnchor="middle" fontSize="14" className="tri-score">{success.complete ? success.total : '-'}</text>
        <text className="tri-label" x="160" y="170" textAnchor="middle" fontSize="10">Success</text>
      </svg>
    );
  };

  // Render score summary row
  const renderScoreSummary = (groupId) => {
    const group = PCT_GROUPS[groupId];
    const { total, complete } = getGroupScore(groupId);
    const { color, bg, label } = getPCTScoreColor(total);

    return (
      <div key={groupId} className="pct-score-row">
        <span className="score-label">{group.name}</span>
        <span
          className="score-value"
          style={{ backgroundColor: complete ? bg : 'var(--bg)', color: complete ? color : 'var(--text-muted)' }}
        >
          {complete ? total : '-'}/30
        </span>
      </div>
    );
  };

  const progress = getTotalProgress();
  const overallScore = getOverallScore();

  return (
    <div className="cm-screen pct-screen">
      <div className="cm-screen-header">
        <div className="header-left">
          <h1>PCT Assessment</h1>
          <p className="subtitle">Score each question from 1 (weak) to 3 (strong) across 4 dimensions</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleStartCreate}>
            <AddIcon fontSize="small" /> New Assessment
          </button>
        </div>
      </div>

      <div className="cm-screen-body cm-split-layout">
        {/* Left: List of assessments */}
        <div className="cm-list-panel">
          <div className="list-header">
            <span className="list-count">{assessments.length} assessments</span>
          </div>
          <div className="list-items">
            {assessments.length === 0 ? (
              <div className="empty-list">
                <TrendingUpIcon style={{ fontSize: 48, opacity: 0.3 }} />
                <p>No PCT assessments yet</p>
                <button className="btn-link" onClick={handleStartCreate}>Create your first assessment</button>
              </div>
            ) : (
              assessments.map(assessment => {
                const avgScore = Math.round(
                  ((assessment.leadershipScore || 0) + (assessment.projectScore || 0) +
                   (assessment.changeScore || 0) + (assessment.successScore || 0)) / 4
                );
                const { color, bg } = getPCTScoreColor(avgScore);
                return (
                  <button
                    key={assessment.id}
                    className={`list-item ${selectedAssessment?.id === assessment.id ? 'selected' : ''}`}
                    onClick={() => handleSelectAssessment(assessment)}
                  >
                    <div className="item-main">
                      <span className="item-name">{assessment.name}</span>
                      <span className="item-meta">
                        {assessment.stakeholderGroupId ? getStakeholderName(assessment.stakeholderGroupId) : 'General'}
                      </span>
                    </div>
                    <div className="item-badges">
                      <span className="badge badge-score" style={{ backgroundColor: bg, color }}>{avgScore || '-'}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Assessment form */}
        <div className="cm-detail-panel pct-detail-panel">
          {!selectedAssessment && !isCreating ? (
            <div className="empty-detail">
              <p>Select an assessment to view details, or create a new one.</p>
              <div className="pct-explainer">
                <h4>PCT Assessment Model</h4>
                <p>Assess change readiness across 4 dimensions with 10 questions each:</p>
                <ul>
                  <li><strong>Leadership:</strong> Executive sponsorship and alignment</li>
                  <li><strong>Project:</strong> Planning and execution capabilities</li>
                  <li><strong>Change:</strong> People-side readiness and adoption</li>
                  <li><strong>Success:</strong> Benefits clarity and value realization</li>
                </ul>
                <div className="pct-legend">
                  <div className="legend-row"><span className="legend-swatch red"></span> 10-19: High risk - needs immediate action</div>
                  <div className="legend-row"><span className="legend-swatch amber"></span> 20-24: Alert - needs investigation</div>
                  <div className="legend-row"><span className="legend-swatch green"></span> 25-30: Strength - leverage and maintain</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="pct-assessment-layout">
              {/* Left side: Questions */}
              <div className="pct-questions-panel">
                <div className="form-row">
                  <div className="form-field half">
                    <label className="field-label required">Assessment Name</label>
                    <input
                      type="text"
                      className="field-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Q1 Readiness Check"
                    />
                  </div>
                  <div className="form-field half">
                    <label className="field-label">Stakeholder Group</label>
                    <select
                      className="field-select"
                      value={formData.stakeholderGroupId}
                      onChange={(e) => setFormData({ ...formData, stakeholderGroupId: e.target.value })}
                    >
                      <option value="">-- General (All) --</option>
                      {stakeholderGroups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pct-progress-bar">
                  <div className="progress-text">{progress.answered} of {progress.total} questions answered</div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${(progress.answered / progress.total) * 100}%` }}></div>
                  </div>
                </div>

                <div className="pct-accordion">
                  {groupIds.map(groupId => {
                    const group = PCT_GROUPS[groupId];
                    const questions = PCT_QUESTIONS[groupId];
                    const { total, answered, complete } = getGroupScore(groupId);
                    const { color, level } = getPCTScoreColor(total);
                    const isExpanded = expandedGroup === groupId;

                    return (
                      <div key={groupId} className={`pct-group ${isExpanded ? 'expanded' : ''}`}>
                        <button className="pct-group-header" onClick={() => toggleGroup(groupId)}>
                          <div className="group-header-left">
                            <span className="group-title">{group.name}</span>
                            <span className="group-tag">{group.tag}</span>
                            <span className={`group-score ${complete ? level : ''}`}>
                              ({complete ? total : `${answered}/10`}/30)
                            </span>
                          </div>
                          <span className="chevron">{isExpanded ? '▼' : '▶'}</span>
                        </button>
                        {isExpanded && (
                          <div className="pct-group-body">
                            {questions.map(q => {
                              const currentScore = formData.responses[q.id] || 0;
                              return (
                                <div key={q.id} className="pct-question">
                                  <div className="question-text">{q.text}</div>
                                  <div className="score-options">
                                    {[1, 2, 3].map(score => (
                                      <button
                                        key={score}
                                        className={`score-btn ${currentScore === score ? `selected score-${score}` : ''}`}
                                        onClick={() => handleScoreChange(q.id, score)}
                                      >
                                        {score}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="form-actions">
                  {isCreating ? (
                    <>
                      <button className="btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button>
                      <button className="btn-primary" onClick={handleCreate} disabled={loading || !formData.name.trim()}>
                        {loading ? 'Creating...' : 'Create Assessment'}
                      </button>
                    </>
                  ) : (
                    <button className="btn-primary" onClick={handleUpdate} disabled={loading}>
                      {loading ? 'Saving...' : 'Save Assessment'}
                    </button>
                  )}
                </div>
              </div>

              {/* Right side: Results */}
              <div className="pct-results-panel">
                <h3>Assessment Results</h3>
                <div className="pct-scores-summary">
                  {groupIds.map(renderScoreSummary)}
                </div>
                <div className="pct-triangle-container">
                  {renderTriangle()}
                </div>
                <div className="pct-legend compact">
                  <div className="legend-row"><span className="legend-swatch red"></span> 10-19: High risk</div>
                  <div className="legend-row"><span className="legend-swatch amber"></span> 20-24: Alert</div>
                  <div className="legend-row"><span className="legend-swatch green"></span> 25-30: Strength</div>
                </div>
                <p className="pct-hint">Aim for balanced strength across all four dimensions.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ CHANGE RISKS SCREEN ============

function ChangeRisksScreen() {
  const {
    risks,
    stakeholderGroups,
    createRisk,
    updateRisk,
    deleteRisk,
    loading,
  } = useChange();

  const [selectedRisk, setSelectedRisk] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'matrix'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'resistance',
    probability: 'medium',
    impact: 'medium',
    mitigationStrategy: '',
    owner: '',
    status: 'identified',
    stakeholderGroupId: '',
  });

  const RISK_CATEGORIES = [
    { id: 'resistance', name: 'Resistance', color: '#dc2626' },
    { id: 'capacity', name: 'Capacity', color: '#f59e0b' },
    { id: 'communication', name: 'Communication', color: '#3b82f6' },
    { id: 'leadership', name: 'Leadership', color: '#8b5cf6' },
    { id: 'resource', name: 'Resource', color: '#ec4899' },
    { id: 'technical', name: 'Technical', color: '#06b6d4' },
  ];

  const PROBABILITY_LEVELS = [
    { id: 'low', name: 'Low', score: 1, color: '#22c55e' },
    { id: 'medium', name: 'Medium', score: 2, color: '#f59e0b' },
    { id: 'high', name: 'High', score: 3, color: '#dc2626' },
  ];

  const IMPACT_LEVELS_RISK = [
    { id: 'low', name: 'Low', score: 1, color: '#22c55e' },
    { id: 'medium', name: 'Medium', score: 2, color: '#f59e0b' },
    { id: 'high', name: 'High', score: 3, color: '#dc2626' },
  ];

  const STATUS_OPTIONS = [
    { id: 'identified', name: 'Identified', color: '#9ca3af' },
    { id: 'analyzing', name: 'Analyzing', color: '#3b82f6' },
    { id: 'mitigating', name: 'Mitigating', color: '#f59e0b' },
    { id: 'mitigated', name: 'Mitigated', color: '#22c55e' },
    { id: 'closed', name: 'Closed', color: '#6b7280' },
    { id: 'occurred', name: 'Occurred', color: '#dc2626' },
  ];

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'resistance',
      probability: 'medium',
      impact: 'medium',
      mitigationStrategy: '',
      owner: '',
      status: 'identified',
      stakeholderGroupId: '',
    });
  };

  const calculateRiskScore = (prob, imp) => {
    const probScore = PROBABILITY_LEVELS.find(p => p.id === prob)?.score || 2;
    const impScore = IMPACT_LEVELS_RISK.find(i => i.id === imp)?.score || 2;
    return probScore * impScore;
  };

  const getRiskScoreColor = (score) => {
    if (score <= 2) return '#22c55e';
    if (score <= 4) return '#f59e0b';
    return '#dc2626';
  };

  const getRiskScoreLabel = (score) => {
    if (score <= 2) return 'Low';
    if (score <= 4) return 'Medium';
    return 'High';
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) return;
    const created = await createRisk(formData);
    if (created) {
      resetForm();
      setIsCreating(false);
      setSelectedRisk(created);
    }
  };

  const handleUpdate = async () => {
    if (!selectedRisk || !formData.title.trim()) return;
    await updateRisk(selectedRisk.id, formData);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this risk?')) {
      await deleteRisk(id);
      if (selectedRisk?.id === id) {
        setSelectedRisk(null);
      }
    }
  };

  const handleSelectRisk = (risk) => {
    setSelectedRisk(risk);
    setIsCreating(false);
    setFormData({
      title: risk.title || '',
      description: risk.description || '',
      category: risk.category || 'resistance',
      probability: risk.probability || 'medium',
      impact: risk.impact || 'medium',
      mitigationStrategy: risk.mitigationStrategy || '',
      owner: risk.owner || '',
      status: risk.status || 'identified',
      stakeholderGroupId: risk.stakeholderGroupId || '',
    });
  };

  const handleStartCreate = () => {
    setSelectedRisk(null);
    setIsCreating(true);
    resetForm();
  };

  // Get stakeholder name by ID
  const getStakeholderName = (id) => {
    return stakeholderGroups.find(g => g.id === id)?.name || '';
  };

  // Risk Matrix View
  const renderRiskMatrix = () => {
    // Create a 3x3 matrix: rows = impact (high to low), cols = probability (low to high)
    const matrix = {
      'high-low': [], 'high-medium': [], 'high-high': [],
      'medium-low': [], 'medium-medium': [], 'medium-high': [],
      'low-low': [], 'low-medium': [], 'low-high': [],
    };

    risks.forEach(risk => {
      const key = `${risk.impact}-${risk.probability}`;
      if (matrix[key]) matrix[key].push(risk);
    });

    const getCellColor = (impact, probability) => {
      const score = calculateRiskScore(probability, impact);
      if (score >= 6) return '#fee2e2'; // red-100
      if (score >= 4) return '#fef3c7'; // amber-100
      return '#dcfce7'; // green-100
    };

    return (
      <div className="risk-matrix-container">
        <div className="risk-matrix">
          <div className="matrix-y-label">Impact</div>
          <div className="matrix-grid">
            {/* Header row - Probability labels */}
            <div className="matrix-header-row">
              <div className="matrix-corner"></div>
              <div className="matrix-header-cell">Low</div>
              <div className="matrix-header-cell">Medium</div>
              <div className="matrix-header-cell">High</div>
            </div>
            {/* Impact rows (high to low) */}
            {['high', 'medium', 'low'].map(impact => (
              <div key={impact} className="matrix-row">
                <div className="matrix-row-label">{impact.charAt(0).toUpperCase() + impact.slice(1)}</div>
                {['low', 'medium', 'high'].map(probability => {
                  const cellRisks = matrix[`${impact}-${probability}`];
                  return (
                    <div
                      key={`${impact}-${probability}`}
                      className="matrix-cell"
                      style={{ backgroundColor: getCellColor(impact, probability) }}
                    >
                      {cellRisks.map(risk => (
                        <button
                          key={risk.id}
                          className={`matrix-risk-chip ${selectedRisk?.id === risk.id ? 'selected' : ''}`}
                          onClick={() => handleSelectRisk(risk)}
                          title={risk.title}
                        >
                          {risk.title.length > 15 ? risk.title.slice(0, 15) + '...' : risk.title}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="matrix-x-label">Probability</div>
        </div>
        <div className="matrix-legend">
          <div className="legend-item" style={{ backgroundColor: '#dcfce7' }}>Low Risk (1-2)</div>
          <div className="legend-item" style={{ backgroundColor: '#fef3c7' }}>Medium Risk (3-4)</div>
          <div className="legend-item" style={{ backgroundColor: '#fee2e2' }}>High Risk (6-9)</div>
        </div>
      </div>
    );
  };

  const currentRiskScore = calculateRiskScore(formData.probability, formData.impact);

  return (
    <div className="cm-screen">
      <div className="cm-screen-header">
        <div className="header-left">
          <h1>Change Risks</h1>
          <p className="subtitle">Identify and track risks specific to the change initiative</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
            <button
              className={`toggle-btn ${viewMode === 'matrix' ? 'active' : ''}`}
              onClick={() => setViewMode('matrix')}
            >
              Matrix
            </button>
          </div>
          <button className="btn-primary" onClick={handleStartCreate}>
            <AddIcon fontSize="small" /> Add Risk
          </button>
        </div>
      </div>

      <div className="cm-screen-body cm-split-layout">
        {/* Left: List or Matrix view */}
        <div className="cm-list-panel">
          {viewMode === 'matrix' ? (
            renderRiskMatrix()
          ) : (
            <>
              <div className="list-header">
                <span className="list-count">{risks.length} risks</span>
              </div>
              <div className="list-items">
                {risks.length === 0 ? (
                  <div className="empty-list">
                    <WarningIcon style={{ fontSize: 48, opacity: 0.3 }} />
                    <p>No change risks identified yet</p>
                    <button className="btn-link" onClick={handleStartCreate}>Add your first risk</button>
                  </div>
                ) : (
                  risks.map(risk => {
                    const riskScore = risk.riskScore || calculateRiskScore(risk.probability, risk.impact);
                    return (
                      <button
                        key={risk.id}
                        className={`list-item ${selectedRisk?.id === risk.id ? 'selected' : ''}`}
                        onClick={() => handleSelectRisk(risk)}
                      >
                        <div className="item-main">
                          <span className="item-name">{risk.title}</span>
                          <span className="item-meta">
                            {RISK_CATEGORIES.find(c => c.id === risk.category)?.name || risk.category}
                          </span>
                        </div>
                        <div className="item-badges">
                          <span
                            className="badge badge-score"
                            style={{
                              backgroundColor: getRiskScoreColor(riskScore),
                              color: '#fff',
                            }}
                          >
                            {riskScore}
                          </span>
                          <span
                            className="badge badge-status"
                            style={{
                              backgroundColor: STATUS_OPTIONS.find(s => s.id === risk.status)?.color || '#9ca3af',
                              color: '#fff',
                            }}
                          >
                            {STATUS_OPTIONS.find(s => s.id === risk.status)?.name || risk.status}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: Detail/Form panel */}
        <div className="cm-detail-panel">
          {!selectedRisk && !isCreating ? (
            <div className="empty-detail">
              <p>Select a risk to view details, or create a new one.</p>
              <div className="risk-guidance">
                <h4>Common Change Risks</h4>
                <ul>
                  <li><strong>Resistance:</strong> Stakeholder pushback, passive resistance, undermining</li>
                  <li><strong>Capacity:</strong> Insufficient skills, time, or resources</li>
                  <li><strong>Communication:</strong> Unclear messaging, rumours, misinformation</li>
                  <li><strong>Leadership:</strong> Weak sponsorship, inconsistent messaging</li>
                  <li><strong>Resource:</strong> Budget cuts, competing priorities</li>
                  <li><strong>Technical:</strong> System integration, data migration issues</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="detail-form risk-form">
              <div className="form-header">
                <h3>{isCreating ? 'New Change Risk' : 'Edit Risk'}</h3>
                <div className="risk-score-display" style={{ backgroundColor: getRiskScoreColor(currentRiskScore) }}>
                  <span className="score-value">{currentRiskScore}</span>
                  <span className="score-label">{getRiskScoreLabel(currentRiskScore)} Risk</span>
                </div>
              </div>

              {selectedRisk && (
                <div className="form-actions-top">
                  <button className="btn-danger-text" onClick={() => handleDelete(selectedRisk.id)}>
                    Delete Risk
                  </button>
                </div>
              )}

              <div className="form-field">
                <label className="field-label required">Risk Title</label>
                <input
                  type="text"
                  className="field-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of the risk"
                />
              </div>

              <div className="form-field">
                <label className="field-label">Description</label>
                <textarea
                  className="field-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the risk and its potential consequences..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-field third">
                  <label className="field-label">Category</label>
                  <select
                    className="field-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {RISK_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field third">
                  <label className="field-label">Probability</label>
                  <select
                    className="field-select"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                  >
                    {PROBABILITY_LEVELS.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field third">
                  <label className="field-label">Impact</label>
                  <select
                    className="field-select"
                    value={formData.impact}
                    onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                  >
                    {IMPACT_LEVELS_RISK.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field half">
                  <label className="field-label">Status</label>
                  <select
                    className="field-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field half">
                  <label className="field-label">Linked Stakeholder Group</label>
                  <select
                    className="field-select"
                    value={formData.stakeholderGroupId}
                    onChange={(e) => setFormData({ ...formData, stakeholderGroupId: e.target.value })}
                  >
                    <option value="">-- None --</option>
                    {stakeholderGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">Mitigation Strategy</label>
                <textarea
                  className="field-textarea"
                  value={formData.mitigationStrategy}
                  onChange={(e) => setFormData({ ...formData, mitigationStrategy: e.target.value })}
                  placeholder="What actions will be taken to reduce or eliminate this risk?"
                  rows={3}
                />
              </div>

              <div className="form-field">
                <label className="field-label">Risk Owner</label>
                <input
                  type="text"
                  className="field-input"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="Person responsible for managing this risk"
                />
              </div>

              <div className="form-actions">
                {isCreating ? (
                  <>
                    <button className="btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleCreate} disabled={loading || !formData.title.trim()}>
                      {loading ? 'Creating...' : 'Create Risk'}
                    </button>
                  </>
                ) : (
                  <button className="btn-primary" onClick={handleUpdate} disabled={loading || !formData.title.trim()}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ IMPACT ASSESSMENT SCREEN ============

function ImpactAssessmentScreen() {
  const {
    stakeholderGroups,
    impactAssessments,
    createImpactAssessment,
    updateImpactAssessment,
    deleteImpactAssessment,
    loading,
  } = useChange();

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [formData, setFormData] = useState({
    impacts: {},
    notes: '',
  });

  const impactCategories = Object.values(IMPACT_CATEGORIES);

  const IMPACT_LEVEL_OPTIONS = [
    { id: 'none', name: 'None', score: 0, color: '#9ca3af' },
    { id: 'low', name: 'Low', score: 1, color: '#22c55e' },
    { id: 'medium', name: 'Medium', score: 2, color: '#f59e0b' },
    { id: 'high', name: 'High', score: 3, color: '#f97316' },
    { id: 'critical', name: 'Critical', score: 4, color: '#dc2626' },
  ];

  // Get assessment for a stakeholder group
  const getAssessmentForGroup = (groupId) => {
    return impactAssessments.find(ia => ia.stakeholderGroupId === groupId);
  };

  // Calculate overall level from impacts
  const calculateOverallLevel = (impacts) => {
    if (!impacts || Object.keys(impacts).length === 0) return 'none';

    const levels = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };
    const scores = Object.values(impacts).map(i => levels[i.level] || 0);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    if (avgScore <= 0.5) return 'none';
    if (avgScore <= 1.5) return 'low';
    if (avgScore <= 2.5) return 'medium';
    if (avgScore <= 3.5) return 'high';
    return 'critical';
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    const existing = getAssessmentForGroup(group.id);
    if (existing) {
      setSelectedAssessment(existing);
      setFormData({
        impacts: existing.impacts || {},
        notes: existing.notes || '',
      });
    } else {
      setSelectedAssessment(null);
      // Initialize with empty impacts for each category
      const initialImpacts = {};
      impactCategories.forEach(cat => {
        initialImpacts[cat.id] = { level: 'none', notes: '' };
      });
      setFormData({
        impacts: initialImpacts,
        notes: '',
      });
    }
  };

  const handleImpactChange = (categoryId, level) => {
    setFormData(prev => ({
      ...prev,
      impacts: {
        ...prev.impacts,
        [categoryId]: {
          ...prev.impacts[categoryId],
          level,
        },
      },
    }));
  };

  const handleImpactNoteChange = (categoryId, notes) => {
    setFormData(prev => ({
      ...prev,
      impacts: {
        ...prev.impacts,
        [categoryId]: {
          ...prev.impacts[categoryId],
          notes,
        },
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedGroup) return;

    const data = {
      name: `Impact Assessment - ${selectedGroup.name}`,
      stakeholderGroupId: selectedGroup.id,
      impacts: formData.impacts,
      overallLevel: calculateOverallLevel(formData.impacts),
      notes: formData.notes,
    };

    if (selectedAssessment) {
      await updateImpactAssessment(selectedAssessment.id, data);
    } else {
      const created = await createImpactAssessment(data);
      if (created) {
        setSelectedAssessment(created);
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedAssessment) return;
    if (confirm('Delete this impact assessment?')) {
      await deleteImpactAssessment(selectedAssessment.id);
      setSelectedAssessment(null);
      // Re-initialize form
      const initialImpacts = {};
      impactCategories.forEach(cat => {
        initialImpacts[cat.id] = { level: 'none', notes: '' };
      });
      setFormData({
        impacts: initialImpacts,
        notes: '',
      });
    }
  };

  // Get color for impact level
  const getImpactColor = (level) => {
    return IMPACT_LEVEL_OPTIONS.find(l => l.id === level)?.color || '#9ca3af';
  };

  // Count assessed groups
  const assessedCount = stakeholderGroups.filter(g => getAssessmentForGroup(g.id)).length;

  return (
    <div className="cm-screen">
      <div className="cm-screen-header">
        <div className="header-left">
          <h1>Impact Assessment</h1>
          <p className="subtitle">Assess how the change impacts each stakeholder group across dimensions</p>
        </div>
        <div className="header-actions">
          <span className="assessment-progress">
            {assessedCount} of {stakeholderGroups.length} groups assessed
          </span>
        </div>
      </div>

      <div className="cm-screen-body cm-split-layout">
        {/* Left: Stakeholder Groups List */}
        <div className="cm-list-panel">
          <div className="list-header">
            <span className="list-count">{stakeholderGroups.length} groups</span>
          </div>
          <div className="list-items">
            {stakeholderGroups.length === 0 ? (
              <div className="empty-list">
                <GroupsIcon style={{ fontSize: 48, opacity: 0.3 }} />
                <p>No stakeholder groups defined yet</p>
                <p className="hint-text">Add stakeholder groups first to assess their impact</p>
              </div>
            ) : (
              stakeholderGroups.map(group => {
                const assessment = getAssessmentForGroup(group.id);
                const overallLevel = assessment?.overallLevel || 'not_assessed';
                return (
                  <button
                    key={group.id}
                    className={`list-item ${selectedGroup?.id === group.id ? 'selected' : ''}`}
                    onClick={() => handleSelectGroup(group)}
                  >
                    <div className="item-main">
                      <span className="item-name">{group.name}</span>
                      <span className="item-meta">{group.size || '?'} people</span>
                    </div>
                    <div className="item-badges">
                      {assessment ? (
                        <span
                          className="badge badge-impact"
                          style={{ backgroundColor: getImpactColor(overallLevel), color: '#fff' }}
                        >
                          {overallLevel}
                        </span>
                      ) : (
                        <span className="badge badge-not-assessed">Not assessed</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Impact Assessment Form */}
        <div className="cm-detail-panel">
          {!selectedGroup ? (
            <div className="empty-detail">
              <p>Select a stakeholder group to assess their impact</p>
              <div className="impact-guidance">
                <h4>Impact Categories</h4>
                <ul>
                  {impactCategories.map(cat => (
                    <li key={cat.id}>
                      <strong>{cat.name}:</strong> {cat.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="detail-form impact-form">
              <div className="form-header">
                <div>
                  <h3>{selectedGroup.name}</h3>
                  <p className="form-subtitle">{selectedGroup.size || '?'} people affected</p>
                </div>
                <div className="overall-impact" style={{ backgroundColor: getImpactColor(calculateOverallLevel(formData.impacts)) }}>
                  <span className="impact-value">{calculateOverallLevel(formData.impacts)}</span>
                  <span className="impact-label">Overall Impact</span>
                </div>
              </div>

              {selectedAssessment && (
                <div className="form-actions-top">
                  <button className="btn-danger-text" onClick={handleDelete}>
                    Delete Assessment
                  </button>
                </div>
              )}

              <div className="impact-categories-grid">
                {impactCategories.map(category => {
                  const currentImpact = formData.impacts[category.id] || { level: 'none', notes: '' };
                  return (
                    <div key={category.id} className="impact-category-card">
                      <div className="category-header">
                        <h4>{category.name}</h4>
                        <span
                          className="category-level-badge"
                          style={{ backgroundColor: getImpactColor(currentImpact.level), color: '#fff' }}
                        >
                          {currentImpact.level}
                        </span>
                      </div>
                      <p className="category-description">{category.description}</p>
                      <div className="impact-level-selector">
                        {IMPACT_LEVEL_OPTIONS.map(level => (
                          <button
                            key={level.id}
                            className={`level-btn ${currentImpact.level === level.id ? 'active' : ''}`}
                            style={{
                              '--level-color': level.color,
                              backgroundColor: currentImpact.level === level.id ? level.color : 'transparent',
                              color: currentImpact.level === level.id ? '#fff' : 'var(--text-muted)',
                            }}
                            onClick={() => handleImpactChange(category.id, level.id)}
                            title={level.name}
                          >
                            {level.name.charAt(0)}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        className="category-note-input"
                        placeholder="Add note..."
                        value={currentImpact.notes || ''}
                        onChange={(e) => handleImpactNoteChange(category.id, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="form-field">
                <label className="field-label">Overall Notes</label>
                <textarea
                  className="field-textarea"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional observations about the overall impact on this group..."
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button className="btn-primary" onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : selectedAssessment ? 'Update Assessment' : 'Save Assessment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ PLACEHOLDER SCREENS ============

function PlaceholderScreen({ title, description }) {
  return (
    <div className="cm-screen">
      <div className="cm-screen-header">
        <h1>{title}</h1>
        <p className="subtitle">{description}</p>
      </div>
      <div className="cm-placeholder">
        <p>This section is coming soon.</p>
      </div>
    </div>
  );
}

// ============ NAVIGATOR ============

function Navigator({ activeView, onViewChange }) {
  const [expandedGroups, setExpandedGroups] = useState({ context: true });

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Expand group containing active view
  useEffect(() => {
    const activeGroup = NAV_GROUPS.find(g => g.views.some(v => v.id === activeView));
    if (activeGroup) {
      setExpandedGroups(prev => ({ ...prev, [activeGroup.id]: true }));
    }
  }, [activeView]);

  return (
    <div className="cm-navigator" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Home Button */}
      <div className="nav-home" style={{ flexShrink: 0 }}>
        <button
          className={`nav-home-btn ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => onViewChange('overview')}
        >
          <DashboardIcon fontSize="small" />
          <span>Overview</span>
        </button>
      </div>

      {/* Grouped Navigation */}
      <div className="nav-views-grouped" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {NAV_GROUPS.map(group => (
          <div key={group.id} className="nav-group">
            <button
              className={`nav-group-header ${expandedGroups[group.id] ? 'expanded' : ''}`}
              onClick={() => toggleGroup(group.id)}
              style={{ borderLeftColor: group.color }}
            >
              {expandedGroups[group.id] ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
              <span className="group-name">{group.name}</span>
              <span className="group-count">{group.views.length}</span>
            </button>
            {expandedGroups[group.id] && (
              <div className="nav-group-views">
                {group.views.map(view => (
                  <button
                    key={view.id}
                    className={`nav-view-btn ${activeView === view.id ? 'active' : ''}`}
                    onClick={() => onViewChange(view.id)}
                  >
                    {view.icon}
                    <span>{view.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ MAIN CHANGE STUDIO COMPONENT ============

export default function ChangeStudio() {
  const router = useRouter();
  const { activeProject } = useProjects();
  const { user } = useAuth();
  const { loading, error } = useChange();

  const [activeView, setActiveView] = useState('overview');

  // Handle view navigation
  const handleNavigate = (view, itemId = null) => {
    setActiveView(view);
    // Could add itemId to URL params if needed
  };

  // Render active view
  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewDashboard onNavigate={handleNavigate} />;
      case 'definition':
        return <ChangeDefinitionScreen />;
      case 'type':
        return <PlaceholderScreen title="Change Type & Characteristics" description="Classify the change to guide assessment approach" />;
      case 'scope':
        return <PlaceholderScreen title="Scope & Boundaries" description="Define what is in and out of scope" />;
      case 'stakeholder-groups':
        return <StakeholderGroupsScreen />;
      case 'impact-assessment':
        return <ImpactAssessmentScreen />;
      case 'impact-heatmap':
        return <PlaceholderScreen title="Impact Heatmap" description="Visual summary of where change impact concentrates" />;
      case 'assessment-dashboard':
        return <PlaceholderScreen title="Assessment Dashboard" description="Central hub for all change assessments" />;
      case 'pct-assessment':
        return <PCTAssessmentScreen />;
      case 'readiness-scorecard':
        return <PlaceholderScreen title="Readiness Scorecard" description="Broader readiness assessment across dimensions" />;
      case 'change-risks':
        return <ChangeRisksScreen />;
      case 'resistance-map':
        return <PlaceholderScreen title="Resistance Map" description="Anticipate and track resistance" />;
      default:
        return <OverviewDashboard onNavigate={handleNavigate} />;
    }
  };

  // Check for project and auth
  if (!user) {
    return (
      <div className="cm-studio-prompt">
        <h2>Please log in</h2>
        <p>You need to be logged in to access Change Studio.</p>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="cm-studio-prompt">
        <h2>No Project Selected</h2>
        <p>Please select a project to access Change Studio.</p>
      </div>
    );
  }

  // Get view info for breadcrumbs
  const getViewInfo = () => {
    if (activeView === 'overview') return { name: 'Overview', group: null };
    for (const group of NAV_GROUPS) {
      const view = group.views.find(v => v.id === activeView);
      if (view) return { name: view.name, group: group.name };
    }
    return { name: activeView, group: null };
  };

  const viewInfo = getViewInfo();

  return (
    <div className="cm-studio">
      {/* Navigator */}
      <Navigator activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content */}
      <div className="cm-main" style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Breadcrumbs */}
        <div className="cm-breadcrumbs" style={{ flexShrink: 0 }}>
          <button className="breadcrumb-item" onClick={() => setActiveView('overview')}>
            <DashboardIcon fontSize="small" />
            <span>Change Studio</span>
          </button>
          {viewInfo.group && (
            <>
              <NavigateNextIcon fontSize="small" className="breadcrumb-separator" />
              <span className="breadcrumb-group">{viewInfo.group}</span>
            </>
          )}
          {activeView !== 'overview' && (
            <>
              <NavigateNextIcon fontSize="small" className="breadcrumb-separator" />
              <span className="breadcrumb-current">{viewInfo.name}</span>
            </>
          )}
        </div>

        {/* View Content */}
        <div className="cm-content" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {loading ? (
            <div className="cm-loading">Loading...</div>
          ) : error ? (
            <div className="cm-error">Error: {error}</div>
          ) : (
            renderView()
          )}
        </div>
      </div>
    </div>
  );
}
