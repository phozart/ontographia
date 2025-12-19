// components/AboutModal.js
// About modal with product information

import { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';

export default function AboutModal({ open, onClose }) {
  const [version, setVersion] = useState('1.0.0');

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="about-modal-overlay" onClick={onClose}>
      <div className="about-modal" onClick={e => e.stopPropagation()}>
        <button className="about-modal-close" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </button>

        <div className="about-modal-header">
          <div className="about-logo">
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
              <circle cx="16" cy="10" r="3" fill="currentColor" />
              <circle cx="10" cy="20" r="3" fill="currentColor" />
              <circle cx="22" cy="20" r="3" fill="currentColor" />
              <line x1="16" y1="13" x2="10" y2="17" stroke="currentColor" strokeWidth="1.5" />
              <line x1="16" y1="13" x2="22" y2="17" stroke="currentColor" strokeWidth="1.5" />
              <line x1="10" y1="20" x2="22" y2="20" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <h2>Ontographia</h2>
          <p className="about-version">Version {version}</p>
        </div>

        <div className="about-modal-body">
          <p className="about-description">
            A comprehensive knowledge management and reasoning platform for
            enterprise architecture, business analysis, system dynamics, and
            philosophical inquiry.
          </p>

          <div className="about-features">
            <h4>Key Capabilities</h4>
            <ul>
              <li>Knowledge Graph Management</li>
              <li>Enterprise Architecture (ArchiMate)</li>
              <li>Business Process Modeling</li>
              <li>Requirements Engineering</li>
              <li>System Dynamics & Causal Loop Diagrams</li>
              <li>Negotiation & Persuasion Analysis</li>
              <li>Mental Models & Sensemaking</li>
              <li>Philosophical & Critical Thinking</li>
            </ul>
          </div>

          <div className="about-tech">
            <h4>Built With</h4>
            <div className="about-tech-tags">
              <span>Next.js</span>
              <span>React</span>
              <span>PostgreSQL</span>
              <span>D3.js</span>
              <span>Material UI</span>
            </div>
          </div>
        </div>

        <div className="about-modal-footer">
          <div className="about-creator">
            Created by <strong>Phozart</strong>
          </div>
          <p className="about-copyright">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
