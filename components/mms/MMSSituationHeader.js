// components/mms/MMSSituationHeader.js - Situation selector and header
import { useState, useRef, useEffect } from 'react';
import { useMMS } from './MMSContext';
import { MMS_SITUATION_STATUSES } from '../../lib/mms-types';

export default function MMSSituationHeader() {
  const {
    situations,
    activeSituation,
    setActiveSituation,
    createSituation,
    updateSituation,
    deleteSituation,
    activeLens,
    setActiveLens
  } = useMMS();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const dropdownRef = useRef(null);
  const titleInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus title input when editing
  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  const handleCreateSituation = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await createSituation({
      title: newTitle.trim(),
      description: newDescription.trim() || null
    });

    setNewTitle('');
    setNewDescription('');
    setShowNewForm(false);
    setDropdownOpen(false);
  };

  const handleTitleBlur = async () => {
    setEditingTitle(false);
    if (activeSituation && titleInputRef.current) {
      const newTitle = titleInputRef.current.value.trim();
      if (newTitle && newTitle !== activeSituation.title) {
        await updateSituation(activeSituation.id, { title: newTitle });
      }
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setEditingTitle(false);
    }
  };

  const handleDelete = async () => {
    if (!activeSituation) return;
    if (confirm(`Delete "${activeSituation.title}"? This cannot be undone.`)) {
      await deleteSituation(activeSituation.id);
    }
  };

  const handleStatusChange = async (status) => {
    if (activeSituation) {
      await updateSituation(activeSituation.id, { status });
    }
  };

  return (
    <div className="mms-header">
      <div className="mms-header-left">
        {/* Situation selector */}
        <div className="mms-situation-selector" ref={dropdownRef}>
          <button
            className="mms-situation-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="mms-situation-icon">📋</span>
            <span className="mms-situation-label">
              {activeSituation ? 'Situation' : 'Select Situation'}
            </span>
            <span className="mms-dropdown-arrow">▾</span>
          </button>

          {dropdownOpen && (
            <div className="mms-situation-dropdown">
              {/* New situation form */}
              {showNewForm ? (
                <form className="mms-new-situation-form" onSubmit={handleCreateSituation}>
                  <input
                    type="text"
                    placeholder="What are you thinking about?"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    autoFocus
                  />
                  <textarea
                    placeholder="Brief context (optional)"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={2}
                  />
                  <div className="mms-form-actions">
                    <button type="button" className="mms-btn-cancel" onClick={() => setShowNewForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="mms-btn-primary" disabled={!newTitle.trim()}>
                      Create
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  className="mms-new-situation-btn"
                  onClick={() => setShowNewForm(true)}
                >
                  <span>+</span> New Situation
                </button>
              )}

              {/* Existing situations */}
              {situations.length > 0 && (
                <>
                  <div className="mms-dropdown-divider" />
                  <div className="mms-dropdown-label">Recent Situations</div>
                  <div className="mms-situation-list">
                    {situations.slice(0, 10).map(s => (
                      <button
                        key={s.id}
                        className={`mms-situation-item ${activeSituation?.id === s.id ? 'active' : ''}`}
                        onClick={() => {
                          setActiveSituation(s);
                          setDropdownOpen(false);
                        }}
                      >
                        <span
                          className="mms-status-dot"
                          style={{ backgroundColor: MMS_SITUATION_STATUSES[s.status]?.color || '#6b7280' }}
                        />
                        <span className="mms-situation-title">{s.title}</span>
                        <span className="mms-element-count">{s.elementCount || 0}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Active situation title */}
        {activeSituation && (
          <div className="mms-active-title">
            {editingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                className="mms-title-input"
                defaultValue={activeSituation.title}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
              />
            ) : (
              <h1
                className="mms-title"
                onClick={() => setEditingTitle(true)}
                title="Click to edit"
              >
                {activeSituation.title}
              </h1>
            )}
          </div>
        )}
      </div>

      <div className="mms-header-right">
        {activeSituation && (
          <>
            {/* Status selector */}
            <select
              className="mms-status-select"
              value={activeSituation.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              {Object.values(MMS_SITUATION_STATUSES).map(status => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Actions */}
            <button
              className="mms-header-action"
              onClick={handleDelete}
              title="Delete situation"
            >
              🗑️
            </button>
          </>
        )}
      </div>
    </div>
  );
}
