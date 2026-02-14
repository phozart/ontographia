// pages/user/home.js
// Platform home dashboard — aggregates cross-studio work items and recent activity.

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../components/AuthContext';
import { useDomains } from '../../components/DomainContext';
import { useProjects } from '../../components/ProjectContext';
import HubIcon from '@mui/icons-material/Hub';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LoopIcon from '@mui/icons-material/Loop';
import BuildIcon from '@mui/icons-material/Build';
import SchoolIcon from '@mui/icons-material/School';
import PsychologyIcon from '@mui/icons-material/Psychology';
import GridViewIcon from '@mui/icons-material/GridView';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import styles from '../../components/ui/HomeDashboard.module.css';

// Studio quick-access cards organized by the new nav categories
const studioCards = [
  {
    section: 'Strategy & Innovation',
    studios: [
      { code: 'blueprint', label: 'Blueprint', href: '/app/spaces/blueprint/funnel', icon: LightbulbIcon, desc: 'Ideas to investment decisions' },
      { code: 'gtm', label: 'GTM', href: '/app/spaces/gtm/plans', icon: RocketLaunchIcon, desc: 'Go-to-market strategy' },
    ],
  },
  {
    section: 'Analysis & Design',
    studios: [
      { code: 'analysis', label: 'Analysis', href: '/app/spaces/analysis/projects', icon: AssignmentIcon, desc: 'Requirements & architecture decisions' },
      { code: 'pdw', label: 'Product Design', href: '/app/spaces/pdw/discovery', icon: PsychologyIcon, desc: 'Discovery before commitment' },
    ],
  },
  {
    section: 'Modeling & Architecture',
    studios: [
      { code: 'enterprise', label: 'Enterprise', href: '/app/spaces/enterprise/dashboard', icon: ArchitectureIcon, desc: 'Capabilities & governance' },
      { code: 'ks', label: 'Knowledge Studio', href: '/app/spaces/ks/navigator', icon: HubIcon, desc: 'Graph navigation' },
      { code: 'diagram', label: 'Diagram', href: '/app/spaces/diagram/canvas', icon: GridViewIcon, desc: 'Visual diagramming' },
      { code: 'sd', label: 'System Dynamics', href: '/app/spaces/sd/canvas', icon: LoopIcon, desc: 'Feedback loops & system behavior' },
    ],
  },
  {
    section: 'Ways of Working',
    studios: [
      { code: 'pds', label: 'Project Studio', href: '/app/spaces/pds/overview', icon: AccountTreeIcon, desc: 'Project planning & delivery' },
      { code: 'dwd', label: 'Work Design', href: '/app/spaces/dwd/landscape', icon: BuildIcon, desc: 'Work structure patterns' },
    ],
  },
];

// Map artefact type to a display label
const TYPE_LABELS = {
  Initiative: 'Initiative',
  Opportunity: 'Opportunity',
  Requirement: 'Requirement',
  UserStory: 'User Story',
  UseCase: 'Use Case',
  ArchitectureDecision: 'ADR',
  Persona: 'Persona',
  Capability: 'Capability',
  Application: 'Application',
  Technology: 'Technology',
  BusinessProcess: 'Process',
  WorkPackage: 'Work Package',
  Milestone: 'Milestone',
  Risk: 'Risk',
  Campaign: 'Campaign',
  LaunchPlan: 'Launch Plan',
  Ticket: 'Ticket',
  Document: 'Document',
};

const STATUS_COLORS = {
  draft: '#9C9A94',
  active: '#5B8A6A',
  in_progress: '#C9A227',
  review: '#6B7280',
  approved: '#5B8A6A',
  completed: '#47453F',
  archived: '#9C9A94',
};

export default function HomePage() {
  const { role, user } = useAuth();
  const { activeDomainObj } = useDomains();
  const { activeProject } = useProjects();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeDomainObj?.id) params.set('domainId', activeDomainObj.id);

    fetch(`/api/dashboard/my-work?${params}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [activeDomainObj?.id]);

  const totalArtefacts = data?.countsByType?.reduce((sum, r) => sum + r.count, 0) || 0;

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>
            Welcome back{user ? `, ${user}` : ''}
          </h1>
          <p className={styles.context}>
            {activeDomainObj ? `Working in ${activeDomainObj.name}` : 'Select a domain to get started'}
            {activeProject ? ` / ${activeProject.name}` : ''}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{loading ? '...' : totalArtefacts}</span>
          <span className={styles.statLabel}>Artefacts</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{loading ? '...' : data?.graphStats?.nodes || 0}</span>
          <span className={styles.statLabel}>Graph Nodes</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{loading ? '...' : data?.graphStats?.relationships || 0}</span>
          <span className={styles.statLabel}>Connections</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{loading ? '...' : (data?.countsByType?.length || 0)}</span>
          <span className={styles.statLabel}>Active Types</span>
        </div>
      </div>

      {/* Two-column layout: Recent work + Studios */}
      <div className={styles.columns}>
        {/* Left: Recent Artefacts */}
        <div className={styles.mainColumn}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Work</h2>
          </div>

          {loading && <div className={styles.loadingText}>Loading...</div>}

          {!loading && (!data?.recentArtefacts || data.recentArtefacts.length === 0) && (
            <div className={styles.emptyState}>
              <p>No artefacts yet. Open a studio to get started.</p>
            </div>
          )}

          {!loading && data?.recentArtefacts?.map(item => (
            <div key={item.id} className={styles.workItem}>
              <div
                className={styles.workItemDot}
                style={{ background: STATUS_COLORS[item.status] || '#9C9A94' }}
              />
              <div className={styles.workItemInfo}>
                <span className={styles.workItemName}>{item.name}</span>
                <span className={styles.workItemMeta}>
                  <span className={styles.workItemType}>
                    {TYPE_LABELS[item.artefact_type] || item.artefact_type}
                  </span>
                  {item.status && (
                    <span className={styles.workItemStatus}>{item.status}</span>
                  )}
                </span>
              </div>
              <span className={styles.workItemDate}>
                {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : ''}
              </span>
            </div>
          ))}

          {/* Artefact type breakdown */}
          {!loading && data?.countsByType?.length > 0 && (
            <>
              <div className={styles.sectionHeader} style={{ marginTop: 24 }}>
                <h2 className={styles.sectionTitle}>By Type</h2>
              </div>
              <div className={styles.typeGrid}>
                {data.countsByType.map(row => (
                  <div key={row.artefact_type} className={styles.typeChip}>
                    <span className={styles.typeChipLabel}>
                      {TYPE_LABELS[row.artefact_type] || row.artefact_type}
                    </span>
                    <span className={styles.typeChipCount}>{row.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: Studio quick-access */}
        <div className={styles.sideColumn}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Studios</h2>
          </div>

          {studioCards.map(group => (
            <div key={group.section} className={styles.studioGroup}>
              <span className={styles.studioGroupLabel}>{group.section}</span>
              {group.studios.map(studio => {
                const Icon = studio.icon;
                return (
                  <Link key={studio.code} href={studio.href} className={styles.studioLink}>
                    <Icon style={{ fontSize: 16, color: '#5C5A54' }} />
                    <div className={styles.studioLinkInfo}>
                      <span className={styles.studioLinkName}>{studio.label}</span>
                      <span className={styles.studioLinkDesc}>{studio.desc}</span>
                    </div>
                    <ArrowForwardIcon style={{ fontSize: 14, color: '#9C9A94' }} />
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
