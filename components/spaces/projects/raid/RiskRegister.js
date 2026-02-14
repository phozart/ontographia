/**
 * RiskRegister.js
 *
 * Full risk register view with filtering and sorting.
 */

import { useMemo, useState } from 'react';
import { useProjectStudio } from '../ProjectContext';
import {
  RISK_STATUS,
  RISK_PROBABILITY,
  RISK_IMPACT,
  calculateRiskScore,
  getRiskExposure,
} from '../../../../lib/project-types';

// Shared UI components
import {
  ViewHeader,
  ContentArea,
  Card,
  EmptyState,
  Button,
} from '@/components/ui';

// MUI Icons
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function RiskRegister({ onCreateArtefact, onEditArtefact, onDeleteArtefact }) {
  const { getArtefactsByType, getRisksByScore } = useProjectStudio();

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score');

  // Get all risks
  const allRisks = useMemo(() => {
    return getRisksByScore().map(risk => ({
      ...risk,
      exposure: getRiskExposure(risk.score),
    }));
  }, [getRisksByScore]);

  // Filter risks
  const filteredRisks = useMemo(() => {
    let filtered = allRisks;

    if (filter !== 'all') {
      filtered = filtered.filter(r => r.custom_fields?.status === filter);
    }

    // Sort
    if (sortBy === 'score') {
      filtered.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return filtered;
  }, [allRisks, filter, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: allRisks.length,
    open: allRisks.filter(r => r.custom_fields?.status === 'open').length,
    high: allRisks.filter(r => r.exposure === 'high' || r.exposure === 'critical').length,
  }), [allRisks]);

  return (
    <>
      <ViewHeader
        icon={WarningIcon}
        iconColor="#ef4444"
        title="Risk Register"
        description="Identify, assess, and manage project risks"
        count={stats.total}
        createLabel="Add Risk"
        onCreate={() => onCreateArtefact?.('risk')}
      />
      <ContentArea>
        <div className="risk-register">
          {/* Stats Bar */}
          <div className="register-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-value" style={{ color: '#ef4444' }}>{stats.open}</span>
              <span className="stat-label">Open</span>
            </div>
            <div className="stat-item">
              <span className="stat-value" style={{ color: '#ef4444' }}>{stats.high}</span>
              <span className="stat-label">High/Critical</span>
            </div>
          </div>

          {/* Filters */}
          <div className="register-filters">
            <div className="filter-group">
              <FilterListIcon fontSize="small" />
              <select value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">All Status</option>
                {Object.values(RISK_STATUS).map(status => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="score">Sort by Score</option>
                <option value="date">Sort by Date</option>
              </select>
            </div>
          </div>

          {/* Risk List */}
          {filteredRisks.length === 0 ? (
            <EmptyState
              icon={WarningIcon}
              iconColor="#ef4444"
              title="No Risks Found"
              description={filter === 'all' ? 'Add risks to track potential project threats.' : 'No risks match the current filter.'}
              actionLabel="Add Risk"
              onAction={() => onCreateArtefact?.('risk')}
            />
          ) : (
            <div className="register-table">
              <table>
                <thead>
                  <tr>
                    <th>Score</th>
                    <th>Description</th>
                    <th>Prob</th>
                    <th>Impact</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRisks.map(risk => (
                    <tr key={risk.id} className={`risk-row risk-row--${risk.exposure}`}>
                      <td>
                        <span className={`risk-score risk-score--${risk.exposure}`}>
                          {risk.score}
                        </span>
                      </td>
                      <td className="risk-description">
                        {risk.custom_fields?.description || risk.name}
                        {risk.custom_fields?.category && (
                          <span className="risk-category">{risk.custom_fields.category}</span>
                        )}
                      </td>
                      <td>
                        <span className={`risk-level risk-level--${risk.custom_fields?.probability}`}>
                          {risk.custom_fields?.probability}
                        </span>
                      </td>
                      <td>
                        <span className={`risk-level risk-level--${risk.custom_fields?.impact}`}>
                          {risk.custom_fields?.impact}
                        </span>
                      </td>
                      <td>
                        <span className={`risk-status risk-status--${risk.custom_fields?.status}`}>
                          {risk.custom_fields?.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>{risk.custom_fields?.owner || '-'}</td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="action-btn"
                            onClick={() => onEditArtefact?.(risk)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </button>
                          <button
                            className="action-btn action-btn--danger"
                            onClick={() => onDeleteArtefact?.(risk)}
                            title="Delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quick Add */}
          <div className="register-footer">
            <Button variant="primary" onClick={() => onCreateArtefact?.('risk')}>
              <AddIcon fontSize="small" />
              Add Risk
            </Button>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
