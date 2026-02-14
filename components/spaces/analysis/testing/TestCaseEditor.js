// components/spaces/analysis/testing/TestCaseEditor.js
// Structured test case management with step-by-step definitions and execution mode.

import { useState, useMemo, useCallback } from 'react';
import { useAnalysis } from '../AnalysisContext';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import BlockIcon from '@mui/icons-material/Block';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NotesIcon from '@mui/icons-material/Notes';
import HistoryIcon from '@mui/icons-material/History';

// Status configuration
const TEST_STATUS = {
  'Not Run': { color: '#9C9A94', icon: RadioButtonUncheckedIcon, label: 'Not Run' },
  Pass: { color: '#5B8A6A', icon: CheckCircleIcon, label: 'Pass' },
  Fail: { color: '#A54D4D', icon: CancelIcon, label: 'Fail' },
  Blocked: { color: '#C9A227', icon: BlockIcon, label: 'Blocked' },
  Skipped: { color: '#9C9A94', icon: RadioButtonUncheckedIcon, label: 'Skipped' },
};

const PRIORITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

// ============ STEP PASS/FAIL TOGGLE ============
function StepResultToggle({ value, onChange, disabled }) {
  return (
    <div className="step-result-toggle">
      <button
        type="button"
        className={`toggle-btn pass ${value === 'Pass' ? 'active' : ''}`}
        onClick={() => !disabled && onChange(value === 'Pass' ? null : 'Pass')}
        disabled={disabled}
        title="Pass"
      >
        <CheckCircleIcon fontSize="small" />
      </button>
      <button
        type="button"
        className={`toggle-btn fail ${value === 'Fail' ? 'active' : ''}`}
        onClick={() => !disabled && onChange(value === 'Fail' ? null : 'Fail')}
        disabled={disabled}
        title="Fail"
      >
        <CancelIcon fontSize="small" />
      </button>
    </div>
  );
}

// ============ TEST CASE LIST ITEM ============
function TestCaseListItem({ testCase, isSelected, onClick }) {
  const status = testCase.metadata?.pass_fail || testCase.pass_fail || 'Not Run';
  const StatusConfig = TEST_STATUS[status] || TEST_STATUS['Not Run'];
  const StatusIcon = StatusConfig.icon;

  return (
    <div
      className={`tc-list-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(testCase)}
    >
      <StatusIcon style={{ color: StatusConfig.color, fontSize: 18 }} />
      <div className="tc-list-info">
        <span className="tc-list-ref">{testCase.display_id || testCase.reference || '---'}</span>
        <span className="tc-list-name">{testCase.name}</span>
      </div>
      <span className="tc-list-priority" data-priority={testCase.priority || testCase.metadata?.priority || 'Medium'}>
        {testCase.priority || testCase.metadata?.priority || 'Medium'}
      </span>
    </div>
  );
}

// ============ REQUIREMENT PICKER MODAL ============
function RequirementPickerModal({ requirements, linkedIds, onLink, onClose }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return requirements;
    const q = search.toLowerCase();
    return requirements.filter(r =>
      r.name?.toLowerCase().includes(q) ||
      r.display_id?.toLowerCase().includes(q)
    );
  }, [requirements, search]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="picker-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Link Requirements</h3>
          <button onClick={onClose} className="close-btn"><CloseIcon fontSize="small" /></button>
        </div>
        <div className="picker-search">
          <SearchIcon fontSize="small" />
          <input
            type="text"
            placeholder="Search requirements..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="picker-list">
          {filtered.length === 0 ? (
            <p className="picker-empty">No requirements found</p>
          ) : (
            filtered.map(req => {
              const isLinked = linkedIds.has(req.id);
              return (
                <div key={req.id} className={`picker-item ${isLinked ? 'linked' : ''}`}>
                  <div className="picker-item-info">
                    <span className="picker-ref">{req.display_id || req.reference || '---'}</span>
                    <span className="picker-name">{req.name}</span>
                    <span className="picker-type">{req.artefactType}</span>
                  </div>
                  <button
                    className={isLinked ? 'btn-linked' : 'btn-link'}
                    onClick={() => onLink(req, isLinked)}
                  >
                    {isLinked ? 'Linked' : 'Link'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ============ EXECUTION MODE ============
function ExecutionMode({ testCase, onSaveResults, onExit }) {
  const steps = testCase.metadata?.steps || [];
  const [currentStep, setCurrentStep] = useState(0);
  const [stepResults, setStepResults] = useState(
    steps.map(s => ({
      actualResult: s.actualResult || '',
      result: s.result || null,
    }))
  );

  const handleStepChange = (index, field, value) => {
    setStepResults(prev => prev.map((sr, i) =>
      i === index ? { ...sr, [field]: value } : sr
    ));
  };

  const overallResult = useMemo(() => {
    if (stepResults.length === 0) return 'Not Run';
    const allPassed = stepResults.every(s => s.result === 'Pass');
    const anyFailed = stepResults.some(s => s.result === 'Fail');
    const allCompleted = stepResults.every(s => s.result !== null);
    if (anyFailed) return 'Fail';
    if (allPassed && allCompleted) return 'Pass';
    if (!allCompleted) return 'Not Run';
    return 'Not Run';
  }, [stepResults]);

  const handleFinish = () => {
    const updatedSteps = steps.map((s, i) => ({
      ...s,
      actualResult: stepResults[i].actualResult,
      result: stepResults[i].result,
    }));
    onSaveResults(updatedSteps, overallResult);
  };

  const step = steps[currentStep];
  const stepResult = stepResults[currentStep];

  return (
    <div className="execution-mode">
      <div className="exec-header">
        <h3>Executing: {testCase.name}</h3>
        <div className="exec-progress">
          Step {currentStep + 1} of {steps.length}
        </div>
        <button className="btn-secondary btn-small" onClick={onExit}>
          Exit Execution
        </button>
      </div>

      <div className="exec-progress-bar">
        {steps.map((_, i) => {
          const sr = stepResults[i];
          let barColor = '#E2E0DB';
          if (sr.result === 'Pass') barColor = '#5B8A6A';
          if (sr.result === 'Fail') barColor = '#A54D4D';
          return (
            <div
              key={i}
              className={`exec-progress-segment ${i === currentStep ? 'current' : ''}`}
              style={{ backgroundColor: barColor }}
              onClick={() => setCurrentStep(i)}
              title={`Step ${i + 1}`}
            />
          );
        })}
      </div>

      {step && (
        <div className="exec-step-card">
          <div className="exec-step-number">Step {step.step || currentStep + 1}</div>
          <div className="exec-step-section">
            <label>Action</label>
            <p className="exec-step-text">{step.action || 'No action defined'}</p>
          </div>
          <div className="exec-step-section">
            <label>Expected Result</label>
            <p className="exec-step-text">{step.expected || 'No expected result defined'}</p>
          </div>
          <div className="exec-step-section">
            <label>Actual Result</label>
            <textarea
              value={stepResult?.actualResult || ''}
              onChange={e => handleStepChange(currentStep, 'actualResult', e.target.value)}
              placeholder="Describe what actually happened..."
              rows={3}
            />
          </div>
          <div className="exec-step-section">
            <label>Result</label>
            <StepResultToggle
              value={stepResult?.result}
              onChange={(val) => handleStepChange(currentStep, 'result', val)}
            />
          </div>
        </div>
      )}

      <div className="exec-nav">
        <button
          className="btn-secondary"
          disabled={currentStep === 0}
          onClick={() => setCurrentStep(c => c - 1)}
        >
          <ArrowBackIcon fontSize="small" />
          Previous
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            className="btn-primary"
            onClick={() => setCurrentStep(c => c + 1)}
          >
            Next
            <ArrowForwardIcon fontSize="small" />
          </button>
        ) : (
          <button className="btn-primary" onClick={handleFinish}>
            <CheckCircleIcon fontSize="small" />
            Finish Execution ({overallResult})
          </button>
        )}
      </div>

      <style jsx>{`
        .execution-mode {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;
          background: #FDFCFA;
          height: 100%;
          overflow-y: auto;
        }
        .exec-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #E2E0DB;
        }
        .exec-header h3 {
          margin: 0;
          font-size: 16px;
          color: #1F1E1B;
        }
        .exec-progress {
          font-size: 13px;
          color: #5C5A54;
        }
        .exec-progress-bar {
          display: flex;
          gap: 3px;
          height: 8px;
        }
        .exec-progress-segment {
          flex: 1;
          border-radius: 4px;
          cursor: pointer;
          transition: opacity 100ms ease-out;
        }
        .exec-progress-segment.current {
          box-shadow: 0 0 0 2px #47453F;
        }
        .exec-progress-segment:hover {
          opacity: 0.8;
        }
        .exec-step-card {
          background: #F0EFEC;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          padding: 20px;
        }
        .exec-step-number {
          font-size: 12px;
          font-weight: 600;
          color: #47453F;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }
        .exec-step-section {
          margin-bottom: 16px;
        }
        .exec-step-section label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #5C5A54;
          margin-bottom: 6px;
        }
        .exec-step-text {
          margin: 0;
          font-size: 14px;
          color: #1F1E1B;
          line-height: 1.5;
        }
        .exec-step-section textarea {
          width: 100%;
          font-size: 14px;
          padding: 8px 10px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          background: #FDFCFA;
          color: #1F1E1B;
          resize: vertical;
          font-family: inherit;
        }
        .exec-step-section textarea:focus {
          outline: none;
          border-color: #47453F;
        }
        .exec-nav {
          display: flex;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #E2E0DB;
        }
      `}</style>
    </div>
  );
}

// ============ TEST CASE DETAIL PANEL ============
function TestCaseDetail({
  testCase,
  onUpdate,
  onDelete,
  onClone,
  onRunTest,
  requirements,
  relationships,
  onLinkRequirement,
  onUnlinkRequirement
}) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(null);
  const [showReqPicker, setShowReqPicker] = useState(false);

  const status = testCase.metadata?.pass_fail || testCase.pass_fail || 'Not Run';
  const StatusConfig = TEST_STATUS[status] || TEST_STATUS['Not Run'];
  const StatusIcon = StatusConfig.icon;

  const steps = testCase.metadata?.steps || [];
  const preconditions = testCase.metadata?.preconditions || [];
  const testData = testCase.metadata?.testData || [];
  const executionHistory = testCase.metadata?.executionHistory || [];
  const notes = testCase.metadata?.notes || testCase.description || '';

  // Linked requirement IDs
  const linkedReqIds = useMemo(() => {
    const ids = new Set();
    relationships.forEach(r => {
      if (r.from === testCase.id) ids.add(r.to);
      if (r.to === testCase.id) ids.add(r.from);
    });
    return ids;
  }, [relationships, testCase.id]);

  const linkedRequirements = useMemo(() => {
    return requirements.filter(r => linkedReqIds.has(r.id));
  }, [requirements, linkedReqIds]);

  const startEdit = () => {
    setFormData({
      name: testCase.name || '',
      priority: testCase.metadata?.priority || testCase.priority || 'Medium',
      test_type: testCase.metadata?.test_type || 'Functional',
      preconditions: [...preconditions],
      steps: steps.map(s => ({ ...s })),
      testData: testData.map(d => ({ ...d })),
      notes: notes,
    });
    setEditMode(true);
  };

  const saveEdit = async () => {
    await onUpdate(testCase.id, {
      name: formData.name,
      metadata: {
        ...testCase.metadata,
        priority: formData.priority,
        test_type: formData.test_type,
        preconditions: formData.preconditions,
        steps: formData.steps,
        testData: formData.testData,
        notes: formData.notes,
      },
    });
    setEditMode(false);
    setFormData(null);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setFormData(null);
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, {
        step: prev.steps.length + 1,
        action: '',
        expected: '',
        actualResult: '',
        result: null,
      }],
    }));
  };

  const removeStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step: i + 1 })),
    }));
  };

  const updateStep = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((s, i) => i === index ? { ...s, [field]: value } : s),
    }));
  };

  const addPrecondition = () => {
    setFormData(prev => ({
      ...prev,
      preconditions: [...prev.preconditions, ''],
    }));
  };

  const removePrecondition = (index) => {
    setFormData(prev => ({
      ...prev,
      preconditions: prev.preconditions.filter((_, i) => i !== index),
    }));
  };

  const updatePrecondition = (index, value) => {
    setFormData(prev => ({
      ...prev,
      preconditions: prev.preconditions.map((p, i) => i === index ? value : p),
    }));
  };

  const addTestData = () => {
    setFormData(prev => ({
      ...prev,
      testData: [...prev.testData, { key: '', value: '' }],
    }));
  };

  const removeTestData = (index) => {
    setFormData(prev => ({
      ...prev,
      testData: prev.testData.filter((_, i) => i !== index),
    }));
  };

  const updateTestData = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      testData: prev.testData.map((d, i) => i === index ? { ...d, [field]: value } : d),
    }));
  };

  // Overall result calculation from step results
  const calculatedResult = useMemo(() => {
    if (steps.length === 0) return 'Not Run';
    const anyFailed = steps.some(s => s.result === 'Fail');
    const allPassed = steps.every(s => s.result === 'Pass');
    const allCompleted = steps.every(s => s.result !== null && s.result !== undefined);
    if (anyFailed) return 'Fail';
    if (allPassed && allCompleted) return 'Pass';
    return 'Not Run';
  }, [steps]);

  return (
    <div className="tc-detail">
      {/* Header */}
      <div className="tc-detail-header">
        <div className="tc-detail-ref">
          <StatusIcon style={{ color: StatusConfig.color, fontSize: 20 }} />
          <span className="ref-text">{testCase.display_id || testCase.reference || 'TST-???'}</span>
        </div>
        {editMode ? (
          <input
            type="text"
            className="tc-detail-name-input"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        ) : (
          <h2 className="tc-detail-name">{testCase.name}</h2>
        )}
        <div className="tc-detail-actions">
          {editMode ? (
            <>
              <button className="btn-primary btn-small" onClick={saveEdit}>Save</button>
              <button className="btn-secondary btn-small" onClick={cancelEdit}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn-secondary btn-small" onClick={startEdit}>
                <EditIcon fontSize="small" /> Edit
              </button>
              <button className="btn-secondary btn-small" onClick={() => onClone(testCase)}>
                <ContentCopyIcon fontSize="small" /> Clone
              </button>
              <button className="btn-primary btn-small" onClick={() => onRunTest(testCase)}>
                <PlayArrowIcon fontSize="small" /> Run
              </button>
              <button className="btn-danger btn-small" onClick={() => onDelete(testCase.id)}>
                <DeleteIcon fontSize="small" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status & Priority Row */}
      <div className="tc-detail-meta">
        <div className="meta-item">
          <label>Status</label>
          <span className="status-badge" style={{ backgroundColor: StatusConfig.color + '20', color: StatusConfig.color }}>
            {status}
          </span>
        </div>
        <div className="meta-item">
          <label>Calculated Result</label>
          <span className="status-badge" style={{
            backgroundColor: (TEST_STATUS[calculatedResult]?.color || '#9C9A94') + '20',
            color: TEST_STATUS[calculatedResult]?.color || '#9C9A94'
          }}>
            {calculatedResult}
          </span>
        </div>
        {editMode ? (
          <>
            <div className="meta-item">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="meta-item">
              <label>Test Type</label>
              <select
                value={formData.test_type}
                onChange={e => setFormData(prev => ({ ...prev, test_type: e.target.value }))}
              >
                <option value="Functional">Functional</option>
                <option value="Integration">Integration</option>
                <option value="Regression">Regression</option>
                <option value="Smoke">Smoke</option>
                <option value="Performance">Performance</option>
                <option value="Security">Security</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <div className="meta-item">
              <label>Priority</label>
              <span>{testCase.metadata?.priority || testCase.priority || 'Medium'}</span>
            </div>
            <div className="meta-item">
              <label>Type</label>
              <span>{testCase.metadata?.test_type || 'Functional'}</span>
            </div>
          </>
        )}
      </div>

      <div className="tc-detail-body">
        {/* Preconditions */}
        <section className="tc-section">
          <h4>Preconditions</h4>
          {editMode ? (
            <div className="preconditions-editor">
              {formData.preconditions.map((pc, i) => (
                <div key={i} className="precondition-row">
                  <span className="pc-number">{i + 1}.</span>
                  <input
                    type="text"
                    value={pc}
                    onChange={e => updatePrecondition(i, e.target.value)}
                    placeholder="Setup requirement..."
                  />
                  <button className="btn-icon" onClick={() => removePrecondition(i)}>
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              ))}
              <button className="btn-secondary btn-small" onClick={addPrecondition}>
                <AddIcon fontSize="small" /> Add Precondition
              </button>
            </div>
          ) : (
            <ol className="preconditions-list">
              {preconditions.length === 0 ? (
                <li className="empty-item">No preconditions defined</li>
              ) : (
                preconditions.map((pc, i) => <li key={i}>{pc}</li>)
              )}
            </ol>
          )}
        </section>

        {/* Test Steps */}
        <section className="tc-section">
          <h4>Test Steps</h4>
          {editMode ? (
            <div className="steps-editor">
              {formData.steps.map((step, i) => (
                <div key={i} className="step-edit-row">
                  <div className="step-num">{i + 1}</div>
                  <div className="step-fields">
                    <div className="step-field">
                      <label>Action</label>
                      <input
                        type="text"
                        value={step.action}
                        onChange={e => updateStep(i, 'action', e.target.value)}
                        placeholder="What the tester does..."
                      />
                    </div>
                    <div className="step-field">
                      <label>Expected Result</label>
                      <input
                        type="text"
                        value={step.expected}
                        onChange={e => updateStep(i, 'expected', e.target.value)}
                        placeholder="What should happen..."
                      />
                    </div>
                  </div>
                  <button className="btn-icon" onClick={() => removeStep(i)}>
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              ))}
              <button className="btn-secondary btn-small" onClick={addStep}>
                <AddIcon fontSize="small" /> Add Step
              </button>
            </div>
          ) : (
            <div className="steps-table">
              {steps.length === 0 ? (
                <p className="empty-item">No test steps defined</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Action</th>
                      <th>Expected Result</th>
                      <th>Actual Result</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {steps.map((step, i) => {
                      const stepStatus = step.result ? TEST_STATUS[step.result] : null;
                      return (
                        <tr key={i}>
                          <td className="step-num-cell">{step.step || i + 1}</td>
                          <td>{step.action}</td>
                          <td>{step.expected}</td>
                          <td className="actual-cell">{step.actualResult || '-'}</td>
                          <td>
                            {stepStatus ? (
                              <span style={{ color: stepStatus.color, fontWeight: 600 }}>
                                {step.result}
                              </span>
                            ) : (
                              <span style={{ color: '#9C9A94' }}>-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </section>

        {/* Test Data */}
        <section className="tc-section">
          <h4>Test Data</h4>
          {editMode ? (
            <div className="test-data-editor">
              {formData.testData.map((td, i) => (
                <div key={i} className="test-data-row">
                  <input
                    type="text"
                    value={td.key}
                    onChange={e => updateTestData(i, 'key', e.target.value)}
                    placeholder="Key"
                    className="td-key"
                  />
                  <input
                    type="text"
                    value={td.value}
                    onChange={e => updateTestData(i, 'value', e.target.value)}
                    placeholder="Value"
                    className="td-value"
                  />
                  <button className="btn-icon" onClick={() => removeTestData(i)}>
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              ))}
              <button className="btn-secondary btn-small" onClick={addTestData}>
                <AddIcon fontSize="small" /> Add Data
              </button>
            </div>
          ) : (
            <div className="test-data-table">
              {testData.length === 0 ? (
                <p className="empty-item">No test data defined</p>
              ) : (
                <table>
                  <thead>
                    <tr><th>Key</th><th>Value</th></tr>
                  </thead>
                  <tbody>
                    {testData.map((td, i) => (
                      <tr key={i}><td>{td.key}</td><td>{td.value}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </section>

        {/* Linked Requirements */}
        <section className="tc-section">
          <div className="section-header-row">
            <h4><LinkIcon fontSize="small" /> Linked Requirements</h4>
            <button className="btn-secondary btn-small" onClick={() => setShowReqPicker(true)}>
              <AddIcon fontSize="small" /> Link
            </button>
          </div>
          {linkedRequirements.length === 0 ? (
            <p className="empty-item">No linked requirements. Link test cases to requirements for traceability.</p>
          ) : (
            <div className="linked-reqs">
              {linkedRequirements.map(req => (
                <div key={req.id} className="linked-req-item">
                  <span className="req-ref">{req.display_id || req.reference || '---'}</span>
                  <span className="req-name">{req.name}</span>
                  <span className="req-type">{req.artefactType}</span>
                  <button className="btn-icon" onClick={() => onUnlinkRequirement(testCase.id, req.id)}>
                    <CloseIcon fontSize="small" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Notes */}
        <section className="tc-section">
          <h4><NotesIcon fontSize="small" /> Notes</h4>
          {editMode ? (
            <textarea
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional context..."
              rows={3}
              className="notes-textarea"
            />
          ) : (
            <p className="notes-text">{notes || 'No additional notes'}</p>
          )}
        </section>

        {/* Execution History */}
        <section className="tc-section">
          <h4><HistoryIcon fontSize="small" /> Execution History</h4>
          {executionHistory.length === 0 ? (
            <p className="empty-item">No execution history yet</p>
          ) : (
            <div className="exec-history">
              {executionHistory.map((run, i) => {
                const RunStatus = TEST_STATUS[run.result] || TEST_STATUS['Not Run'];
                return (
                  <div key={i} className="exec-history-row">
                    <span className="eh-date">{run.date ? new Date(run.date).toLocaleDateString() : '-'}</span>
                    <span className="eh-tester">{run.tester || 'Unknown'}</span>
                    <span className="eh-result" style={{ color: RunStatus.color }}>{run.result}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {showReqPicker && (
        <RequirementPickerModal
          requirements={requirements}
          linkedIds={linkedReqIds}
          onLink={(req, isLinked) => {
            if (isLinked) {
              onUnlinkRequirement(testCase.id, req.id);
            } else {
              onLinkRequirement(testCase.id, req.id, req.artefactType);
            }
          }}
          onClose={() => setShowReqPicker(false)}
        />
      )}
    </div>
  );
}

// ============ MAIN TEST CASE EDITOR ============
export default function TestCaseEditor() {
  const {
    getArtefactsByType,
    artefacts,
    relationships,
    createArtefact,
    updateArtefact,
    deleteArtefact,
    createRelationship,
    deleteRelationship,
  } = useAnalysis();

  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [executionTarget, setExecutionTarget] = useState(null);

  const testCases = useMemo(() => getArtefactsByType('TestCase'), [getArtefactsByType]);

  // Requirement types for linking
  const requirementTypes = ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement', 'NonFunctionalRequirement', 'UserStory', 'BusinessRule', 'UseCase'];
  const allRequirements = useMemo(() => {
    return artefacts.filter(a => requirementTypes.includes(a.artefactType));
  }, [artefacts]);

  // Filter and sort
  const filteredTestCases = useMemo(() => {
    let result = testCases;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(tc =>
        tc.name?.toLowerCase().includes(q) ||
        tc.display_id?.toLowerCase().includes(q) ||
        tc.reference?.toLowerCase().includes(q)
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter(tc => {
        const s = tc.metadata?.pass_fail || tc.pass_fail || 'Not Run';
        return s === filterStatus;
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'status': {
          const sa = a.metadata?.pass_fail || 'Not Run';
          const sb = b.metadata?.pass_fail || 'Not Run';
          return sa.localeCompare(sb);
        }
        case 'priority': {
          const pa = PRIORITY_ORDER[a.metadata?.priority || 'Medium'] ?? 2;
          const pb = PRIORITY_ORDER[b.metadata?.priority || 'Medium'] ?? 2;
          return pa - pb;
        }
        case 'lastRun': {
          const da = a.metadata?.lastRunDate || '';
          const db = b.metadata?.lastRunDate || '';
          return db.localeCompare(da);
        }
        default:
          return 0;
      }
    });

    return result;
  }, [testCases, searchQuery, filterStatus, sortBy]);

  const handleCreate = async () => {
    const newTC = await createArtefact('TestCase', {
      name: 'New Test Case',
      metadata: {
        priority: 'Medium',
        test_type: 'Functional',
        pass_fail: 'Not Run',
        preconditions: [],
        steps: [],
        testData: [],
        notes: '',
        executionHistory: [],
      },
    });
    if (newTC) setSelectedTestCase(newTC);
  };

  const handleClone = async (testCase) => {
    const cloned = await createArtefact('TestCase', {
      name: `${testCase.name} (Copy)`,
      metadata: {
        ...testCase.metadata,
        pass_fail: 'Not Run',
        executionHistory: [],
        steps: (testCase.metadata?.steps || []).map(s => ({
          ...s,
          actualResult: '',
          result: null,
        })),
      },
    });
    if (cloned) setSelectedTestCase(cloned);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this test case?')) {
      await deleteArtefact(id);
      if (selectedTestCase?.id === id) setSelectedTestCase(null);
    }
  };

  const handleRunTest = (testCase) => {
    const steps = testCase.metadata?.steps || [];
    if (steps.length === 0) {
      alert('Add test steps before running the test.');
      return;
    }
    setExecutionTarget(testCase);
  };

  const handleSaveExecutionResults = async (updatedSteps, overallResult) => {
    const history = executionTarget.metadata?.executionHistory || [];
    const newRun = {
      date: new Date().toISOString(),
      tester: 'Current User',
      result: overallResult,
    };

    await updateArtefact(executionTarget.id, {
      metadata: {
        ...executionTarget.metadata,
        steps: updatedSteps,
        pass_fail: overallResult,
        lastRunDate: new Date().toISOString(),
        executionHistory: [newRun, ...history],
      },
    });

    setExecutionTarget(null);
    // Refresh selected test case
    const updated = { ...executionTarget, metadata: { ...executionTarget.metadata, steps: updatedSteps, pass_fail: overallResult, lastRunDate: new Date().toISOString(), executionHistory: [newRun, ...history] } };
    setSelectedTestCase(updated);
  };

  const handleLinkRequirement = async (testCaseId, reqId, reqType) => {
    await createRelationship({
      from: testCaseId,
      to: reqId,
      type: 'verifies',
      fromType: 'TestCase',
      toType: reqType,
    });
  };

  const handleUnlinkRequirement = async (testCaseId, reqId) => {
    const rel = relationships.find(r =>
      (r.from === testCaseId && r.to === reqId) ||
      (r.to === testCaseId && r.from === reqId)
    );
    if (rel) await deleteRelationship(rel.id);
  };

  // Execution mode view
  if (executionTarget) {
    return (
      <ExecutionMode
        testCase={executionTarget}
        onSaveResults={handleSaveExecutionResults}
        onExit={() => setExecutionTarget(null)}
      />
    );
  }

  return (
    <div className="test-case-editor">
      {/* Left Panel: Test Case List */}
      <div className="tc-list-panel">
        <div className="tc-list-header">
          <h3>Test Cases</h3>
          <button className="btn-primary btn-small" onClick={handleCreate}>
            <AddIcon fontSize="small" /> New
          </button>
        </div>

        <div className="tc-list-filters">
          <div className="tc-search">
            <SearchIcon fontSize="small" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="tc-filter-row">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              {Object.keys(TEST_STATUS).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="priority">Priority</option>
              <option value="lastRun">Last Run</option>
            </select>
          </div>
        </div>

        <div className="tc-list-items">
          {filteredTestCases.length === 0 ? (
            <div className="tc-list-empty">
              <RadioButtonUncheckedIcon style={{ fontSize: 40, color: '#9C9A94' }} />
              <p>No test cases found</p>
              <button className="btn-primary btn-small" onClick={handleCreate}>
                Create Test Case
              </button>
            </div>
          ) : (
            filteredTestCases.map(tc => (
              <TestCaseListItem
                key={tc.id}
                testCase={tc}
                isSelected={selectedTestCase?.id === tc.id}
                onClick={setSelectedTestCase}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Panel: Test Case Detail */}
      <div className="tc-detail-panel">
        {selectedTestCase ? (
          <TestCaseDetail
            testCase={selectedTestCase}
            onUpdate={updateArtefact}
            onDelete={handleDelete}
            onClone={handleClone}
            onRunTest={handleRunTest}
            requirements={allRequirements}
            relationships={relationships}
            onLinkRequirement={handleLinkRequirement}
            onUnlinkRequirement={handleUnlinkRequirement}
          />
        ) : (
          <div className="tc-detail-empty">
            <CheckCircleIcon style={{ fontSize: 56, color: '#E2E0DB' }} />
            <h3>Create test cases to verify your requirements are implemented correctly</h3>
            <p>Select a test case from the list or create a new one.</p>
            <button className="btn-primary" onClick={handleCreate}>
              <AddIcon fontSize="small" /> Create Test Case
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .test-case-editor {
          display: flex;
          height: 100%;
          min-height: 600px;
          background: #FDFCFA;
        }

        /* Left Panel */
        .tc-list-panel {
          width: 340px;
          min-width: 280px;
          border-right: 1px solid #E2E0DB;
          display: flex;
          flex-direction: column;
          background: #F0EFEC;
        }
        .tc-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #E2E0DB;
        }
        .tc-list-header h3 {
          margin: 0;
          font-size: 15px;
          color: #1F1E1B;
        }
        .tc-list-filters {
          padding: 8px 12px;
          border-bottom: 1px solid #E2E0DB;
        }
        .tc-search {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #FDFCFA;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          padding: 4px 8px;
          margin-bottom: 8px;
        }
        .tc-search input {
          border: none;
          background: transparent;
          font-size: 13px;
          color: #1F1E1B;
          width: 100%;
          outline: none;
        }
        .tc-filter-row {
          display: flex;
          gap: 6px;
        }
        .tc-filter-row select {
          flex: 1;
          font-size: 12px;
          padding: 4px 6px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          background: #FDFCFA;
          color: #1F1E1B;
        }
        .tc-list-items {
          flex: 1;
          overflow-y: auto;
          padding: 4px 0;
        }
        .tc-list-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          cursor: pointer;
          border-left: 2px solid transparent;
          transition: background 100ms ease-out;
        }
        .tc-list-item:hover {
          background: rgba(71, 69, 63, 0.06);
        }
        .tc-list-item.selected {
          background: rgba(71, 69, 63, 0.1);
          border-left-color: #47453F;
        }
        .tc-list-info {
          flex: 1;
          min-width: 0;
        }
        .tc-list-ref {
          display: block;
          font-size: 11px;
          color: #9C9A94;
          font-family: monospace;
        }
        .tc-list-name {
          display: block;
          font-size: 13px;
          color: #1F1E1B;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tc-list-priority {
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
          background: #E2E0DB;
          color: #5C5A54;
        }
        .tc-list-priority[data-priority="Critical"] {
          background: #A54D4D20;
          color: #A54D4D;
        }
        .tc-list-priority[data-priority="High"] {
          background: #C9A22720;
          color: #C9A227;
        }
        .tc-list-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          gap: 8px;
          text-align: center;
        }
        .tc-list-empty p {
          color: #9C9A94;
          font-size: 13px;
        }

        /* Right Panel */
        .tc-detail-panel {
          flex: 1;
          overflow-y: auto;
        }
        .tc-detail {
          padding: 20px;
        }
        .tc-detail-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .tc-detail-ref {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ref-text {
          font-family: monospace;
          font-size: 13px;
          color: #5C5A54;
        }
        .tc-detail-name {
          flex: 1;
          margin: 0;
          font-size: 18px;
          color: #1F1E1B;
        }
        .tc-detail-name-input {
          flex: 1;
          font-size: 18px;
          font-weight: 600;
          padding: 4px 8px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          background: #FDFCFA;
          color: #1F1E1B;
        }
        .tc-detail-actions {
          display: flex;
          gap: 6px;
        }
        .tc-detail-meta {
          display: flex;
          gap: 20px;
          padding: 12px 0;
          border-bottom: 1px solid #E2E0DB;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .tc-detail-meta .meta-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .tc-detail-meta .meta-item label {
          font-size: 11px;
          color: #9C9A94;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .tc-detail-meta .meta-item span {
          font-size: 13px;
          color: #1F1E1B;
        }
        .tc-detail-meta select {
          font-size: 13px;
          padding: 4px 6px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          background: #FDFCFA;
          color: #1F1E1B;
        }
        .status-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Sections */
        .tc-detail-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .tc-section {
          padding: 0;
        }
        .tc-section h4 {
          font-size: 13px;
          color: #5C5A54;
          margin: 0 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .section-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .section-header-row h4 {
          margin-bottom: 0;
        }

        /* Preconditions */
        .preconditions-list {
          margin: 0;
          padding-left: 20px;
          font-size: 14px;
          color: #1F1E1B;
        }
        .preconditions-list li {
          margin-bottom: 4px;
        }
        .precondition-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .pc-number {
          font-size: 13px;
          color: #9C9A94;
          width: 20px;
        }
        .precondition-row input {
          flex: 1;
          font-size: 13px;
          padding: 4px 8px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          background: #FDFCFA;
          color: #1F1E1B;
        }

        /* Steps */
        .steps-table table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .steps-table th {
          text-align: left;
          padding: 8px 10px;
          border-bottom: 2px solid #E2E0DB;
          color: #5C5A54;
          font-size: 12px;
          font-weight: 600;
        }
        .steps-table td {
          padding: 8px 10px;
          border-bottom: 1px solid #E2E0DB;
          color: #1F1E1B;
          vertical-align: top;
        }
        .step-num-cell {
          width: 36px;
          text-align: center;
          font-weight: 600;
          color: #5C5A54;
        }
        .actual-cell {
          color: #5C5A54;
          font-style: italic;
        }
        .step-edit-row {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
          align-items: flex-start;
        }
        .step-edit-row .step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #47453F;
          color: #F0EFEC;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
          margin-top: 4px;
        }
        .step-fields {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .step-field label {
          font-size: 11px;
          color: #9C9A94;
        }
        .step-field input {
          width: 100%;
          font-size: 13px;
          padding: 4px 8px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          background: #FDFCFA;
          color: #1F1E1B;
        }

        /* Test Data */
        .test-data-table table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .test-data-table th, .test-data-table td {
          padding: 6px 10px;
          border-bottom: 1px solid #E2E0DB;
          text-align: left;
          color: #1F1E1B;
        }
        .test-data-table th {
          color: #5C5A54;
          font-size: 12px;
        }
        .test-data-row {
          display: flex;
          gap: 8px;
          margin-bottom: 6px;
        }
        .td-key {
          width: 140px;
          font-size: 13px;
          padding: 4px 8px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          background: #FDFCFA;
          color: #1F1E1B;
        }
        .td-value {
          flex: 1;
          font-size: 13px;
          padding: 4px 8px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          background: #FDFCFA;
          color: #1F1E1B;
        }

        /* Linked Requirements */
        .linked-reqs {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .linked-req-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background: #F0EFEC;
          border-radius: 4px;
          font-size: 13px;
        }
        .req-ref {
          font-family: monospace;
          font-size: 11px;
          color: #9C9A94;
        }
        .req-name {
          flex: 1;
          color: #1F1E1B;
        }
        .req-type {
          font-size: 11px;
          color: #5C5A54;
          padding: 1px 6px;
          background: #E2E0DB;
          border-radius: 4px;
        }

        /* Notes */
        .notes-textarea {
          width: 100%;
          font-size: 14px;
          padding: 8px 10px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          background: #FDFCFA;
          color: #1F1E1B;
          resize: vertical;
          font-family: inherit;
        }
        .notes-text {
          font-size: 14px;
          color: #5C5A54;
          margin: 0;
          line-height: 1.6;
        }

        /* Execution History */
        .exec-history-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 6px 0;
          border-bottom: 1px solid #E2E0DB;
          font-size: 13px;
        }
        .eh-date {
          color: #9C9A94;
          font-size: 12px;
          width: 100px;
        }
        .eh-tester {
          flex: 1;
          color: #1F1E1B;
        }
        .eh-result {
          font-weight: 600;
        }

        /* Empty States */
        .empty-item {
          color: #9C9A94;
          font-size: 13px;
          margin: 0;
          font-style: italic;
        }
        .tc-detail-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          padding: 40px;
          gap: 8px;
        }
        .tc-detail-empty h3 {
          color: #5C5A54;
          font-size: 16px;
          margin: 0;
          max-width: 400px;
        }
        .tc-detail-empty p {
          color: #9C9A94;
          font-size: 14px;
          margin: 0;
        }

        /* Step result toggle */
        .step-result-toggle {
          display: flex;
          gap: 8px;
        }
        .toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 36px;
          border: 2px solid #E2E0DB;
          border-radius: 4px;
          background: #FDFCFA;
          cursor: pointer;
          transition: all 100ms ease-out;
          color: #9C9A94;
        }
        .toggle-btn:hover {
          transform: translateY(-1px);
        }
        .toggle-btn.pass.active {
          border-color: #5B8A6A;
          background: #5B8A6A10;
          color: #5B8A6A;
        }
        .toggle-btn.fail.active {
          border-color: #A54D4D;
          background: #A54D4D10;
          color: #A54D4D;
        }
        .toggle-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Buttons */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 600;
          background: #47453F;
          color: #F0EFEC;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 100ms ease-out;
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(31, 30, 27, 0.15);
        }
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          font-size: 13px;
          background: transparent;
          color: #5C5A54;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          cursor: pointer;
          transition: all 100ms ease-out;
        }
        .btn-secondary:hover {
          background: #F0EFEC;
          transform: translateY(-1px);
        }
        .btn-danger {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          font-size: 13px;
          background: transparent;
          color: #A54D4D;
          border: 1px solid #A54D4D40;
          border-radius: 4px;
          cursor: pointer;
          transition: all 100ms ease-out;
        }
        .btn-danger:hover {
          background: #A54D4D10;
        }
        .btn-small {
          padding: 4px 8px;
          font-size: 12px;
        }
        .btn-icon {
          background: transparent;
          border: none;
          color: #9C9A94;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          transition: all 100ms ease-out;
        }
        .btn-icon:hover {
          color: #A54D4D;
          background: #A54D4D10;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(31, 30, 27, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .picker-modal {
          background: #FDFCFA;
          border-radius: 4px;
          width: 520px;
          max-height: 70vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px rgba(31, 30, 27, 0.2);
        }
        .picker-modal .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #E2E0DB;
        }
        .picker-modal .modal-header h3 {
          margin: 0;
          font-size: 15px;
        }
        .close-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #5C5A54;
          padding: 4px;
        }
        .picker-search {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-bottom: 1px solid #E2E0DB;
        }
        .picker-search input {
          border: none;
          background: transparent;
          font-size: 13px;
          width: 100%;
          outline: none;
          color: #1F1E1B;
        }
        .picker-list {
          flex: 1;
          overflow-y: auto;
          padding: 4px 0;
        }
        .picker-empty {
          text-align: center;
          color: #9C9A94;
          padding: 24px;
          font-size: 13px;
        }
        .picker-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          border-bottom: 1px solid #E2E0DB;
        }
        .picker-item.linked {
          background: #5B8A6A08;
        }
        .picker-item-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }
        .picker-ref {
          font-family: monospace;
          font-size: 11px;
          color: #9C9A94;
        }
        .picker-name {
          font-size: 13px;
          color: #1F1E1B;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .picker-type {
          font-size: 10px;
          color: #5C5A54;
          background: #E2E0DB;
          padding: 1px 6px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .btn-link {
          font-size: 12px;
          padding: 3px 10px;
          border: 1px solid #47453F;
          background: transparent;
          color: #47453F;
          border-radius: 4px;
          cursor: pointer;
          transition: all 100ms ease-out;
        }
        .btn-link:hover {
          background: #47453F;
          color: #F0EFEC;
        }
        .btn-linked {
          font-size: 12px;
          padding: 3px 10px;
          border: 1px solid #5B8A6A;
          background: #5B8A6A10;
          color: #5B8A6A;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
