// components/spaces/gtm/views/LaunchCalendar.js
// Unified calendar view for GTM activities

import { useState, useMemo } from 'react';
import { useGTM } from '../GTMContext';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import FlagIcon from '@mui/icons-material/Flag';
import CampaignIcon from '@mui/icons-material/Campaign';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';

export default function LaunchCalendar({ onSelect }) {
  const { getArtefactsByType, activeGTMPlan } = useGTM();

  const campaigns = getArtefactsByType('Campaign');
  const milestones = getArtefactsByType('Milestone');
  const trainings = getArtefactsByType('Training');

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'list'
  const [filterType, setFilterType] = useState('all');

  const launchDate = activeGTMPlan?.launch?.launch_date ? new Date(activeGTMPlan.launch.launch_date) : null;

  // Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();

    const days = [];

    // Padding for previous month
    for (let i = 0; i < startPadding; i++) {
      const date = new Date(year, month, -startPadding + i + 1);
      days.push({ date, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Padding to complete grid
    while (days.length < 42) {
      const lastDate = days[days.length - 1].date;
      days.push({
        date: new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1),
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentDate]);

  // Get all events for display
  const getAllEvents = () => {
    const events = [];

    // Milestones
    milestones.forEach(m => {
      if (m.due_date) {
        events.push({
          type: 'milestone',
          date: new Date(m.due_date),
          item: m,
          label: m.name,
          color: m.status === 'complete' ? '#5B8A6A' : '#47453F'
        });
      }
    });

    // Campaign start/end dates
    campaigns.forEach(c => {
      if (c.start_date) {
        events.push({
          type: 'campaign-start',
          date: new Date(c.start_date),
          item: c,
          label: `${c.name} starts`,
          color: '#3b82f6'
        });
      }
      if (c.end_date) {
        events.push({
          type: 'campaign-end',
          date: new Date(c.end_date),
          item: c,
          label: `${c.name} ends`,
          color: '#6366f1'
        });
      }
    });

    // Training delivery dates
    trainings.forEach(t => {
      if (t.delivery_date) {
        events.push({
          type: 'training',
          date: new Date(t.delivery_date),
          item: t,
          label: t.name,
          color: '#8b5cf6'
        });
      }
    });

    // Launch date
    if (launchDate) {
      events.push({
        type: 'launch',
        date: launchDate,
        item: { name: 'Product Launch', type: 'launch' },
        label: 'Launch Day',
        color: '#ef4444',
        priority: 1
      });
    }

    return events.sort((a, b) => a.date - b.date);
  };

  const allEvents = getAllEvents();

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return allEvents.filter(e => {
      if (filterType !== 'all' && e.type !== filterType && e.type !== 'launch') return false;
      return e.date.toISOString().split('T')[0] === dateStr;
    });
  };

  // List view events (upcoming)
  const upcomingEvents = allEvents
    .filter(e => e.date >= today)
    .filter(e => filterType === 'all' || e.type === filterType || e.type === 'launch')
    .slice(0, 20);

  const isToday = (date) => {
    return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'milestone': return <FlagIcon fontSize="small" />;
      case 'campaign-start':
      case 'campaign-end': return <CampaignIcon fontSize="small" />;
      case 'training': return <SchoolIcon fontSize="small" />;
      case 'launch': return <RocketLaunchIcon fontSize="small" />;
      default: return <EventIcon fontSize="small" />;
    }
  };

  const monthLabel = currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="gtm-launch-calendar">
      <div className="gtm-calendar-header">
        <div className="gtm-calendar-nav">
          <button onClick={prevMonth}>
            <ChevronLeftIcon />
          </button>
          <h2>{monthLabel}</h2>
          <button onClick={nextMonth}>
            <ChevronRightIcon />
          </button>
          <button className="gtm-today-btn" onClick={goToToday}>
            <TodayIcon fontSize="small" />
            Today
          </button>
        </div>

        <div className="gtm-calendar-controls">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="milestone">Milestones</option>
            <option value="campaign-start">Campaigns</option>
            <option value="training">Training</option>
          </select>

          <div className="gtm-view-toggle">
            <button
              className={viewMode === 'month' ? 'active' : ''}
              onClick={() => setViewMode('month')}
            >
              Calendar
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="gtm-calendar-legend">
        <span className="gtm-legend-item" style={{ '--dot-color': '#47453F' }}>
          <span className="gtm-legend-dot" />
          Milestone
        </span>
        <span className="gtm-legend-item" style={{ '--dot-color': '#3b82f6' }}>
          <span className="gtm-legend-dot" />
          Campaign
        </span>
        <span className="gtm-legend-item" style={{ '--dot-color': '#8b5cf6' }}>
          <span className="gtm-legend-dot" />
          Training
        </span>
        <span className="gtm-legend-item" style={{ '--dot-color': '#ef4444' }}>
          <span className="gtm-legend-dot" />
          Launch
        </span>
      </div>

      {viewMode === 'month' ? (
        <div className="gtm-calendar-month">
          <div className="gtm-calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="gtm-weekday">{day}</div>
            ))}
          </div>

          <div className="gtm-calendar-grid">
            {calendarDays.map(({ date, isCurrentMonth }, index) => {
              const events = getEventsForDate(date);
              const hasLaunch = events.some(e => e.type === 'launch');

              return (
                <div
                  key={index}
                  className={`gtm-calendar-cell
                    ${!isCurrentMonth ? 'other-month' : ''}
                    ${isToday(date) ? 'today' : ''}
                    ${hasLaunch ? 'launch-day' : ''}`}
                >
                  <span className="gtm-cell-date">{date.getDate()}</span>
                  <div className="gtm-cell-events">
                    {events.slice(0, 3).map((event, i) => (
                      <div
                        key={i}
                        className={`gtm-cell-event type-${event.type}`}
                        style={{ backgroundColor: event.color }}
                        onClick={() => onSelect?.(event.item)}
                        title={event.label}
                      >
                        {getEventIcon(event.type)}
                        <span>{event.label}</span>
                      </div>
                    ))}
                    {events.length > 3 && (
                      <span className="gtm-cell-more">+{events.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="gtm-calendar-list">
          {upcomingEvents.length === 0 ? (
            <div className="gtm-empty-hint">
              <p>No upcoming events</p>
            </div>
          ) : (
            <div className="gtm-events-list">
              {upcomingEvents.map((event, index) => {
                const isEventToday = isToday(event.date);
                const daysUntil = Math.ceil((event.date - today) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={index}
                    className={`gtm-event-row type-${event.type} ${isEventToday ? 'today' : ''}`}
                    onClick={() => onSelect?.(event.item)}
                  >
                    <div className="gtm-event-date">
                      <span className="gtm-event-day">{event.date.getDate()}</span>
                      <span className="gtm-event-month">
                        {event.date.toLocaleDateString('en-GB', { month: 'short' })}
                      </span>
                      <span className="gtm-event-days-until">
                        {isEventToday ? 'Today' :
                         daysUntil === 1 ? 'Tomorrow' :
                         `${daysUntil} days`}
                      </span>
                    </div>

                    <div
                      className="gtm-event-indicator"
                      style={{ backgroundColor: event.color }}
                    />

                    <div className="gtm-event-content">
                      <div className="gtm-event-icon">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="gtm-event-info">
                        <span className="gtm-event-label">{event.label}</span>
                        <span className="gtm-event-type">
                          {event.type.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
