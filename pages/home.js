// pages/home.js
// Platform Home Dashboard — "My Work" cross-studio aggregation
// Landing page for authenticated users showing recent activity across all spaces

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../components/AuthContext';
import { useDomains } from '../components/DomainContext';
import { getSpacesByCategory, getSpace } from '../lib/spaceRegistry';
import styles from '../styles/home.module.css';

// Space icon mapping (unicode for lightweight rendering)
const SPACE_ICONS = {
  blueprint: '\u{1F4A1}',   // light bulb
  analysis: '\u{1F50D}',    // magnifying glass
  enterprise: '\u{1F3DB}',  // classical building
  gtm: '\u{1F680}',         // rocket
  ba: '\u{1F4CB}',          // clipboard
  pdw: '\u{1F4A1}',         // light bulb
  pds: '\u{1F332}',         // tree
  dwd: '\u{1F527}',         // wrench
  als: '\u{1F393}',         // graduation cap
  sd: '\u{1F504}',          // loop
  mindlab: '\u{1F9E0}',     // brain
  ks: '\u{1F578}',          // spider web / hub
  diagram: '\u{1F4CA}',     // bar chart
};

const STAGE_COLORS = {
  idea: '#C9A227',
  explore: '#5B8A6A',
  assess: '#6B8A9A',
  case: '#8B7A9A',
  approved: '#5B8A6A',
  declined: '#A54D4D',
};

export default function HomePage() {
  const router = useRouter();
  const { user, role } = useAuth();
  const { activeDomain, activeDomainObj } = useDomains();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (user === null) {
      router.replace('/');
    }
  }, [user, router]);

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (activeDomain) params.set('domainId', activeDomain);

      const res = await fetch(`/api/my-work?${params}`, {
        headers: {
          'x-user': user || '',
          'x-role': role || '',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, activeDomain]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Space categories for quick navigation
  const spaceCategories = useMemo(() => getSpacesByCategory(), []);

  if (!user) return null;

  const greeting = getGreeting();
  const displayName = typeof user === 'string' ? user : user?.name || user?.email || 'there';

  return (
    <div className={styles.home}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.greeting}>
            {greeting}, {displayName}
          </h1>
          <p className={styles.subtitle}>
            {activeDomainObj
              ? `Working in ${activeDomainObj.name || activeDomainObj.displayId || activeDomainObj.display_id}`
              : 'Your cross-studio work overview'}
          </p>
        </div>
      </div>

      {/* Stats Bar — always visible with fallback values */}
      <div className={styles.statsBar}>
        <div className={styles.statsBarInner}>
          <StatCard
            label="Active Projects"
            value={loading ? '\u2014' : (data?.stats?.activeProjects ?? 0)}
            subtext={loading ? null : `${data?.stats?.totalProjects ?? 0} total`}
            loading={loading}
          />
          <StatCard
            label="Initiatives"
            value={loading ? '\u2014' : (data?.stats?.activeInitiatives ?? 0)}
            subtext={loading ? null : `${data?.stats?.totalInitiatives ?? 0} total`}
            loading={loading}
          />
          <StatCard
            label="Analysis Projects"
            value={loading ? '\u2014' : (data?.stats?.analysisProjects ?? 0)}
            loading={loading}
          />
          <StatCard
            label="Graph Nodes"
            value={loading ? '\u2014' : (data?.stats?.graphNodes ?? 0)}
            subtext={loading ? null : `${data?.stats?.graphRelationships ?? 0} relationships`}
            loading={loading}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left Column — Work Items */}
        <div className={styles.workColumn}>
          {error && (
            <div className={styles.errorBanner}>
              Failed to load data: {error}
              <button onClick={fetchData} className={styles.retryBtn}>Retry</button>
            </div>
          )}

          {/* Recent Projects */}
          <WorkSection
            title="Projects"
            count={data?.stats?.totalProjects}
            loading={loading}
            emptyMessage="No projects yet. Create one in Business Analysis or Project Design."
          >
            {data?.projects?.map(project => (
              <ProjectRow
                key={project.id}
                displayId={project.display_id}
                name={project.name}
                status={project.status}
                meta={`${project.artefact_count || 0} artefacts`}
                domainName={project.domain_name}
                lastActivity={project.last_activity}
                onClick={() => router.push(`/app/spaces/analysis/repository`)}
              />
            ))}
          </WorkSection>

          {/* Blueprint Initiatives */}
          <WorkSection
            title="Blueprint Initiatives"
            count={data?.stats?.totalInitiatives}
            loading={loading}
            emptyMessage="No initiatives yet. Create one in Blueprint Studio."
          >
            {data?.initiatives?.map(initiative => (
              <ProjectRow
                key={initiative.id}
                displayId={initiative.initiative_id}
                name={initiative.name}
                status={initiative.stage}
                statusColor={STAGE_COLORS[initiative.stage]}
                meta={`Stage: ${initiative.stage}`}
                lastActivity={initiative.updated_at}
                onClick={() => router.push(`/app/spaces/blueprint/discovery`)}
              />
            ))}
          </WorkSection>

          {/* Analysis Projects */}
          <WorkSection
            title="Analysis Projects"
            count={data?.stats?.analysisProjects}
            loading={loading}
            emptyMessage="No analysis projects yet."
          >
            {data?.analysisProjects?.map(project => (
              <ProjectRow
                key={project.id}
                displayId={project.display_id}
                name={project.name}
                status={project.status}
                meta={`${project.artefact_count || 0} artefacts`}
                lastActivity={project.updated_at}
                onClick={() => router.push(`/app/spaces/analysis/projects`)}
              />
            ))}
          </WorkSection>
        </div>

        {/* Right Column — Sidebar */}
        <div className={styles.sidebar}>
          {/* Quick Navigation */}
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarHeader}>
              <h3 className={styles.sidebarTitle}>Studios</h3>
            </div>
            <div className={styles.studioNav}>
              {spaceCategories.map(({ category, spaces }) => (
                <div key={category.id} className={styles.studioCategory}>
                  <span className={styles.studioCategoryLabel}>{category.name}</span>
                  {spaces.map(space => (
                    <Link
                      key={space.code}
                      href={space.customUrl || `/app/spaces/${space.code}/${space.defaultView}`}
                      className={styles.studioLink}
                    >
                      <span className={styles.studioIcon}>
                        {SPACE_ICONS[space.code] || '\u{1F4C1}'}
                      </span>
                      <span className={styles.studioName}>{space.name}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          {data?.recentActivity?.length > 0 && (
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarHeader}>
                <h3 className={styles.sidebarTitle}>Recent Activity</h3>
              </div>
              <div className={styles.activityList}>
                {data.recentActivity.slice(0, 10).map((activity, idx) => (
                  <div key={idx} className={styles.activityItem}>
                    <div className={styles.activityDot} data-type={activity.type} />
                    <div className={styles.activityContent}>
                      <div
                        className={styles.activityText}
                        dangerouslySetInnerHTML={{ __html: activity.text }}
                      />
                      {activity.time && (
                        <div className={styles.activityTime}>{activity.time}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Graph Summary */}
          {data?.graphStats && (data.graphStats.nodes > 0 || data.graphStats.relationships > 0) && (
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarHeader}>
                <h3 className={styles.sidebarTitle}>Knowledge Graph</h3>
              </div>
              <div className={styles.graphSummary}>
                <div className={styles.graphStat}>
                  <span className={styles.graphStatValue}>{data.graphStats.nodes}</span>
                  <span className={styles.graphStatLabel}>nodes</span>
                </div>
                <div className={styles.graphStatDivider} />
                <div className={styles.graphStat}>
                  <span className={styles.graphStatValue}>{data.graphStats.relationships}</span>
                  <span className={styles.graphStatLabel}>relationships</span>
                </div>
              </div>
              <Link href="/app/spaces/ks/navigator" className={styles.graphLink}>
                Open Knowledge Studio
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-components

function StatCard({ label, value, subtext, loading }) {
  return (
    <div className={`${styles.statCard} ${loading ? styles.statCardLoading : ''}`}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value ?? 0}</div>
      {subtext && <div className={styles.statSubtext}>{subtext}</div>}
    </div>
  );
}

function WorkSection({ title, count, loading, emptyMessage, children }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  const hasItems = items.length > 0;

  return (
    <div className={styles.workSection}>
      <div className={styles.workSectionHeader}>
        <h2 className={styles.workSectionTitle}>
          {title}
          {count !== undefined && count !== null && (
            <span className={styles.workSectionCount}>{count}</span>
          )}
        </h2>
      </div>
      {loading ? (
        <div className={styles.workSectionLoading}>Loading...</div>
      ) : hasItems ? (
        <div className={styles.workSectionItems}>{items}</div>
      ) : (
        <div className={styles.workSectionEmpty}>{emptyMessage}</div>
      )}
    </div>
  );
}

function ProjectRow({ displayId, name, status, statusColor, meta, domainName, lastActivity, onClick }) {
  return (
    <div className={styles.projectRow} onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onClick?.(); }}>
      <div className={styles.projectRowMain}>
        {displayId && <span className={styles.projectRowId}>{displayId}</span>}
        <span className={styles.projectRowName}>{name}</span>
      </div>
      <div className={styles.projectRowMeta}>
        {status && (
          <span
            className={styles.projectRowBadge}
            data-status={status.toLowerCase().replace(/\s+/g, '_')}
            style={statusColor ? { color: statusColor, background: `${statusColor}18` } : undefined}
          >
            {status.replace(/_/g, ' ')}
          </span>
        )}
        {meta && <span className={styles.projectRowDetail}>{meta}</span>}
        {domainName && <span className={styles.projectRowDetail}>{domainName}</span>}
        {lastActivity && (
          <span className={styles.projectRowTime}>{formatDate(lastActivity)}</span>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);

  if (diffDays < 1) return 'Today';
  if (diffDays < 2) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
