// components/spaces/blueprint/ai-design/steps/SelectStep.js
// Step 6: Select which sections to import

import { useState, useEffect, useMemo } from 'react';
import { detectAvailableSections, IMPORT_SECTIONS } from '../../../../../lib/blueprint/ai-import-schema';
import { createImportPreview } from '../../../../../lib/blueprint/ai-import-transformer';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import InfoIcon from '@mui/icons-material/Info';

export default function SelectStep({ parsedData, selectedSections, onSelectionChange, onValidate }) {
  const [availableSections, setAvailableSections] = useState({});

  useEffect(() => {
    if (parsedData) {
      const available = detectAvailableSections(parsedData);
      setAvailableSections(available);

      // Initialize selection with all available sections if not already set
      if (!selectedSections || selectedSections.length === 0) {
        const defaultSelected = Object.entries(available)
          .filter(([, isAvailable]) => isAvailable)
          .map(([sectionId]) => sectionId);
        onSelectionChange(defaultSelected);
      }
    }
  }, [parsedData, selectedSections, onSelectionChange]);

  // Validate: at least one section must be selected
  useEffect(() => {
    const hasSelection = selectedSections && selectedSections.length > 0;
    onValidate(hasSelection);
  }, [selectedSections, onValidate]);

  const toggleSection = (sectionId) => {
    const current = selectedSections || [];
    if (current.includes(sectionId)) {
      onSelectionChange(current.filter(id => id !== sectionId));
    } else {
      onSelectionChange([...current, sectionId]);
    }
  };

  const selectAll = () => {
    const allAvailable = Object.entries(availableSections)
      .filter(([, isAvailable]) => isAvailable)
      .map(([sectionId]) => sectionId);
    onSelectionChange(allAvailable);
  };

  const selectNone = () => {
    onSelectionChange([]);
  };

  // Generate preview of what will be imported
  const preview = useMemo(() => {
    if (!parsedData || !selectedSections?.length) return null;
    return createImportPreview(parsedData, selectedSections);
  }, [parsedData, selectedSections]);

  const availableCount = Object.values(availableSections).filter(Boolean).length;
  const selectedCount = selectedSections?.length || 0;

  if (!parsedData) {
    return (
      <div className="ai-wizard-step select-step">
        <div className="step-intro">
          <p>No data to import. Please go back and import JSON first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-wizard-step select-step">
      <div className="step-intro">
        <p>
          Choose which sections to import into your initiative. You can import all sections
          or select specific ones. Existing data will be merged with imported data.
        </p>
      </div>

      <div className="selection-actions">
        <button className="action-link" onClick={selectAll}>
          Select All ({availableCount})
        </button>
        <span className="action-divider">|</span>
        <button className="action-link" onClick={selectNone}>
          Select None
        </button>
        <span className="selection-count">
          {selectedCount} of {availableCount} selected
        </span>
      </div>

      <div className="section-checkboxes">
        {Object.entries(IMPORT_SECTIONS).map(([sectionId, sectionInfo]) => {
          const isAvailable = availableSections[sectionId];
          const isSelected = selectedSections?.includes(sectionId);

          return (
            <label
              key={sectionId}
              className={`section-checkbox ${isAvailable ? 'available' : 'unavailable'} ${isSelected ? 'selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSection(sectionId)}
                disabled={!isAvailable}
              />
              <span className="checkbox-icon">
                {isSelected ? (
                  <CheckBoxIcon fontSize="small" />
                ) : (
                  <CheckBoxOutlineBlankIcon fontSize="small" />
                )}
              </span>
              <span className="checkbox-content">
                <span className="checkbox-label">
                  {sectionInfo.name}
                  {sectionInfo.required && <span className="required-badge">Required</span>}
                </span>
                <span className="checkbox-description">{sectionInfo.description}</span>
              </span>
              {!isAvailable && <span className="no-data-indicator">No data</span>}
            </label>
          );
        })}
      </div>

      {/* Import Preview */}
      {preview && preview.sections.length > 0 && (
        <div className="import-preview">
          <h4>Import Preview</h4>
          <div className="preview-summary">
            <span className="summary-total">{preview.totalItems} items</span>
            <span className="summary-sections">{preview.sections.length} sections</span>
          </div>
          <div className="preview-details">
            {preview.sections.map(section => (
              <div key={section.id} className="preview-section-item">
                <span className="preview-section-name">{section.name}</span>
                <ul className="preview-section-items">
                  {section.items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedCount === 0 && (
        <div className="no-selection-warning">
          <InfoIcon fontSize="small" />
          <span>Select at least one section to import</span>
        </div>
      )}

      <div className="step-tip">
        <strong>Note:</strong> Importing will add new data to your initiative. Existing data
        in matching fields will be updated. This action cannot be undone, but you can manually
        edit any imported values afterward.
      </div>
    </div>
  );
}
