// components/spaces/ks/KSWorkspace.js
// Knowledge Studio workspace - Floating toolbars design

import { useMemo, useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useDomains } from '../../DomainContext';
import { buildSpaceUrl } from '../../../lib/urlUtils';
import styles from './KSWorkspace.module.css';

// MUI Icons
import HubIcon from '@mui/icons-material/Hub';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SchoolIcon from '@mui/icons-material/School';
import SourceIcon from '@mui/icons-material/Source';
import CategoryIcon from '@mui/icons-material/Category';
import CableIcon from '@mui/icons-material/Cable';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// View components
import NavigatorView from './views/NavigatorView';
import BrowserView from './views/BrowserView';
import NodesView from './views/NodesView';
import NodeTypesView from './views/NodeTypesView';
import RelationshipsView from './views/RelationshipsView';
import RelationshipTypesView from './views/RelationshipTypesView';

// View configuration
const VIEWS = {
  navigator: { component: NavigatorView, label: 'Graph Navigator', icon: AccountTreeIcon },
  browser: { component: BrowserView, label: 'Model Browser', icon: SchoolIcon },
  nodes: { component: NodesView, label: 'Nodes', icon: SourceIcon },
  'node-types': { component: NodeTypesView, label: 'Node Types', icon: CategoryIcon },
  relationships: { component: RelationshipsView, label: 'Relationships', icon: CableIcon },
  'relationship-types': { component: RelationshipTypesView, label: 'Relationship Types', icon: DeviceHubIcon },
};

// Navigation items (horizontal)
const NAV_ITEMS = [
  { id: 'navigator', icon: AccountTreeIcon, tooltip: 'Graph Navigator' },
  { id: 'browser', icon: SchoolIcon, tooltip: 'Model Browser' },
  'divider',
  { id: 'nodes', icon: SourceIcon, tooltip: 'Nodes' },
  { id: 'node-types', icon: CategoryIcon, tooltip: 'Node Types' },
  { id: 'relationships', icon: CableIcon, tooltip: 'Relationships' },
  { id: 'relationship-types', icon: DeviceHubIcon, tooltip: 'Relationship Types' },
];

export default function KSWorkspace({ view = 'navigator', domainId }) {
  const router = useRouter();
  const { activeDomain, activeDomainObj } = useDomains();
  const [showGraphToolbar, setShowGraphToolbar] = useState(true);

  // Get current domain UUID for passing to views (internal use)
  const currentDomainId = useMemo(() => {
    if (domainId) return domainId;
    if (activeDomain) return activeDomain;
    return null;
  }, [domainId, activeDomain]);

  // Get display_id for URL (user-friendly format like DOM-0001)
  const currentDisplayId = useMemo(() => {
    if (activeDomainObj?.displayId) return activeDomainObj.displayId;
    if (activeDomainObj?.display_id) return activeDomainObj.display_id;
    return null;
  }, [activeDomainObj]);

  // Navigation handler - includes domain display_id in URL for sharing
  const handleNavigate = useCallback((targetView) => {
    const url = buildSpaceUrl('ks', targetView, currentDisplayId);
    router.push(url);
  }, [router, currentDisplayId]);

  // Get current view component
  const viewConfig = VIEWS[view] || VIEWS.navigator;
  const ViewComponent = viewConfig.component;

  return (
    <div className={styles.workspace}>
      {/* Floating Top Bar - Logo + Navigation */}
      <div className={styles.topBar}>
        <div className={styles.topBarLogo}>
          <HubIcon />
          <span>Knowledge Studio</span>
        </div>

        {/* Navigation buttons */}
        <div className={styles.navGroup}>
          {NAV_ITEMS.map((item, index) => {
            if (item === 'divider') {
              return <div key={`div-${index}`} className={styles.navDivider} />;
            }
            const Icon = item.icon;
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                className={`${styles.navBtn} ${isActive ? styles.active : ''}`}
                onClick={() => handleNavigate(item.id)}
                data-tooltip={item.tooltip}
              >
                <Icon />
              </button>
            );
          })}
        </div>

        <span className={styles.viewLabel}>
          <strong>{viewConfig.label}</strong>
        </span>
      </div>

      {/* Floating Right Toolbar - Settings */}
      <div className={styles.rightToolbar}>
        {/* Toggle graph toolbar visibility (only for navigator view) */}
        {view === 'navigator' && (
          <button
            className={`${styles.settingsBtn} ${!showGraphToolbar ? styles.active : ''}`}
            onClick={() => setShowGraphToolbar(prev => !prev)}
            title={showGraphToolbar ? 'Hide Toolbar' : 'Show Toolbar'}
          >
            {showGraphToolbar ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </button>
        )}
        <button className={styles.settingsBtn} title="Settings">
          <SettingsIcon />
        </button>
        <button className={styles.settingsBtn} title="Help">
          <HelpOutlineIcon />
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.viewContainer}>
          <ViewComponent
            domainId={currentDomainId}
            showToolbar={showGraphToolbar}
          />
        </div>
      </div>
    </div>
  );
}
