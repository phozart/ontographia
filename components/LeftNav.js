// components/LeftNav.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Tooltip from '@mui/material/Tooltip';
import SchoolIcon from '@mui/icons-material/School';
import HubIcon from '@mui/icons-material/Hub';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TimelineIcon from '@mui/icons-material/Timeline';
import SourceIcon from '@mui/icons-material/Source';
import CableIcon from '@mui/icons-material/Cable';
import CategoryIcon from '@mui/icons-material/Category';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { useAuth } from './AuthContext';

export default function LeftNav() {
  const router = useRouter();
  const { role, user } = useAuth();
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Load pinned state from localStorage
  useEffect(() => {
    const stored = window.localStorage.getItem('left-nav-pinned');
    if (stored === 'true') setIsPinned(true);
  }, []);

  // Save pinned state to localStorage
  const togglePinned = () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    window.localStorage.setItem('left-nav-pinned', String(newPinned));
  };

  const isActive = (...hrefs) =>
    hrefs.some(href => {
      if (!router?.pathname) return false;
      if (href === '/') return router.pathname === '/';
      return router.pathname.startsWith(href);
    });

  if (!user) return null;

  const navItems = [
    {
      href: '/semanticmodelbrowser',
      label: 'Model Browser',
      icon: SchoolIcon,
      active: isActive('/semanticmodelbrowser', '/user-view'),
      roles: ['admin', 'editor', 'viewer'],
    },
    {
      href: '/graphnavigator',
      label: 'Graph Navigator',
      icon: HubIcon,
      active: isActive('/graphnavigator', '/studio'),
      roles: ['admin', 'editor', 'viewer'],
    },
    {
      href: '/flow-designer',
      label: 'Flow Designer',
      icon: TimelineIcon,
      active: isActive('/flow-designer'),
      roles: ['admin', 'editor', 'viewer'],
    },
    {
      href: '/diagram-workspace',
      label: 'Diagrams',
      icon: AccountTreeIcon,
      active: isActive('/diagram-workspace'),
      roles: ['admin', 'editor', 'viewer'],
    },
    { type: 'divider' },
    {
      href: '/nodes',
      label: 'Nodes',
      icon: SourceIcon,
      active: isActive('/nodes'),
      roles: ['admin'],
    },
    {
      href: '/node-types',
      label: 'Node Types',
      icon: CategoryIcon,
      active: isActive('/node-types'),
      roles: ['admin'],
    },
    {
      href: '/relationships',
      label: 'Connections',
      icon: CableIcon,
      active: isActive('/relationships'),
      roles: ['admin'],
    },
    {
      href: '/relationship-types',
      label: 'Connection Types',
      icon: DeviceHubIcon,
      active: isActive('/relationship-types'),
      roles: ['admin'],
    },
  ];

  const isExpanded = isPinned || isHovered;
  const showTooltips = !isExpanded;

  return (
    <nav
      className={`left-nav ${isExpanded ? 'expanded' : ''} ${isPinned ? 'pinned' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Pin button */}
      <Tooltip title={isPinned ? 'Unpin sidebar' : 'Pin sidebar open'} placement="right" arrow disableHoverListener={isExpanded}>
        <button
          className={`left-nav-pin ${isPinned ? 'active' : ''}`}
          onClick={togglePinned}
          aria-label={isPinned ? 'Unpin sidebar' : 'Pin sidebar open'}
        >
          {isPinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
        </button>
      </Tooltip>

      {navItems.map((item, index) => {
        if (item.type === 'divider') {
          return <div key={`divider-${index}`} className="left-nav-divider" />;
        }

        if (!item.roles.includes(role)) return null;

        const Icon = item.icon;
        const linkContent = (
          <Link
            href={item.href}
            className={`left-nav-item ${item.active ? 'active' : ''}`}
          >
            <span className="left-nav-icon">
              <Icon fontSize="small" />
            </span>
            <span className="left-nav-label">{item.label}</span>
          </Link>
        );

        // Only show tooltip when not expanded
        if (showTooltips) {
          return (
            <Tooltip key={item.href} title={item.label} placement="right" arrow>
              {linkContent}
            </Tooltip>
          );
        }

        return <div key={item.href}>{linkContent}</div>;
      })}
    </nav>
  );
}
