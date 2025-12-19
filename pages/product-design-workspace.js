// pages/product-design-workspace.js
// Product Design Workspace - Discovery & Validation workspace
// Domain-scoped (not project-scoped)

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../components/AuthContext';
import { useDomains } from '../components/DomainContext';
import { usePresence } from '../components/PresenceContext';
import { PDWProvider } from '../components/pdw/PDWContext';
import PDWWorkspace from '../components/pdw/PDWWorkspace';

import LightbulbIcon from '@mui/icons-material/Lightbulb';

export default function ProductDesignWorkspacePage() {
  const { user } = useAuth();
  const { activeDomain } = useDomains();
  const { joinPage, leavePage } = usePresence();

  // Presence tracking
  useEffect(() => {
    joinPage('product-design-workspace');
    return () => leavePage();
  }, [joinPage, leavePage]);

  // Login prompt
  if (!user) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 420 }}>
          <LightbulbIcon style={{ fontSize: 48, color: 'var(--accent)', marginBottom: 12 }} />
          <h2>Product Design Workspace</h2>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to capture discovery thinking and decisions.</p>
          <Link href="/login" className="btn btn-primary">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <PDWProvider>
      <div className="pdw-studio-page">
        <PDWWorkspace />

        <style jsx>{`
          .pdw-studio-page {
            display: flex;
            flex-direction: column;
            height: 100vh;
            background: var(--bg);
          }
        `}</style>
      </div>
    </PDWProvider>
  );
}
