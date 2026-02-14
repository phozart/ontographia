// components/spaces/ks/views/NodesView.js
// Nodes management view - embeds the nodes page

export default function NodesView({ domainId }) {
  // Build iframe URL with embed parameter and optional domain
  const iframeUrl = domainId
    ? `/graph/nodes?embed=true&dom=${domainId}`
    : '/graph/nodes?embed=true';

  return (
    <div className="ks-iframe-view">
      <iframe
        key="nodes"
        src={iframeUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Nodes"
      />
      <style jsx>{`
        .ks-iframe-view {
          width: 100%;
          height: 100%;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
