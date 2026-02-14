// components/ea/EAGuidancePanel.js
// Contextual guidance panel for Enterprise Architecture Studio
// Provides progressive guidance, tips, and recommendations based on user context

import { useState, useMemo } from 'react';
import { useEA, EA_LAYERS, EA_ELEMENT_TYPES } from './EAContext';
import styles from './ea.module.css';

// MUI Icons
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SchoolIcon from '@mui/icons-material/School';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LinkIcon from '@mui/icons-material/Link';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AppsIcon from '@mui/icons-material/Apps';
import StorageIcon from '@mui/icons-material/Storage';

// Guidance content
const GETTING_STARTED_STEPS = [
  {
    id: 'understand',
    title: 'Understand the Layers',
    description: 'ArchiMate organizes architecture into three main layers: Business, Application, and Technology.',
    icon: SchoolIcon,
    link: 'layers'
  },
  {
    id: 'business',
    title: 'Start with Business',
    description: 'Begin by documenting your business capabilities - what your organization can do.',
    icon: AccountTreeIcon,
    link: 'business'
  },
  {
    id: 'applications',
    title: 'Add Applications',
    description: 'Map the software systems that support your business capabilities.',
    icon: AppsIcon,
    link: 'application'
  },
  {
    id: 'technology',
    title: 'Document Technology',
    description: 'Record the infrastructure that hosts your applications.',
    icon: StorageIcon,
    link: 'technology'
  },
  {
    id: 'connect',
    title: 'Create Relationships',
    description: 'Link elements together to show how business, apps, and technology relate.',
    icon: LinkIcon,
    link: 'relationships'
  }
];

const QUICK_TIPS = {
  overview: [
    'Start with your most critical business capability',
    'Use the left navigation to browse by viewpoint or layer',
    'Import existing capabilities from the Capability Studio'
  ],
  business: [
    'Business capabilities describe WHAT you do, not HOW',
    'Business processes show the flow of work',
    'Business services are what you provide to customers'
  ],
  application: [
    'Application components are your software systems',
    'Link applications to the business capabilities they support',
    'Document integrations between applications'
  ],
  technology: [
    'Nodes are physical or virtual servers',
    'Technology services are what infrastructure provides',
    'Document networks and communication paths'
  ],
  motivation: [
    'Start with stakeholders and their concerns',
    'Goals describe desired outcomes',
    'Requirements link goals to solutions'
  ],
  strategy: [
    'Capabilities here are strategic, high-level abilities',
    'Value streams show end-to-end customer value delivery',
    'Course of action is how you achieve strategic goals'
  ]
};

const ARCHIMATE_BEST_PRACTICES = [
  {
    title: 'Top-Down Approach',
    description: 'Start from business motivation, flow to strategy, then to business/application/technology layers.',
    type: 'tip'
  },
  {
    title: 'Keep it Simple',
    description: 'Don\'t model everything - focus on what adds value for decision-making.',
    type: 'tip'
  },
  {
    title: 'Avoid mixing layers in the same view',
    description: 'Use layered views to show cross-layer relationships cleanly.',
    type: 'warning'
  },
  {
    title: 'Name consistently',
    description: 'Use verb phrases for processes (e.g., "Process Order"), nouns for components (e.g., "Order Management System").',
    type: 'tip'
  }
];

export default function EAGuidancePanel({
  activeSection = 'overview',
  activeLayerId = null,
  onNavigate,
  collapsed = false,
  onToggleCollapse
}) {
  const { elements, relationships } = useEA();
  const [expandedSection, setExpandedSection] = useState('getting-started');

  // Calculate architecture health metrics
  const metrics = useMemo(() => {
    const elementsByLayer = {};
    const layerIds = ['motivation', 'strategy', 'business', 'application', 'technology', 'implementation'];

    layerIds.forEach(layer => {
      elementsByLayer[layer] = elements.filter(el => {
        const typeDef = EA_ELEMENT_TYPES.find(t => t.id === el.element_type);
        return typeDef?.layer === layer;
      }).length;
    });

    const totalElements = elements.length;
    const totalRelationships = relationships.length;

    // Check for orphaned elements (no relationships)
    const connectedIds = new Set();
    relationships.forEach(r => {
      connectedIds.add(r.source_id);
      connectedIds.add(r.target_id);
    });
    const orphanedElements = elements.filter(el => !connectedIds.has(el.id)).length;

    // Calculate coverage score
    const layersCovered = Object.values(elementsByLayer).filter(count => count > 0).length;
    const coverageScore = Math.round((layersCovered / 3) * 100); // 3 main layers

    return {
      total: totalElements,
      relationships: totalRelationships,
      byLayer: elementsByLayer,
      orphaned: orphanedElements,
      coverage: coverageScore,
      layersCovered
    };
  }, [elements, relationships]);

  // Generate contextual recommendations
  const recommendations = useMemo(() => {
    const recs = [];

    if (metrics.total === 0) {
      recs.push({
        type: 'info',
        title: 'Getting Started',
        message: 'Start by adding your first business capability or application.',
        action: 'Add Business Capability',
        actionLink: 'businessCapability'
      });
    } else {
      // Check for layer gaps
      if (metrics.byLayer.business === 0) {
        recs.push({
          type: 'warning',
          title: 'Missing Business Layer',
          message: 'Add business capabilities and processes to document what your organization does.',
          action: 'Add Business Element',
          actionLink: 'business'
        });
      }
      if (metrics.byLayer.application === 0 && metrics.byLayer.business > 0) {
        recs.push({
          type: 'info',
          title: 'Add Applications',
          message: 'Map the software systems that support your business capabilities.',
          action: 'Add Application',
          actionLink: 'applicationComponent'
        });
      }
      if (metrics.orphaned > 0) {
        recs.push({
          type: 'attention',
          title: `${metrics.orphaned} Orphaned Element${metrics.orphaned > 1 ? 's' : ''}`,
          message: 'Some elements have no relationships. Connect them to show how they relate.',
          action: 'View Orphaned',
          actionLink: 'orphaned'
        });
      }
      if (metrics.relationships === 0 && metrics.total > 1) {
        recs.push({
          type: 'warning',
          title: 'No Relationships',
          message: 'Create relationships to show how elements connect across layers.',
          action: 'Learn About Relationships',
          actionLink: 'relationships'
        });
      }
    }

    return recs;
  }, [metrics]);

  // Get tips based on current context
  const contextTips = useMemo(() => {
    if (activeLayerId && QUICK_TIPS[activeLayerId]) {
      return QUICK_TIPS[activeLayerId];
    }
    return QUICK_TIPS[activeSection] || QUICK_TIPS.overview;
  }, [activeSection, activeLayerId]);

  const toggleSection = (sectionId) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
  };

  if (collapsed) {
    return (
      <div className={styles.guidancePanelCollapsed}>
        <button
          className={styles.guidanceExpandBtn}
          onClick={onToggleCollapse}
          title="Show Guidance"
        >
          <LightbulbIcon fontSize="small" />
        </button>
      </div>
    );
  }

  return (
    <aside className={styles.guidancePanel}>
      <div className={styles.guidanceHeader}>
        <div className={styles.guidanceHeaderLeft}>
          <LightbulbIcon fontSize="small" />
          <span>Guidance</span>
        </div>
        <button
          className={styles.guidanceCollapseBtn}
          onClick={onToggleCollapse}
          title="Hide Guidance"
        >
          ×
        </button>
      </div>

      <div className={styles.guidanceContent}>
        {/* Architecture Health Summary */}
        {metrics.total > 0 && (
          <div className={styles.guidanceSection}>
            <div className={styles.healthSummary}>
              <div className={styles.healthScore} style={{
                color: metrics.coverage >= 66 ? '#10b981' : metrics.coverage >= 33 ? '#f59e0b' : '#ef4444'
              }}>
                <span className={styles.healthValue}>{metrics.coverage}%</span>
                <span className={styles.healthLabel}>Layer Coverage</span>
              </div>
              <div className={styles.healthStats}>
                <div className={styles.healthStat}>
                  <span className={styles.healthStatValue}>{metrics.total}</span>
                  <span className={styles.healthStatLabel}>Elements</span>
                </div>
                <div className={styles.healthStat}>
                  <span className={styles.healthStatValue}>{metrics.relationships}</span>
                  <span className={styles.healthStatLabel}>Relationships</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className={styles.guidanceSection}>
            <button
              className={styles.guidanceSectionHeader}
              onClick={() => toggleSection('recommendations')}
            >
              <span>Recommendations</span>
              {expandedSection === 'recommendations' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </button>
            {expandedSection === 'recommendations' && (
              <div className={styles.guidanceSectionContent}>
                {recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className={styles.recommendation}
                    data-type={rec.type}
                  >
                    <div className={styles.recIcon}>
                      {rec.type === 'warning' && <WarningAmberIcon fontSize="small" style={{ color: '#f59e0b' }} />}
                      {rec.type === 'info' && <TipsAndUpdatesIcon fontSize="small" style={{ color: '#3b82f6' }} />}
                      {rec.type === 'attention' && <WarningAmberIcon fontSize="small" style={{ color: '#ef4444' }} />}
                      {rec.type === 'success' && <CheckCircleIcon fontSize="small" style={{ color: '#10b981' }} />}
                    </div>
                    <div className={styles.recContent}>
                      <strong>{rec.title}</strong>
                      <p>{rec.message}</p>
                      {rec.action && (
                        <button
                          className={styles.recAction}
                          onClick={() => onNavigate && onNavigate(rec.actionLink)}
                        >
                          {rec.action} →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Getting Started */}
        {metrics.total < 5 && (
          <div className={styles.guidanceSection}>
            <button
              className={styles.guidanceSectionHeader}
              onClick={() => toggleSection('getting-started')}
            >
              <span>Getting Started</span>
              {expandedSection === 'getting-started' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </button>
            {expandedSection === 'getting-started' && (
              <div className={styles.guidanceSectionContent}>
                <div className={styles.gettingStartedSteps}>
                  {GETTING_STARTED_STEPS.map((step, i) => {
                    const StepIcon = step.icon;
                    const isCompleted = (step.id === 'business' && metrics.byLayer.business > 0) ||
                                       (step.id === 'applications' && metrics.byLayer.application > 0) ||
                                       (step.id === 'technology' && metrics.byLayer.technology > 0) ||
                                       (step.id === 'connect' && metrics.relationships > 0);
                    return (
                      <div
                        key={step.id}
                        className={`${styles.gettingStartedStep} ${isCompleted ? styles.completed : ''}`}
                        onClick={() => onNavigate && onNavigate(step.link)}
                      >
                        <div className={styles.stepNumber}>
                          {isCompleted ? <CheckCircleIcon fontSize="small" /> : i + 1}
                        </div>
                        <div className={styles.stepContent}>
                          <strong>{step.title}</strong>
                          <p>{step.description}</p>
                        </div>
                        <PlayArrowIcon fontSize="small" className={styles.stepArrow} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Tips */}
        <div className={styles.guidanceSection}>
          <button
            className={styles.guidanceSectionHeader}
            onClick={() => toggleSection('tips')}
          >
            <span>Quick Tips</span>
            {expandedSection === 'tips' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </button>
          {expandedSection === 'tips' && (
            <div className={styles.guidanceSectionContent}>
              <ul className={styles.tipsList}>
                {contextTips.map((tip, i) => (
                  <li key={i}>
                    <TipsAndUpdatesIcon fontSize="small" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Best Practices */}
        <div className={styles.guidanceSection}>
          <button
            className={styles.guidanceSectionHeader}
            onClick={() => toggleSection('best-practices')}
          >
            <span>Best Practices</span>
            {expandedSection === 'best-practices' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </button>
          {expandedSection === 'best-practices' && (
            <div className={styles.guidanceSectionContent}>
              {ARCHIMATE_BEST_PRACTICES.map((practice, i) => (
                <div key={i} className={styles.bestPractice} data-type={practice.type}>
                  {practice.type === 'warning' ? (
                    <WarningAmberIcon fontSize="small" style={{ color: '#f59e0b' }} />
                  ) : (
                    <CheckCircleIcon fontSize="small" style={{ color: '#10b981' }} />
                  )}
                  <div>
                    <strong>{practice.title}</strong>
                    <p>{practice.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
