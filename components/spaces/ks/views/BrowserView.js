// components/spaces/ks/views/BrowserView.js
// Model Browser view - embeds the semanticmodelbrowser page

export default function BrowserView({ domainId }) {
  // Build iframe URL with embed parameter and optional domain
  const iframeUrl = domainId
    ? `/semanticmodelbrowser?embed=true&dom=${domainId}`
    : '/semanticmodelbrowser?embed=true';

  return (
    <div className="ks-iframe-view">
      <iframe
        key="browser"
        src={iframeUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Model Browser"
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
