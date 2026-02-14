// components/spaces/ks/views/RelationshipsView.js
// Relationships management view - embeds the relationships page

export default function RelationshipsView({ domainId }) {
  // Build iframe URL with embed parameter and optional domain
  const iframeUrl = domainId
    ? `/graph/relationships?embed=true&dom=${domainId}`
    : '/graph/relationships?embed=true';

  return (
    <div className="ks-iframe-view">
      <iframe
        key="relationships"
        src={iframeUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Relationships"
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
