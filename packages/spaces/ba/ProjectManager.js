// components/ba/ProjectManager.js
// Project Management Components for BA Workspace (EPIC 1)
import { useState, useEffect, useRef } from 'react';
import { useProjects, PROJECT_STATUS, PROJECT_ROLES } from '../../ProjectContext';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import ArchiveIcon from '@mui/icons-material/Archive';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ApprovalIcon from '@mui/icons-material/Approval';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import Tooltip from '@mui/material/Tooltip';

// Status icons and colors
const STATUS_CONFIG = {
  [PROJECT_STATUS.DRAFT]: { icon: PendingIcon, color: '#94a3b8', label: 'Draft' },
  [PROJECT_STATUS.ACTIVE]: { icon: CheckCircleIcon, color: '#22c55e', label: 'Active' },
  [PROJECT_STATUS.ON_HOLD]: { icon: PauseCircleIcon, color: '#f59e0b', label: 'On Hold' },
  [PROJECT_STATUS.CLOSED]: { icon: ArchiveIcon, color: '#6b7280', label: 'Closed' },
};

// Format project display name with number
const formatProjectName = (project) => {
  if (!project) return 'Select Project';
  const num = project.project_number || project.projectNumber;
  if (num) {
    return `P${String(num).padStart(3, '0')} - ${project.name}`;
  }
  return project.name;
};

// ============ PROJECT SELECTOR ============
export function ProjectSelector({ onOpenDashboard }) {
  const { projects, activeProject, setActiveProject, createProject } = useProjects();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const StatusIcon = activeProject ? STATUS_CONFIG[activeProject.status]?.icon : FolderIcon;

  return (
    <>
      <div className="ba-project-selector" ref={dropdownRef}>
        <button
          className="ba-project-selector-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          <StatusIcon
            fontSize="small"
            style={{ color: activeProject ? STATUS_CONFIG[activeProject.status]?.color : '#6b7280' }}
          />
          <span className="project-name">
            {formatProjectName(activeProject)}
          </span>
          <ExpandMoreIcon fontSize="small" className={`expand-icon ${isOpen ? 'open' : ''}`} />
        </button>

        {isOpen && (
          <div className="ba-project-dropdown">
            <div className="dropdown-header">
              <span>Projects</span>
              <button
                className="dropdown-action-btn"
                onClick={() => {
                  setShowCreateModal(true);
                  setIsOpen(false);
                }}
                title="Create new project"
              >
                <AddIcon fontSize="small" />
              </button>
            </div>

            <div className="dropdown-list">
              {projects.length === 0 ? (
                <div className="dropdown-empty">
                  No projects yet. Create one to get started.
                </div>
              ) : (
                projects.map(project => {
                  const StatusIcon = STATUS_CONFIG[project.status]?.icon || FolderIcon;
                  return (
                    <button
                      key={project.id}
                      className={`dropdown-item ${project.id === activeProject?.id ? 'active' : ''}`}
                      onClick={() => {
                        setActiveProject(project.id);
                        setIsOpen(false);
                      }}
                    >
                      <StatusIcon
                        fontSize="small"
                        style={{ color: STATUS_CONFIG[project.status]?.color }}
                      />
                      <div className="item-content">
                        <span className="item-name">{formatProjectName(project)}</span>
                        <span className="item-status">{project.status}</span>
                      </div>
                      {project.id === activeProject?.id && (
                        <CheckCircleIcon fontSize="small" className="check-icon" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {activeProject && (
              <div className="dropdown-footer">
                <button
                  className="dropdown-footer-btn"
                  onClick={() => {
                    onOpenDashboard?.();
                    setIsOpen(false);
                  }}
                >
                  <DashboardIcon fontSize="small" />
                  Project Dashboard
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <ProjectCreationModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => {
            createProject(data);
            setShowCreateModal(false);
          }}
        />
      )}
    </>
  );
}

// ============ PROJECT CREATION MODAL ============
export function ProjectCreationModal({ onClose, onCreate, editProject = null }) {
  const [formData, setFormData] = useState({
    name: editProject?.name || '',
    description: editProject?.description || '',
    businessContext: editProject?.businessContext || '',
    startDate: editProject?.startDate || new Date().toISOString().split('T')[0],
    endDate: editProject?.endDate || '',
    status: editProject?.status || PROJECT_STATUS.DRAFT,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onCreate(formData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal ba-project-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editProject ? 'Edit Project' : 'Create New Project'}</h3>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Project Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the project"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Business Context</label>
            <textarea
              value={formData.businessContext}
              onChange={e => setFormData({ ...formData, businessContext: e.target.value })}
              placeholder="Describe the business context and drivers for this project"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>End Date (Optional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              {Object.entries(PROJECT_STATUS).map(([key, value]) => (
                <option key={key} value={value}>{value}</option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!formData.name.trim()}>
              {editProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ PROJECT SCOPING PANEL ============
export function ProjectScopingPanel({ project, onUpdate }) {
  const [inScopeInput, setInScopeInput] = useState('');
  const [outScopeInput, setOutScopeInput] = useState('');
  const [objectiveInput, setObjectiveInput] = useState('');
  const [criteriaInput, setCriteriaInput] = useState('');

  if (!project) return null;

  const addItem = (field, value, setter) => {
    if (!value.trim()) return;
    onUpdate(project.id, {
      [field]: [...(project[field] || []), value.trim()]
    });
    setter('');
  };

  const removeItem = (field, index) => {
    onUpdate(project.id, {
      [field]: project[field].filter((_, i) => i !== index)
    });
  };

  return (
    <div className="ba-scoping-panel">
      <h4>Project Scoping</h4>

      {/* In Scope */}
      <div className="scoping-section">
        <label>In Scope</label>
        <div className="scoping-items">
          {(project.inScope || []).map((item, i) => (
            <div key={i} className="scoping-item in-scope">
              <span>{item}</span>
              <button onClick={() => removeItem('inScope', i)}>
                <CloseIcon fontSize="small" />
              </button>
            </div>
          ))}
        </div>
        <div className="scoping-input">
          <input
            type="text"
            value={inScopeInput}
            onChange={e => setInScopeInput(e.target.value)}
            placeholder="Add in-scope item"
            onKeyPress={e => e.key === 'Enter' && addItem('inScope', inScopeInput, setInScopeInput)}
          />
          <button onClick={() => addItem('inScope', inScopeInput, setInScopeInput)}>
            <AddIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Out of Scope */}
      <div className="scoping-section">
        <label>Out of Scope</label>
        <div className="scoping-items">
          {(project.outOfScope || []).map((item, i) => (
            <div key={i} className="scoping-item out-scope">
              <span>{item}</span>
              <button onClick={() => removeItem('outOfScope', i)}>
                <CloseIcon fontSize="small" />
              </button>
            </div>
          ))}
        </div>
        <div className="scoping-input">
          <input
            type="text"
            value={outScopeInput}
            onChange={e => setOutScopeInput(e.target.value)}
            placeholder="Add out-of-scope item"
            onKeyPress={e => e.key === 'Enter' && addItem('outOfScope', outScopeInput, setOutScopeInput)}
          />
          <button onClick={() => addItem('outOfScope', outScopeInput, setOutScopeInput)}>
            <AddIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Objectives */}
      <div className="scoping-section">
        <label>High-Level Objectives</label>
        <div className="scoping-items">
          {(project.objectives || []).map((item, i) => (
            <div key={i} className="scoping-item objective">
              <span>{item}</span>
              <button onClick={() => removeItem('objectives', i)}>
                <CloseIcon fontSize="small" />
              </button>
            </div>
          ))}
        </div>
        <div className="scoping-input">
          <input
            type="text"
            value={objectiveInput}
            onChange={e => setObjectiveInput(e.target.value)}
            placeholder="Add objective"
            onKeyPress={e => e.key === 'Enter' && addItem('objectives', objectiveInput, setObjectiveInput)}
          />
          <button onClick={() => addItem('objectives', objectiveInput, setObjectiveInput)}>
            <AddIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Success Criteria */}
      <div className="scoping-section">
        <label>Success Criteria</label>
        <div className="scoping-items">
          {(project.successCriteria || []).map((item, i) => (
            <div key={i} className="scoping-item criteria">
              <span>{item}</span>
              <button onClick={() => removeItem('successCriteria', i)}>
                <CloseIcon fontSize="small" />
              </button>
            </div>
          ))}
        </div>
        <div className="scoping-input">
          <input
            type="text"
            value={criteriaInput}
            onChange={e => setCriteriaInput(e.target.value)}
            placeholder="Add success criterion"
            onKeyPress={e => e.key === 'Enter' && addItem('successCriteria', criteriaInput, setCriteriaInput)}
          />
          <button onClick={() => addItem('successCriteria', criteriaInput, setCriteriaInput)}>
            <AddIcon fontSize="small" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ ROLE PERMISSIONS DISPLAY ============
const ROLE_PERMISSIONS = {
  [PROJECT_ROLES.BA]: {
    permissions: ['create', 'edit', 'delete', 'approve', 'comment', 'view'],
    description: 'Full access to all project features including deletion',
    color: '#8b5cf6',
  },
  [PROJECT_ROLES.PO]: {
    permissions: ['create', 'edit', 'approve', 'comment', 'view'],
    description: 'Can create, edit, and approve requirements',
    color: '#3b82f6',
  },
  [PROJECT_ROLES.STAKEHOLDER]: {
    permissions: ['approve', 'comment', 'view'],
    description: 'Can approve and comment on requirements',
    color: '#f59e0b',
  },
  [PROJECT_ROLES.VIEWER]: {
    permissions: ['view'],
    description: 'Read-only access to all content',
    color: '#6b7280',
  },
};

function RolePermissionPreview({ role }) {
  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) return null;

  const allPermissions = ['create', 'edit', 'delete', 'approve', 'comment', 'view'];

  return (
    <div className="role-permission-preview">
      <p className="role-description">{roleConfig.description}</p>
      <div className="permissions-grid">
        {allPermissions.map(perm => (
          <div
            key={perm}
            className={`permission-item ${roleConfig.permissions.includes(perm) ? 'granted' : 'denied'}`}
          >
            <span className="permission-indicator">
              {roleConfig.permissions.includes(perm) ? '✓' : '×'}
            </span>
            <span className="permission-name">{perm}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ PROJECT MEMBERS PANEL ============
export function ProjectMembersPanel({ project, onAddMember, onRemoveMember, onUpdateMember }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({ userId: '', role: PROJECT_ROLES.VIEWER });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRole, setSelectedRole] = useState(PROJECT_ROLES.VIEWER);
  const [hoveredRole, setHoveredRole] = useState(null);

  if (!project) return null;

  // Search for users (simulated - in real app would call API)
  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Try to fetch from API
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        // Filter out existing members
        const existingUserIds = (project.members || []).map(m => m.userId);
        const filtered = data.filter(u => !existingUserIds.includes(u.username));
        setSearchResults(filtered.slice(0, 5));
      } else {
        // Fallback: create a suggestion from the query
        setSearchResults([{ username: query, email: query }]);
      }
    } catch (err) {
      // Fallback: create a suggestion from the query
      setSearchResults([{ username: query, email: query }]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = (userId) => {
    if (!userId.trim()) return;
    onAddMember(project.id, userId, selectedRole);
    setNewMember({ userId: '', role: PROJECT_ROLES.VIEWER });
    setSearchQuery('');
    setSearchResults([]);
    setShowAddForm(false);
  };

  const getRoleBadgeClass = (role) => {
    const roleKey = role.toLowerCase().replace(/\s+/g, '-');
    return `role-${roleKey}`;
  };

  const getRoleColor = (role) => {
    return ROLE_PERMISSIONS[role]?.color || '#6b7280';
  };

  return (
    <div className="ba-members-panel enhanced">
      {/* Header */}
      <div className="panel-header">
        <div className="header-left">
          <h4>Project Team</h4>
          <span className="member-count">{(project.members || []).length} members</span>
        </div>
        <button
          className={`panel-action-btn ${showAddForm ? 'active' : ''}`}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <PersonAddIcon fontSize="small" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Add Member Form */}
      {showAddForm && (
        <div className="add-member-section">
          <div className="add-member-form enhanced">
            <div className="search-input-wrapper">
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearchUsers(e.target.value)}
                placeholder="Search by username or email..."
                autoFocus
              />
              {isSearching && <span className="search-spinner">⟳</span>}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((user, i) => (
                  <button
                    key={i}
                    className="search-result-item"
                    onClick={() => handleAddMember(user.username)}
                  >
                    <div className="user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <span className="user-name">{user.username}</span>
                      {user.email && <span className="user-email">{user.email}</span>}
                    </div>
                    <span className="add-indicator">+ Add</span>
                  </button>
                ))}
              </div>
            )}

            {/* Role Selector */}
            <div className="role-selector">
              <label>Select Role:</label>
              <div className="role-options">
                {Object.entries(PROJECT_ROLES).map(([key, value]) => (
                  <button
                    key={key}
                    className={`role-option ${selectedRole === value ? 'selected' : ''}`}
                    onClick={() => setSelectedRole(value)}
                    onMouseEnter={() => setHoveredRole(value)}
                    onMouseLeave={() => setHoveredRole(null)}
                    style={{
                      borderColor: selectedRole === value ? getRoleColor(value) : 'transparent',
                      backgroundColor: selectedRole === value ? `${getRoleColor(value)}15` : 'transparent',
                    }}
                  >
                    <span
                      className="role-indicator"
                      style={{ backgroundColor: getRoleColor(value) }}
                    />
                    <span className="role-name">{value}</span>
                  </button>
                ))}
              </div>

              {/* Permission Preview */}
              <RolePermissionPreview role={hoveredRole || selectedRole} />
            </div>

            {/* Manual Add */}
            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="manual-add">
                <p>No users found. Add by username:</p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleAddMember(searchQuery)}
                >
                  Add "{searchQuery}" as {selectedRole}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="members-list enhanced">
        {(project.members || []).length === 0 ? (
          <div className="members-empty">
            <PersonAddIcon style={{ fontSize: 40, opacity: 0.3 }} />
            <p>No team members yet</p>
            <button className="btn btn-sm btn-primary" onClick={() => setShowAddForm(true)}>
              Add First Member
            </button>
          </div>
        ) : (
          (project.members || []).map((member, i) => {
            const isOwner = member.userId === project.createdBy;
            const roleColor = getRoleColor(member.role);

            return (
              <div key={i} className={`member-item enhanced ${isOwner ? 'owner' : ''}`}>
                <div className="member-avatar" style={{ backgroundColor: roleColor }}>
                  {member.userId.charAt(0).toUpperCase()}
                </div>

                <div className="member-info">
                  <div className="member-name-row">
                    <span className="member-name">{member.userId}</span>
                    {isOwner && <span className="owner-badge">Owner</span>}
                  </div>
                  <div className="member-meta">
                    <span
                      className={`member-role-badge ${getRoleBadgeClass(member.role)}`}
                      style={{ backgroundColor: `${roleColor}20`, color: roleColor }}
                    >
                      {member.role}
                    </span>
                    {member.addedAt && (
                      <span className="member-added">
                        Added {new Date(member.addedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="member-actions">
                  {!isOwner && (
                    <>
                      <select
                        value={member.role}
                        onChange={e => onUpdateMember(project.id, member.userId, e.target.value)}
                        className="role-select"
                        style={{ borderColor: roleColor }}
                      >
                        {Object.entries(PROJECT_ROLES).map(([key, value]) => (
                          <option key={key} value={value}>{value}</option>
                        ))}
                      </select>
                      <button
                        className="remove-btn"
                        onClick={() => onRemoveMember(project.id, member.userId)}
                        title="Remove member"
                      >
                        <CloseIcon fontSize="small" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Roles Legend */}
      <div className="roles-legend">
        <h5>Role Permissions</h5>
        <div className="legend-grid">
          {Object.entries(PROJECT_ROLES).map(([key, value]) => {
            const config = ROLE_PERMISSIONS[value];
            return (
              <div key={key} className="legend-item">
                <span
                  className="legend-color"
                  style={{ backgroundColor: config.color }}
                />
                <span className="legend-role">{value}</span>
                <span className="legend-perms">
                  {config.permissions.join(', ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ PROJECT DASHBOARD ============
export function ProjectDashboard({ project, onClose }) {
  if (!project) return null;

  const stats = project.stats || {
    requirementsCount: 0,
    ticketsCount: 0,
    pendingApprovals: 0,
    linkedModels: 0,
  };

  const StatusIcon = STATUS_CONFIG[project.status]?.icon || FolderIcon;

  return (
    <div className="ba-project-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <StatusIcon
            style={{ color: STATUS_CONFIG[project.status]?.color, fontSize: 28 }}
          />
          <div>
            <h2>{project.name}</h2>
            <span className="dashboard-status">{project.status}</span>
          </div>
        </div>
        <button className="dashboard-close" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <AssignmentIcon className="stat-icon requirements" />
          <div className="stat-content">
            <span className="stat-value">{stats.requirementsCount}</span>
            <span className="stat-label">Requirements</span>
          </div>
        </div>
        <div className="stat-card">
          <ConfirmationNumberIcon className="stat-icon tickets" />
          <div className="stat-content">
            <span className="stat-value">{stats.ticketsCount}</span>
            <span className="stat-label">Tickets</span>
          </div>
        </div>
        <div className="stat-card">
          <ApprovalIcon className="stat-icon approvals" />
          <div className="stat-content">
            <span className="stat-value">{stats.pendingApprovals}</span>
            <span className="stat-label">Pending Approvals</span>
          </div>
        </div>
        <div className="stat-card">
          <AccountTreeIcon className="stat-icon models" />
          <div className="stat-content">
            <span className="stat-value">{stats.linkedModels}</span>
            <span className="stat-label">Linked Models</span>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h4>Description</h4>
          <p>{project.description || 'No description provided.'}</p>
        </div>

        <div className="dashboard-section">
          <h4>Business Context</h4>
          <p>{project.businessContext || 'No business context provided.'}</p>
        </div>

        <div className="dashboard-section">
          <h4>Timeline</h4>
          <div className="timeline-info">
            <span>Start: {project.startDate || 'Not set'}</span>
            <span>End: {project.endDate || 'Not set'}</span>
          </div>
        </div>

        {project.objectives?.length > 0 && (
          <div className="dashboard-section">
            <h4>Objectives</h4>
            <ul className="objective-list">
              {project.objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>
        )}

        {project.successCriteria?.length > 0 && (
          <div className="dashboard-section">
            <h4>Success Criteria</h4>
            <ul className="criteria-list">
              {project.successCriteria.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="dashboard-section scope-section">
          <div className="scope-column">
            <h4>In Scope</h4>
            {project.inScope?.length > 0 ? (
              <ul>
                {project.inScope.map((item, i) => (
                  <li key={i} className="in-scope">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="empty-text">No items defined</p>
            )}
          </div>
          <div className="scope-column">
            <h4>Out of Scope</h4>
            {project.outOfScope?.length > 0 ? (
              <ul>
                {project.outOfScope.map((item, i) => (
                  <li key={i} className="out-scope">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="empty-text">No items defined</p>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h4>Team ({project.members?.length || 0} members)</h4>
          <div className="team-list">
            {(project.members || []).map((member, i) => (
              <div key={i} className="team-member">
                <span className="member-name">{member.userId}</span>
                <span className={`member-role role-${member.role.toLowerCase().replace(' ', '-')}`}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ PROJECT SETTINGS MODAL ============
export function ProjectSettingsModal({ project, onClose, onUpdate, onDelete }) {
  const { updateProject, deleteProject, addProjectMember, removeProjectMember, updateProjectMember } = useProjects();
  const [activeTab, setActiveTab] = useState('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!project) return null;

  const handleUpdate = (updates) => {
    updateProject(project.id, updates);
  };

  const handleDelete = () => {
    deleteProject(project.id);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal ba-settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Project Settings</h3>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <div className="settings-tabs">
          <button
            className={`tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`tab ${activeTab === 'scoping' ? 'active' : ''}`}
            onClick={() => setActiveTab('scoping')}
          >
            Scoping
          </button>
          <button
            className={`tab ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Team
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <ProjectCreationModal
              editProject={project}
              onClose={onClose}
              onCreate={(data) => {
                handleUpdate(data);
                onClose();
              }}
            />
          )}

          {activeTab === 'scoping' && (
            <ProjectScopingPanel
              project={project}
              onUpdate={handleUpdate}
            />
          )}

          {activeTab === 'team' && (
            <ProjectMembersPanel
              project={project}
              onAddMember={addProjectMember}
              onRemoveMember={removeProjectMember}
              onUpdateMember={updateProjectMember}
            />
          )}
        </div>

        <div className="settings-footer">
          <button
            className="btn btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <DeleteIcon fontSize="small" /> Delete Project
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm">
              <h4>Delete Project?</h4>
              <p>This will permanently delete "{project.name}" and all associated data.</p>
              <div className="confirm-actions">
                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default {
  ProjectSelector,
  ProjectCreationModal,
  ProjectScopingPanel,
  ProjectMembersPanel,
  ProjectDashboard,
  ProjectSettingsModal,
};
