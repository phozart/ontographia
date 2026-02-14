// components/spaces/ks/KSNavigator.js
// Knowledge Studio sidebar navigator

import { Navigator, NavGroup, NavItem } from '@/components/ui';

// MUI Icons
import HubIcon from '@mui/icons-material/Hub';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SchoolIcon from '@mui/icons-material/School';
import SourceIcon from '@mui/icons-material/Source';
import CategoryIcon from '@mui/icons-material/Category';
import CableIcon from '@mui/icons-material/Cable';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';

// Navigation structure
const NAV_GROUPS = [
  {
    name: 'Explore',
    items: [
      { id: 'navigator', label: 'Graph Navigator', icon: AccountTreeIcon },
      { id: 'browser', label: 'Model Browser', icon: SchoolIcon },
    ],
  },
  {
    name: 'Data Management',
    items: [
      { id: 'nodes', label: 'Nodes', icon: SourceIcon },
      { id: 'node-types', label: 'Node Types', icon: CategoryIcon },
      { id: 'relationships', label: 'Relationships', icon: CableIcon },
      { id: 'relationship-types', label: 'Relationship Types', icon: DeviceHubIcon },
    ],
  },
];

export default function KSNavigator({ activeView, onNavigate, domainId }) {
  const isOverviewActive = activeView === 'overview';

  return (
    <Navigator
      title="Knowledge Studio"
      icon={HubIcon}
      iconColor="#47453F"
      showHome={true}
      homeLabel="Overview"
      homeIcon={DashboardIcon}
      homeActive={isOverviewActive}
      onHomeClick={() => onNavigate('overview')}
    >
      {NAV_GROUPS.map((group) => {
        const hasActiveChild = group.items.some((item) => item.id === activeView);

        return (
          <NavGroup
            key={group.name}
            name={group.name}
            hasActiveChild={hasActiveChild}
            defaultExpanded={true}
          >
            {group.items.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeView === item.id}
                onClick={() => onNavigate(item.id)}
              />
            ))}
          </NavGroup>
        );
      })}
    </Navigator>
  );
}
