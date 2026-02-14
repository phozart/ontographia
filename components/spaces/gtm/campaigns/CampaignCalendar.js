// components/spaces/gtm/campaigns/CampaignCalendar.js
// Calendar view of campaigns and milestones

import { useState, useMemo } from 'react';
import { useGTM, CAMPAIGN_TYPES } from '../GTMContext';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import CampaignIcon from '@mui/icons-material/Campaign';
import FlagIcon from '@mui/icons-material/Flag';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

export default function CampaignCalendar({ onSelect }) {
  const { getArtefactsByType, activeGTMPlan } = useGTM();
  const campaigns = getArtefactsByType('Campaign');
  const milestones = getArtefactsByType('Milestone');

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'quarter'

  const launchDate = activeGTMPlan?.launch?.launch_date ? new Date(activeGTMPlan.launch.launch_date) : null;

  // Navigate months
  const prevPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1));
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // Generate calendar days for month view
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay(); // 0 = Sunday

    const days = [];

    // Add padding for days before first of month
    for (let i = 0; i < startPadding; i++) {
      const date = new Date(year, month, -startPadding + i + 1);
      days.push({ date, isCurrentMonth: false });
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Add padding to complete the grid (6 rows)
    while (days.length < 42) {
      const lastDate = days[days.length - 1].date;
      days.push({
        date: new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1),
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentDate]);

  // Get items for a specific date
  const getItemsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const items = [];

    // Campaigns that span this date
    campaigns.forEach(campaign => {
      if (!campaign.start_date && !campaign.end_date) return;
      const start = campaign.start_date ? new Date(campaign.start_date) : null;
      const end = campaign.end_date ? new Date(campaign.end_date) : null;

      if (start && start.toISOString().split('T')[0] === dateStr) {
        items.push({ type: 'campaign-start', item: campaign });
      }
      if (end && end.toISOString().split('T')[0] === dateStr) {
        items.push({ type: 'campaign-end', item: campaign });
      }
    });

    // Milestones on this date
    milestones.forEach(milestone => {
      if (milestone.due_date && milestone.due_date === dateStr) {
        items.push({ type: 'milestone', item: milestone });
      }
    });

    // Launch date
    if (launchDate && launchDate.toISOString().split('T')[0] === dateStr) {
      items.push({ type: 'launch', item: { name: 'Product Launch' } });
    }

    return items;
  };

  // Check if date is today
  const isToday = (date) => {
    return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
  };

  // Format month header
  const monthLabel = currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  // Quarter view data
  const quarterMonths = useMemo(() => {
    const months = [];
    for (let i = 0; i < 3; i++) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      months.push(monthDate);
    }
    return months;
  }, [currentDate]);

  // Get campaigns active in a month
  const getCampaignsForMonth = (monthDate) => {
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    return campaigns.filter(campaign => {
      if (!campaign.start_date && !campaign.end_date) return false;
      const start = campaign.start_date ? new Date(campaign.start_date) : monthStart;
      const end = campaign.end_date ? new Date(campaign.end_date) : monthEnd;
      return start <= monthEnd && end >= monthStart;
    });
  };

  return (
    <div className="gtm-campaign-calendar">
      <div className="gtm-calendar-header">
        <div className="gtm-calendar-nav">
          <button onClick={prevPeriod}>
            <ChevronLeftIcon />
          </button>
          <h2>{monthLabel}</h2>
          <button onClick={nextPeriod}>
            <ChevronRightIcon />
          </button>
          <button className="gtm-today-btn" onClick={goToToday}>
            <TodayIcon fontSize="small" />
            Today
          </button>
        </div>

        <div className="gtm-view-toggle">
          <button
            className={viewMode === 'month' ? 'active' : ''}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
          <button
            className={viewMode === 'quarter' ? 'active' : ''}
            onClick={() => setViewMode('quarter')}
          >
            Quarter
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="gtm-calendar-legend">
        <span className="gtm-legend-item campaign-start">
          <CampaignIcon fontSize="small" /> Campaign Start
        </span>
        <span className="gtm-legend-item campaign-end">
          <CampaignIcon fontSize="small" /> Campaign End
        </span>
        <span className="gtm-legend-item milestone">
          <FlagIcon fontSize="small" /> Milestone
        </span>
        <span className="gtm-legend-item launch">
          <RocketLaunchIcon fontSize="small" /> Launch
        </span>
      </div>

      {viewMode === 'month' ? (
        /* Month View */
        <div className="gtm-calendar-month">
          <div className="gtm-calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="gtm-weekday">{day}</div>
            ))}
          </div>

          <div className="gtm-calendar-days">
            {calendarDays.map(({ date, isCurrentMonth }, index) => {
              const items = getItemsForDate(date);
              return (
                <div
                  key={index}
                  className={`gtm-calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday(date) ? 'today' : ''}`}
                >
                  <span className="gtm-day-number">{date.getDate()}</span>
                  <div className="gtm-day-items">
                    {items.slice(0, 3).map((item, i) => (
                      <div
                        key={i}
                        className={`gtm-day-item ${item.type}`}
                        onClick={() => onSelect?.(item.item)}
                        title={item.item.name}
                      >
                        {item.type === 'campaign-start' && <CampaignIcon fontSize="small" />}
                        {item.type === 'campaign-end' && <CampaignIcon fontSize="small" />}
                        {item.type === 'milestone' && <FlagIcon fontSize="small" />}
                        {item.type === 'launch' && <RocketLaunchIcon fontSize="small" />}
                        <span>{item.item.name?.substring(0, 12)}</span>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <span className="gtm-more-items">+{items.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Quarter View */
        <div className="gtm-calendar-quarter">
          {quarterMonths.map((monthDate, monthIndex) => {
            const monthCampaigns = getCampaignsForMonth(monthDate);
            const monthMilestones = milestones.filter(m => {
              if (!m.due_date) return false;
              const d = new Date(m.due_date);
              return d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear();
            });

            return (
              <div key={monthIndex} className="gtm-quarter-month">
                <h3>{monthDate.toLocaleDateString('en-GB', { month: 'long' })}</h3>

                <div className="gtm-quarter-campaigns">
                  {monthCampaigns.length === 0 ? (
                    <p className="gtm-empty-hint">No campaigns</p>
                  ) : (
                    monthCampaigns.map(campaign => (
                      <div
                        key={campaign.id}
                        className={`gtm-quarter-campaign status-${campaign.status || 'draft'}`}
                        onClick={() => onSelect?.(campaign)}
                      >
                        <CampaignIcon fontSize="small" />
                        <span>{campaign.name}</span>
                        <span className="gtm-campaign-type-badge">
                          {CAMPAIGN_TYPES[campaign.campaign_type]?.name || 'Campaign'}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {monthMilestones.length > 0 && (
                  <div className="gtm-quarter-milestones">
                    {monthMilestones.map(milestone => (
                      <div
                        key={milestone.id}
                        className={`gtm-quarter-milestone ${milestone.status === 'complete' ? 'complete' : ''}`}
                        onClick={() => onSelect?.(milestone)}
                      >
                        <FlagIcon fontSize="small" />
                        <span>{milestone.name}</span>
                        <span className="gtm-milestone-date">
                          {new Date(milestone.due_date).getDate()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Launch date indicator */}
                {launchDate &&
                  launchDate.getMonth() === monthDate.getMonth() &&
                  launchDate.getFullYear() === monthDate.getFullYear() && (
                  <div className="gtm-quarter-launch">
                    <RocketLaunchIcon />
                    <span>Launch Day - {launchDate.getDate()}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
