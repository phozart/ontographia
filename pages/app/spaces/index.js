// pages/app/spaces/index.js
// Spaces Overview - Landing page for all application spaces

import { useAuth } from '../../../components/AuthContext';
import { useDomains } from '../../../components/DomainContext';
import { getAllSpaces, getSpacesByCategory } from '../../../lib/spaceRegistry';
import { buildSpaceUrl } from '../../../lib/urlUtils';
import Link from 'next/link';
import LoginIcon from '@mui/icons-material/Login';
import AppsIcon from '@mui/icons-material/Apps';
import CategoryIcon from '@mui/icons-material/Category';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import LoopIcon from '@mui/icons-material/Loop';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HandshakeIcon from '@mui/icons-material/Handshake';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import TransformIcon from '@mui/icons-material/Transform';
import SchoolIcon from '@mui/icons-material/School';
import BuildIcon from '@mui/icons-material/Build';
import DrawIcon from '@mui/icons-material/Draw';
import HubIcon from '@mui/icons-material/Hub';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const SPACE_ICONS = {
  Architecture: ArchitectureIcon,
  Loop: LoopIcon,
  Business: BusinessIcon,
  Assignment: AssignmentIcon,
  Lightbulb: LightbulbIcon,
  AccountTree: AccountTreeIcon,
  TrendingUp: TrendingUpIcon,
  Psychology: PsychologyIcon,
  Handshake: HandshakeIcon,
  AutoStories: AutoStoriesIcon,
  Transform: TransformIcon,
  School: SchoolIcon,
  Build: BuildIcon,
  Draw: DrawIcon,
  Hub: HubIcon,
  AutoAwesome: AutoAwesomeIcon,
};

// Dynamic icon resolver
function SpaceIcon({ iconName, ...props }) {
  const IconComponent = SPACE_ICONS[iconName] || CategoryIcon;
  return <IconComponent {...props} />;
}

function SpaceCard({ space }) {
  const { activeDomainObj } = useDomains();
  const domainId = activeDomainObj?.displayId || null;

  // Build URL with domain context if available and required
  const href = buildSpaceUrl(
    space.code,
    space.defaultView,
    space.requiresDomain && domainId ? domainId : null
  );

  return (
    <Link href={href} className="space-card" style={{
      display: 'block',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid var(--border)',
      backgroundColor: 'var(--bg-secondary)',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'all 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '8px',
          backgroundColor: space.color + '20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <SpaceIcon iconName={space.icon} style={{ color: space.color, fontSize: 24 }} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{space.name}</h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            {space.description}
          </p>
          <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {space.views.slice(0, 4).map(view => (
              <span key={view} style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-muted)',
              }}>
                {view}
              </span>
            ))}
            {space.views.length > 4 && (
              <span style={{
                fontSize: '11px',
                padding: '2px 6px',
                color: 'var(--text-muted)',
              }}>
                +{space.views.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function SpacesOverview() {
  const { user } = useAuth();
  const { activeDomain, activeDomainObj } = useDomains();
  const categories = getSpacesByCategory();
  const allSpaces = getAllSpaces();

  if (!user) {
    return (
      <div className="page-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 400 }}>
          <AppsIcon style={{ fontSize: 48, color: 'var(--accent)', marginBottom: 16 }} />
          <h2>Application Spaces</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Access specialized workspaces for enterprise architecture, business analysis,
            system dynamics, and more.
          </p>
          <Link href="/login" className="btn btn-primary" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}>
            <LoginIcon fontSize="small" /> Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>Application Spaces</h1>
        <p style={{ margin: '8px 0 0', color: 'var(--text-muted)' }}>
          {activeDomainObj ? (
            <>Working in <strong>{activeDomainObj.name}</strong> domain</>
          ) : (
            'Select a domain from the left navigation to get started'
          )}
        </p>
      </header>

      {Object.entries(categories).map(([category, spaceCodes]) => (
        <section key={category} style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '16px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--border)',
          }}>
            {category}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}>
            {spaceCodes.map(code => {
              const space = allSpaces.find(s => s.code === code);
              return space ? <SpaceCard key={code} space={space} /> : null;
            })}
          </div>
        </section>
      ))}

      <style jsx>{`
        .space-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
