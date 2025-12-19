// components/als/ALSSituationHeader.js - Situation selector header
import { useState, useRef, useEffect } from 'react';
import { useALS } from './ALSContext';
import { ALS_SITUATION_STATUS } from '../../lib/als-types';

export default function ALSSituationHeader({ onCreateNew }) {
  const { situations, activeSituation, setActiveSituation, updateSituation, deleteSituation } = useALS();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = async (status) => {
    if (activeSituation) {
      await updateSituation(activeSituation.id, { status });
    }
    setMenuOpen(false);
  };

  const handleDelete = async () => {
    if (activeSituation && confirm('Delete this learning situation? All sessions and reflections will be lost.')) {
      await deleteSituation(activeSituation.id);
    }
    setMenuOpen(false);
  };

  return (
    <div className="als-header">
      <div className="als-header-left">
        {/* Situation selector */}
        <div className="als-situation-selector" ref={dropdownRef}>
          <button
            className="als-situation-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="als-situation-icon">📚</span>
            <span className="als-situation-name">
              {activeSituation ? activeSituation.title : 'Select Learning Situation'}
            </span>
            <span className="als-situation-arrow">▼</span>
          </button>

          {dropdownOpen && (
            <div className="als-situation-dropdown">
              <div className="als-situation-dropdown-header">
                <span>Learning Situations</span>
                <button className="als-btn-small" onClick={() => { setDropdownOpen(false); onCreateNew(); }}>
                  + New
                </button>
              </div>
              <div className="als-situation-list">
                {situations.length === 0 ? (
                  <div className="als-situation-empty">
                    No learning situations yet
                  </div>
                ) : (
                  situations.map(sit => (
                    <button
                      key={sit.id}
                      className={`als-situation-item ${activeSituation?.id === sit.id ? 'active' : ''}`}
                      onClick={() => { setActiveSituation(sit); setDropdownOpen(false); }}
                    >
                      <div className="als-situation-item-main">
                        <span className="als-situation-item-title">{sit.title}</span>
                        {sit.subject && <span className="als-situation-item-subject">{sit.subject}</span>}
                      </div>
                      <div className="als-situation-item-meta">
                        <span className={`als-status als-status--${sit.status}`}>
                          {ALS_SITUATION_STATUS[sit.status]?.label || sit.status}
                        </span>
                        <span className="als-session-count">{sit.sessionCount || 0} sessions</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status badge */}
        {activeSituation && (
          <span className={`als-status-badge als-status--${activeSituation.status}`}>
            {ALS_SITUATION_STATUS[activeSituation.status]?.icon} {ALS_SITUATION_STATUS[activeSituation.status]?.label}
          </span>
        )}
      </div>

      <div className="als-header-right">
        {/* Situation actions menu */}
        {activeSituation && (
          <div className="als-menu-wrapper" ref={menuRef}>
            <button className="als-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              ⋮
            </button>
            {menuOpen && (
              <div className="als-menu-dropdown">
                <div className="als-menu-section">
                  <div className="als-menu-section-title">Change Status</div>
                  {Object.entries(ALS_SITUATION_STATUS).map(([key, val]) => (
                    <button
                      key={key}
                      className={`als-menu-item ${activeSituation.status === key ? 'active' : ''}`}
                      onClick={() => handleStatusChange(key)}
                    >
                      {val.icon} {val.label}
                    </button>
                  ))}
                </div>
                <div className="als-menu-divider" />
                <button className="als-menu-item als-menu-item--danger" onClick={handleDelete}>
                  🗑️ Delete Situation
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
