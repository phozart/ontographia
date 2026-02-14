// components/spaces/blueprint/stages/DiscoveryView.js
// Combined Discovery view - shows product ideas across idea/explore/assess stages
// Cards are color-coded by stage, detail panel has tabs for each stage's content
// Discovery phase - Decision stage (case/approval) remains separate

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useBlueprint, BPS_STAGE_INFO } from '../BlueprintContext';
import { useDomains } from '../../../DomainContext';
import ProductIdeaModal from '../initiative/ProductIdeaModal';
import InitiativeSelector from '../shared/InitiativeSelector';
import CanvasModal, { CANVAS_TYPES, getCompleteness } from '../canvases/CanvasModal';

// MUI Icons
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ExploreIcon from '@mui/icons-material/Explore';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import TargetIcon from '@mui/icons-material/TrackChanges';
import ScienceIcon from '@mui/icons-material/Science';
import BarChartIcon from '@mui/icons-material/BarChart';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import GroupsIcon from '@mui/icons-material/Groups';
import StorefrontIcon from '@mui/icons-material/Storefront';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import RouteIcon from '@mui/icons-material/Route';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FaceIcon from '@mui/icons-material/Face';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SpeedIcon from '@mui/icons-material/Speed';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BuildIcon from '@mui/icons-material/Build';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LinkIcon from '@mui/icons-material/Link';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import RadarIcon from '@mui/icons-material/Radar';
import * as XLSX from 'xlsx';

// Discovery stages configuration
const DISCOVERY_STAGES = ['idea', 'explore', 'assess'];

const STAGE_CONFIG = {
  idea: {
    label: 'Idea',
    color: '#D1A73A', // warm yellow
    bgColor: 'rgba(209, 167, 58, 0.08)',
    icon: LightbulbIcon,
    description: 'Capture and define the idea',
  },
  explore: {
    label: 'Explore',
    color: '#5B8A6A', // green
    bgColor: 'rgba(91, 138, 106, 0.08)',
    icon: ExploreIcon,
    description: 'Research and validate market fit',
  },
  assess: {
    label: 'Assess',
    color: '#6B5B95', // indigo/purple
    bgColor: 'rgba(107, 91, 149, 0.08)',
    icon: AssessmentIcon,
    description: 'Evaluate feasibility and risks',
  },
};

// Default priority categories (MoSCoW)
const DEFAULT_CATEGORIES = [
  { id: 'must', label: 'Must Have', color: '#C62828', description: 'Critical for success' },
  { id: 'should', label: 'Should Have', color: '#F57C00', description: 'Important but not critical' },
  { id: 'could', label: 'Could Have', color: '#1976D2', description: 'Nice to have' },
  { id: 'wont', label: "Won't Have", color: '#757575', description: 'Out of scope for now' },
  { id: 'unassigned', label: 'Uncategorized', color: '#9E9E9E', description: 'Not yet prioritized' },
];

// Calculate idea completeness for visual indicator
function calculateCompleteness(idea) {
  const checks = {
    idea: [
      !!idea.name,
      !!idea.description,
      !!(idea.target_customer || idea.idea_data?.target_customer),
      !!(idea.problem_statement || idea.idea_data?.problem_statement),
      !!idea.idea_data?.hypothesis,
    ],
    explore: [
      !!idea.explore_data?.market_size,
      !!idea.explore_data?.competitors,
      !!idea.explore_data?.customer_interviews,
      !!idea.explore_data?.validation_notes,
    ],
    assess: [
      !!idea.assess_data?.feasibility_score,
      !!idea.assess_data?.risk_assessment,
      !!idea.assess_data?.resource_estimate,
      !!idea.assess_data?.recommendation,
    ],
  };

  const stage = idea.stage || 'idea';
  const stageChecks = checks[stage] || checks.idea;
  const completed = stageChecks.filter(Boolean).length;
  return Math.round((completed / stageChecks.length) * 100);
}

export default function DiscoveryView({
  onSelectInitiative,
  onEditInitiative,
  onDeleteInitiative,
  onNavigate,
  onOpenAIWizard,
  selectedIdeaFromUrl, // PI-xxx from URL query param for auto-selection
}) {
  const {
    activeInitiative,
    productIdeas,
    fetchProductIdeas,
    loadingProductIdeas,
    advanceProductIdeaStage,
    regressProductIdeaStage,
    updateProductIdea,
    deleteProductIdea,
    updateInitiative,
  } = useBlueprint();

  const { activeDomainObj } = useDomains();
  const router = useRouter();

  // View state
  const [viewMode, setViewMode] = useState('lanes'); // 'lanes', 'grid', or 'kanban'

  // Track if URL-based idea selection has been processed (to prevent re-selection after close)
  const urlSelectionProcessedRef = useRef(false);

  // Detail panel state
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [activeTab, setActiveTab] = useState('idea'); // 'idea', 'explore', 'assess'
  const [editForm, setEditForm] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [detailExpanded, setDetailExpanded] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null); // 'interviews', 'market', 'competitors', 'evidence'

  // Modal for creating new ideas
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);
  const [newIdeaDefaultPriority, setNewIdeaDefaultPriority] = useState('unassigned');
  const [showGuidance, setShowGuidance] = useState(false);

  // Canvas modal state
  const [canvasModalOpen, setCanvasModalOpen] = useState(false);
  const [activeCanvasType, setActiveCanvasType] = useState(null); // 'persona', 'journey', 'empathy'
  const [activeCanvasIndex, setActiveCanvasIndex] = useState(null); // For personas array
  const [savingCanvas, setSavingCanvas] = useState(false);

  // Stage transition state
  const [transitioningIds, setTransitioningIds] = useState(new Set());

  // Copy feedback state
  const [copiedId, setCopiedId] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStage, setFilterStage] = useState('all'); // 'all', 'idea', 'explore', 'assess'

  // Category editing state
  const [editingCategory, setEditingCategory] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  // Drag and drop state
  const [draggedIdea, setDraggedIdea] = useState(null);
  const [dragOverCategory, setDragOverCategory] = useState(null);

  // Export dropdown state
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  const saveTimeoutRef = useRef(null);

  // Load categories from initiative
  useEffect(() => {
    if (activeInitiative?.custom_fields?.idea_categories) {
      setCategories(activeInitiative.custom_fields.idea_categories);
    } else {
      setCategories(DEFAULT_CATEGORIES);
    }
  }, [activeInitiative?.id, activeInitiative?.custom_fields?.idea_categories]);

  // Filter product ideas to Discovery stages (idea, explore, assess)
  const ideasInDiscovery = useMemo(() => {
    if (!activeInitiative) return [];
    return productIdeas.filter(pi =>
      pi.initiative_id === activeInitiative.id &&
      DISCOVERY_STAGES.includes(pi.stage)
    );
  }, [productIdeas, activeInitiative]);

  // Apply filters
  const filteredIdeas = useMemo(() => {
    let result = ideasInDiscovery;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(idea =>
        idea.name?.toLowerCase().includes(query) ||
        idea.description?.toLowerCase().includes(query) ||
        idea.target_customer?.toLowerCase().includes(query)
      );
    }

    // Priority filter
    if (filterPriority !== 'all') {
      result = result.filter(idea => {
        const priority = idea.idea_data?.priority || 'unassigned';
        return priority === filterPriority;
      });
    }

    // Stage filter
    if (filterStage !== 'all') {
      result = result.filter(idea => idea.stage === filterStage);
    }

    return result;
  }, [ideasInDiscovery, searchQuery, filterPriority, filterStage]);

  // Group ideas by priority category
  const ideasByCategory = useMemo(() => {
    const grouped = {};
    categories.forEach(cat => {
      grouped[cat.id] = [];
    });

    filteredIdeas.forEach(idea => {
      const priority = idea.idea_data?.priority || 'unassigned';
      if (grouped[priority]) {
        grouped[priority].push(idea);
      } else {
        grouped['unassigned'].push(idea);
      }
    });

    return grouped;
  }, [filteredIdeas, categories]);

  // Fetch product ideas
  useEffect(() => {
    if (activeInitiative?.id) {
      fetchProductIdeas();
    }
  }, [activeInitiative?.id, fetchProductIdeas]);

  // Auto-select idea from URL query parameter (PI-xxx) - only once per URL
  useEffect(() => {
    if (!selectedIdeaFromUrl || loadingProductIdeas || !productIdeas.length) return;
    if (urlSelectionProcessedRef.current) return; // Already processed this URL param

    const matchingIdea = productIdeas.find(pi =>
      pi.display_id === selectedIdeaFromUrl ||
      pi.product_idea_id === selectedIdeaFromUrl ||
      pi.displayId === selectedIdeaFromUrl ||
      `PI-${pi.id}` === selectedIdeaFromUrl
    );

    if (matchingIdea) {
      setSelectedIdea(matchingIdea);
      urlSelectionProcessedRef.current = true;
    }
  }, [selectedIdeaFromUrl, productIdeas, loadingProductIdeas]);

  // Reset URL selection flag when URL param changes
  useEffect(() => {
    urlSelectionProcessedRef.current = false;
  }, [selectedIdeaFromUrl]);

  // Update edit form when selected idea changes
  useEffect(() => {
    if (selectedIdea) {
      setActiveTab(selectedIdea.stage || 'idea');
      setEditForm({
        // Idea stage fields
        name: selectedIdea.name || '',
        description: selectedIdea.description || '',
        target_customer: selectedIdea.target_customer || selectedIdea.idea_data?.target_customer || '',
        problem_statement: selectedIdea.problem_statement || selectedIdea.idea_data?.problem_statement || '',
        hypothesis: selectedIdea.idea_data?.hypothesis || '',
        priority: selectedIdea.idea_data?.priority || 'unassigned',
        impact: selectedIdea.idea_data?.impact || 'medium',
        urgency: selectedIdea.idea_data?.urgency || 'medium',
        // Explore stage fields
        market_size: selectedIdea.explore_data?.market_size || '',
        competitors: selectedIdea.explore_data?.competitors || '',
        customer_interviews: selectedIdea.explore_data?.customer_interviews || '',
        validation_notes: selectedIdea.explore_data?.validation_notes || '',
        market_fit_score: selectedIdea.explore_data?.market_fit_score || 0,
        interview_count: selectedIdea.explore_data?.interview_count || 0,
        // Canvas data (personas, journey maps, etc.) - structured objects
        // Handle both new array format and legacy string format
        personas: Array.isArray(selectedIdea.canvas_data?.personas)
          ? selectedIdea.canvas_data.personas
          : [{ id: 1, name: '', role: '', demographics: '', goals: '', frustrations: '', quote: '' }],
        journey_stages: Array.isArray(selectedIdea.canvas_data?.journey_stages)
          ? selectedIdea.canvas_data.journey_stages
          : [
              { id: 1, name: 'Awareness', touchpoints: '', actions: '', emotions: '', pains: '' },
              { id: 2, name: 'Consideration', touchpoints: '', actions: '', emotions: '', pains: '' },
              { id: 3, name: 'Decision', touchpoints: '', actions: '', emotions: '', pains: '' },
              { id: 4, name: 'Usage', touchpoints: '', actions: '', emotions: '', pains: '' },
            ],
        empathy_map: (typeof selectedIdea.canvas_data?.empathy_map === 'object' && selectedIdea.canvas_data?.empathy_map !== null && !Array.isArray(selectedIdea.canvas_data?.empathy_map))
          ? selectedIdea.canvas_data.empathy_map
          : { thinks: '', feels: '', says: '', does: '' },
        // Assess stage fields - enhanced multi-dimensional assessment
        feasibility_score: selectedIdea.assess_data?.feasibility_score || 0,
        // Multi-dimensional feasibility scores
        feasibility_technical: selectedIdea.assess_data?.feasibility_technical || 5,
        feasibility_market: selectedIdea.assess_data?.feasibility_market || 5,
        feasibility_operational: selectedIdea.assess_data?.feasibility_operational || 5,
        feasibility_financial: selectedIdea.assess_data?.feasibility_financial || 5,
        feasibility_time: selectedIdea.assess_data?.feasibility_time || 5,
        // Structured risks
        risks: selectedIdea.assess_data?.risks || [],
        // Resource breakdown
        resource_team: selectedIdea.assess_data?.resource_team || '',
        resource_timeline: selectedIdea.assess_data?.resource_timeline || 'medium',
        resource_budget: selectedIdea.assess_data?.resource_budget || '',
        resource_dependencies: selectedIdea.assess_data?.resource_dependencies || '',
        // ICE/RICE scores
        ice_impact: selectedIdea.assess_data?.ice_impact || 5,
        ice_confidence: selectedIdea.assess_data?.ice_confidence || 5,
        ice_ease: selectedIdea.assess_data?.ice_ease || 5,
        // Go/No-Go checklist
        checklist: selectedIdea.assess_data?.checklist || {
          problem_validated: false,
          solution_viable: false,
          market_validated: false,
          resources_available: false,
          risks_acceptable: false,
          strategic_fit: false,
        },
        // Legacy fields
        risk_assessment: selectedIdea.assess_data?.risk_assessment || '',
        resource_estimate: selectedIdea.assess_data?.resource_estimate || '',
        technical_notes: selectedIdea.assess_data?.technical_notes || '',
        recommendation: selectedIdea.assess_data?.recommendation || '',
        recommendation_confidence: selectedIdea.assess_data?.recommendation_confidence || 'medium',
        recommendation_conditions: selectedIdea.assess_data?.recommendation_conditions || '',
      });
      setHasChanges(false);
    }
  }, [selectedIdea]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const handleBack = useCallback(() => {
    onNavigate?.('overview');
  }, [onNavigate]);

  // Stage transitions
  const handleAdvanceStage = useCallback(async (idea) => {
    setTransitioningIds(prev => new Set([...prev, idea.id]));

    await new Promise(resolve => setTimeout(resolve, 500));
    await advanceProductIdeaStage(idea.id);

    setTransitioningIds(prev => {
      const next = new Set(prev);
      next.delete(idea.id);
      return next;
    });

    // Update selected idea if it's the one being advanced
    if (selectedIdea?.id === idea.id) {
      const newStage = idea.stage === 'idea' ? 'explore' : idea.stage === 'explore' ? 'assess' : 'case';
      if (DISCOVERY_STAGES.includes(newStage)) {
        setActiveTab(newStage);
      } else {
        setSelectedIdea(null); // Moving to Decision phase
      }
    }
  }, [advanceProductIdeaStage, selectedIdea]);

  const handleRegressStage = useCallback(async (idea) => {
    if (idea.stage === 'idea') return;

    setTransitioningIds(prev => new Set([...prev, idea.id]));
    await new Promise(resolve => setTimeout(resolve, 500));

    // Call regress API (you may need to implement this)
    if (regressProductIdeaStage) {
      await regressProductIdeaStage(idea.id);
    } else {
      // Fallback: manually update stage
      const prevStage = idea.stage === 'assess' ? 'explore' : 'idea';
      await updateProductIdea(idea.id, { stage: prevStage });
    }

    setTransitioningIds(prev => {
      const next = new Set(prev);
      next.delete(idea.id);
      return next;
    });

    if (selectedIdea?.id === idea.id) {
      const newStage = idea.stage === 'assess' ? 'explore' : 'idea';
      setActiveTab(newStage);
    }
  }, [regressProductIdeaStage, updateProductIdea, selectedIdea]);

  // Selection handlers
  const handleSelectIdea = useCallback((idea) => {
    setSelectedIdea(idea);
    setDetailExpanded(false);

    // Update URL with idea ID for shareable links
    const ideaDisplayId = idea.display_id || idea.product_idea_id || idea.displayId;
    if (ideaDisplayId && router.isReady) {
      const url = new URL(window.location.href);
      url.searchParams.set('idea', ideaDisplayId);
      router.replace(url.pathname + url.search, undefined, { shallow: true });
    }
  }, [router]);

  const handleCloseDetail = useCallback(() => {
    setSelectedIdea(null);
    setEditForm({});
    setHasChanges(false);
    setDetailExpanded(false);

    // Remove idea from URL
    if (router.isReady) {
      const url = new URL(window.location.href);
      url.searchParams.delete('idea');
      router.replace(url.pathname + url.search, undefined, { shallow: true });
    }
  }, [router]);

  const handleToggleExpand = useCallback(() => {
    setDetailExpanded(prev => !prev);
  }, []);

  // Copy full URL to clipboard
  const handleCopyId = useCallback(async (productIdeaId) => {
    try {
      // Construct full URL: /app/spaces/blueprint/discovery/{domainDisplayId}/{initiativeDisplayId}/{productIdeaId}
      const domainDisplayId = activeDomainObj?.display_id || activeDomainObj?.displayId;
      const initiativeDisplayId = activeInitiative?.display_id || activeInitiative?.initiative_id;

      let fullUrl;
      if (domainDisplayId && initiativeDisplayId) {
        fullUrl = `${window.location.origin}/app/spaces/blueprint/discovery/${domainDisplayId}/${initiativeDisplayId}/${productIdeaId}`;
      } else {
        // Fallback to just the ID if we don't have the full context
        fullUrl = productIdeaId;
      }

      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [activeDomainObj, activeInitiative]);

  // Form handlers
  const handleEditFormChange = useCallback((field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const handleSaveIdea = useCallback(async () => {
    if (!selectedIdea || !hasChanges) return;

    setSavingChanges(true);
    try {
      await updateProductIdea(selectedIdea.id, {
        name: editForm.name,
        description: editForm.description,
        // Use camelCase field names to match repository expectations
        ideaData: {
          ...selectedIdea.idea_data,
          hypothesis: editForm.hypothesis,
          priority: editForm.priority,
          impact: editForm.impact,
          urgency: editForm.urgency,
          target_customer: editForm.target_customer,
          problem_statement: editForm.problem_statement,
        },
        exploreData: {
          ...selectedIdea.explore_data,
          market_size: editForm.market_size,
          competitors: editForm.competitors,
          customer_interviews: editForm.customer_interviews,
          validation_notes: editForm.validation_notes,
          market_fit_score: editForm.market_fit_score,
          interview_count: editForm.interview_count,
        },
        canvasData: {
          ...selectedIdea.canvas_data,
          personas: editForm.personas,
          journey_stages: editForm.journey_stages,
          empathy_map: editForm.empathy_map,
        },
        assessData: {
          ...selectedIdea.assess_data,
          feasibility_score: editForm.feasibility_score,
          feasibility_technical: editForm.feasibility_technical,
          feasibility_market: editForm.feasibility_market,
          feasibility_operational: editForm.feasibility_operational,
          feasibility_financial: editForm.feasibility_financial,
          feasibility_time: editForm.feasibility_time,
          risks: editForm.risks,
          resource_team: editForm.resource_team,
          resource_timeline: editForm.resource_timeline,
          resource_budget: editForm.resource_budget,
          resource_dependencies: editForm.resource_dependencies,
          ice_impact: editForm.ice_impact,
          ice_confidence: editForm.ice_confidence,
          ice_ease: editForm.ice_ease,
          checklist: editForm.checklist,
          risk_assessment: editForm.risk_assessment,
          resource_estimate: editForm.resource_estimate,
          technical_notes: editForm.technical_notes,
          recommendation: editForm.recommendation,
          recommendation_confidence: editForm.recommendation_confidence,
          recommendation_conditions: editForm.recommendation_conditions,
        },
      });
      setHasChanges(false);
      fetchProductIdeas();
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSavingChanges(false);
    }
  }, [selectedIdea, hasChanges, editForm, updateProductIdea, fetchProductIdeas]);

  const handleDeleteIdea = useCallback(async (idea) => {
    if (confirm(`Delete "${idea.name}"? This cannot be undone.`)) {
      if (selectedIdea?.id === idea.id) setSelectedIdea(null);
      await deleteProductIdea(idea.id);
    }
  }, [deleteProductIdea, selectedIdea]);

  const handleNewIdea = useCallback((categoryId = 'unassigned') => {
    setNewIdeaDefaultPriority(categoryId);
    setIdeaModalOpen(true);
  }, []);

  const handleIdeasSaved = useCallback(() => {
    fetchProductIdeas();
  }, [fetchProductIdeas]);

  // Priority change
  const handlePriorityChange = useCallback(async (idea, newPriority) => {
    await updateProductIdea(idea.id, {
      ideaData: { ...idea.idea_data, priority: newPriority },
    });
    // Refresh to get updated data
    fetchProductIdeas();
  }, [updateProductIdea, fetchProductIdeas]);

  // Canvas modal handlers
  const handleOpenCanvas = useCallback((canvasType, index = null) => {
    setActiveCanvasType(canvasType);
    setActiveCanvasIndex(index);
    setCanvasModalOpen(true);
  }, []);

  const handleCloseCanvas = useCallback(() => {
    setCanvasModalOpen(false);
    setActiveCanvasType(null);
    setActiveCanvasIndex(null);
  }, []);

  const handleSaveCanvas = useCallback(async (canvasData) => {
    if (!selectedIdea || !activeCanvasType) return;

    setSavingCanvas(true);
    try {
      let updatedCanvasData = { ...selectedIdea.canvas_data };

      if (activeCanvasType === 'persona') {
        // Handle personas array
        const personas = updatedCanvasData.personas || [];
        if (activeCanvasIndex !== null && activeCanvasIndex < personas.length) {
          // Update existing persona
          personas[activeCanvasIndex] = { ...personas[activeCanvasIndex], ...canvasData };
        } else {
          // Add new persona
          const newId = personas.length > 0 ? Math.max(...personas.map(p => p.id || 0)) + 1 : 1;
          personas.push({ id: newId, ...canvasData });
        }
        updatedCanvasData.personas = personas;
      } else if (activeCanvasType === 'journey') {
        updatedCanvasData.journey = canvasData;
      } else if (activeCanvasType === 'empathy') {
        updatedCanvasData.empathy = canvasData;
      }

      await updateProductIdea(selectedIdea.id, {
        canvasData: updatedCanvasData,
      });

      // Update local edit form
      setEditForm(prev => ({
        ...prev,
        personas: updatedCanvasData.personas,
        journey: updatedCanvasData.journey,
        empathy_map: updatedCanvasData.empathy,
      }));

      fetchProductIdeas();
      handleCloseCanvas();
    } catch (err) {
      console.error('Failed to save canvas:', err);
    } finally {
      setSavingCanvas(false);
    }
  }, [selectedIdea, activeCanvasType, activeCanvasIndex, updateProductIdea, fetchProductIdeas, handleCloseCanvas]);

  // Get canvas data for modal
  const getCanvasDataForModal = useCallback(() => {
    if (!selectedIdea || !activeCanvasType) return {};

    const canvasData = selectedIdea.canvas_data || {};

    if (activeCanvasType === 'persona') {
      const personas = canvasData.personas || [];
      if (activeCanvasIndex !== null && activeCanvasIndex < personas.length) {
        return personas[activeCanvasIndex];
      }
      return {}; // New persona
    } else if (activeCanvasType === 'journey') {
      return canvasData.journey || {};
    } else if (activeCanvasType === 'empathy') {
      return canvasData.empathy || {};
    }
    return {};
  }, [selectedIdea, activeCanvasType, activeCanvasIndex]);

  // Get canvas title for modal
  const getCanvasTitle = useCallback(() => {
    if (!activeCanvasType) return '';

    if (activeCanvasType === 'persona') {
      const personas = selectedIdea?.canvas_data?.personas || [];
      if (activeCanvasIndex !== null && activeCanvasIndex < personas.length) {
        return personas[activeCanvasIndex]?.name || 'Edit Persona';
      }
      return 'New User Persona';
    } else if (activeCanvasType === 'journey') {
      return selectedIdea?.canvas_data?.journey?.name || 'Customer Journey Map';
    } else if (activeCanvasType === 'empathy') {
      return 'Empathy Map';
    }
    return '';
  }, [activeCanvasType, activeCanvasIndex, selectedIdea]);

  // Category label edit
  const handleCategoryLabelChange = useCallback(async (categoryId, newLabel) => {
    const updatedCategories = categories.map(cat =>
      cat.id === categoryId ? { ...cat, label: newLabel } : cat
    );
    setCategories(updatedCategories);
    setEditingCategory(null);

    if (activeInitiative) {
      try {
        await updateInitiative(activeInitiative.id, {
          custom_fields: {
            ...activeInitiative.custom_fields,
            idea_categories: updatedCategories,
          },
        });
      } catch (err) {
        console.error('Failed to save categories:', err);
      }
    }
  }, [categories, activeInitiative, updateInitiative]);

  // Export - supports CSV and Markdown formats
  const handleExport = useCallback((format = 'excel') => {
    const date = new Date().toISOString().split('T')[0];
    const initiativeName = activeInitiative?.name || 'ideas';
    const initiativeId = activeInitiative?.display_id || 'initiative';
    setShowExportMenu(false);

    const escapeHtml = (text) => {
      if (!text) return '';
      return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
    };

    if (format === 'html') {
      // HTML export for lanes/kanban views (Word-compatible)
      let content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(initiativeName)} - Product Ideas</title>
  <style>
    body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; color: #1F1E1B; line-height: 1.5; }
    h1 { color: #35332F; margin-bottom: 8px; font-size: 28px; }
    h2 { color: #47453F; margin-top: 32px; margin-bottom: 16px; padding: 10px 14px; background: #F5F4F2; border-left: 4px solid #47453F; font-size: 18px; }
    .meta { display: table; margin: 16px 0 24px; background: #F9F9F7; padding: 16px 20px; border-radius: 8px; border: 1px solid #E2E0DB; }
    .meta-row { display: table-row; }
    .meta-label { display: table-cell; padding: 4px 16px 4px 0; font-weight: 600; color: #5C5A54; }
    .meta-value { display: table-cell; padding: 4px 0; }
    .idea-card { background: #FDFCFA; border: 1px solid #E2E0DB; border-radius: 6px; padding: 14px 16px; margin-bottom: 12px; }
    .idea-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .idea-name { font-weight: 600; font-size: 15px; color: #1F1E1B; margin: 0; }
    .idea-id { font-size: 12px; color: #9C9A94; font-family: monospace; }
    .idea-meta { display: flex; gap: 12px; margin-bottom: 8px; font-size: 12px; }
    .idea-stage { padding: 2px 8px; border-radius: 3px; font-weight: 500; }
    .idea-progress { color: #5C5A54; }
    .idea-desc { font-size: 13px; color: #5C5A54; margin: 8px 0 0; }
    .idea-customer { font-size: 12px; color: #47453F; margin-top: 8px; }
    .empty { color: #9C9A94; font-style: italic; padding: 20px; text-align: center; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E0DB; font-size: 12px; color: #9C9A94; }
  </style>
</head>
<body>
  <h1>${escapeHtml(initiativeName)}</h1>
  <p style="color:#5C5A54;margin-top:0;">Product Ideas Overview</p>

  <div class="meta">
    <div class="meta-row"><span class="meta-label">Initiative:</span><span class="meta-value">${initiativeId}</span></div>
    <div class="meta-row"><span class="meta-label">Total Ideas:</span><span class="meta-value"><strong>${filteredIdeas.length}</strong></span></div>
    <div class="meta-row"><span class="meta-label">Exported:</span><span class="meta-value">${date}</span></div>
  </div>`;

      categories.forEach(category => {
        const categoryIdeas = ideasByCategory[category.id] || [];
        content += `\n  <h2>${escapeHtml(category.label)} (${categoryIdeas.length})</h2>`;

        if (categoryIdeas.length === 0) {
          content += `\n  <p class="empty">No ideas in this category</p>`;
        } else {
          categoryIdeas.forEach(idea => {
            const stageConfig = STAGE_CONFIG[idea.stage] || {};
            const stageLabel = stageConfig.label || idea.stage;
            const stageColor = stageConfig.color || '#47453F';
            const completeness = calculateCompleteness(idea);
            const ideaId = idea.display_id || idea.product_idea_id || `PI-${idea.id}`;

            content += `
  <div class="idea-card">
    <div class="idea-header">
      <h3 class="idea-name">${escapeHtml(idea.name)}</h3>
      <span class="idea-id">${ideaId}</span>
    </div>
    <div class="idea-meta">
      <span class="idea-stage" style="background:${stageColor}20;color:${stageColor};">${stageLabel}</span>
      <span class="idea-progress">${completeness}% complete</span>
    </div>`;
            if (idea.description) {
              content += `\n    <p class="idea-desc">${escapeHtml(idea.description)}</p>`;
            }
            if (idea.target_customer || idea.idea_data?.target_customer) {
              content += `\n    <p class="idea-customer"><strong>Target:</strong> ${escapeHtml(idea.target_customer || idea.idea_data?.target_customer)}</p>`;
            }
            content += `\n  </div>`;
          });
        }
      });

      content += `
  <div class="footer">
    Exported from Ontographia Blueprint Studio on ${date}
  </div>
</body>
</html>`;

      const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${initiativeId}_ideas_${date}.html`;
      link.click();
    } else {
      // Native Excel export using xlsx library
      const workbook = XLSX.utils.book_new();

      // Create data rows
      const data = [
        ['Initiative:', initiativeName, '', '', '', '', ''],
        ['Exported:', date, '', '', '', '', ''],
        ['Total Ideas:', filteredIdeas.length, '', '', '', '', ''],
        [], // Empty row
        ['ID', 'Name', 'Stage', 'Category', 'Description', 'Target Customer', 'Completeness'],
      ];

      filteredIdeas.forEach(idea => {
        const stageLabel = STAGE_CONFIG[idea.stage]?.label || idea.stage;
        const priority = categories.find(c => c.id === (idea.idea_data?.priority || 'unassigned'))?.label || 'Unassigned';
        const completeness = calculateCompleteness(idea);
        const ideaId = idea.display_id || idea.product_idea_id || `PI-${idea.id}`;

        data.push([
          ideaId,
          idea.name || '',
          stageLabel,
          priority,
          idea.description || '',
          idea.target_customer || idea.idea_data?.target_customer || '',
          `${completeness}%`,
        ]);
      });

      // Create worksheet from data
      const worksheet = XLSX.utils.aoa_to_sheet(data);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 12 },  // ID
        { wch: 30 },  // Name
        { wch: 10 },  // Stage
        { wch: 15 },  // Category
        { wch: 50 },  // Description
        { wch: 25 },  // Target Customer
        { wch: 12 },  // Completeness
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ideas');

      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, `${initiativeId}_ideas_${date}.xlsx`);
    }
  }, [filteredIdeas, categories, activeInitiative, ideasByCategory]);

  // Export individual product idea as formatted HTML document (Word-compatible)
  const handleExportIdea = useCallback((idea, format = 'full') => {
    if (!idea) return;

    const date = new Date().toISOString().split('T')[0];
    const ideaId = idea.display_id || idea.product_idea_id || `PI-${idea.id}`;
    const stageLabel = STAGE_CONFIG[idea.stage]?.label || idea.stage;
    const stageColor = STAGE_CONFIG[idea.stage]?.color || '#47453F';
    const priority = categories.find(c => c.id === (idea.idea_data?.priority || 'unassigned'))?.label || 'Unassigned';
    const completeness = calculateCompleteness(idea);

    const escapeHtml = (text) => {
      if (!text) return '<em style="color:#9C9A94;">Not provided</em>';
      return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
    };

    let content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(idea.name)} - ${ideaId}</title>
  <style>
    body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1F1E1B; line-height: 1.6; }
    h1 { color: #35332F; margin-bottom: 8px; font-size: 28px; }
    h2 { color: #47453F; margin-top: 32px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #E2E0DB; font-size: 20px; }
    h3 { color: #5C5A54; margin-top: 20px; margin-bottom: 8px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .meta { display: table; margin: 16px 0 24px; background: #F9F9F7; padding: 16px 20px; border-radius: 8px; border: 1px solid #E2E0DB; }
    .meta-row { display: table-row; }
    .meta-label { display: table-cell; padding: 4px 16px 4px 0; font-weight: 600; color: #5C5A54; white-space: nowrap; }
    .meta-value { display: table-cell; padding: 4px 0; }
    .stage-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: 500; font-size: 13px; }
    .completeness-bar { display: inline-block; width: 100px; height: 8px; background: #E2E0DB; border-radius: 4px; overflow: hidden; vertical-align: middle; margin-right: 8px; }
    .completeness-fill { height: 100%; background: #5B8A6A; }
    .section-content { background: #FDFCFA; padding: 16px 20px; border-radius: 6px; border: 1px solid #E2E0DB; margin-bottom: 12px; }
    .score { font-size: 24px; font-weight: 700; color: #35332F; }
    .score-label { color: #9C9A94; font-size: 14px; }
    hr { border: none; border-top: 1px solid #E2E0DB; margin: 32px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E0DB; font-size: 12px; color: #9C9A94; }
  </style>
</head>
<body>
  <h1>${escapeHtml(idea.name)}</h1>

  <div class="meta">
    <div class="meta-row"><span class="meta-label">ID:</span><span class="meta-value"><strong>${ideaId}</strong></span></div>
    <div class="meta-row"><span class="meta-label">Initiative:</span><span class="meta-value">${escapeHtml(activeInitiative?.name) || 'N/A'}</span></div>
    <div class="meta-row"><span class="meta-label">Stage:</span><span class="meta-value"><span class="stage-badge" style="background:${stageColor}20;color:${stageColor};">${stageLabel}</span></span></div>
    <div class="meta-row"><span class="meta-label">Priority:</span><span class="meta-value">${priority}</span></div>
    <div class="meta-row"><span class="meta-label">Completeness:</span><span class="meta-value"><span class="completeness-bar"><span class="completeness-fill" style="width:${completeness}%;"></span></span>${completeness}%</span></div>
  </div>`;

    // Idea Section
    if (format === 'full' || format === 'idea') {
      content += `
  <h2>Idea</h2>
  <div class="section-content">
    <h3>Description</h3>
    <p>${escapeHtml(idea.description)}</p>

    <h3>Target Customer</h3>
    <p>${escapeHtml(idea.target_customer || idea.idea_data?.target_customer)}</p>

    <h3>Problem Statement</h3>
    <p>${escapeHtml(idea.problem_statement || idea.idea_data?.problem_statement)}</p>

    <h3>Hypothesis</h3>
    <p>${escapeHtml(idea.idea_data?.hypothesis)}</p>
  </div>`;
    }

    // Explore Section
    if (format === 'full' || format === 'explore') {
      const exploreData = idea.explore_data || {};
      content += `
  <h2>Explore</h2>
  <div class="section-content">
    <h3>Market Fit Score</h3>
    <p><span class="score">${exploreData.market_fit_score || 0}</span><span class="score-label">/10</span></p>

    <h3>Market Size</h3>
    <p>${escapeHtml(exploreData.market_size)}</p>

    <h3>Competitors</h3>
    <p>${escapeHtml(exploreData.competitors)}</p>

    <h3>Customer Interviews</h3>
    <p>${escapeHtml(exploreData.customer_interviews)}</p>

    <h3>Validation Notes</h3>
    <p>${escapeHtml(exploreData.validation_notes)}</p>
  </div>`;
    }

    // Assess Section
    if (format === 'full' || format === 'assess') {
      const assessData = idea.assess_data || {};
      const recommendation = assessData.recommendation
        ? assessData.recommendation.charAt(0).toUpperCase() + assessData.recommendation.slice(1).replace(/-/g, ' ')
        : null;
      content += `
  <h2>Assess</h2>
  <div class="section-content">
    <h3>Feasibility Score</h3>
    <p><span class="score">${assessData.feasibility_score || 0}</span><span class="score-label">/10</span></p>

    <h3>Risk Assessment</h3>
    <p>${escapeHtml(assessData.risk_assessment)}</p>

    <h3>Resource Estimate</h3>
    <p>${escapeHtml(assessData.resource_estimate)}</p>

    <h3>Technical Notes</h3>
    <p>${escapeHtml(assessData.technical_notes)}</p>

    <h3>Recommendation</h3>
    <p>${recommendation ? `<strong>${recommendation}</strong>` : '<em style="color:#9C9A94;">Not provided</em>'}</p>
  </div>`;
    }

    // Footer
    content += `
  <div class="footer">
    Exported from Ontographia Blueprint Studio on ${date}
  </div>
</body>
</html>`;

    // Download as HTML (opens in Word)
    const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${ideaId}_${idea.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'idea'}_${date}.html`;
    link.click();
  }, [activeInitiative, categories]);

  // Drag handlers
  const handleDragStart = useCallback((e, idea) => {
    setDraggedIdea(idea);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', idea.id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedIdea(null);
    setDragOverCategory(null);
  }, []);

  const handleDragOver = useCallback((e, categoryId) => {
    e.preventDefault();
    setDragOverCategory(categoryId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverCategory(null);
  }, []);

  const handleDrop = useCallback(async (e, categoryId) => {
    e.preventDefault();
    setDragOverCategory(null);
    if (draggedIdea && draggedIdea.idea_data?.priority !== categoryId) {
      await handlePriorityChange(draggedIdea, categoryId);
    }
    setDraggedIdea(null);
  }, [draggedIdea, handlePriorityChange]);

  const handleInitiativeSelect = useCallback((initiative) => {
    if (initiative) onSelectInitiative?.(initiative);
  }, [onSelectInitiative]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterPriority('all');
    setFilterStage('all');
  }, []);

  const hasActiveFilters = searchQuery || filterPriority !== 'all' || filterStage !== 'all';

  // No initiative selected
  if (!activeInitiative) {
    return (
      <div className="stage-view discovery-view">
        <div className="stage-view-header stage-view-header--minimal">
          <div className="stage-view-header-left">
            <LightbulbIcon className="stage-view-icon" style={{ color: '#D1A73A' }} />
            <h1 className="stage-view-title">Discovery</h1>
          </div>
          <div className="stage-view-header-right">
            <InitiativeSelector onSelect={handleInitiativeSelect} placeholder="Select initiative..." />
          </div>
        </div>
        <div className="stage-view-content">
          <div className="stage-view-select-prompt">
            <LightbulbIcon style={{ fontSize: 48, color: '#D1A73A', opacity: 0.5 }} />
            <h3>Select an Initiative</h3>
            <p>Choose an initiative to view and manage product ideas.</p>
          </div>
        </div>
      </div>
    );
  }

  // Stage counts for header
  const stageCounts = {
    idea: ideasInDiscovery.filter(i => i.stage === 'idea').length,
    explore: ideasInDiscovery.filter(i => i.stage === 'explore').length,
    assess: ideasInDiscovery.filter(i => i.stage === 'assess').length,
  };

  return (
    <div className={`stage-view stage-view--notebook discovery-view ${selectedIdea ? 'with-detail' : ''} ${detailExpanded ? 'detail-expanded' : ''}`}>
      {/* Header - matches IdeaCapture structure */}
      <header className="stage-header-inline" style={{ '--stage-accent': '#D1A73A' }}>
        <button className="stage-header-back" onClick={handleBack} title="Back to Overview">
          <ArrowBackIcon fontSize="small" />
        </button>

        <span className="stage-header-id">{activeInitiative.display_id}</span>
        <span className="stage-header-name">{activeInitiative.name}</span>

        <div className="stage-header-divider" />

        {/* Stage filter badges */}
        <div className="discovery-stage-filters">
          {DISCOVERY_STAGES.map(stage => {
            const config = STAGE_CONFIG[stage];
            const Icon = config.icon;
            const count = stageCounts[stage];
            return (
              <button
                key={stage}
                className={`discovery-stage-badge ${filterStage === stage ? 'active' : ''}`}
                style={{ '--stage-color': config.color, '--stage-bg': config.bgColor }}
                onClick={() => setFilterStage(filterStage === stage ? 'all' : stage)}
                title={`${config.label}: ${count} ideas`}
              >
                <Icon style={{ fontSize: 14 }} />
                <span className="discovery-stage-count">{count}</span>
              </button>
            );
          })}
        </div>

        <span className="stage-header-count">
          {filteredIdeas.length}{hasActiveFilters ? `/${ideasInDiscovery.length}` : ''} idea{filteredIdeas.length !== 1 ? 's' : ''}
        </span>

        <button
          className="stage-header-action"
          onClick={() => setShowGuidance(!showGuidance)}
          title={showGuidance ? 'Hide guidance' : 'Show guidance'}
        >
          <HelpOutlineIcon fontSize="small" />
        </button>
      </header>

      {/* Toolbar - hidden when detail is expanded to full page */}
      {!detailExpanded && (
      <div className="idea-toolbar">
        <div className="idea-toolbar-left">
          <div className="idea-view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'lanes' ? 'active' : ''}`}
              onClick={() => setViewMode('lanes')}
              title="Priority grid"
            >
              <ViewModuleIcon fontSize="small" />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban columns"
            >
              <DragIndicatorIcon fontSize="small" style={{ transform: 'rotate(90deg)' }} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Table view"
            >
              <TableRowsIcon fontSize="small" />
            </button>
          </div>

          <div className="idea-search">
            <SearchIcon fontSize="small" className="idea-search-icon" />
            <input
              type="text"
              className="idea-search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="idea-search-clear" onClick={() => setSearchQuery('')}>
                <ClearIcon fontSize="small" />
              </button>
            )}
          </div>

          <select
            className="idea-filter-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button className="idea-clear-filters" onClick={clearFilters}>
              <ClearIcon fontSize="small" />
              Clear
            </button>
          )}
        </div>

        <div className="idea-toolbar-right">
          <div className="idea-export-wrap" ref={exportMenuRef}>
            <button
              className="idea-export-btn"
              onClick={() => setShowExportMenu(!showExportMenu)}
              title="Export options"
            >
              <FileDownloadIcon fontSize="small" />
              <span>Export</span>
            </button>
            {showExportMenu && (
              <div className="idea-export-menu">
                <button className="idea-export-option" onClick={() => handleExport('excel')}>
                  <span>📊</span> Export to Excel
                </button>
                <button className="idea-export-option" onClick={() => handleExport('html')}>
                  <span>📄</span> Export for Word
                </button>
              </div>
            )}
          </div>
          <button className="idea-add-btn" onClick={() => handleNewIdea()}>
            <AddIcon fontSize="small" />
            <span>Add Idea</span>
          </button>
        </div>
      </div>
      )}

      {/* Main content area with optional sidebar */}
      <div className={`stage-notebook-body ${showGuidance && !selectedIdea ? 'with-guidance' : ''}`}>
        <main className="stage-notebook-main stage-notebook-main--scroll">
          {loadingProductIdeas ? (
            <div className="stage-loading">Loading ideas...</div>
          ) : viewMode === 'lanes' ? (
            <div className="ideas-swim-lanes">
              {categories
                .filter(category => filterPriority === 'all' || category.id === filterPriority)
                .map(category => {
                const categoryIdeas = ideasByCategory[category.id] || [];
                const isEmpty = categoryIdeas.length === 0;
                const isDropTarget = dragOverCategory === category.id;

                return (
                  <section
                    key={category.id}
                    className={`idea-swim-lane ${isDropTarget ? 'drop-target' : ''} ${isEmpty ? 'empty' : ''}`}
                    onDragOver={(e) => handleDragOver(e, category.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, category.id)}
                  >
                    <header className="swim-lane-header">
                      <div className="swim-lane-indicator" style={{ backgroundColor: category.color }} />
                      {editingCategory === category.id ? (
                        <input
                          type="text"
                          className="swim-lane-input"
                          defaultValue={category.label}
                          autoFocus
                          onBlur={(e) => handleCategoryLabelChange(category.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCategoryLabelChange(category.id, e.target.value);
                            else if (e.key === 'Escape') setEditingCategory(null);
                          }}
                        />
                      ) : (
                        <h3 className="swim-lane-title" onClick={() => setEditingCategory(category.id)} title="Click to edit">
                          {category.label}
                        </h3>
                      )}
                      <span className="swim-lane-count">{categoryIdeas.length}</span>
                      <button className="swim-lane-add" onClick={() => handleNewIdea(category.id)} title="Add idea">
                        <AddIcon fontSize="small" />
                      </button>
                    </header>

                    <div className="swim-lane-cards">
                      {categoryIdeas.map(idea => {
                        const stageConfig = STAGE_CONFIG[idea.stage] || STAGE_CONFIG.idea;
                        const StageIcon = stageConfig.icon;
                        const completeness = calculateCompleteness(idea);
                        const isTransitioning = transitioningIds.has(idea.id);
                        const isSelected = selectedIdea?.id === idea.id;

                        return (
                          <article
                            key={idea.id}
                            className={`discovery-card ${isSelected ? 'selected' : ''} ${isTransitioning ? 'transitioning' : ''}`}
                            style={{ '--card-stage-color': stageConfig.color, '--card-stage-bg': stageConfig.bgColor }}
                            draggable={!isTransitioning}
                            onDragStart={(e) => handleDragStart(e, idea)}
                            onDragEnd={handleDragEnd}
                            onClick={() => handleSelectIdea(idea)}
                          >
                            {/* Stage indicator stripe */}
                            <div className="discovery-card-stage-stripe" />

                            {/* Card header with stage badge */}
                            <div className="discovery-card-header">
                              <div className="discovery-card-stage-badge" title={stageConfig.label}>
                                <StageIcon style={{ fontSize: 14 }} />
                              </div>
                              <DragIndicatorIcon className="discovery-card-drag" fontSize="small" />
                            </div>

                            {/* Card content */}
                            <div className="discovery-card-content">
                              <h4 className="discovery-card-name">{idea.name}</h4>
                              {idea.description && (
                                <p className="discovery-card-desc">{idea.description}</p>
                              )}
                            </div>

                            {/* Visual metrics */}
                            <div className="discovery-card-metrics">
                              {/* Completeness ring */}
                              <div className="discovery-card-progress" title={`${completeness}% complete`}>
                                <svg viewBox="0 0 36 36" className="discovery-progress-ring">
                                  <path
                                    className="discovery-progress-bg"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                  <path
                                    className="discovery-progress-fill"
                                    strokeDasharray={`${completeness}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    style={{ stroke: stageConfig.color }}
                                  />
                                </svg>
                                <span className="discovery-progress-text">{completeness}%</span>
                              </div>

                              {/* Stage position indicator */}
                              <div className="discovery-card-stage-dots">
                                {DISCOVERY_STAGES.map((s, idx) => (
                                  <span
                                    key={s}
                                    className={`discovery-stage-dot ${s === idea.stage ? 'active' : ''} ${DISCOVERY_STAGES.indexOf(idea.stage) > idx ? 'complete' : ''}`}
                                    style={{ '--dot-color': STAGE_CONFIG[s].color }}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Quick actions */}
                            <div className="discovery-card-actions">
                              <button
                                className="discovery-card-action"
                                onClick={(e) => { e.stopPropagation(); handleAdvanceStage(idea); }}
                                title={idea.stage === 'assess' ? 'Move to Decision' : 'Advance stage'}
                                disabled={isTransitioning}
                              >
                                <ArrowForwardIcon fontSize="small" />
                              </button>
                              <button
                                className="discovery-card-action discovery-card-action--danger"
                                onClick={(e) => { e.stopPropagation(); handleDeleteIdea(idea); }}
                                title="Delete"
                              >
                                <DeleteIcon fontSize="small" />
                              </button>
                            </div>
                          </article>
                        );
                      })}

                      {isEmpty && (
                        <div className="swim-lane-empty" onClick={() => handleNewIdea(category.id)}>
                          <span>Drop here or +</span>
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : viewMode === 'kanban' ? (
            /* Kanban column view */
            <div className="ideas-kanban-view">
              {categories
                .filter(category => filterPriority === 'all' || category.id === filterPriority)
                .map(category => {
                const categoryIdeas = ideasByCategory[category.id] || [];
                const isEmpty = categoryIdeas.length === 0;
                const isDropTarget = dragOverCategory === category.id;

                return (
                  <div
                    key={category.id}
                    className={`kanban-column ${isDropTarget ? 'drop-target' : ''} ${isEmpty ? 'empty' : ''}`}
                    onDragOver={(e) => handleDragOver(e, category.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, category.id)}
                  >
                    <header className="kanban-column-header">
                      <div className="kanban-column-indicator" style={{ backgroundColor: category.color }} />
                      <h3 className="kanban-column-title">{category.label}</h3>
                      <span className="kanban-column-count">{categoryIdeas.length}</span>
                      <button className="kanban-column-add" onClick={() => handleNewIdea(category.id)} title="Add idea">
                        <AddIcon fontSize="small" />
                      </button>
                    </header>

                    <div className="kanban-column-cards">
                      {categoryIdeas.map(idea => {
                        const stageConfig = STAGE_CONFIG[idea.stage] || STAGE_CONFIG.idea;
                        const StageIcon = stageConfig.icon;
                        const completeness = calculateCompleteness(idea);
                        const isTransitioning = transitioningIds.has(idea.id);
                        const isSelected = selectedIdea?.id === idea.id;

                        return (
                          <article
                            key={idea.id}
                            className={`kanban-card ${isSelected ? 'selected' : ''} ${isTransitioning ? 'transitioning' : ''}`}
                            style={{ '--card-stage-color': stageConfig.color }}
                            draggable={!isTransitioning}
                            onDragStart={(e) => handleDragStart(e, idea)}
                            onDragEnd={handleDragEnd}
                            onClick={() => handleSelectIdea(idea)}
                          >
                            <div className="kanban-card-header">
                              <div className="kanban-card-stage" title={stageConfig.label}>
                                <StageIcon style={{ fontSize: 12 }} />
                              </div>
                              <span className="kanban-card-progress">{completeness}%</span>
                            </div>
                            <h4 className="kanban-card-name">{idea.name}</h4>
                            {idea.description && (
                              <p className="kanban-card-desc">{idea.description}</p>
                            )}
                          </article>
                        );
                      })}

                      {isEmpty && (
                        <div className="kanban-column-empty" onClick={() => handleNewIdea(category.id)}>
                          <span>+ Add idea</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Grid/table view */
            <div className="ideas-grid-view">
              <table className="ideas-table">
                <thead>
                  <tr>
                    <th className="ideas-table-th">Name</th>
                    <th className="ideas-table-th" style={{ width: 100 }}>Stage</th>
                    <th className="ideas-table-th">Description</th>
                    <th className="ideas-table-th ideas-table-th--priority">Priority</th>
                    <th className="ideas-table-th" style={{ width: 80 }}>Progress</th>
                    <th className="ideas-table-th ideas-table-th--actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIdeas.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="ideas-table-empty">
                        {hasActiveFilters ? 'No ideas match your filters' : 'No ideas yet'}
                      </td>
                    </tr>
                  ) : (
                    filteredIdeas.map(idea => {
                      const priority = idea.idea_data?.priority || 'unassigned';
                      const category = categories.find(c => c.id === priority);
                      const stageConfig = STAGE_CONFIG[idea.stage] || STAGE_CONFIG.idea;
                      const completeness = calculateCompleteness(idea);
                      const isSelected = selectedIdea?.id === idea.id;

                      return (
                        <tr
                          key={idea.id}
                          className={`ideas-table-row ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectIdea(idea)}
                        >
                          <td className="ideas-table-td ideas-table-td--name">
                            <span className="ideas-table-link">{idea.name}</span>
                          </td>
                          <td className="ideas-table-td">
                            <span
                              className="discovery-stage-pill"
                              style={{ '--pill-color': stageConfig.color, '--pill-bg': stageConfig.bgColor }}
                            >
                              {stageConfig.label}
                            </span>
                          </td>
                          <td className="ideas-table-td ideas-table-td--desc">{idea.description || '-'}</td>
                          <td className="ideas-table-td ideas-table-td--priority">
                            <select
                              className="ideas-table-priority-select"
                              value={priority}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handlePriorityChange(idea, e.target.value)}
                              style={{ borderLeftColor: category?.color }}
                            >
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="ideas-table-td">
                            <div className="discovery-table-progress">
                              <div className="discovery-table-progress-bar" style={{ width: `${completeness}%`, backgroundColor: stageConfig.color }} />
                              <span>{completeness}%</span>
                            </div>
                          </td>
                          <td className="ideas-table-td ideas-table-td--actions">
                            <button
                              className="ideas-table-action"
                              onClick={(e) => { e.stopPropagation(); handleAdvanceStage(idea); }}
                              title="Advance"
                            >
                              <ArrowForwardIcon fontSize="small" />
                            </button>
                            <button
                              className="ideas-table-action ideas-table-action--danger"
                              onClick={(e) => { e.stopPropagation(); handleDeleteIdea(idea); }}
                              title="Delete"
                            >
                              <DeleteIcon fontSize="small" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Guidance sidebar */}
        {showGuidance && !selectedIdea && (
          <aside className="stage-guidance">
            <div className="guidance-content">
              <h4 className="guidance-title">Discovery Phase</h4>
              <p className="guidance-text">Move ideas through three stages:</p>

              {DISCOVERY_STAGES.map(stage => {
                const config = STAGE_CONFIG[stage];
                const Icon = config.icon;
                return (
                  <div key={stage} className="guidance-stage-item">
                    <Icon style={{ color: config.color, fontSize: 18 }} />
                    <div>
                      <strong>{config.label}</strong>
                      <span>{config.description}</span>
                    </div>
                  </div>
                );
              })}

              <h4 className="guidance-title" style={{ marginTop: '1.5rem' }}>Tips</h4>
              <ul className="guidance-checklist">
                <li>Drag cards to reprioritize</li>
                <li>Click to view/edit details</li>
                <li>Use stage tabs to fill info</li>
                <li>Advance when ready</li>
              </ul>
            </div>
          </aside>
        )}

        {/* Detail panel with tabs */}
        {selectedIdea && (
          <aside className={`discovery-detail-panel ${detailExpanded ? 'expanded' : ''}`}>
            <header className={`discovery-detail-header ${detailExpanded ? 'discovery-detail-header--fullpage' : ''}`}>
              {/* Breadcrumb navigation: BPS-002 / PI-003 idea name */}
              <nav className="discovery-detail-breadcrumb">
                <button
                  className="discovery-breadcrumb-link discovery-breadcrumb-link--initiative"
                  onClick={handleCloseDetail}
                  title="Back to ideas list"
                >
                  <ArrowBackIcon style={{ fontSize: 16 }} />
                  <span>{activeInitiative?.display_id}</span>
                </button>
                <span className="discovery-breadcrumb-separator">/</span>
                <span className="discovery-breadcrumb-current">
                  <span
                    className="discovery-detail-stage-dot"
                    style={{ backgroundColor: STAGE_CONFIG[selectedIdea.stage]?.color }}
                  />
                  <button
                    className={`discovery-breadcrumb-id ${copiedId ? 'copied' : ''}`}
                    onClick={() => handleCopyId(selectedIdea.display_id || selectedIdea.productIdeaId)}
                    title={copiedId ? 'Copied!' : 'Click to copy ID'}
                  >
                    {selectedIdea.display_id || selectedIdea.productIdeaId}
                    {copiedId ? (
                      <CheckIcon style={{ fontSize: 11, marginLeft: 4 }} />
                    ) : (
                      <ContentCopyIcon style={{ fontSize: 11, marginLeft: 4, opacity: 0.5 }} />
                    )}
                  </button>
                </span>
              </nav>

              <h2 className="discovery-detail-page-title">{selectedIdea.name}</h2>

              <div className="discovery-detail-actions">
                {hasChanges && (
                  <button
                    className="discovery-detail-action discovery-detail-action--save"
                    onClick={handleSaveIdea}
                    disabled={savingChanges}
                    title="Save changes"
                  >
                    <SaveIcon fontSize="small" />
                  </button>
                )}
                <button
                  className="discovery-detail-action"
                  onClick={() => handleExportIdea(selectedIdea, 'full')}
                  title="Download for Word"
                >
                  <FileDownloadIcon fontSize="small" />
                </button>
                <button
                  className="discovery-detail-action"
                  onClick={handleToggleExpand}
                  title={detailExpanded ? 'Collapse' : 'Expand'}
                >
                  {detailExpanded ? <CloseFullscreenIcon fontSize="small" /> : <OpenInFullIcon fontSize="small" />}
                </button>
              </div>
            </header>

            {/* Stage tabs */}
            <nav className="discovery-detail-tabs">
              {DISCOVERY_STAGES.map((stage, idx) => {
                const config = STAGE_CONFIG[stage];
                const Icon = config.icon;
                const isActive = activeTab === stage;
                const isCurrent = selectedIdea.stage === stage;
                const isPast = DISCOVERY_STAGES.indexOf(selectedIdea.stage) > idx;

                return (
                  <button
                    key={stage}
                    className={`discovery-detail-tab ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''} ${isPast ? 'complete' : ''}`}
                    style={{ '--tab-color': config.color }}
                    onClick={() => setActiveTab(stage)}
                  >
                    <Icon fontSize="small" />
                    <span>{config.label}</span>
                    {isCurrent && <span className="discovery-tab-current-badge">Current</span>}
                  </button>
                );
              })}
            </nav>

            {/* Tab content */}
            <div className="discovery-detail-body">
              {activeTab === 'idea' && (
                <div className="discovery-tab-content">
                  {/* Completeness indicator */}
                  {(() => {
                    const fields = [editForm.name, editForm.description, editForm.target_customer, editForm.problem_statement, editForm.hypothesis];
                    const filled = fields.filter(f => f && f.trim()).length;
                    const percent = Math.round((filled / fields.length) * 100);
                    return (
                      <div className="discovery-completeness">
                        <div className="discovery-completeness-bar">
                          <div
                            className="discovery-completeness-fill"
                            style={{ width: `${percent}%`, backgroundColor: STAGE_CONFIG.idea.color }}
                          />
                        </div>
                        <span className="discovery-completeness-text">{percent}% captured</span>
                      </div>
                    );
                  })()}

                  {/* Section: The Spark */}
                  <div className="discovery-section-group">
                    <div className="discovery-section-header">
                      <LightbulbIcon style={{ fontSize: 16, color: STAGE_CONFIG.idea.color }} />
                      <span>The Spark</span>
                    </div>

                    <div className="discovery-detail-section">
                      <label className="discovery-detail-label">What's the big idea?</label>
                      <input
                        type="text"
                        className="discovery-detail-input discovery-detail-input--prominent"
                        value={editForm.name || ''}
                        onChange={(e) => handleEditFormChange('name', e.target.value)}
                        placeholder="e.g., Mobile check-in for hotel guests"
                      />
                    </div>

                    <div className="discovery-detail-section">
                      <label className="discovery-detail-label">Paint the picture</label>
                      <textarea
                        className="discovery-detail-textarea"
                        value={editForm.description || ''}
                        onChange={(e) => handleEditFormChange('description', e.target.value)}
                        placeholder="e.g., Allow guests to skip the front desk entirely by checking in via their phone, selecting their room, and using a digital key to access it."
                        rows={3}
                      />
                      <span className="discovery-detail-hint">What opportunity have you spotted? What could be different?</span>
                    </div>
                  </div>

                  {/* Section: The Problem */}
                  <div className="discovery-section-group">
                    <div className="discovery-section-header">
                      <TargetIcon style={{ fontSize: 16, color: '#A54D4D' }} />
                      <span>The Problem</span>
                    </div>

                    <div className="discovery-detail-section">
                      <label className="discovery-detail-label">Who feels this pain?</label>
                      <input
                        type="text"
                        className="discovery-detail-input"
                        value={editForm.target_customer || ''}
                        onChange={(e) => handleEditFormChange('target_customer', e.target.value)}
                        placeholder="e.g., Business travelers who arrive late and hate waiting in line"
                      />
                      <span className="discovery-detail-hint">Be specific about who, not just demographics</span>
                    </div>

                    <div className="discovery-detail-section">
                      <label className="discovery-detail-label">What's the frustration?</label>
                      <textarea
                        className="discovery-detail-textarea"
                        value={editForm.problem_statement || ''}
                        onChange={(e) => handleEditFormChange('problem_statement', e.target.value)}
                        placeholder="e.g., After a long flight, guests spend 10-15 minutes waiting to check in. They're tired, the line is slow, and all they want is to get to their room."
                        rows={3}
                      />
                      <span className="discovery-detail-hint">What happens today that's painful or inefficient?</span>
                    </div>
                  </div>

                  {/* Section: The Hypothesis - Prominent */}
                  <div className="discovery-section-group discovery-section-group--highlight">
                    <div className="discovery-section-header">
                      <ScienceIcon style={{ fontSize: 16, color: '#5B8A6A' }} />
                      <span>The Hypothesis</span>
                    </div>

                    <div className="discovery-detail-section">
                      <label className="discovery-detail-label">What's your testable belief?</label>
                      <textarea
                        className="discovery-detail-textarea discovery-detail-textarea--highlight"
                        value={editForm.hypothesis || ''}
                        onChange={(e) => handleEditFormChange('hypothesis', e.target.value)}
                        placeholder="e.g., We believe that business travelers will prefer mobile check-in over front desk because it saves them 10+ minutes and gives them control over room selection, leading to higher satisfaction scores."
                        rows={4}
                      />
                      <span className="discovery-detail-hint discovery-detail-hint--tip">
                        <TipsAndUpdatesIcon style={{ fontSize: 14 }} />
                        A clear hypothesis tells you what to test and how you'll know if you're right
                      </span>
                    </div>
                  </div>

                  {/* Priority Matrix - Impact × Urgency */}
                  <div className="discovery-priority-matrix">
                    <div className="discovery-priority-matrix-header">
                      <span>Prioritization</span>
                      <span className="discovery-priority-result">
                        <span
                          className="discovery-priority-dot"
                          style={{ backgroundColor: categories.find(c => c.id === editForm.priority)?.color || '#9C9A94' }}
                        />
                        {categories.find(c => c.id === editForm.priority)?.label || 'Uncategorized'}
                      </span>
                    </div>

                    <div className="discovery-priority-matrix-grid">
                      {/* Impact selector */}
                      <div className="discovery-priority-axis">
                        <label className="discovery-priority-axis-label">Impact</label>
                        <span className="discovery-priority-axis-hint">How much value if we do this?</span>
                        <div className="discovery-priority-options">
                          {['high', 'medium', 'low'].map(level => {
                            const impact = editForm.impact || 'medium';
                            return (
                              <button
                                key={level}
                                type="button"
                                className={`discovery-priority-option ${impact === level ? 'active' : ''}`}
                                data-level={level}
                                onClick={() => {
                                  handleEditFormChange('impact', level);
                                  // Auto-calculate priority based on impact × urgency matrix
                                  const urgency = editForm.urgency || 'medium';
                                  let newPriority = 'could';
                                  if (level === 'high' && urgency === 'high') newPriority = 'must';
                                  else if ((level === 'high' && urgency === 'medium') || (level === 'medium' && urgency === 'high')) newPriority = 'should';
                                  else if (level === 'high' || urgency === 'high' || (level === 'medium' && urgency === 'medium')) newPriority = 'could';
                                  else newPriority = 'wont';
                                  handleEditFormChange('priority', newPriority);
                                }}
                              >
                                {level === 'high' ? 'High' : level === 'medium' ? 'Medium' : 'Low'}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Urgency selector */}
                      <div className="discovery-priority-axis">
                        <label className="discovery-priority-axis-label">Urgency</label>
                        <span className="discovery-priority-axis-hint">How soon do we need this?</span>
                        <div className="discovery-priority-options">
                          {['high', 'medium', 'low'].map(level => {
                            const urgency = editForm.urgency || 'medium';
                            return (
                              <button
                                key={level}
                                type="button"
                                className={`discovery-priority-option ${urgency === level ? 'active' : ''}`}
                                data-level={level}
                                onClick={() => {
                                  handleEditFormChange('urgency', level);
                                  // Auto-calculate priority based on impact × urgency matrix
                                  const impact = editForm.impact || 'medium';
                                  let newPriority = 'could';
                                  if (impact === 'high' && level === 'high') newPriority = 'must';
                                  else if ((impact === 'high' && level === 'medium') || (impact === 'medium' && level === 'high')) newPriority = 'should';
                                  else if (impact === 'high' || level === 'high' || (impact === 'medium' && level === 'medium')) newPriority = 'could';
                                  else newPriority = 'wont';
                                  handleEditFormChange('priority', newPriority);
                                }}
                              >
                                {level === 'high' ? 'High' : level === 'medium' ? 'Medium' : 'Low'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Visual matrix indicator */}
                    <div className="discovery-priority-matrix-visual">
                      <div className="discovery-matrix-grid">
                        {/* Row labels */}
                        <div className="discovery-matrix-label-y">Impact</div>
                        {/* Matrix cells - Impact (rows) × Urgency (cols) */}
                        {['high', 'medium', 'low'].map(impact => (
                          ['high', 'medium', 'low'].map(urgency => {
                            const isSelected = (editForm.impact || 'medium') === impact && (editForm.urgency || 'medium') === urgency;
                            let cellPriority = 'could';
                            if (impact === 'high' && urgency === 'high') cellPriority = 'must';
                            else if ((impact === 'high' && urgency === 'medium') || (impact === 'medium' && urgency === 'high')) cellPriority = 'should';
                            else if (impact === 'high' || urgency === 'high' || (impact === 'medium' && urgency === 'medium')) cellPriority = 'could';
                            else cellPriority = 'wont';
                            const cellColor = categories.find(c => c.id === cellPriority)?.color || '#9E9E9E';
                            return (
                              <div
                                key={`${impact}-${urgency}`}
                                className={`discovery-matrix-cell ${isSelected ? 'selected' : ''}`}
                                style={{ '--cell-color': cellColor }}
                                title={`${impact} impact + ${urgency} urgency = ${categories.find(c => c.id === cellPriority)?.label}`}
                              />
                            );
                          })
                        ))}
                        {/* Column labels */}
                        <div className="discovery-matrix-label-x">Urgency</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'explore' && (
                <div className="discovery-tab-content discovery-tab-content--explore">
                  {/* Explore Stage Header */}
                  <div className="discovery-stage-guidance">
                    <div className="discovery-stage-guidance-header">
                      <ExploreIcon style={{ fontSize: 18, color: STAGE_CONFIG.explore.color }} />
                      <div>
                        <h4>Validate Your Hypothesis</h4>
                        <p>Talk to customers, gather evidence, build confidence.</p>
                      </div>
                    </div>
                  </div>

                  {/* Hypothesis being tested - Prominent display */}
                  <div className="explore-hypothesis-hero">
                    {editForm.hypothesis ? (
                      <>
                        <div className="explore-hypothesis-label">
                          <ScienceIcon style={{ fontSize: 16, color: '#5B8A6A' }} />
                          <span>We're testing this hypothesis</span>
                        </div>
                        <p className="explore-hypothesis-text">{editForm.hypothesis}</p>
                      </>
                    ) : (
                      <div className="explore-hypothesis-empty">
                        <ScienceIcon style={{ fontSize: 20, color: '#9C9A94' }} />
                        <div>
                          <p>No hypothesis defined yet</p>
                          <button
                            type="button"
                            className="explore-hypothesis-add-btn"
                            onClick={() => setActiveTab('idea')}
                          >
                            Add hypothesis in Idea tab →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Validation Progress */}
                  <div className="explore-validation-progress">
                    <div className="explore-progress-header">
                      <h5>Validation Progress</h5>
                      <div className="explore-confidence-badge" style={{
                        '--badge-color': (editForm.market_fit_score || 0) >= 7 ? '#5B8A6A' :
                                        (editForm.market_fit_score || 0) >= 4 ? '#C9A227' : '#A54D4D'
                      }}>
                        <span className="explore-confidence-label">Confidence</span>
                        <span className="explore-confidence-value">{editForm.market_fit_score || 0}/10</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={editForm.market_fit_score || 0}
                      onChange={(e) => handleEditFormChange('market_fit_score', parseInt(e.target.value))}
                      className="explore-confidence-slider"
                      style={{
                        '--slider-color': (editForm.market_fit_score || 0) >= 7 ? '#5B8A6A' :
                                         (editForm.market_fit_score || 0) >= 4 ? '#C9A227' : '#A54D4D'
                      }}
                    />
                    <div className="explore-confidence-scale">
                      <span>Unvalidated</span>
                      <span>Validated</span>
                    </div>
                  </div>

                  {/* Two main validation areas */}
                  <div className="explore-validation-grid">
                    {/* Customer Discovery */}
                    <div className={`explore-validation-card ${expandedCard === 'interviews' ? 'expanded' : ''}`}>
                      <div
                        className="explore-validation-card-header"
                        onClick={() => setExpandedCard(expandedCard === 'interviews' ? null : 'interviews')}
                      >
                        <div className="explore-validation-card-icon" style={{ backgroundColor: 'rgba(107, 162, 181, 0.1)' }}>
                          <GroupsIcon style={{ color: STAGE_CONFIG.explore.color }} />
                        </div>
                        <div className="explore-validation-card-title">
                          <h5>Customer Discovery</h5>
                          <p>What are customers telling you?</p>
                        </div>
                        <div className="explore-validation-card-meta">
                          <span className="explore-interview-badge">
                            {editForm.interview_count || 0} interviews
                          </span>
                          {(editForm.interview_count || 0) >= 5 ? (
                            <CheckCircleOutlineIcon style={{ fontSize: 18, color: '#5B8A6A' }} />
                          ) : (
                            <span className="explore-validation-target">Target: 5+</span>
                          )}
                        </div>
                      </div>

                      {expandedCard === 'interviews' && (
                        <div className="explore-validation-card-body">
                          <div className="explore-interview-actions">
                            <button
                              type="button"
                              className="explore-add-interview-btn"
                              onClick={() => {
                                const template = `\n\n---\n\nInterview #${(editForm.interview_count || 0) + 1} — ${new Date().toLocaleDateString()}\nWho: [Role/Company]\nKey quote: "[What they said]"\nInsight: [What we learned]`;
                                handleEditFormChange('customer_interviews', (editForm.customer_interviews || '') + template);
                                handleEditFormChange('interview_count', (editForm.interview_count || 0) + 1);
                              }}
                            >
                              <AddIcon style={{ fontSize: 14 }} /> Log Interview
                            </button>
                          </div>
                          <textarea
                            value={editForm.customer_interviews || ''}
                            onChange={(e) => handleEditFormChange('customer_interviews', e.target.value)}
                            placeholder="Interview #1 — Jan 15, 2024
Who: Sarah, Product Manager at Fintech Corp
Key quote: 'We lose 3 hours every day just coordinating'
Insight: Pain point is real and quantifiable

Interview #2 — Jan 16, 2024
Who: Marcus, Engineering Lead at TechStartup
Key quote: 'I would pay $50/month for this today'
Insight: Strong willingness to pay, validates pricing"
                            rows={10}
                          />
                        </div>
                      )}
                    </div>

                    {/* Evidence Summary */}
                    <div className={`explore-validation-card ${expandedCard === 'evidence' ? 'expanded' : ''}`}>
                      <div
                        className="explore-validation-card-header"
                        onClick={() => setExpandedCard(expandedCard === 'evidence' ? null : 'evidence')}
                      >
                        <div className="explore-validation-card-icon" style={{ backgroundColor: 'rgba(91, 138, 106, 0.1)' }}>
                          <FactCheckIcon style={{ color: '#5B8A6A' }} />
                        </div>
                        <div className="explore-validation-card-title">
                          <h5>Evidence Summary</h5>
                          <p>What supports or challenges your hypothesis?</p>
                        </div>
                        <div className="explore-validation-card-meta">
                          {editForm.validation_notes ? (
                            <CheckCircleOutlineIcon style={{ fontSize: 18, color: '#5B8A6A' }} />
                          ) : (
                            <span className="explore-validation-cta">Add evidence →</span>
                          )}
                        </div>
                      </div>

                      {expandedCard === 'evidence' && (
                        <div className="explore-validation-card-body">
                          <textarea
                            value={editForm.validation_notes || ''}
                            onChange={(e) => handleEditFormChange('validation_notes', e.target.value)}
                            placeholder="✓ SUPPORTING EVIDENCE
What we learned that validates our hypothesis:
• 8/10 interviewees said they would pay for this
• Average time wasted on current solution: 4 hours/week
• Quote: 'I would switch immediately if this existed'

✗ CHALLENGING EVIDENCE
What we learned that questions our hypothesis:
• Some users have workarounds they're comfortable with
• Integration with existing tools is critical
• Price sensitivity higher than expected for SMBs

→ KEY IMPLICATIONS
What this means for our approach:
• Focus on enterprise first (less price sensitive)
• Integration story must be strong
• Highlight time savings in value prop"
                            rows={12}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Discovery Canvases - Visual tools for customer understanding */}
                  <div className="explore-canvases-section">
                    <div className="explore-canvases-header">
                      <h5>Discovery Canvases</h5>
                      <p>Visual tools to understand your customer</p>
                    </div>

                    <div className="explore-canvases-grid">
                      {/* User Personas Canvas Card */}
                      <div className="explore-canvas-card">
                        <div className="explore-canvas-card-header">
                          <div className="explore-canvas-card-icon" style={{ backgroundColor: `${CANVAS_TYPES.persona.color}15` }}>
                            <PersonIcon style={{ color: CANVAS_TYPES.persona.color }} />
                          </div>
                          <div className="explore-canvas-card-title">
                            <h6>User Personas</h6>
                            <span>{(selectedIdea?.canvas_data?.personas || []).filter(p => p.name).length} personas defined</span>
                          </div>
                        </div>

                        {/* Persona list */}
                        <div className="explore-canvas-card-items">
                          {(selectedIdea?.canvas_data?.personas || []).filter(p => p.name).length > 0 ? (
                            (selectedIdea?.canvas_data?.personas || []).filter(p => p.name).map((persona, idx) => {
                              const completeness = getCompleteness('persona', persona);
                              const actualIndex = (selectedIdea?.canvas_data?.personas || []).findIndex(p => p.id === persona.id);
                              return (
                                <button
                                  key={persona.id}
                                  className="explore-canvas-item"
                                  onClick={() => handleOpenCanvas('persona', actualIndex)}
                                >
                                  <div className="explore-canvas-item-avatar" style={{ backgroundColor: `${CANVAS_TYPES.persona.color}20` }}>
                                    <PersonIcon style={{ fontSize: 16, color: CANVAS_TYPES.persona.color }} />
                                  </div>
                                  <div className="explore-canvas-item-info">
                                    <span className="explore-canvas-item-name">{persona.name}</span>
                                    <span className="explore-canvas-item-role">{persona.role || 'No role'}</span>
                                  </div>
                                  <div className="explore-canvas-item-progress" title={`${completeness.percentage}% complete`}>
                                    <div
                                      className="explore-canvas-item-progress-fill"
                                      style={{ width: `${completeness.percentage}%`, backgroundColor: CANVAS_TYPES.persona.color }}
                                    />
                                  </div>
                                </button>
                              );
                            })
                          ) : (
                            <div className="explore-canvas-empty">
                              <span>No personas defined yet</span>
                            </div>
                          )}
                        </div>

                        <button
                          className="explore-canvas-add-btn"
                          onClick={() => handleOpenCanvas('persona', null)}
                          style={{ color: CANVAS_TYPES.persona.color }}
                        >
                          <AddIcon style={{ fontSize: 16 }} />
                          <span>Add Persona</span>
                        </button>
                      </div>

                      {/* Customer Journey Canvas Card */}
                      {(() => {
                        const journeyData = selectedIdea?.canvas_data?.journey || {};
                        const completeness = getCompleteness('journey', journeyData);
                        const hasContent = journeyData.stages?.some(s => s.touchpoints || s.actions || s.emotions || s.pains);
                        return (
                          <button
                            className={`explore-canvas-card explore-canvas-card--clickable ${hasContent ? 'has-content' : ''}`}
                            onClick={() => handleOpenCanvas('journey', null)}
                          >
                            <div className="explore-canvas-card-header">
                              <div className="explore-canvas-card-icon" style={{ backgroundColor: `${CANVAS_TYPES.journey.color}15` }}>
                                <RouteIcon style={{ color: CANVAS_TYPES.journey.color }} />
                              </div>
                              <div className="explore-canvas-card-title">
                                <h6>Customer Journey</h6>
                                <span>{journeyData.stages?.length || 5} stages mapped</span>
                              </div>
                              {hasContent && (
                                <CheckCircleOutlineIcon style={{ fontSize: 18, color: '#5B8A6A' }} />
                              )}
                            </div>
                            <div className="explore-canvas-card-preview">
                              <div className="explore-canvas-card-description">
                                {hasContent
                                  ? 'Touchpoints, actions, emotions & pain points mapped'
                                  : 'Map the customer experience across stages'
                                }
                              </div>
                              <div className="explore-canvas-card-progress">
                                <div className="explore-canvas-card-progress-bar">
                                  <div
                                    className="explore-canvas-card-progress-fill"
                                    style={{ width: `${completeness.percentage}%`, backgroundColor: CANVAS_TYPES.journey.color }}
                                  />
                                </div>
                                <span>{completeness.percentage}%</span>
                              </div>
                            </div>
                          </button>
                        );
                      })()}

                      {/* Empathy Map Canvas Card */}
                      {(() => {
                        const empathyData = selectedIdea?.canvas_data?.empathy || {};
                        const completeness = getCompleteness('empathy', empathyData);
                        const hasContent = empathyData.thinks || empathyData.feels || empathyData.says || empathyData.does;
                        return (
                          <button
                            className={`explore-canvas-card explore-canvas-card--clickable ${hasContent ? 'has-content' : ''}`}
                            onClick={() => handleOpenCanvas('empathy', null)}
                          >
                            <div className="explore-canvas-card-header">
                              <div className="explore-canvas-card-icon" style={{ backgroundColor: `${CANVAS_TYPES.empathy.color}15` }}>
                                <PsychologyIcon style={{ color: CANVAS_TYPES.empathy.color }} />
                              </div>
                              <div className="explore-canvas-card-title">
                                <h6>Empathy Map</h6>
                                <span>Think, feel, say, do</span>
                              </div>
                              {hasContent && (
                                <CheckCircleOutlineIcon style={{ fontSize: 18, color: '#5B8A6A' }} />
                              )}
                            </div>
                            <div className="explore-canvas-card-preview">
                              <div className="explore-canvas-card-description">
                                {hasContent
                                  ? `${completeness.filled} of ${completeness.total} quadrants filled`
                                  : 'Understand what users think, feel, say & do'
                                }
                              </div>
                              <div className="explore-canvas-card-progress">
                                <div className="explore-canvas-card-progress-bar">
                                  <div
                                    className="explore-canvas-card-progress-fill"
                                    style={{ width: `${completeness.percentage}%`, backgroundColor: CANVAS_TYPES.empathy.color }}
                                  />
                                </div>
                                <span>{completeness.percentage}%</span>
                              </div>
                            </div>
                          </button>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Link to Initiative Market Research */}
                  <div className="explore-initiative-link">
                    <div className="explore-initiative-link-content">
                      <TrendingUpIcon style={{ fontSize: 18, color: '#6366f1' }} />
                      <div>
                        <span className="explore-initiative-link-label">Market Research</span>
                        <p>TAM/SAM, competitors, and PESTLE analysis live at the initiative level</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="explore-initiative-link-btn"
                      onClick={() => onNavigate?.('market')}
                    >
                      View Market Research →
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'assess' && (
                <div className="discovery-tab-content assess-tab-content">
                  {/* Assessment Summary Header */}
                  {(() => {
                    const avgScore = Math.round(
                      ((editForm.feasibility_technical || 5) +
                       (editForm.feasibility_market || 5) +
                       (editForm.feasibility_operational || 5) +
                       (editForm.feasibility_financial || 5) +
                       (editForm.feasibility_time || 5)) / 5
                    );
                    const iceScore = ((editForm.ice_impact || 5) * (editForm.ice_confidence || 5) * (editForm.ice_ease || 5)) / 25;
                    const checklistItems = Object.values(editForm.checklist || {});
                    const checklistComplete = checklistItems.filter(Boolean).length;
                    const scoreColor = avgScore >= 7 ? '#5B8A6A' : avgScore >= 4 ? '#C9A227' : '#A54D4D';

                    return (
                      <div className="assess-summary-banner" style={{ '--score-color': scoreColor }}>
                        <div className="assess-summary-score">
                          <span className="assess-summary-score-value">{avgScore.toFixed(1)}</span>
                          <span className="assess-summary-score-label">Feasibility</span>
                        </div>
                        <div className="assess-summary-divider" />
                        <div className="assess-summary-metrics">
                          <div className="assess-summary-metric">
                            <span className="assess-summary-metric-value">{iceScore.toFixed(1)}</span>
                            <span className="assess-summary-metric-label">ICE Score</span>
                          </div>
                          <div className="assess-summary-metric">
                            <span className="assess-summary-metric-value">{checklistComplete}/{checklistItems.length}</span>
                            <span className="assess-summary-metric-label">Checklist</span>
                          </div>
                          <div className="assess-summary-metric">
                            <span className="assess-summary-metric-value">{(editForm.risks || []).length}</span>
                            <span className="assess-summary-metric-label">Risks</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Feasibility Radar - Multi-dimensional Assessment */}
                  <div className="assess-section assess-feasibility">
                    <div className="assess-section-header">
                      <RadarIcon style={{ fontSize: 18 }} />
                      <h4>Feasibility Assessment</h4>
                      <span className="assess-section-hint">Rate each dimension 1-10</span>
                    </div>

                    <div className="assess-feasibility-grid">
                      {/* Radar Chart Visualization */}
                      <div className="assess-radar-chart">
                        <svg viewBox="0 0 200 200" className="assess-radar-svg">
                          {/* Background rings */}
                          {[2, 4, 6, 8, 10].map(ring => (
                            <polygon
                              key={ring}
                              points={[0, 72, 144, 216, 288].map((angle, i) => {
                                const r = (ring / 10) * 70;
                                const x = 100 + r * Math.cos((angle - 90) * Math.PI / 180);
                                const y = 100 + r * Math.sin((angle - 90) * Math.PI / 180);
                                return `${x},${y}`;
                              }).join(' ')}
                              fill="none"
                              stroke="var(--border-default, #E2E0DB)"
                              strokeWidth="1"
                              opacity={ring === 10 ? 0.8 : 0.4}
                            />
                          ))}
                          {/* Axis lines */}
                          {[0, 72, 144, 216, 288].map((angle, i) => {
                            const x = 100 + 70 * Math.cos((angle - 90) * Math.PI / 180);
                            const y = 100 + 70 * Math.sin((angle - 90) * Math.PI / 180);
                            return (
                              <line
                                key={i}
                                x1="100" y1="100"
                                x2={x} y2={y}
                                stroke="var(--border-default, #E2E0DB)"
                                strokeWidth="1"
                              />
                            );
                          })}
                          {/* Data polygon */}
                          <polygon
                            points={[
                              editForm.feasibility_technical || 5,
                              editForm.feasibility_market || 5,
                              editForm.feasibility_operational || 5,
                              editForm.feasibility_financial || 5,
                              editForm.feasibility_time || 5,
                            ].map((val, i) => {
                              const angle = [0, 72, 144, 216, 288][i];
                              const r = (val / 10) * 70;
                              const x = 100 + r * Math.cos((angle - 90) * Math.PI / 180);
                              const y = 100 + r * Math.sin((angle - 90) * Math.PI / 180);
                              return `${x},${y}`;
                            }).join(' ')}
                            fill="rgba(107, 91, 149, 0.2)"
                            stroke="#6B5B95"
                            strokeWidth="2"
                          />
                          {/* Data points */}
                          {[
                            editForm.feasibility_technical || 5,
                            editForm.feasibility_market || 5,
                            editForm.feasibility_operational || 5,
                            editForm.feasibility_financial || 5,
                            editForm.feasibility_time || 5,
                          ].map((val, i) => {
                            const angle = [0, 72, 144, 216, 288][i];
                            const r = (val / 10) * 70;
                            const x = 100 + r * Math.cos((angle - 90) * Math.PI / 180);
                            const y = 100 + r * Math.sin((angle - 90) * Math.PI / 180);
                            return (
                              <circle
                                key={i}
                                cx={x} cy={y} r="4"
                                fill="#6B5B95"
                              />
                            );
                          })}
                        </svg>
                        {/* Labels */}
                        <span className="assess-radar-label" style={{ top: '2%', left: '50%', transform: 'translateX(-50%)' }}>Technical</span>
                        <span className="assess-radar-label" style={{ top: '35%', right: '0%' }}>Market</span>
                        <span className="assess-radar-label" style={{ bottom: '12%', right: '10%' }}>Operational</span>
                        <span className="assess-radar-label" style={{ bottom: '12%', left: '10%' }}>Financial</span>
                        <span className="assess-radar-label" style={{ top: '35%', left: '0%' }}>Time</span>
                      </div>

                      {/* Dimension Sliders */}
                      <div className="assess-dimension-sliders">
                        {[
                          { key: 'feasibility_technical', label: 'Technical', icon: BuildIcon, hint: 'Can we build it?' },
                          { key: 'feasibility_market', label: 'Market', icon: StorefrontIcon, hint: 'Will they buy it?' },
                          { key: 'feasibility_operational', label: 'Operational', icon: AccountBalanceIcon, hint: 'Can we support it?' },
                          { key: 'feasibility_financial', label: 'Financial', icon: AttachMoneyIcon, hint: 'Is it profitable?' },
                          { key: 'feasibility_time', label: 'Time-to-Market', icon: AccessTimeIcon, hint: 'Can we ship fast?' },
                        ].map(({ key, label, icon: Icon, hint }) => {
                          const value = editForm[key] || 5;
                          const color = value >= 7 ? '#5B8A6A' : value >= 4 ? '#C9A227' : '#A54D4D';
                          return (
                            <div key={key} className="assess-dimension-row">
                              <div className="assess-dimension-label">
                                <Icon style={{ fontSize: 16, color: '#6B5B95' }} />
                                <span>{label}</span>
                              </div>
                              <div className="assess-dimension-slider">
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={value}
                                  onChange={(e) => handleEditFormChange(key, parseInt(e.target.value))}
                                  className="assess-slider"
                                  style={{ '--slider-fill': color }}
                                />
                                <span className="assess-dimension-value" style={{ color }}>{value}</span>
                              </div>
                              <span className="assess-dimension-hint">{hint}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Two Column Layout: Risk + ICE Score */}
                  <div className="assess-two-col">
                    {/* Risk Assessment */}
                    <div className="assess-section assess-risks">
                      <div className="assess-section-header">
                        <WarningAmberIcon style={{ fontSize: 18, color: '#C9A227' }} />
                        <h4>Risk Assessment</h4>
                        <button
                          type="button"
                          className="assess-add-btn"
                          onClick={() => {
                            const newRisk = {
                              id: Date.now(),
                              name: '',
                              category: 'technical',
                              likelihood: 'medium',
                              impact: 'medium',
                              mitigation: '',
                            };
                            handleEditFormChange('risks', [...(editForm.risks || []), newRisk]);
                          }}
                        >
                          <AddIcon style={{ fontSize: 14 }} /> Add Risk
                        </button>
                      </div>

                      {/* Risk Matrix Mini */}
                      <div className="assess-risk-matrix">
                        <div className="assess-risk-matrix-grid">
                          {['high', 'medium', 'low'].map(impact => (
                            ['low', 'medium', 'high'].map(likelihood => {
                              const cellRisks = (editForm.risks || []).filter(
                                r => r.impact === impact && r.likelihood === likelihood
                              );
                              const severity =
                                (impact === 'high' && likelihood === 'high') ? 'critical' :
                                (impact === 'high' || likelihood === 'high') ? 'high' :
                                (impact === 'medium' && likelihood === 'medium') ? 'medium' : 'low';
                              return (
                                <div
                                  key={`${impact}-${likelihood}`}
                                  className={`assess-risk-cell assess-risk-cell--${severity}`}
                                  title={`${impact} impact, ${likelihood} likelihood`}
                                >
                                  {cellRisks.length > 0 && (
                                    <span className="assess-risk-cell-count">{cellRisks.length}</span>
                                  )}
                                </div>
                              );
                            })
                          ))}
                        </div>
                        <div className="assess-risk-matrix-labels">
                          <span className="assess-risk-matrix-y">Impact</span>
                          <span className="assess-risk-matrix-x">Likelihood</span>
                        </div>
                      </div>

                      {/* Risk List */}
                      <div className="assess-risk-list">
                        {(editForm.risks || []).length === 0 ? (
                          <div className="assess-empty-state">
                            <span>No risks identified yet</span>
                          </div>
                        ) : (
                          (editForm.risks || []).map((risk, idx) => (
                            <div key={risk.id} className="assess-risk-item">
                              <input
                                type="text"
                                className="assess-risk-name"
                                placeholder="Risk description..."
                                value={risk.name}
                                onChange={(e) => {
                                  const updated = [...editForm.risks];
                                  updated[idx] = { ...risk, name: e.target.value };
                                  handleEditFormChange('risks', updated);
                                }}
                              />
                              <div className="assess-risk-selects">
                                <select
                                  value={risk.likelihood}
                                  onChange={(e) => {
                                    const updated = [...editForm.risks];
                                    updated[idx] = { ...risk, likelihood: e.target.value };
                                    handleEditFormChange('risks', updated);
                                  }}
                                  className="assess-risk-select"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Med</option>
                                  <option value="high">High</option>
                                </select>
                                <span className="assess-risk-x">×</span>
                                <select
                                  value={risk.impact}
                                  onChange={(e) => {
                                    const updated = [...editForm.risks];
                                    updated[idx] = { ...risk, impact: e.target.value };
                                    handleEditFormChange('risks', updated);
                                  }}
                                  className="assess-risk-select"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Med</option>
                                  <option value="high">High</option>
                                </select>
                                <button
                                  type="button"
                                  className="assess-risk-delete"
                                  onClick={() => {
                                    const updated = editForm.risks.filter((_, i) => i !== idx);
                                    handleEditFormChange('risks', updated);
                                  }}
                                >
                                  <DeleteIcon style={{ fontSize: 14 }} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* ICE Score */}
                    <div className="assess-section assess-ice">
                      <div className="assess-section-header">
                        <SpeedIcon style={{ fontSize: 18, color: '#6B5B95' }} />
                        <h4>ICE Score</h4>
                        <span className="assess-ice-formula">I × C × E</span>
                      </div>

                      <div className="assess-ice-display">
                        <div className="assess-ice-total">
                          {(() => {
                            const score = ((editForm.ice_impact || 5) * (editForm.ice_confidence || 5) * (editForm.ice_ease || 5)) / 25;
                            const color = score >= 7 ? '#5B8A6A' : score >= 4 ? '#C9A227' : '#A54D4D';
                            return (
                              <>
                                <span className="assess-ice-total-value" style={{ color }}>{score.toFixed(1)}</span>
                                <span className="assess-ice-total-label">/ 10</span>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="assess-ice-sliders">
                        {[
                          { key: 'ice_impact', label: 'Impact', hint: 'How much will this move the needle?' },
                          { key: 'ice_confidence', label: 'Confidence', hint: 'How sure are we this works?' },
                          { key: 'ice_ease', label: 'Ease', hint: 'How easy is this to implement?' },
                        ].map(({ key, label, hint }) => {
                          const value = editForm[key] || 5;
                          return (
                            <div key={key} className="assess-ice-row">
                              <div className="assess-ice-label">
                                <span className="assess-ice-label-letter">{label[0]}</span>
                                <span>{label}</span>
                              </div>
                              <div className="assess-ice-slider-wrap">
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={value}
                                  onChange={(e) => handleEditFormChange(key, parseInt(e.target.value))}
                                  className="assess-slider assess-slider--ice"
                                />
                                <span className="assess-ice-value">{value}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Resource Requirements */}
                  <div className="assess-section assess-resources">
                    <div className="assess-section-header">
                      <PeopleAltIcon style={{ fontSize: 18 }} />
                      <h4>Resource Requirements</h4>
                    </div>

                    <div className="assess-resource-grid">
                      <div className="assess-resource-card">
                        <div className="assess-resource-card-header">
                          <GroupsIcon style={{ fontSize: 16 }} />
                          <span>Team</span>
                        </div>
                        <textarea
                          className="assess-resource-input"
                          placeholder="e.g., 1 PM, 2 Engineers, 0.5 Designer"
                          value={editForm.resource_team || ''}
                          onChange={(e) => handleEditFormChange('resource_team', e.target.value)}
                          rows={2}
                        />
                      </div>

                      <div className="assess-resource-card">
                        <div className="assess-resource-card-header">
                          <AccessTimeIcon style={{ fontSize: 16 }} />
                          <span>Timeline</span>
                        </div>
                        <div className="assess-timeline-options">
                          {[
                            { value: 'sprint', label: '1-2 weeks', icon: '⚡' },
                            { value: 'short', label: '1-2 months', icon: '🚀' },
                            { value: 'medium', label: '3-6 months', icon: '📅' },
                            { value: 'long', label: '6+ months', icon: '🏗️' },
                          ].map(({ value, label, icon }) => (
                            <button
                              key={value}
                              type="button"
                              className={`assess-timeline-btn ${editForm.resource_timeline === value ? 'active' : ''}`}
                              onClick={() => handleEditFormChange('resource_timeline', value)}
                            >
                              <span className="assess-timeline-icon">{icon}</span>
                              <span>{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="assess-resource-card">
                        <div className="assess-resource-card-header">
                          <AttachMoneyIcon style={{ fontSize: 16 }} />
                          <span>Budget</span>
                        </div>
                        <input
                          type="text"
                          className="assess-resource-input assess-resource-input--inline"
                          placeholder="e.g., $50K-100K"
                          value={editForm.resource_budget || ''}
                          onChange={(e) => handleEditFormChange('resource_budget', e.target.value)}
                        />
                      </div>

                      <div className="assess-resource-card">
                        <div className="assess-resource-card-header">
                          <LinkIcon style={{ fontSize: 16 }} />
                          <span>Dependencies</span>
                        </div>
                        <textarea
                          className="assess-resource-input"
                          placeholder="Teams, systems, or decisions blocking this"
                          value={editForm.resource_dependencies || ''}
                          onChange={(e) => handleEditFormChange('resource_dependencies', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Go/No-Go Checklist */}
                  <div className="assess-section assess-checklist">
                    <div className="assess-section-header">
                      <PlaylistAddCheckIcon style={{ fontSize: 18 }} />
                      <h4>Go/No-Go Checklist</h4>
                      {(() => {
                        const items = Object.values(editForm.checklist || {});
                        const complete = items.filter(Boolean).length;
                        return (
                          <span className={`assess-checklist-progress ${complete === items.length ? 'complete' : ''}`}>
                            {complete}/{items.length}
                          </span>
                        );
                      })()}
                    </div>

                    <div className="assess-checklist-items">
                      {[
                        { key: 'problem_validated', label: 'Problem validated with customers', hint: '5+ interviews confirm the pain' },
                        { key: 'solution_viable', label: 'Solution is technically viable', hint: 'Architecture reviewed, no blockers' },
                        { key: 'market_validated', label: 'Market opportunity validated', hint: 'TAM/SAM analysis complete' },
                        { key: 'resources_available', label: 'Resources can be committed', hint: 'Team and budget available' },
                        { key: 'risks_acceptable', label: 'Risks are acceptable', hint: 'Mitigations in place for high risks' },
                        { key: 'strategic_fit', label: 'Strategic alignment confirmed', hint: 'Fits company direction and priorities' },
                      ].map(({ key, label, hint }) => {
                        const checked = editForm.checklist?.[key] || false;
                        return (
                          <button
                            key={key}
                            type="button"
                            className={`assess-checklist-item ${checked ? 'checked' : ''}`}
                            onClick={() => {
                              handleEditFormChange('checklist', {
                                ...editForm.checklist,
                                [key]: !checked,
                              });
                            }}
                          >
                            {checked ? (
                              <CheckBoxIcon style={{ fontSize: 20, color: '#5B8A6A' }} />
                            ) : (
                              <CheckBoxOutlineBlankIcon style={{ fontSize: 20 }} />
                            )}
                            <div className="assess-checklist-item-text">
                              <span className="assess-checklist-item-label">{label}</span>
                              <span className="assess-checklist-item-hint">{hint}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="assess-section assess-recommendation">
                    <div className="assess-section-header">
                      <FactCheckIcon style={{ fontSize: 18 }} />
                      <h4>Recommendation</h4>
                    </div>

                    <div className="assess-recommendation-options">
                      {[
                        { value: 'proceed', label: 'Proceed', icon: ThumbUpIcon, color: '#5B8A6A', desc: 'Ready for investment decision' },
                        { value: 'iterate', label: 'Iterate', icon: TrendingFlatIcon, color: '#C9A227', desc: 'Needs more validation' },
                        { value: 'pivot', label: 'Pivot', icon: TrendingDownIcon, color: '#C9A227', desc: 'Change direction significantly' },
                        { value: 'park', label: 'Park', icon: AccessTimeIcon, color: '#9C9A94', desc: 'Not now, revisit later' },
                        { value: 'kill', label: 'Kill', icon: ThumbDownIcon, color: '#A54D4D', desc: 'Do not pursue' },
                      ].map(({ value, label, icon: Icon, color, desc }) => (
                        <button
                          key={value}
                          type="button"
                          className={`assess-recommendation-btn ${editForm.recommendation === value ? 'active' : ''}`}
                          style={{ '--rec-color': color }}
                          onClick={() => handleEditFormChange('recommendation', value)}
                        >
                          <Icon style={{ fontSize: 20 }} />
                          <span className="assess-recommendation-label">{label}</span>
                          <span className="assess-recommendation-desc">{desc}</span>
                        </button>
                      ))}
                    </div>

                    {editForm.recommendation && (
                      <div className="assess-recommendation-details">
                        <div className="assess-confidence-row">
                          <label>Confidence Level</label>
                          <div className="assess-confidence-options">
                            {['low', 'medium', 'high'].map(level => (
                              <button
                                key={level}
                                type="button"
                                className={`assess-confidence-btn ${editForm.recommendation_confidence === level ? 'active' : ''}`}
                                onClick={() => handleEditFormChange('recommendation_confidence', level)}
                              >
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="assess-conditions-row">
                          <label>Conditions / Next Steps</label>
                          <textarea
                            className="assess-conditions-input"
                            placeholder="What needs to happen before proceeding? Any caveats?"
                            value={editForm.recommendation_conditions || ''}
                            onChange={(e) => handleEditFormChange('recommendation_conditions', e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ready for Business Case Banner - shows when Proceed is selected */}
                  {editForm.recommendation === 'proceed' && (
                    <div className="assess-ready-banner">
                      <div className="assess-ready-banner-icon">
                        <CheckCircleOutlineIcon style={{ fontSize: 28 }} />
                      </div>
                      <div className="assess-ready-banner-content">
                        <h4>Ready for Business Case</h4>
                        <p>This idea has been validated and recommended to proceed. Add it to the business case to build the investment proposal.</p>
                      </div>
                      <button
                        type="button"
                        className="assess-ready-banner-btn"
                        onClick={() => onNavigate?.('summary')}
                      >
                        <ArrowForwardIcon style={{ fontSize: 16 }} />
                        Go to Decision
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stage Journey Footer - subtle state indicator */}
            <footer className="discovery-stage-journey">
              <div className="discovery-journey-track">
                {/* Regress button */}
                <button
                  className="discovery-journey-nav discovery-journey-nav--back"
                  onClick={() => handleRegressStage(selectedIdea)}
                  disabled={selectedIdea.stage === 'idea' || transitioningIds.has(selectedIdea.id)}
                  title={selectedIdea.stage === 'idea' ? 'Already at first stage' : `Back to ${STAGE_CONFIG[selectedIdea.stage === 'assess' ? 'explore' : 'idea']?.label}`}
                >
                  <ArrowBackIcon style={{ fontSize: 14 }} />
                </button>

                {/* Stage dots */}
                <div className="discovery-journey-stages">
                  {DISCOVERY_STAGES.map((stage, idx) => {
                    const config = STAGE_CONFIG[stage];
                    const isCurrent = selectedIdea.stage === stage;
                    const isPast = DISCOVERY_STAGES.indexOf(selectedIdea.stage) > idx;
                    const Icon = config.icon;
                    return (
                      <div
                        key={stage}
                        className={`discovery-journey-stage ${isCurrent ? 'current' : ''} ${isPast ? 'complete' : ''}`}
                        style={{ '--stage-color': config.color }}
                        title={config.label}
                      >
                        <Icon style={{ fontSize: 12 }} />
                        {isCurrent && <span className="discovery-journey-label">{config.label}</span>}
                      </div>
                    );
                  })}
                  {/* Decision indicator */}
                  <div
                    className={`discovery-journey-stage discovery-journey-stage--decision ${selectedIdea.stage === 'case' ? 'current' : ''}`}
                    title="Decision Phase"
                  >
                    <CheckCircleOutlineIcon style={{ fontSize: 12 }} />
                  </div>
                </div>

                {/* Advance button */}
                <button
                  className="discovery-journey-nav discovery-journey-nav--forward"
                  onClick={() => handleAdvanceStage(selectedIdea)}
                  disabled={transitioningIds.has(selectedIdea.id)}
                  title={selectedIdea.stage === 'assess' ? 'Move to Decision' : `Advance to ${STAGE_CONFIG[selectedIdea.stage === 'idea' ? 'explore' : 'assess']?.label}`}
                >
                  <ArrowForwardIcon style={{ fontSize: 14 }} />
                </button>
              </div>

              {/* Delete - subtle icon */}
              <button
                className="discovery-journey-delete"
                onClick={() => handleDeleteIdea(selectedIdea)}
                title="Delete idea"
              >
                <DeleteIcon style={{ fontSize: 14 }} />
              </button>
            </footer>
          </aside>
        )}
      </div>

      {/* Modal for new ideas */}
      <ProductIdeaModal
        isOpen={ideaModalOpen}
        onClose={() => {
          setIdeaModalOpen(false);
          setNewIdeaDefaultPriority('unassigned');
        }}
        productIdea={null}
        initiativeId={activeInitiative.id}
        onSaved={handleIdeasSaved}
        defaultPriority={newIdeaDefaultPriority}
      />

      {/* Canvas Modal for Persona, Journey, Empathy canvases */}
      <CanvasModal
        isOpen={canvasModalOpen}
        onClose={handleCloseCanvas}
        canvasType={activeCanvasType}
        data={getCanvasDataForModal()}
        onSave={handleSaveCanvas}
        saving={savingCanvas}
        title={getCanvasTitle()}
      />
    </div>
  );
}
