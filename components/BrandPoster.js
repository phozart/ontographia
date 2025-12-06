export default function BrandPoster({ width = 320, color = 'var(--text)', className = '', style = {} }) {
  const height = (width * 260) / 320;
  return (
    <svg
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 260"
      width={width}
      height={height}
      aria-hidden
      role="img"
    >
      <defs>
        <style>
          {`
            .edge { stroke:${color}; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round; fill:none; }
            .node { fill:${color}; }
            .wordmark { fill:${color}; font-family:'Inter','Tomorrow', sans-serif; font-size:34px; font-weight:800; letter-spacing:1px; text-anchor:middle; }
          `}
        </style>
      </defs>
      <g transform="translate(160,90)">
        <g className="edge">
          <line x1="0" y1="-46" x2="36" y2="-12" />
          <line x1="36" y1="-12" x2="28" y2="30" />
          <line x1="28" y1="30" x2="-30" y2="32" />
          <line x1="0" y1="-46" x2="12" y2="4" />
          <line x1="0" y1="-46" x2="-16" y2="0" />
          <line x1="36" y1="-12" x2="12" y2="4" />
          <line x1="-30" y1="32" x2="-16" y2="0" />
          <line x1="28" y1="30" x2="12" y2="4" />
          <line x1="-16" y1="0" x2="12" y2="4" />
        </g>
        <g className="node">
          <circle cx="0" cy="-46" r="5" />
          <circle cx="36" cy="-12" r="5" />
          <circle cx="28" cy="30" r="5" />
          <circle cx="-30" cy="32" r="5" />
          <circle cx="12" cy="4" r="4" />
          <circle cx="-16" cy="0" r="4" />
        </g>
      </g>
      <text className="wordmark" x="160" y="215">
        ONTOGRAPHIA
      </text>
    </svg>
  );
}
