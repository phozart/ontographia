// components/spaces/blueprint/ai-design/AIDesignWizard.js
// AI-Assisted Initiative Design - 6-Step Wizard Modal

import { useState, useCallback, useMemo } from 'react';
import { useBlueprint } from '../BlueprintContext';
import { transformToInitiativeData } from '../../../../lib/blueprint/ai-import-transformer';

// Step components
import {
  BasicInfoStep,
  PromptStep,
  ImportStep,
  ValidateStep,
  PreviewStep,
  SelectStep,
} from './steps';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckIcon from '@mui/icons-material/Check';

// Step configuration
const STEPS = [
  { id: 'basic', name: 'Basic Info', description: 'Initiative details' },
  { id: 'prompt', name: 'AI Prompt', description: 'Copy & run prompt' },
  { id: 'import', name: 'Import', description: 'Paste AI response' },
  { id: 'validate', name: 'Validate', description: 'Check for issues' },
  { id: 'preview', name: 'Preview', description: 'Review data' },
  { id: 'select', name: 'Select', description: 'Choose sections' },
];

export default function AIDesignWizard({ isOpen, onClose, initiative = null }) {
  const { createInitiative, updateInitiative, saving } = useBlueprint();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [stepValid, setStepValid] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // Data state
  const [basicInfo, setBasicInfo] = useState({
    name: initiative?.name || '',
    problemStatement: initiative?.idea?.problem_statement || '',
    targetCustomer: initiative?.idea?.target_customer || '',
    description: initiative?.idea?.description || '',
    additionalContext: '',
    industry: '',
    geography: '',
  });
  const [jsonData, setJsonData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [selectedSections, setSelectedSections] = useState([]);

  // Reset wizard when closed/opened
  const resetWizard = useCallback(() => {
    setCurrentStep(0);
    setStepValid(false);
    setIsImporting(false);
    setImportError(null);
    setImportSuccess(false);
    setJsonData(null);
    setValidationResult(null);
    setParsedData(null);
    setSelectedSections([]);
    setBasicInfo({
      name: initiative?.name || '',
      problemStatement: initiative?.idea?.problem_statement || '',
      targetCustomer: initiative?.idea?.target_customer || '',
      description: initiative?.idea?.description || '',
      additionalContext: '',
      industry: '',
      geography: '',
    });
  }, [initiative]);

  // Handle close
  const handleClose = useCallback(() => {
    resetWizard();
    onClose();
  }, [resetWizard, onClose]);

  // Navigation
  const canGoBack = currentStep > 0 && !isImporting;
  const canGoNext = stepValid && currentStep < STEPS.length - 1 && !isImporting;
  const isLastStep = currentStep === STEPS.length - 1;

  const goBack = useCallback(() => {
    if (canGoBack) {
      setCurrentStep(prev => prev - 1);
      setStepValid(true); // Previous steps were already validated
    }
  }, [canGoBack]);

  const goNext = useCallback(() => {
    if (canGoNext) {
      setCurrentStep(prev => prev + 1);
      setStepValid(false); // Next step needs validation
    }
  }, [canGoNext]);

  // Handle JSON parse result from ImportStep
  const handleJsonParsed = useCallback((parsed, result) => {
    setParsedData(parsed);
    setValidationResult(result);
  }, []);

  // Handle AI-generated content from PromptStep (direct generation)
  const handleAIGenerated = useCallback((content, json) => {
    // If we got parsed JSON, use it directly
    if (json) {
      setParsedData(json);
      // Skip to validation step (step 3)
      setCurrentStep(3);
      setStepValid(true);
    } else {
      // Set the raw content for the import step
      setJsonData(content);
      // Move to import step (step 2)
      setCurrentStep(2);
      setStepValid(true);
    }
  }, []);

  // Handle final import
  const handleImport = useCallback(async () => {
    if (!parsedData || selectedSections.length === 0) return;

    setIsImporting(true);
    setImportError(null);

    try {
      // Transform AI data to initiative format
      const initiativeData = transformToInitiativeData(parsedData, selectedSections);

      if (initiative) {
        // Update existing initiative
        const result = await updateInitiative(initiative.id, initiativeData);
        if (result) {
          setImportSuccess(true);
          setTimeout(() => {
            handleClose();
          }, 1500);
        } else {
          setImportError('Failed to update initiative');
        }
      } else {
        // Create new initiative with AI data
        const newInitiativeData = {
          name: basicInfo.name,
          ...initiativeData,
        };
        const result = await createInitiative(newInitiativeData);
        if (result) {
          setImportSuccess(true);
          setTimeout(() => {
            handleClose();
          }, 1500);
        } else {
          setImportError('Failed to create initiative');
        }
      }
    } catch (err) {
      console.error('Import error:', err);
      setImportError(err.message || 'An error occurred during import');
    } finally {
      setIsImporting(false);
    }
  }, [parsedData, selectedSections, initiative, basicInfo, updateInitiative, createInitiative, handleClose]);

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            data={basicInfo}
            onChange={setBasicInfo}
            onValidate={setStepValid}
          />
        );
      case 1:
        return (
          <PromptStep
            basicInfo={basicInfo}
            onValidate={setStepValid}
            onAIGenerated={handleAIGenerated}
          />
        );
      case 2:
        return (
          <ImportStep
            jsonData={jsonData}
            onJsonParsed={handleJsonParsed}
            onValidate={setStepValid}
          />
        );
      case 3:
        return (
          <ValidateStep
            validationResult={validationResult}
            onValidate={setStepValid}
          />
        );
      case 4:
        return (
          <PreviewStep
            parsedData={parsedData}
            onValidate={setStepValid}
          />
        );
      case 5:
        return (
          <SelectStep
            parsedData={parsedData}
            selectedSections={selectedSections}
            onSelectionChange={setSelectedSections}
            onValidate={setStepValid}
          />
        );
      default:
        return null;
    }
  };

  // Compute button labels
  const nextButtonLabel = useMemo(() => {
    if (isImporting) return 'Importing...';
    if (importSuccess) return 'Done!';
    if (isLastStep) return `Import (${selectedSections.length} sections)`;
    return 'Next';
  }, [isImporting, importSuccess, isLastStep, selectedSections.length]);

  if (!isOpen) return null;

  return (
    <div className="ai-wizard-overlay" onClick={handleClose}>
      <div className="ai-wizard-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-wizard-header">
          <div className="header-title">
            <AutoAwesomeIcon className="wizard-icon" />
            <div>
              <h2>AI-Assisted Design</h2>
              <p>{initiative ? `Enhancing: ${initiative.name}` : 'Create New Initiative'}</p>
            </div>
          </div>
          <button className="close-btn" onClick={handleClose} title="Close wizard">
            <CloseIcon />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="ai-wizard-progress">
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`progress-step ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
            >
              <div className="step-indicator">
                {idx < currentStep ? <CheckIcon fontSize="small" /> : idx + 1}
              </div>
              <span className="step-name">{step.name}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="ai-wizard-content">
          {renderStepContent()}
        </div>

        {/* Error message */}
        {importError && (
          <div className="ai-wizard-error">
            {importError}
          </div>
        )}

        {/* Success message */}
        {importSuccess && (
          <div className="ai-wizard-success">
            <CheckIcon />
            <span>Import successful! Closing...</span>
          </div>
        )}

        {/* Footer */}
        <div className="ai-wizard-footer">
          <button
            className="wizard-btn secondary"
            onClick={goBack}
            disabled={!canGoBack}
          >
            <ArrowBackIcon fontSize="small" />
            <span>Back</span>
          </button>

          <div className="step-info">
            Step {currentStep + 1} of {STEPS.length}
          </div>

          {isLastStep ? (
            <button
              className={`wizard-btn primary ${importSuccess ? 'success' : ''}`}
              onClick={handleImport}
              disabled={!stepValid || isImporting || importSuccess}
            >
              {importSuccess ? <CheckIcon fontSize="small" /> : null}
              <span>{nextButtonLabel}</span>
            </button>
          ) : (
            <button
              className="wizard-btn primary"
              onClick={goNext}
              disabled={!canGoNext}
            >
              <span>Next</span>
              <ArrowForwardIcon fontSize="small" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
