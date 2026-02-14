// components/pds/shared/CommandPalette.js
// Quick command palette (Cmd+K) for PDS workspace
// Phase 5: Delight & Polish

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';

// MUI Icons
import SearchIcon from '@mui/icons-material/Search';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import FlagIcon from '@mui/icons-material/Flag';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import SchoolIcon from '@mui/icons-material/School';
import BugReportIcon from '@mui/icons-material/BugReport';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import BuildIcon from '@mui/icons-material/Build';
import HelpIcon from '@mui/icons-material/Help';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import styles from './CommandPalette.module.css';

// Command definitions
const COMMANDS = [
  // Create artefacts
  {
    id: 'create_stakeholder',
    name: 'Add Stakeholder',
    description: 'Create a new stakeholder',
    icon: PeopleIcon,
    category: 'create',
    keywords: ['new', 'add', 'stakeholder', 'person', 'team'],
    action: { type: 'create', artefactType: 'pds_stakeholder' },
  },
  {
    id: 'create_risk',
    name: 'Add Risk',
    description: 'Log a new project risk',
    icon: WarningIcon,
    category: 'create',
    keywords: ['new', 'add', 'risk', 'threat', 'danger'],
    action: { type: 'create', artefactType: 'pds_risk' },
  },
  {
    id: 'create_milestone',
    name: 'Add Milestone',
    description: 'Set a project milestone',
    icon: EventIcon,
    category: 'create',
    keywords: ['new', 'add', 'milestone', 'deadline', 'date'],
    action: { type: 'create', artefactType: 'pds_milestone' },
  },
  {
    id: 'create_assumption',
    name: 'Add Assumption',
    description: 'Document an assumption',
    icon: LightbulbIcon,
    category: 'create',
    keywords: ['new', 'add', 'assumption', 'premise'],
    action: { type: 'create', artefactType: 'pds_assumption' },
  },
  {
    id: 'create_deliverable',
    name: 'Add Deliverable',
    description: 'Define a project deliverable',
    icon: AssignmentIcon,
    category: 'create',
    keywords: ['new', 'add', 'deliverable', 'output', 'product'],
    action: { type: 'create', artefactType: 'pds_deliverable' },
  },
  {
    id: 'create_issue',
    name: 'Add Issue',
    description: 'Log a project issue',
    icon: BugReportIcon,
    category: 'create',
    keywords: ['new', 'add', 'issue', 'problem', 'bug'],
    action: { type: 'create', artefactType: 'pds_issue' },
  },
  {
    id: 'create_lesson',
    name: 'Add Lesson Learned',
    description: 'Capture a lesson learned',
    icon: SchoolIcon,
    category: 'create',
    keywords: ['new', 'add', 'lesson', 'learning', 'insight'],
    action: { type: 'create', artefactType: 'pds_lesson' },
  },

  // Navigate to stages
  {
    id: 'go_intent',
    name: 'Go to Intent & Governance',
    description: 'Navigate to the Intent stage',
    icon: FlagIcon,
    category: 'navigate',
    keywords: ['go', 'navigate', 'intent', 'governance', 'why'],
    action: { type: 'navigate', view: 'intent' },
  },
  {
    id: 'go_structure',
    name: 'Go to Structure & Planning',
    description: 'Navigate to the Structure stage',
    icon: AccountTreeIcon,
    category: 'navigate',
    keywords: ['go', 'navigate', 'structure', 'planning', 'plan'],
    action: { type: 'navigate', view: 'structure' },
  },
  {
    id: 'go_uncertainty',
    name: 'Go to Risk & Uncertainty',
    description: 'Navigate to the Risk stage',
    icon: WarningIcon,
    category: 'navigate',
    keywords: ['go', 'navigate', 'risk', 'uncertainty', 'threats'],
    action: { type: 'navigate', view: 'uncertainty' },
  },
  {
    id: 'go_control',
    name: 'Go to Execution & Control',
    description: 'Navigate to the Control stage',
    icon: PlayCircleIcon,
    category: 'navigate',
    keywords: ['go', 'navigate', 'execution', 'control', 'execute'],
    action: { type: 'navigate', view: 'control' },
  },
  {
    id: 'go_learning',
    name: 'Go to Learning & Evolution',
    description: 'Navigate to the Learning stage',
    icon: SchoolIcon,
    category: 'navigate',
    keywords: ['go', 'navigate', 'learning', 'evolution', 'lessons'],
    action: { type: 'navigate', view: 'learning' },
  },

  // Navigate to views
  {
    id: 'go_overview',
    name: 'Go to Overview',
    description: 'View the project dashboard',
    icon: DashboardIcon,
    category: 'view',
    keywords: ['go', 'overview', 'dashboard', 'home'],
    action: { type: 'navigate', view: 'overview' },
  },
  {
    id: 'go_story',
    name: 'View Project Story',
    description: 'See the cross-stage timeline',
    icon: AutoStoriesIcon,
    category: 'view',
    keywords: ['go', 'story', 'timeline', 'journey'],
    action: { type: 'navigate', view: 'story' },
  },
  {
    id: 'go_tools',
    name: 'Open Tools',
    description: 'Access interactive tools',
    icon: BuildIcon,
    category: 'view',
    keywords: ['go', 'tools', 'matrix', 'heatmap'],
    action: { type: 'navigate', view: 'tools' },
  },

  // Actions
  {
    id: 'show_achievements',
    name: 'View Achievements',
    description: 'See your project achievements',
    icon: EmojiEventsIcon,
    category: 'action',
    keywords: ['achievements', 'badges', 'progress', 'trophies'],
    action: { type: 'action', actionId: 'achievements' },
  },
  {
    id: 'show_help',
    name: 'Show Help',
    description: 'Get guidance and tips',
    icon: HelpIcon,
    category: 'action',
    keywords: ['help', 'guide', 'tips', 'support'],
    action: { type: 'action', actionId: 'help' },
  },
  {
    id: 'show_shortcuts',
    name: 'Keyboard Shortcuts',
    description: 'View all keyboard shortcuts',
    icon: KeyboardIcon,
    category: 'action',
    keywords: ['keyboard', 'shortcuts', 'hotkeys', 'keys'],
    action: { type: 'action', actionId: 'shortcuts' },
  },
];

// Category labels
const CATEGORY_LABELS = {
  create: 'Create',
  navigate: 'Navigate',
  view: 'Views',
  action: 'Actions',
};

// Fuzzy search function
function fuzzyMatch(text, query) {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Exact match scores highest
  if (lowerText.includes(lowerQuery)) return 100;

  // Check each word
  const queryWords = lowerQuery.split(/\s+/);
  const textWords = lowerText.split(/\s+/);

  let matches = 0;
  for (const qWord of queryWords) {
    for (const tWord of textWords) {
      if (tWord.includes(qWord) || qWord.includes(tWord)) {
        matches++;
        break;
      }
    }
  }

  return matches > 0 ? (matches / queryWords.length) * 80 : 0;
}

function searchCommands(commands, query) {
  if (!query.trim()) return commands;

  const scored = commands.map(cmd => {
    const nameScore = fuzzyMatch(cmd.name, query);
    const descScore = fuzzyMatch(cmd.description, query) * 0.5;
    const keywordScore = Math.max(
      ...cmd.keywords.map(k => fuzzyMatch(k, query))
    ) * 0.7;

    return {
      ...cmd,
      score: Math.max(nameScore, descScore, keywordScore),
    };
  });

  return scored
    .filter(cmd => cmd.score > 20)
    .sort((a, b) => b.score - a.score);
}

// Main command palette component
export default function CommandPalette({
  isOpen,
  onClose,
  onExecute,
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Focus input after a brief delay
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    return searchCommands(COMMANDS, query);
  }, [query]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Flat list for keyboard navigation
  const flatList = useMemo(() => {
    return Object.values(groupedCommands).flat();
  }, [groupedCommands]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < flatList.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : flatList.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (flatList[selectedIndex]) {
            handleExecute(flatList[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, flatList, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleExecute = useCallback((command) => {
    onExecute?.(command.action);
    onClose?.();
  }, [onExecute, onClose]);

  if (!isOpen || !mounted) return null;

  let itemIndex = 0;

  const content = (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.palette} onClick={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div className={styles.searchContainer}>
          <SearchIcon className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          <kbd className={styles.escHint}>esc</kbd>
        </div>

        {/* Commands list */}
        <div className={styles.commands} ref={listRef}>
          {flatList.length === 0 ? (
            <div className={styles.empty}>
              <SearchIcon />
              <span>No commands found</span>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, commands]) => (
              <div key={category} className={styles.group}>
                <div className={styles.groupLabel}>
                  {CATEGORY_LABELS[category] || category}
                </div>
                {commands.map((cmd) => {
                  const Icon = cmd.icon;
                  const currentIndex = itemIndex++;
                  const isSelected = currentIndex === selectedIndex;

                  return (
                    <button
                      key={cmd.id}
                      data-index={currentIndex}
                      className={`${styles.command} ${isSelected ? styles.selected : ''}`}
                      onClick={() => handleExecute(cmd)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                    >
                      <div className={styles.commandIcon}>
                        <Icon />
                      </div>
                      <div className={styles.commandContent}>
                        <span className={styles.commandName}>{cmd.name}</span>
                        <span className={styles.commandDesc}>{cmd.description}</span>
                      </div>
                      <ArrowForwardIcon className={styles.commandArrow} />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className={styles.footer}>
          <div className={styles.footerHint}>
            <kbd>↑</kbd><kbd>↓</kbd> to navigate
          </div>
          <div className={styles.footerHint}>
            <kbd>↵</kbd> to select
          </div>
          <div className={styles.footerHint}>
            <kbd>esc</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// Hook to manage command palette state with keyboard shortcut
export function useCommandPalette(onExecute) {
  const [isOpen, setIsOpen] = useState(false);

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    CommandPaletteComponent: (
      <CommandPalette
        isOpen={isOpen}
        onClose={close}
        onExecute={onExecute}
      />
    ),
  };
}

// Keyboard shortcuts panel component
export function KeyboardShortcutsPanel({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const shortcuts = [
    { keys: ['⌘', 'K'], description: 'Open command palette' },
    { keys: ['⌘', 'N'], description: 'Create new artefact' },
    { keys: ['⌘', '/'], description: 'Toggle help panel' },
    { keys: ['⌘', '1-5'], description: 'Navigate to stage 1-5' },
    { keys: ['⌘', '0'], description: 'Go to overview' },
    { keys: ['Esc'], description: 'Close dialogs' },
    { keys: ['↑', '↓'], description: 'Navigate lists' },
    { keys: ['Enter'], description: 'Confirm action' },
  ];

  const content = (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.shortcutsPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.shortcutsHeader}>
          <KeyboardIcon />
          <h3>Keyboard Shortcuts</h3>
        </div>
        <div className={styles.shortcutsList}>
          {shortcuts.map((shortcut, index) => (
            <div key={index} className={styles.shortcutRow}>
              <div className={styles.shortcutKeys}>
                {shortcut.keys.map((key, i) => (
                  <kbd key={i}>{key}</kbd>
                ))}
              </div>
              <span className={styles.shortcutDesc}>{shortcut.description}</span>
            </div>
          ))}
        </div>
        <div className={styles.shortcutsFooter}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// Hook for additional keyboard shortcuts (Cmd+N, Cmd+/, Cmd+0-5)
export function useKeyboardShortcuts({
  onCreateArtefact,
  onToggleHelp,
  onNavigate,
  disabled = false,
}) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e) => {
      // Skip if user is typing in an input
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;

      // Cmd+N - Create new artefact
      if (isMod && e.key === 'n') {
        e.preventDefault();
        onCreateArtefact?.();
        return;
      }

      // Cmd+/ - Toggle help
      if (isMod && e.key === '/') {
        e.preventDefault();
        onToggleHelp?.();
        return;
      }

      // Cmd+0 - Overview
      if (isMod && e.key === '0') {
        e.preventDefault();
        onNavigate?.('overview');
        return;
      }

      // Cmd+1-5 - Navigate to stages
      const stageViews = ['intent', 'structure', 'risk', 'execution', 'learning'];
      const num = parseInt(e.key, 10);
      if (isMod && num >= 1 && num <= 5) {
        e.preventDefault();
        onNavigate?.(stageViews[num - 1]);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onCreateArtefact, onToggleHelp, onNavigate]);
}
