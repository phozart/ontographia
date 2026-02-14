// components/spaces/ks/views/NodeTypesView.js
// Node Types management view - embeds the node-types page

export default function NodeTypesView({ domainId }) {
  // Build iframe URL with embed parameter and optional domain
  const iframeUrl = domainId
    ? `/graph/node-types?embed=true&dom=${domainId}`
    : '/graph/node-types?embed=true';

  return (
    <div className="ks-iframe-view">
      <iframe
        key="node-types"
        src={iframeUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Node Types"
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
