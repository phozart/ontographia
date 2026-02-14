// pages/graph/graph.js
// Knowledge Graph Explorer

import { useState, useEffect } from 'react';
import Head from 'next/head';
import nextDynamic from 'next/dynamic';
import { Box, Typography, IconButton, Tooltip, Paper } from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import RefreshIcon from '@mui/icons-material/Refresh';
import Link from 'next/link';
import SourceIcon from '@mui/icons-material/Source';
import CategoryIcon from '@mui/icons-material/Category';
import CableIcon from '@mui/icons-material/Cable';
import SchoolIcon from '@mui/icons-material/School';

const GraphView = nextDynamic(() => import('../../components/GraphView'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-muted)'
    }}>
      Loading graph...
    </div>
  )
});

const navItems = [
  { href: '/graph/graph', label: 'Graph', icon: HubIcon, active: true },
  { href: '/user/user-view', label: 'Model Browser', icon: SchoolIcon },
  { href: '/graph/nodes', label: 'Nodes', icon: SourceIcon },
  { href: '/graph/node-types', label: 'Node Types', icon: CategoryIcon },
  { href: '/graph/relationships', label: 'Relationships', icon: CableIcon },
];

export default function GraphPage() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <>
      <Head>
        <title>Knowledge Studio | Ontographia</title>
      </Head>
      <div className="knowledge-studio-wrapper">
        <style jsx>{`
          .knowledge-studio-wrapper {
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 600px;
          }
          .ks-header {
            padding: 12px 20px;
            border-bottom: 1px solid var(--border);
            background: var(--panel);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
          }
          .ks-header-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .ks-header h1 {
            font-size: 18px;
            font-weight: 600;
            color: var(--text);
            margin: 0;
          }
          .ks-nav {
            display: flex;
            gap: 4px;
          }
          .ks-nav a {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 6px;
            color: var(--text-muted);
            text-decoration: none;
            font-size: 13px;
            transition: all 0.15s ease;
          }
          .ks-nav a:hover {
            background: var(--bg-alt);
            color: var(--text);
          }
          .ks-nav a.active {
            background: var(--accent-soft);
            color: var(--accent);
          }
          .ks-graph-container {
            flex: 1;
            position: relative;
            min-height: 400px;
          }
        `}</style>

        {/* Header */}
        <div className="ks-header">
          <div className="ks-header-left">
            <HubIcon style={{ color: 'var(--accent)' }} />
            <h1>Knowledge Studio</h1>
          </div>
          <div className="ks-nav">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={item.active ? 'active' : ''}
              >
                <item.icon style={{ fontSize: 18 }} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Graph Container */}
        <div className="ks-graph-container">
          <GraphView reloadKey={reloadKey} />
        </div>
      </div>
    </>
  );
}
