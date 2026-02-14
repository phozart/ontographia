/**
 * Roles List
 *
 * Lists organisational roles with their responsibilities
 */

import { useState, useMemo } from 'react';
import { useEnterprise } from '../EnterpriseContext';
import styles from './organisation.module.css';

export function RolesList() {
  const { artefacts, setSelectedArtefact, setActiveView } = useEnterprise();
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('all');

  const roles = useMemo(() => {
    return artefacts.filter(a => a.type === 'role');
  }, [artefacts]);

  const orgUnits = useMemo(() => {
    return artefacts.filter(a => a.type === 'org-unit');
  }, [artefacts]);

  const filtered = useMemo(() => {
    let items = roles;

    if (unitFilter !== 'all') {
      items = items.filter(r => r.orgUnitId === unitFilter);
    }

    if (search) {
      const s = search.toLowerCase();
      items = items.filter(r =>
        r.name?.toLowerCase().includes(s) ||
        r.description?.toLowerCase().includes(s)
      );
    }

    return items;
  }, [roles, unitFilter, search]);

  const handleRoleClick = (role) => {
    setSelectedArtefact(role);
    setActiveView('role-detail');
  };

  const getUnitName = (unitId) => {
    const unit = orgUnits.find(u => u.id === unitId);
    return unit?.name || 'Unassigned';
  };

  return (
    <div className={styles.rolesList}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2>Roles</h2>
          <p className={styles.subtitle}>
            Organisational roles and responsibilities
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => setActiveView('role-create')}
        >
          + Add Role
        </button>
      </div>

      {/* Filters */}
      <div className={styles.toolbar}>
        <select
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
          className={styles.select}
        >
          <option value="all">All Units</option>
          {orgUnits.map(unit => (
            <option key={unit.id} value={unit.id}>{unit.name}</option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Roles Table */}
      <div className={styles.rolesTable}>
        <div className={styles.tableHeader}>
          <span className={styles.headerCell}>Role</span>
          <span className={styles.headerCell}>Unit</span>
          <span className={styles.headerCell}>Level</span>
          <span className={styles.headerCell}>Incumbents</span>
        </div>
        {filtered.map(role => (
          <div
            key={role.id}
            className={styles.tableRow}
            onClick={() => handleRoleClick(role)}
          >
            <span className={styles.roleCell}>
              <strong>{role.name}</strong>
              {role.description && (
                <span className={styles.roleDescription}>
                  {role.description.length > 60
                    ? `${role.description.slice(0, 60)}...`
                    : role.description}
                </span>
              )}
            </span>
            <span className={styles.cell}>
              {getUnitName(role.orgUnitId)}
            </span>
            <span className={styles.cell}>
              {role.level || '-'}
            </span>
            <span className={styles.cell}>
              {role.incumbents?.length || 0}
            </span>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.emptyState}>
          <p>No roles found</p>
          <button
            className={styles.addButton}
            onClick={() => setActiveView('role-create')}
          >
            Add First Role
          </button>
        </div>
      )}
    </div>
  );
}
