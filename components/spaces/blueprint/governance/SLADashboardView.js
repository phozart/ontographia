// components/spaces/blueprint/governance/SLADashboardView.js
// Full dashboard view for SLA tracking

import SLATracker from './SLATracker';

export default function SLADashboardView({ onSelectInitiative }) {
  return (
    <SLATracker
      showDashboard={true}
      onSelectInitiative={onSelectInitiative}
    />
  );
}
