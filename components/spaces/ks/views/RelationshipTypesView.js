// components/spaces/ks/views/RelationshipTypesView.js
// Relationship Types management view - embeds the relationship-types page

export default function RelationshipTypesView({ domainId }) {
  // Build iframe URL with embed parameter and optional domain
  const iframeUrl = domainId
    ? `/graph/relationship-types?embed=true&dom=${domainId}`
    : '/graph/relationship-types?embed=true';

  return (
    <div className="ks-iframe-view">
      <iframe
        key="relationship-types"
        src={iframeUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Relationship Types"
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
