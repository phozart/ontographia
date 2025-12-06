// Ontographia logo mark, wordmark, and spinner built from the provided SVGs
export function LogoMark({ size = 32, color = '#0B2545', style = {}, className = '' }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-28 -28 56 56"
      width={size}
      height={size}
    >
      <defs>
        <style>
          {`.brand-stroke{stroke:${color};stroke-linecap:round;stroke-linejoin:round;stroke-width:1.7;fill:none}.brand-fill{fill:${color};stroke:none}`}
        </style>
      </defs>
      <g className="brand-stroke">
        <line x1="0" y1="-22" x2="18" y2="-6" />
        <line x1="18" y1="-6" x2="14" y2="14" />
        <line x1="14" y1="14" x2="-15" y2="15" />
        <line x1="0" y1="-22" x2="6" y2="2" />
        <line x1="0" y1="-22" x2="-8" y2="0" />
        <line x1="18" y1="-6" x2="6" y2="2" />
        <line x1="-15" y1="15" x2="-8" y2="0" />
        <line x1="14" y1="14" x2="6" y2="2" />
        <line x1="-8" y1="0" x2="6" y2="2" />
      </g>
      <g className="brand-fill">
        <circle cx="0" cy="-22" r="2.8" />
        <circle cx="18" cy="-6" r="2.8" />
        <circle cx="14" cy="14" r="2.8" />
        <circle cx="-15" cy="15" r="2.8" />
        <circle cx="6" cy="2" r="2.4" />
        <circle cx="-8" cy="0" r="2.4" />
      </g>
    </svg>
  );
}

export function LogoWordmark({ width = 220, height, color = '#0B2545', className = '', style = {} }) {
  const finalHeight = height || (width * 110) / 420;
  return (
    <svg
      role="img"
      aria-label="Ontographia – Knowledge Graph Studio"
      focusable="false"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 420 110"
      width={width}
      height={finalHeight}
      preserveAspectRatio="xMinYMid meet"
    >
      <defs>
        <style>
          {`.brand-fill{fill:${color};}.brand-stroke{stroke:${color};stroke-linecap:round;stroke-linejoin:round;} .title{font-family:\"Inter\",\"Tomorrow\", system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;font-size:36px;font-weight:800;fill:${color};} .subtitle{font-family:\"Inter\",\"Tomorrow\", system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;font-size:18px;font-weight:500;fill:${color};}`}
        </style>
      </defs>
      <g transform="translate(40,52)">
        <g className="brand-stroke" fill="none" strokeWidth="1.7">
          <line x1="0" y1="-22" x2="18" y2="-6" />
          <line x1="18" y1="-6" x2="14" y2="14" />
          <line x1="14" y1="14" x2="-15" y2="15" />
          <line x1="0" y1="-22" x2="6" y2="2" />
          <line x1="0" y1="-22" x2="-8" y2="0" />
          <line x1="18" y1="-6" x2="6" y2="2" />
          <line x1="-15" y1="15" x2="-8" y2="0" />
          <line x1="14" y1="14" x2="6" y2="2" />
          <line x1="-8" y1="0" x2="6" y2="2" />
        </g>
        <g className="brand-fill">
          <circle cx="0" cy="-22" r="2.8" />
          <circle cx="18" cy="-6" r="2.8" />
          <circle cx="14" cy="14" r="2.8" />
          <circle cx="-15" cy="15" r="2.8" />
          <circle cx="6" cy="2" r="2.4" />
          <circle cx="-8" cy="0" r="2.4" />
        </g>
      </g>
      <g transform="translate(96,54)">
        <text className="title" x="0" y="0">
          Ontographia
        </text>
        <text className="subtitle" x="0" y="24">
          Knowledge Graph Studio
        </text>
      </g>
    </svg>
  );
}

export function LogoSpinner({ size = 48, color = '#0B2545', label, theme }) {
  const spinColor = theme === 'dark' ? '#ffffff' : color;
  return (
    <div className="logo-spinner" role="status" aria-live="polite">
      <LogoMark
        size={size}
        color={spinColor}
        className="logo-spinner__svg"
        style={{ '--logo-spinner-color': spinColor }}
      />
      {label && <div className="logo-spinner__label">{label}</div>}
    </div>
  );
}
