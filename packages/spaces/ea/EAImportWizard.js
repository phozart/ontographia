// components/ea/EAImportWizard.js
// Import wizard for bringing artefacts from other modules into EA
// Creates linked references that sync with source artefacts

import { useState, useEffect, useCallback } from 'react';
import { useEA } from './EAContext';
import { useDomains } from '../../DomainContext';
import { useAuth } from '../../AuthContext';
import styles from './ea.module.css';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import FolderIcon from '@mui/icons-material/Folder';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Source module definitions
const IMPORT_SOURCES = [
  {
    id: 'capabilities',
    name: 'Capabilities',
    icon: AccountTreeIcon,
    color: '#6366f1',
    description: 'Import capabilities and value streams from Capability Studio',
    types: [
      { source: 'cap_capability', target: 'capability', label: 'Capability' },
      { source: 'cap_value_stream', target: 'valueStream', label: 'Value Stream' },
      { source: 'cap_capability_group', target: 'capability', label: 'Capability Group' }
    ],
    apiPath: '/api/artefacts'
  },
  {
    id: 'services',
    name: 'Business Services',
    icon: MiscellaneousServicesIcon,
    color: '#3b82f6',
    description: 'Import services from Business Service Management',
    types: [
      { source: 'bsm_service', target: 'businessService', label: 'Business Service' },
      { source: 'bsm_service_category', target: 'businessFunction', label: 'Service Category' }
    ],
    apiPath: '/api/artefacts'
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: FolderIcon,
    color: '#10b981',
    description: 'Import project initiatives as work packages',
    types: [
      { source: 'cap_initiative', target: 'workPackage', label: 'Initiative' }
    ],
    apiPath: '/api/artefacts'
  }
];

// EA target type labels
const EA_TYPE_LABELS = {
  capability: 'Capability (Strategy)',
  valueStream: 'Value Stream (Strategy)',
  businessService: 'Business Service',
  businessFunction: 'Business Function',
  workPackage: 'Work Package (Implementation)'
};

export default function EAImportWizard({ isOpen, onClose }) {
  const { createElement, elements } = useEA();
  const { activeDomain } = useDomains();
  const { user, role } = useAuth();

  // Wizard state
  const [step, setStep] = useState(1); // 1: Select source, 2: Select items, 3: Confirm
  const [selectedSource, setSelectedSource] = useState(null);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [importResults, setImportResults] = useState(null);

  // Auth headers
  const authHeaders = {
    'x-user': user || '',
    'x-role': role || ''
  };

  // Fetch available items when source is selected
  const fetchItems = useCallback(async (source) => {
    if (!activeDomain || !source) return;

    setLoading(true);
    setError(null);

    try {
      // Get all source types for this import source
      const sourceTypes = source.types.map(t => t.source);

      const params = new URLSearchParams({
        domainId: activeDomain,
        types: sourceTypes.join(',')
      });

      const res = await fetch(`${source.apiPath}?${params}`, {
        headers: authHeaders
      });

      if (!res.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await res.json();
      const items = data.artefacts || data || [];

      // Filter out items that are already imported (linked)
      const existingLinks = new Set(
        elements
          .filter(el => el.properties?.linkedArtefactId)
          .map(el => el.properties.linkedArtefactId)
      );

      const availableForImport = items.filter(item => !existingLinks.has(item.id));

      setAvailableItems(availableForImport);
    } catch (err) {
      console.error('Error fetching items for import:', err);
      setError(err.message);
      setAvailableItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeDomain, authHeaders, elements]);

  // When source is selected, fetch items
  useEffect(() => {
    if (selectedSource && step === 2) {
      fetchItems(selectedSource);
    }
  }, [selectedSource, step, fetchItems]);

  // Toggle item selection
  const toggleItem = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  // Select all items
  const selectAll = () => {
    setSelectedItems([...availableItems]);
  };

  // Deselect all items
  const deselectAll = () => {
    setSelectedItems([]);
  };

  // Get target EA type for a source type
  const getTargetType = (sourceType) => {
    if (!selectedSource) return null;
    const mapping = selectedSource.types.find(t => t.source === sourceType);
    return mapping?.target || 'businessCapability';
  };

  // Import selected items
  const handleImport = async () => {
    if (selectedItems.length === 0) return;

    setImporting(true);
    setError(null);

    const results = {
      success: [],
      failed: []
    };

    for (const item of selectedItems) {
      try {
        const targetType = getTargetType(item.artefact_type);

        // Create EA element with link to source
        const element = {
          element_type: targetType,
          name: item.name,
          description: item.description || '',
          properties: {
            linkedArtefactId: item.id,
            linkedArtefactType: item.artefact_type,
            linkedModule: selectedSource.id,
            importedAt: new Date().toISOString(),
            // Copy over relevant properties
            ...(item.custom_fields || {})
          }
        };

        const created = await createElement(element);
        if (created) {
          results.success.push({ source: item, created });
        } else {
          results.failed.push({ source: item, error: 'Failed to create element' });
        }
      } catch (err) {
        console.error('Error importing item:', err);
        results.failed.push({ source: item, error: err.message });
      }
    }

    setImportResults(results);
    setImporting(false);

    // Move to results step if there were any imports
    if (results.success.length > 0) {
      setStep(4);
    }
  };

  // Reset wizard
  const handleReset = () => {
    setStep(1);
    setSelectedSource(null);
    setAvailableItems([]);
    setSelectedItems([]);
    setImportResults(null);
    setError(null);
  };

  // Close wizard
  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.importWizardOverlay}>
      <div className={styles.importWizard}>
        {/* Header */}
        <div className={styles.importWizardHeader}>
          <h2>Import from Other Modules</h2>
          <button className={styles.closeBtn} onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Progress */}
        <div className={styles.importProgress}>
          <div className={`${styles.progressStep} ${step >= 1 ? styles.active : ''} ${step > 1 ? styles.completed : ''}`}>
            <span className={styles.progressNumber}>1</span>
            <span className={styles.progressLabel}>Source</span>
          </div>
          <div className={styles.progressLine} />
          <div className={`${styles.progressStep} ${step >= 2 ? styles.active : ''} ${step > 2 ? styles.completed : ''}`}>
            <span className={styles.progressNumber}>2</span>
            <span className={styles.progressLabel}>Select</span>
          </div>
          <div className={styles.progressLine} />
          <div className={`${styles.progressStep} ${step >= 3 ? styles.active : ''} ${step > 3 ? styles.completed : ''}`}>
            <span className={styles.progressNumber}>3</span>
            <span className={styles.progressLabel}>Confirm</span>
          </div>
          <div className={styles.progressLine} />
          <div className={`${styles.progressStep} ${step >= 4 ? styles.active : ''}`}>
            <span className={styles.progressNumber}>4</span>
            <span className={styles.progressLabel}>Done</span>
          </div>
        </div>

        {/* Content */}
        <div className={styles.importWizardContent}>
          {/* Step 1: Select Source */}
          {step === 1 && (
            <div className={styles.sourceSelection}>
              <p className={styles.stepDescription}>
                Choose where to import elements from. Imported elements will be linked to their source and stay in sync.
              </p>
              <div className={styles.sourceGrid}>
                {IMPORT_SOURCES.map(source => {
                  const SourceIcon = source.icon;
                  const isSelected = selectedSource?.id === source.id;
                  return (
                    <button
                      key={source.id}
                      className={`${styles.sourceCard} ${isSelected ? styles.selected : ''}`}
                      onClick={() => setSelectedSource(source)}
                      style={{ '--source-color': source.color }}
                    >
                      <div className={styles.sourceIcon} style={{ backgroundColor: `${source.color}15`, color: source.color }}>
                        <SourceIcon />
                      </div>
                      <div className={styles.sourceInfo}>
                        <strong>{source.name}</strong>
                        <p>{source.description}</p>
                        <div className={styles.sourceTypes}>
                          {source.types.map(t => (
                            <span key={t.source} className={styles.typeTag}>{t.label}</span>
                          ))}
                        </div>
                      </div>
                      {isSelected && <CheckCircleIcon className={styles.selectedCheck} style={{ color: source.color }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Select Items */}
          {step === 2 && (
            <div className={styles.itemSelection}>
              <div className={styles.itemSelectionHeader}>
                <p className={styles.stepDescription}>
                  Select items to import as linked EA elements.
                </p>
                <div className={styles.selectionActions}>
                  <button onClick={selectAll} disabled={loading}>Select All</button>
                  <button onClick={deselectAll} disabled={loading}>Deselect All</button>
                  <span className={styles.selectionCount}>
                    {selectedItems.length} of {availableItems.length} selected
                  </span>
                </div>
              </div>

              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner} />
                  <p>Loading available items...</p>
                </div>
              ) : error ? (
                <div className={styles.errorState}>
                  <p>{error}</p>
                  <button onClick={() => fetchItems(selectedSource)}>Retry</button>
                </div>
              ) : availableItems.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No items available to import, or all items have already been imported.</p>
                </div>
              ) : (
                <div className={styles.itemList}>
                  {availableItems.map(item => {
                    const isSelected = selectedItems.some(i => i.id === item.id);
                    const mapping = selectedSource?.types.find(t => t.source === item.artefact_type);
                    return (
                      <div
                        key={item.id}
                        className={`${styles.itemRow} ${isSelected ? styles.selected : ''}`}
                        onClick={() => toggleItem(item)}
                      >
                        <div className={styles.itemCheckbox}>
                          {isSelected ? (
                            <CheckBoxIcon style={{ color: selectedSource?.color }} />
                          ) : (
                            <CheckBoxOutlineBlankIcon />
                          )}
                        </div>
                        <div className={styles.itemInfo}>
                          <strong>{item.name}</strong>
                          {item.description && <p>{item.description}</p>}
                        </div>
                        <div className={styles.itemMapping}>
                          <span className={styles.sourceType}>{mapping?.label}</span>
                          <ArrowForwardIcon fontSize="small" />
                          <span className={styles.targetType}>{EA_TYPE_LABELS[mapping?.target]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className={styles.confirmStep}>
              <p className={styles.stepDescription}>
                Review and confirm your import. {selectedItems.length} element{selectedItems.length !== 1 ? 's' : ''} will be created with links to their source.
              </p>

              <div className={styles.confirmSummary}>
                <div className={styles.confirmIcon} style={{ backgroundColor: `${selectedSource?.color}15`, color: selectedSource?.color }}>
                  <LinkIcon />
                </div>
                <div className={styles.confirmInfo}>
                  <h3>Linked Import</h3>
                  <p>
                    These elements will be linked to their source in {selectedSource?.name}.
                    Changes to the source will be reflected in EA.
                  </p>
                </div>
              </div>

              <div className={styles.confirmList}>
                {selectedItems.slice(0, 10).map(item => {
                  const mapping = selectedSource?.types.find(t => t.source === item.artefact_type);
                  return (
                    <div key={item.id} className={styles.confirmItem}>
                      <span className={styles.confirmItemName}>{item.name}</span>
                      <span className={styles.confirmItemType}>→ {EA_TYPE_LABELS[mapping?.target]}</span>
                    </div>
                  );
                })}
                {selectedItems.length > 10 && (
                  <div className={styles.confirmMore}>
                    ... and {selectedItems.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 4 && importResults && (
            <div className={styles.doneStep}>
              <div className={styles.doneIcon}>
                <CheckCircleIcon style={{ fontSize: 48, color: '#10b981' }} />
              </div>
              <h3>Import Complete</h3>
              <p>
                Successfully imported {importResults.success.length} element{importResults.success.length !== 1 ? 's' : ''}.
                {importResults.failed.length > 0 && ` ${importResults.failed.length} failed.`}
              </p>

              {importResults.success.length > 0 && (
                <div className={styles.importedList}>
                  <h4>Imported Elements:</h4>
                  {importResults.success.slice(0, 5).map(({ source, created }) => (
                    <div key={created.id} className={styles.importedItem}>
                      <LinkIcon fontSize="small" style={{ color: selectedSource?.color }} />
                      <span>{source.name}</span>
                    </div>
                  ))}
                  {importResults.success.length > 5 && (
                    <div className={styles.importedMore}>
                      ... and {importResults.success.length - 5} more
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.importWizardFooter}>
          {step === 1 && (
            <>
              <button className={styles.cancelBtn} onClick={handleClose}>Cancel</button>
              <button
                className={styles.nextBtn}
                onClick={() => setStep(2)}
                disabled={!selectedSource}
              >
                Next <ArrowForwardIcon fontSize="small" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button className={styles.backBtn} onClick={() => setStep(1)}>
                <ArrowBackIcon fontSize="small" /> Back
              </button>
              <button
                className={styles.nextBtn}
                onClick={() => setStep(3)}
                disabled={selectedItems.length === 0}
              >
                Next <ArrowForwardIcon fontSize="small" />
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button className={styles.backBtn} onClick={() => setStep(2)} disabled={importing}>
                <ArrowBackIcon fontSize="small" /> Back
              </button>
              <button
                className={styles.importBtn}
                onClick={handleImport}
                disabled={importing}
              >
                {importing ? 'Importing...' : `Import ${selectedItems.length} Element${selectedItems.length !== 1 ? 's' : ''}`}
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <button className={styles.backBtn} onClick={handleReset}>
                Import More
              </button>
              <button className={styles.doneBtn} onClick={handleClose}>
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
