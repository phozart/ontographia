// components/spaces/ks/views/NavigatorView.js
// Graph Navigator view - Direct component (no iframe)

import dynamic from 'next/dynamic';

// Dynamically import GraphNavigator to avoid SSR issues with Cytoscape
const GraphNavigatorComponent = dynamic(
  () => import('../../../../pages/graphnavigator').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-muted)'
      }}>
        Loading Graph Navigator...
      </div>
    )
  }
);

export default function NavigatorView({ domainId, showToolbar = true }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <GraphNavigatorComponent showToolbar={showToolbar} />
    </div>
  );
}
