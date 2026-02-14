/**
 * ChangeOverview.js
 *
 * Change Management overview dashboard.
 */

import { useMemo } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { ViewHeader, ContentArea, Card, EmptyState, Button } from '@/components/ui';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import CampaignIcon from '@mui/icons-material/Campaign';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function ChangeOverview({ onNavigate, onCreateArtefact }) {
  const { getArtefactsByType } = useProjectStudio();

  const stats = useMemo(() => ({
    impacts: getArtefactsByType('impact_assessment').length,
    stakeholders: getArtefactsByType('stakeholder_engagement').length,
    communications: getArtefactsByType('communication').length,
    training: getArtefactsByType('training_item').length,
    readiness: getArtefactsByType('readiness_assessment').length,
  }), [getArtefactsByType]);

  const hasData = Object.values(stats).some(v => v > 0);

  return (
    <>
      <ViewHeader
        icon={SwapHorizIcon}
        iconColor="#8b5cf6"
        title="Change Management"
        description="Manage the people side of change"
      />
      <ContentArea>
        <div className="change-overview">
          {!hasData ? (
            <div className="change-onboarding">
              <Card>
                <Card.Header>
                  <span style={{ fontWeight: 600 }}>Change Management helps you answer:</span>
                </Card.Header>
                <Card.Section>
                  <ul className="change-questions">
                    <li>Who is affected by this change?</li>
                    <li>What changes for them?</li>
                    <li>How ready are they?</li>
                    <li>What support do they need?</li>
                  </ul>
                </Card.Section>
              </Card>

              <div className="change-steps">
                <Card onClick={() => onCreateArtefact?.('impact_assessment')} className="change-step-card">
                  <AssessmentIcon style={{ color: '#8b5cf6', fontSize: 28 }} />
                  <h4>1. Assess Impact</h4>
                  <p>Understand what changes for whom</p>
                </Card>
                <Card onClick={() => onCreateArtefact?.('stakeholder_engagement')} className="change-step-card">
                  <PeopleIcon style={{ color: '#3b82f6', fontSize: 28 }} />
                  <h4>2. Engage Stakeholders</h4>
                  <p>Plan targeted engagement</p>
                </Card>
                <Card onClick={() => onCreateArtefact?.('communication')} className="change-step-card">
                  <CampaignIcon style={{ color: '#22c55e', fontSize: 28 }} />
                  <h4>3. Communicate</h4>
                  <p>Keep everyone informed</p>
                </Card>
                <Card onClick={() => onCreateArtefact?.('training_item')} className="change-step-card">
                  <SchoolIcon style={{ color: '#f59e0b', fontSize: 28 }} />
                  <h4>4. Train</h4>
                  <p>Build capability</p>
                </Card>
              </div>
            </div>
          ) : (
            <div className="change-dashboard">
              <div className="change-stats-grid">
                <Card onClick={() => onNavigate?.('impact')} className="change-stat-card">
                  <AssessmentIcon style={{ color: '#8b5cf6', fontSize: 32 }} />
                  <span className="stat-value">{stats.impacts}</span>
                  <span className="stat-label">Impact Assessments</span>
                </Card>
                <Card onClick={() => onNavigate?.('stakeholders')} className="change-stat-card">
                  <PeopleIcon style={{ color: '#3b82f6', fontSize: 32 }} />
                  <span className="stat-value">{stats.stakeholders}</span>
                  <span className="stat-label">Stakeholders</span>
                </Card>
                <Card onClick={() => onNavigate?.('communications')} className="change-stat-card">
                  <CampaignIcon style={{ color: '#22c55e', fontSize: 32 }} />
                  <span className="stat-value">{stats.communications}</span>
                  <span className="stat-label">Communications</span>
                </Card>
                <Card onClick={() => onNavigate?.('training')} className="change-stat-card">
                  <SchoolIcon style={{ color: '#f59e0b', fontSize: 32 }} />
                  <span className="stat-value">{stats.training}</span>
                  <span className="stat-label">Training Items</span>
                </Card>
                <Card onClick={() => onNavigate?.('readiness')} className="change-stat-card">
                  <CheckCircleIcon style={{ color: '#22c55e', fontSize: 32 }} />
                  <span className="stat-value">{stats.readiness}</span>
                  <span className="stat-label">Readiness Assessments</span>
                </Card>
              </div>
            </div>
          )}
        </div>
      </ContentArea>
    </>
  );
}
