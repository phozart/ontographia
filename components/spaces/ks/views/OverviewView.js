// components/spaces/ks/views/OverviewView.js
// Knowledge Studio overview dashboard

import HubIcon from '@mui/icons-material/Hub';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SchoolIcon from '@mui/icons-material/School';
import SourceIcon from '@mui/icons-material/Source';
import CategoryIcon from '@mui/icons-material/Category';
import CableIcon from '@mui/icons-material/Cable';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';

const OVERVIEW_CARDS = [
  {
    id: 'navigator',
    title: 'Graph Navigator',
    description: 'Visual exploration of knowledge graph relationships and connections',
    icon: AccountTreeIcon,
    color: '#47453F',
  },
  {
    id: 'browser',
    title: 'Model Browser',
    description: 'Browse and search the semantic model by node types',
    icon: SchoolIcon,
    color: '#5B8A6A',
  },
  {
    id: 'nodes',
    title: 'Nodes',
    description: 'Create, edit, and manage knowledge graph nodes',
    icon: SourceIcon,
    color: '#5C5A54',
  },
  {
    id: 'node-types',
    title: 'Node Types',
    description: 'Define and configure node type schemas',
    icon: CategoryIcon,
    color: '#C9A227',
  },
  {
    id: 'relationships',
    title: 'Relationships',
    description: 'Manage connections between nodes',
    icon: CableIcon,
    color: '#9C9A94',
  },
  {
    id: 'relationship-types',
    title: 'Relationship Types',
    description: 'Define relationship type schemas and constraints',
    icon: DeviceHubIcon,
    color: '#A54D4D',
  },
];

export default function OverviewView({ domainId, onNavigate }) {
  return (
    <div className="ks-overview">
      <div className="ks-overview-header">
        <HubIcon style={{ fontSize: 48, color: '#47453F' }} />
        <div className="ks-overview-header-text">
          <h1>Knowledge Studio</h1>
          <p>Explore and manage your knowledge graph</p>
        </div>
      </div>

      <div className="ks-overview-grid">
        {OVERVIEW_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="ks-overview-card"
              onClick={() => onNavigate?.(card.id)}
              style={{ cursor: onNavigate ? 'pointer' : 'default' }}
            >
              <div className="ks-overview-card-icon" style={{ backgroundColor: card.color + '20', color: card.color }}>
                <Icon />
              </div>
              <div className="ks-overview-card-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .ks-overview {
          padding: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .ks-overview-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .ks-overview-header-text h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: var(--text);
        }

        .ks-overview-header-text p {
          margin: 4px 0 0;
          color: var(--text-muted);
          font-size: 14px;
        }

        .ks-overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .ks-overview-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          transition: all 0.2s ease;
        }

        .ks-overview-card:hover {
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .ks-overview-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ks-overview-card-content h3 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
        }

        .ks-overview-card-content p {
          margin: 0;
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
