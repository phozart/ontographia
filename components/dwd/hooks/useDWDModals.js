// components/dwd/hooks/useDWDModals.js
// Centralized modal state management for DWD Workspace

import { useState, useCallback } from 'react';

/**
 * Custom hook to manage all modal state in DWD Workspace
 * Consolidates 10+ useState calls into a single, organized hook
 */
export default function useDWDModals() {
  // Type selector modal
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // Artefact create/edit modal
  const [artefactModal, setArtefactModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    type: null,
    artefact: null,
  });

  // Delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Volatility assessment modal
  const [volatilityTarget, setVolatilityTarget] = useState(null);

  // Wizard modal
  const [showWizard, setShowWizard] = useState(false);

  // Pattern library modal
  const [showPatternLibrary, setShowPatternLibrary] = useState(false);

  // Experiment tracker modal
  const [experimentTarget, setExperimentTarget] = useState(null);

  // Cross-studio linker modal
  const [linkerState, setLinkerState] = useState({
    target: null,
    existingLinks: [],
  });

  // Report generator modal
  const [showReportGenerator, setShowReportGenerator] = useState(false);

  // Type selector handlers
  const openTypeSelector = useCallback(() => {
    setShowTypeSelector(true);
  }, []);

  const closeTypeSelector = useCallback(() => {
    setShowTypeSelector(false);
  }, []);

  // Artefact modal handlers
  const openArtefactModal = useCallback((type, mode = 'create', artefact = null) => {
    setArtefactModal({
      isOpen: true,
      mode,
      type: artefact?.artefact_type || type,
      artefact: mode === 'edit' ? artefact : null,
    });
  }, []);

  const closeArtefactModal = useCallback(() => {
    setArtefactModal({
      isOpen: false,
      mode: 'create',
      type: null,
      artefact: null,
    });
  }, []);

  // Delete confirmation handlers
  const openDeleteConfirm = useCallback((artefact) => {
    setDeleteConfirm(artefact);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  // Volatility assessment handlers
  const openVolatilityAssessment = useCallback((workItem) => {
    setVolatilityTarget(workItem);
  }, []);

  const closeVolatilityAssessment = useCallback(() => {
    setVolatilityTarget(null);
  }, []);

  // Wizard handlers
  const openWizard = useCallback(() => {
    setShowWizard(true);
  }, []);

  const closeWizard = useCallback(() => {
    setShowWizard(false);
  }, []);

  // Pattern library handlers
  const openPatternLibrary = useCallback(() => {
    setShowPatternLibrary(true);
  }, []);

  const closePatternLibrary = useCallback(() => {
    setShowPatternLibrary(false);
  }, []);

  // Experiment tracker handlers
  const openExperimentTracker = useCallback((adjustment) => {
    setExperimentTarget(adjustment);
  }, []);

  const closeExperimentTracker = useCallback(() => {
    setExperimentTarget(null);
  }, []);

  // Cross-studio linker handlers
  const openLinker = useCallback((artefact, existingLinks = []) => {
    setLinkerState({
      target: artefact,
      existingLinks,
    });
  }, []);

  const closeLinker = useCallback(() => {
    setLinkerState({
      target: null,
      existingLinks: [],
    });
  }, []);

  // Report generator handlers
  const openReportGenerator = useCallback(() => {
    setShowReportGenerator(true);
  }, []);

  const closeReportGenerator = useCallback(() => {
    setShowReportGenerator(false);
  }, []);

  return {
    // Type selector
    typeSelector: {
      isOpen: showTypeSelector,
      open: openTypeSelector,
      close: closeTypeSelector,
    },

    // Artefact modal
    artefactModal: {
      ...artefactModal,
      open: openArtefactModal,
      close: closeArtefactModal,
    },

    // Delete confirmation
    deleteConfirm: {
      artefact: deleteConfirm,
      isOpen: !!deleteConfirm,
      open: openDeleteConfirm,
      close: closeDeleteConfirm,
    },

    // Volatility assessment
    volatilityAssessment: {
      target: volatilityTarget,
      isOpen: !!volatilityTarget,
      open: openVolatilityAssessment,
      close: closeVolatilityAssessment,
    },

    // Wizard
    wizard: {
      isOpen: showWizard,
      open: openWizard,
      close: closeWizard,
    },

    // Pattern library
    patternLibrary: {
      isOpen: showPatternLibrary,
      open: openPatternLibrary,
      close: closePatternLibrary,
    },

    // Experiment tracker
    experimentTracker: {
      adjustment: experimentTarget,
      isOpen: !!experimentTarget,
      open: openExperimentTracker,
      close: closeExperimentTracker,
    },

    // Cross-studio linker
    linker: {
      target: linkerState.target,
      existingLinks: linkerState.existingLinks,
      isOpen: !!linkerState.target,
      open: openLinker,
      close: closeLinker,
    },

    // Report generator
    reportGenerator: {
      isOpen: showReportGenerator,
      open: openReportGenerator,
      close: closeReportGenerator,
    },
  };
}
