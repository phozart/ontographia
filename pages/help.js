export const dynamic = 'force-dynamic';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../components/AuthContext';

const sections = [
  {
    id: 'overview',
    title: 'Getting started',
    summary:
      'Ontographia helps you model concepts, navigate relationships, and keep meaning consistent across teams.',
    steps: [
      'Pick your domain (workspace) from the domain selector in the top bar.',
      'Use the Model Browser to explore node types and their instances.',
      'Open Graph Navigator to see visual relationships and run impact checks.',
      'Use Nodes / Relationships / Types pages (admins) to evolve the model.',
    ],
  },
  {
    id: 'domains',
    title: 'Domains (workspaces)',
    summary:
      'Domains isolate your work. You only see node types, nodes, and relationships that belong to the active domain.',
    steps: [
      'Switch domain from the Domain icon in the top-right.',
      'Admins can create domains and grant access in Settings → Domains.',
      'Editors can work inside domains they created or were given access to.',
      'Viewers can only browse domains shared with them.',
    ],
    tips: ['If nothing shows, ensure a domain is selected.'],
  },
  {
    id: 'model-browser',
    title: 'Semantic Model Browser',
    summary:
      'Browse node types and nodes for the active domain, filter, and inspect details.',
    steps: [
      'Filters: Layer, Node type, Node search, and direction toggle (up/down).',
      'Select a node on the left to see attributes and linked relationships on the right.',
      'Use the refresh and clear focus icons to reload or reset the view.',
    ],
  },
  {
    id: 'graph-navigator',
    title: 'Graph Navigator',
    summary:
      'Visual exploration for the active domain—highlight neighbors, inspect relationships, and re-center.',
    steps: [
      'Use search to focus a node; neighbors appear based on the chosen direction.',
      'Use the toolbar to refresh layout, clear focus, or toggle direction.',
      'Click a node to open its details; edges show relationship types.',
    ],
  },
  {
    id: 'nodes',
    title: 'Nodes (admin/editor)',
    summary:
      'Create and manage nodes scoped to the active domain.',
    steps: [
      'Filter by type, add new nodes, or edit existing ones.',
      'Each node inherits its domain from its node type; keep domain selection aligned.',
    ],
  },
  {
    id: 'relationships',
    title: 'Relationships (admin/editor)',
    summary:
      'Create and edit relationships between nodes within the same domain.',
    steps: [
      'Select source/target nodes that belong to the active domain.',
      'Use relationship types that are defined for the same domain.',
    ],
  },
  {
    id: 'types',
    title: 'Node & Relationship types (admin)',
    summary:
      'Govern the schema: define types, attributes, and allowable relationships per domain.',
    steps: [
      'Create node types and assign them to the active domain.',
      'Define relationship types for that domain to control allowed edges.',
    ],
  },
];

export default function HelpPage() {
  const router = useRouter();
  const { user, hydrated } = useAuth();

  useEffect(() => {
    if (hydrated && user === null) {
      router.replace('/login');
    }
  }, [user, hydrated, router]);

  const navItems = useMemo(
    () => sections.map(s => ({ id: s.id, title: s.title })),
    []
  );

  if (!hydrated) {
    return null;
  }

  if (!user) {
    return (
      <main style={{ padding: 24 }}>
        <p>Redirecting to login…</p>
      </main>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', padding: '24px 12px', position: 'relative' }}>
      <aside
        style={{
          position: 'sticky',
          top: 88,
          width: 240,
          alignSelf: 'flex-start',
          padding: 12,
          borderRadius: 12,
          border: '1px solid var(--border)',
          background: 'var(--panel)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <h4 style={{ margin: '4px 0 10px', fontSize: 14, color: 'var(--text-muted)' }}>Help center</h4>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {navItems.map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              style={{
                textDecoration: 'none',
                color: 'var(--text)',
                padding: '8px 10px',
                borderRadius: 10,
                background: 'var(--bg)',
                border: '1px solid var(--border)',
              }}
            >
              {item.title}
            </a>
          ))}
        </nav>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <header style={{ marginBottom: 6 }}>
          <p style={{ margin: 0, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: 12 }}>
            Guides
          </p>
          <h1 style={{ margin: '4px 0 6px' }}>How to use Ontographia</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', maxWidth: 700, lineHeight: 1.5 }}>
            A quick reference for the main pages. Each guide assumes you have selected the right domain in the top bar.
          </p>
        </header>

        {sections.map(section => (
          <section
            key={section.id}
            id={section.id}
            style={{
              padding: '16px 18px',
              borderRadius: 14,
              border: '1px solid var(--border)',
              background: 'var(--panel)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <h2 style={{ margin: '0 0 6px', fontSize: 20 }}>{section.title}</h2>
            <p style={{ margin: '0 0 10px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {section.summary}
            </p>
            <ol style={{ margin: '0 0 8px 16px', padding: 0, lineHeight: 1.5 }}>
              {section.steps.map(step => (
                <li key={step} style={{ marginBottom: 6 }}>{step}</li>
              ))}
            </ol>
            {section.tips && (
              <div style={{ marginTop: 6, padding: '8px 10px', borderRadius: 10, background: 'var(--bg)' }}>
                <strong>Tips:</strong>{' '}
                {section.tips.join(' • ')}
              </div>
            )}
          </section>
        ))}

        <div
          style={{
            marginTop: 8,
            padding: '14px 16px',
            borderRadius: 12,
            background: 'var(--bg)',
            border: '1px solid var(--border)',
          }}
        >
          <h3 style={{ margin: '0 0 6px' }}>Need more help?</h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Ask your administrator for access to additional domains or documentation. If something feels off, try switching domains or refreshing data.
          </p>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)' }}>
            Quick links: <Link href="/semanticmodelbrowser">Model Browser</Link> ·{' '}
            <Link href="/graphnavigator">Graph Navigator</Link> ·{' '}
            <Link href="/nodes">Nodes</Link> ·{' '}
            <Link href="/relationships">Relationships</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
