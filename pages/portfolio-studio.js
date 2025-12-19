// pages/portfolio-studio.js
// Portfolio Studio - Where we decide what deserves a project
// Domain-scoped (not project-scoped)

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../components/AuthContext';
import { usePresence } from '../components/PresenceContext';
import { PortfolioProvider } from '../components/portfolio/PortfolioContext';
import PortfolioWorkspace from '../components/portfolio/PortfolioWorkspace';

import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

export default function PortfolioStudioPage() {
  const { user } = useAuth();
  const { joinPage, leavePage } = usePresence();

  // Presence tracking
  useEffect(() => {
    joinPage('portfolio-studio');
    return () => leavePage();
  }, [joinPage, leavePage]);

  // Login prompt
  if (!user) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 420 }}>
          <BusinessCenterIcon style={{ fontSize: 48, color: '#8b5cf6', marginBottom: 12 }} />
          <h2>Portfolio Studio</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage investment decisions and initiative pipeline.</p>
          <Link href="/login" className="btn btn-primary">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <PortfolioProvider>
      <div className="portfolio-studio-page">
        <PortfolioWorkspace />

        <style jsx>{`
          .portfolio-studio-page {
            display: flex;
            flex-direction: column;
            height: 100vh;
            width:100%;
          }
        `}</style>
      </div>
    </PortfolioProvider>
  );
}
