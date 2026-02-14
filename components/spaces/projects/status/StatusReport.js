/**
 * StatusReport.js
 *
 * Project status reporting view.
 */

import { useMemo, useState } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { ViewHeader, ContentArea, Card, EmptyState, Button } from '@/components/ui';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

export default function StatusReport({ onCreateArtefact, onEditArtefact, onDeleteArtefact }) {
  const { getArtefactsByType, stats } = useProjectStudio();
  const [selectedReport, setSelectedReport] = useState(null);

  const reports = useMemo(() => {
    return getArtefactsByType('status_report').sort(
      (a, b) => new Date(b.custom_fields?.report_date || 0) - new Date(a.custom_fields?.report_date || 0)
    );
  }, [getArtefactsByType]);

  const latestReport = reports[0];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return <TrendingUpIcon style={{ color: '#22c55e', fontSize: 18 }} />;
      case 'declining': return <TrendingDownIcon style={{ color: '#ef4444', fontSize: 18 }} />;
      default: return <TrendingFlatIcon style={{ color: '#f59e0b', fontSize: 18 }} />;
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'green': return '#22c55e';
      case 'amber': return '#f59e0b';
      case 'red': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  return (
    <>
      <ViewHeader
        icon={SummarizeIcon}
        iconColor="#3b82f6"
        title="Status Reports"
        description="Track and communicate project progress"
        count={reports.length}
        createLabel="New Report"
        onCreate={() => onCreateArtefact?.('status_report')}
      />
      <ContentArea>
        <div className="status-reports">
          {reports.length === 0 ? (
            <EmptyState
              icon={SummarizeIcon}
              iconColor="#3b82f6"
              title="No Status Reports"
              description="Create regular status reports to track progress."
              actionLabel="New Report"
              onAction={() => onCreateArtefact?.('status_report')}
            />
          ) : (
            <>
              {/* Latest Report Summary */}
              {latestReport && !selectedReport && (
                <Card className="status-latest">
                  <Card.Header>
                    <span>Latest Report</span>
                    <span className="report-date">
                      {new Date(latestReport.custom_fields?.report_date).toLocaleDateString()}
                    </span>
                    <span
                      className="health-badge"
                      style={{
                        backgroundColor: getHealthColor(latestReport.custom_fields?.overall_health),
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {latestReport.custom_fields?.overall_health}
                    </span>
                    <div className="card-actions">
                      <button onClick={() => onEditArtefact?.(latestReport)}><EditIcon fontSize="small" /></button>
                      <button onClick={() => onDeleteArtefact?.(latestReport)}><DeleteIcon fontSize="small" /></button>
                    </div>
                  </Card.Header>
                  <Card.Section>
                    <div className="status-dimensions">
                      <div className="dimension">
                        <span className="dimension-label">Schedule</span>
                        <span
                          className="dimension-value"
                          style={{ color: getHealthColor(latestReport.custom_fields?.schedule_health) }}
                        >
                          {latestReport.custom_fields?.schedule_health}
                        </span>
                        {getTrendIcon(latestReport.custom_fields?.schedule_trend)}
                      </div>
                      <div className="dimension">
                        <span className="dimension-label">Budget</span>
                        <span
                          className="dimension-value"
                          style={{ color: getHealthColor(latestReport.custom_fields?.budget_health) }}
                        >
                          {latestReport.custom_fields?.budget_health}
                        </span>
                        {getTrendIcon(latestReport.custom_fields?.budget_trend)}
                      </div>
                      <div className="dimension">
                        <span className="dimension-label">Scope</span>
                        <span
                          className="dimension-value"
                          style={{ color: getHealthColor(latestReport.custom_fields?.scope_health) }}
                        >
                          {latestReport.custom_fields?.scope_health}
                        </span>
                        {getTrendIcon(latestReport.custom_fields?.scope_trend)}
                      </div>
                      <div className="dimension">
                        <span className="dimension-label">Resources</span>
                        <span
                          className="dimension-value"
                          style={{ color: getHealthColor(latestReport.custom_fields?.resource_health) }}
                        >
                          {latestReport.custom_fields?.resource_health}
                        </span>
                        {getTrendIcon(latestReport.custom_fields?.resource_trend)}
                      </div>
                    </div>

                    {latestReport.custom_fields?.summary && (
                      <div className="report-summary">
                        <h4>Executive Summary</h4>
                        <p>{latestReport.custom_fields.summary}</p>
                      </div>
                    )}

                    <div className="report-sections">
                      {latestReport.custom_fields?.accomplishments?.length > 0 && (
                        <div className="report-section">
                          <h4>Key Accomplishments</h4>
                          <ul>
                            {latestReport.custom_fields.accomplishments.map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {latestReport.custom_fields?.upcoming?.length > 0 && (
                        <div className="report-section">
                          <h4>Upcoming Activities</h4>
                          <ul>
                            {latestReport.custom_fields.upcoming.map((u, i) => (
                              <li key={i}>{u}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {latestReport.custom_fields?.blockers?.length > 0 && (
                        <div className="report-section report-section--blockers">
                          <h4>Blockers & Escalations</h4>
                          <ul>
                            {latestReport.custom_fields.blockers.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Card.Section>
                </Card>
              )}

              {/* Report History */}
              {reports.length > 1 && (
                <Card>
                  <Card.Header>
                    <span>Report History</span>
                  </Card.Header>
                  <Card.Section>
                    <div className="report-history">
                      {reports.slice(1).map(report => (
                        <div key={report.id} className="history-item">
                          <span className="history-date">
                            {new Date(report.custom_fields?.report_date).toLocaleDateString()}
                          </span>
                          <span
                            className="history-health"
                            style={{
                              color: getHealthColor(report.custom_fields?.overall_health)
                            }}
                          >
                            {report.custom_fields?.overall_health}
                          </span>
                          <span className="history-summary">
                            {report.custom_fields?.summary?.substring(0, 80)}
                            {report.custom_fields?.summary?.length > 80 ? '...' : ''}
                          </span>
                          <div className="row-actions">
                            <button onClick={() => setSelectedReport(report)}>View</button>
                            <button onClick={() => onEditArtefact?.(report)}><EditIcon fontSize="small" /></button>
                            <button onClick={() => onDeleteArtefact?.(report)}><DeleteIcon fontSize="small" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Section>
                </Card>
              )}
            </>
          )}

          <div className="register-footer">
            <Button variant="primary" onClick={() => onCreateArtefact?.('status_report')}>
              <AddIcon fontSize="small" />
              New Status Report
            </Button>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
