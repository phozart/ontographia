// components/portfolio/DecisionTimeline.js
// Decision Timeline - When decisions need to be made
// "What's coming up and what's overdue?"

import { useMemo } from 'react';
import { usePortfolio } from './PortfolioContext';
import { ViewHeader, ContentArea, Card } from '../ui';

// MUI Icons
import EventIcon from '@mui/icons-material/Event';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GavelIcon from '@mui/icons-material/Gavel';
import TodayIcon from '@mui/icons-material/Today';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import {
  PORTFOLIO_STAGES,
  INVESTMENT_HORIZONS,
} from '../../lib/portfolio-types';

// Calculate days between dates
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((date2 - date1) / oneDay);
}

// Format date
function formatDate(date) {
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Format relative time
function formatRelativeTime(days) {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days < 7) return `In ${days} days`;
  if (days < 14) return 'Next week';
  if (days < 30) return `In ${Math.ceil(days / 7)} weeks`;
  return `In ${Math.ceil(days / 30)} months`;
}

// Timeline Item component
function TimelineItem({ item, type, onClick }) {
  const horizon = INVESTMENT_HORIZONS[item.custom_fields?.time_horizon];
  const stage = PORTFOLIO_STAGES[item.custom_fields?.stage];

  const getIcon = () => {
    switch (type) {
      case 'overdue':
        return <ErrorOutlineIcon style={{ color: '#ef4444' }} />;
      case 'today':
        return <TodayIcon style={{ color: '#f59e0b' }} />;
      case 'upcoming':
        return <ScheduleIcon style={{ color: '#3b82f6' }} />;
      case 'stuck':
        return <HourglassEmptyIcon style={{ color: '#f59e0b' }} />;
      default:
        return <RocketLaunchIcon style={{ color: '#6b7280' }} />;
    }
  };

  return (
    <div className={`timeline-item timeline-item--${type}`} onClick={() => onClick?.(item)}>
      <div className="timeline-item__icon">{getIcon()}</div>
      <div className="timeline-item__content">
        <div className="timeline-item__header">
          <span className="timeline-item__name">{item.name}</span>
          {horizon && (
            <span className="timeline-item__horizon" style={{ background: horizon.color }}>
              {horizon.shortName}
            </span>
          )}
        </div>
        <div className="timeline-item__meta">
          {item.dueDate && (
            <span className="timeline-item__date">
              {formatDate(item.dueDate)} ({formatRelativeTime(item.daysUntil)})
            </span>
          )}
          {item.daysStuck !== undefined && (
            <span className="timeline-item__stuck">
              Stuck for {item.daysStuck} days in {stage?.name}
            </span>
          )}
        </div>
      </div>
      <ArrowForwardIcon fontSize="small" style={{ color: 'var(--text-muted)' }} />
    </div>
  );
}

// Section component
function TimelineSection({ title, icon: Icon, iconColor, items, emptyMessage, onItemClick }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="timeline-section">
      <div className="timeline-section__header">
        <Icon style={{ fontSize: 18, color: iconColor }} />
        <span>{title}</span>
        <span className="timeline-section__count">{items.length}</span>
      </div>
      <div className="timeline-section__items">
        {items.map(item => (
          <TimelineItem
            key={item.id}
            item={item}
            type={item.type}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
}

export default function DecisionTimeline({ onSelectItem }) {
  const {
    initiatives,
    decisions,
  } = usePortfolio();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Analyze initiatives for timeline
  const timelineData = useMemo(() => {
    const overdue = [];
    const todayItems = [];
    const thisWeek = [];
    const nextWeek = [];
    const thisMonth = [];
    const stuck = [];

    initiatives.forEach(init => {
      const deadline = init.custom_fields?.decision_deadline;
      const createdAt = new Date(init.created_at);
      const updatedAt = new Date(init.updated_at || init.created_at);

      // Check for decision deadline
      if (deadline) {
        const dueDate = new Date(deadline);
        dueDate.setHours(0, 0, 0, 0);
        const daysUntil = daysBetween(today, dueDate);

        const timelineItem = {
          ...init,
          dueDate,
          daysUntil,
        };

        if (daysUntil < 0) {
          timelineItem.type = 'overdue';
          overdue.push(timelineItem);
        } else if (daysUntil === 0) {
          timelineItem.type = 'today';
          todayItems.push(timelineItem);
        } else if (daysUntil <= 7) {
          timelineItem.type = 'upcoming';
          thisWeek.push(timelineItem);
        } else if (daysUntil <= 14) {
          timelineItem.type = 'upcoming';
          nextWeek.push(timelineItem);
        } else if (daysUntil <= 30) {
          timelineItem.type = 'upcoming';
          thisMonth.push(timelineItem);
        }
      }

      // Check for stuck initiatives (no update in 14+ days in certain stages)
      const stuckStages = ['discover', 'evaluate', 'decide'];
      if (stuckStages.includes(init.custom_fields?.stage)) {
        const daysSinceUpdate = daysBetween(updatedAt, today);
        if (daysSinceUpdate >= 14) {
          stuck.push({
            ...init,
            daysStuck: daysSinceUpdate,
            type: 'stuck',
          });
        }
      }
    });

    // Sort by date/priority
    overdue.sort((a, b) => a.daysUntil - b.daysUntil);
    todayItems.sort((a, b) => a.name.localeCompare(b.name));
    thisWeek.sort((a, b) => a.daysUntil - b.daysUntil);
    nextWeek.sort((a, b) => a.daysUntil - b.daysUntil);
    thisMonth.sort((a, b) => a.daysUntil - b.daysUntil);
    stuck.sort((a, b) => b.daysStuck - a.daysStuck);

    return {
      overdue,
      today: todayItems,
      thisWeek,
      nextWeek,
      thisMonth,
      stuck,
    };
  }, [initiatives, today]);

  // Recent decisions
  const recentDecisions = useMemo(() => {
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return decisions
      .filter(d => {
        const decisionDate = new Date(d.custom_fields?.decision_date);
        return decisionDate >= thirtyDaysAgo;
      })
      .sort((a, b) => {
        const dateA = new Date(a.custom_fields?.decision_date);
        const dateB = new Date(b.custom_fields?.decision_date);
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [decisions, today]);

  const hasTimelineItems =
    timelineData.overdue.length > 0 ||
    timelineData.today.length > 0 ||
    timelineData.thisWeek.length > 0 ||
    timelineData.nextWeek.length > 0 ||
    timelineData.thisMonth.length > 0 ||
    timelineData.stuck.length > 0;

  return (
    <>
      <ViewHeader
        icon={EventIcon}
        iconColor="#3b82f6"
        title="Decision Timeline"
        description="Upcoming decisions and stuck initiatives"
        count={initiatives.length}
      />
      <ContentArea>
        {!hasTimelineItems && recentDecisions.length === 0 ? (
          <div className="timeline-empty">
            <EventIcon style={{ fontSize: 48, color: '#6b7280', marginBottom: 16 }} />
            <h3>No Upcoming Decisions</h3>
            <p>Set decision deadlines on initiatives to track them here.</p>
            <p className="timeline-empty__tip">
              Add a <strong>decision_deadline</strong> field to your initiatives to see them in the timeline.
            </p>
          </div>
        ) : (
          <div className="timeline-layout">
            {/* Main Timeline */}
            <div className="timeline-main">
              {/* Overdue */}
              <TimelineSection
                title="Overdue"
                icon={ErrorOutlineIcon}
                iconColor="#ef4444"
                items={timelineData.overdue}
                onItemClick={onSelectItem}
              />

              {/* Today */}
              <TimelineSection
                title="Today"
                icon={TodayIcon}
                iconColor="#f59e0b"
                items={timelineData.today}
                onItemClick={onSelectItem}
              />

              {/* This Week */}
              <TimelineSection
                title="This Week"
                icon={ScheduleIcon}
                iconColor="#3b82f6"
                items={timelineData.thisWeek}
                onItemClick={onSelectItem}
              />

              {/* Next Week */}
              <TimelineSection
                title="Next Week"
                icon={ScheduleIcon}
                iconColor="#3b82f6"
                items={timelineData.nextWeek}
                onItemClick={onSelectItem}
              />

              {/* This Month */}
              <TimelineSection
                title="This Month"
                icon={ScheduleIcon}
                iconColor="#6b7280"
                items={timelineData.thisMonth}
                onItemClick={onSelectItem}
              />

              {/* Stuck */}
              {timelineData.stuck.length > 0 && (
                <TimelineSection
                  title="Stuck Initiatives"
                  icon={HourglassEmptyIcon}
                  iconColor="#f59e0b"
                  items={timelineData.stuck}
                  onItemClick={onSelectItem}
                />
              )}

              {/* No upcoming but has stuck */}
              {!hasTimelineItems && timelineData.stuck.length === 0 && (
                <div className="timeline-no-upcoming">
                  <CheckCircleIcon style={{ color: '#10b981', fontSize: 24 }} />
                  <span>No upcoming decision deadlines</span>
                </div>
              )}
            </div>

            {/* Sidebar: Recent Decisions */}
            {recentDecisions.length > 0 && (
              <div className="timeline-sidebar">
                <Card className="timeline-recent">
                  <Card.Header>
                    <GavelIcon style={{ fontSize: 18 }} />
                    <span>Recent Decisions</span>
                  </Card.Header>
                  <div className="timeline-recent__list">
                    {recentDecisions.map(decision => (
                      <div
                        key={decision.id}
                        className="timeline-recent__item"
                        onClick={() => onSelectItem?.(decision)}
                      >
                        <span className={`timeline-recent__type timeline-recent__type--${decision.custom_fields?.decision_type}`}>
                          {decision.custom_fields?.decision_type}
                        </span>
                        <span className="timeline-recent__name">{decision.name}</span>
                        <span className="timeline-recent__date">
                          {formatDate(new Date(decision.custom_fields?.decision_date))}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Summary Stats */}
                <Card className="timeline-stats">
                  <Card.Header>
                    <ScheduleIcon style={{ fontSize: 18 }} />
                    <span>Summary</span>
                  </Card.Header>
                  <div className="timeline-stats__grid">
                    <div className="timeline-stats__item">
                      <span className="timeline-stats__value timeline-stats__value--overdue">
                        {timelineData.overdue.length}
                      </span>
                      <span className="timeline-stats__label">Overdue</span>
                    </div>
                    <div className="timeline-stats__item">
                      <span className="timeline-stats__value timeline-stats__value--week">
                        {timelineData.today.length + timelineData.thisWeek.length}
                      </span>
                      <span className="timeline-stats__label">This Week</span>
                    </div>
                    <div className="timeline-stats__item">
                      <span className="timeline-stats__value timeline-stats__value--stuck">
                        {timelineData.stuck.length}
                      </span>
                      <span className="timeline-stats__label">Stuck</span>
                    </div>
                    <div className="timeline-stats__item">
                      <span className="timeline-stats__value">
                        {recentDecisions.length}
                      </span>
                      <span className="timeline-stats__label">Decided (30d)</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </ContentArea>

      <style jsx>{`
        .timeline-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          color: var(--text-muted);
        }

        .timeline-empty h3 {
          margin: 0 0 8px;
          color: var(--text);
        }

        .timeline-empty p {
          margin: 0 0 12px;
        }

        .timeline-empty__tip {
          font-size: 0.8125rem;
          padding: 12px 16px;
          background: var(--panel);
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .timeline-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 24px;
        }

        @media (max-width: 900px) {
          .timeline-layout {
            grid-template-columns: 1fr;
          }
        }

        .timeline-main {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .timeline-section__header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .timeline-section__count {
          margin-left: auto;
          padding: 2px 8px;
          background: var(--bg);
          border-radius: 10px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .timeline-section__items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .timeline-no-upcoming {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 8px;
          color: #10b981;
          font-weight: 500;
        }

        .timeline-sidebar {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .timeline-recent__list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
        }

        .timeline-recent__item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: var(--bg);
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .timeline-recent__item:hover {
          background: var(--border);
        }

        .timeline-recent__type {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .timeline-recent__type--approve {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .timeline-recent__type--defer {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .timeline-recent__type--drop {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .timeline-recent__name {
          flex: 1;
          font-size: 0.8125rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .timeline-recent__date {
          font-size: 0.6875rem;
          color: var(--text-muted);
        }

        .timeline-stats__grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding: 12px;
        }

        .timeline-stats__item {
          text-align: center;
        }

        .timeline-stats__value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .timeline-stats__value--overdue {
          color: #ef4444;
        }

        .timeline-stats__value--week {
          color: #3b82f6;
        }

        .timeline-stats__value--stuck {
          color: #f59e0b;
        }

        .timeline-stats__label {
          display: block;
          font-size: 0.6875rem;
          color: var(--text-muted);
          margin-top: 4px;
        }
      `}</style>
    </>
  );
}
