/**
 * Organisation Structure
 *
 * Displays organisational units, roles, and reporting structures
 */

import { useState, useMemo } from 'react';
import { useEnterprise, ORG_UNIT_TYPE } from '../EnterpriseContext';
import { OrgUnitCard } from './OrgUnitCard';
import styles from './organisation.module.css';

export function OrgStructure() {
  const { artefacts, setActiveView } = useEnterprise();
  const [viewMode, setViewMode] = useState('tree');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const orgUnits = useMemo(() => {
    return artefacts.filter(a => a.type === 'org-unit');
  }, [artefacts]);

  const roles = useMemo(() => {
    return artefacts.filter(a => a.type === 'role');
  }, [artefacts]);

  const filtered = useMemo(() => {
    let items = orgUnits;

    if (filter !== 'all') {
      items = items.filter(u => u.unitType === filter);
    }

    if (search) {
      const s = search.toLowerCase();
      items = items.filter(u =>
        u.name?.toLowerCase().includes(s) ||
        u.description?.toLowerCase().includes(s)
      );
    }

    return items;
  }, [orgUnits, filter, search]);

  // Build tree structure
  const tree = useMemo(() => {
    const rootUnits = filtered.filter(u => !u.parentId);
    const buildChildren = (parentId) => {
      return filtered
        .filter(u => u.parentId === parentId)
        .map(u => ({
          ...u,
          children: buildChildren(u.id)
        }));
    };

    return rootUnits.map(u => ({
      ...u,
      children: buildChildren(u.id)
    }));
  }, [filtered]);

  const stats = useMemo(() => ({
    units: orgUnits.length,
    departments: orgUnits.filter(u => u.unitType === 'department').length,
    teams: orgUnits.filter(u => u.unitType === 'team').length,
    roles: roles.length,
    headcount: orgUnits.reduce((sum, u) => sum + (u.headcount || 0), 0)
  }), [orgUnits, roles]);

  const renderTreeNode = (unit, level = 0) => (
    <div key={unit.id} className={styles.treeNode} style={{ marginLeft: level * 24 }}>
      <OrgUnitCard unit={unit} compact />
      {unit.children?.length > 0 && (
        <div className={styles.treeChildren}>
          {unit.children.map(child => renderTreeNode(child, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.structure}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2>Organisation Structure</h2>
          <p className={styles.subtitle}>
            Organisational units, teams, and roles
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.addButton}
            onClick={() => setActiveView('org-unit-create')}
          >
            + Add Unit
          </button>
          <button
            className={styles.secondaryButton}
            onClick={() => setActiveView('role-create')}
          >
            + Add Role
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.units}</span>
          <span className={styles.statLabel}>Org Units</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.departments}</span>
          <span className={styles.statLabel}>Departments</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.teams}</span>
          <span className={styles.statLabel}>Teams</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.roles}</span>
          <span className={styles.statLabel}>Roles</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.headcount}</span>
          <span className={styles.statLabel}>Headcount</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleButton} ${viewMode === 'tree' ? styles.active : ''}`}
            onClick={() => setViewMode('tree')}
          >
            Tree
          </button>
          <button
            className={`${styles.toggleButton} ${viewMode === 'grid' ? styles.active : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.select}
        >
          <option value="all">All Types</option>
          {Object.entries(ORG_UNIT_TYPE).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search organisation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Content */}
      {viewMode === 'tree' ? (
        <div className={styles.treeView}>
          {tree.length > 0 ? (
            tree.map(unit => renderTreeNode(unit))
          ) : (
            <div className={styles.emptyState}>
              <p>No organisation units defined</p>
              <button
                className={styles.addButton}
                onClick={() => setActiveView('org-unit-create')}
              >
                Add First Unit
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.gridView}>
          {filtered.map(unit => (
            <OrgUnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      )}
    </div>
  );
}
