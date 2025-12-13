// pages/ea-studio.js
// Guided Enterprise Architecture Studio - Learning-first EA management

import { useAuth } from '../components/AuthContext';
import { useDomains } from '../components/DomainContext';
import { EAProvider } from '../components/ea/EAContext';
import GuidedEAWorkspace from '../components/ea/GuidedEAWorkspace';
import Link from 'next/link';
import BusinessIcon from '@mui/icons-material/Business';
import LoginIcon from '@mui/icons-material/Login';
import DomainIcon from '@mui/icons-material/Domain';

export default function EAStudio() {
  const { user } = useAuth();
  const { activeDomain, activeDomainObj, accessibleDomains } = useDomains();

  if (!user) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 400 }}>
          <BusinessIcon style={{ fontSize: 48, color: 'var(--accent)', marginBottom: 16 }} />
          <h2>Enterprise Architecture Studio</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Build and manage your enterprise architecture with guided learning and question-based navigation.
          </p>
          <Link href="/login" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <LoginIcon fontSize="small" /> Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (!activeDomain || !activeDomainObj) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 400 }}>
          <DomainIcon style={{ fontSize: 48, color: 'var(--accent)', marginBottom: 16 }} />
          <h2>Select a Domain</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Enterprise Architecture elements are organized by domain. Please select or create a domain to begin.
          </p>
          {accessibleDomains.length === 0 ? (
            <Link href="/domains" className="btn btn-primary">
              Create Your First Domain
            </Link>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Use the domain selector in the left navigation to choose a domain.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <EAProvider>
      <GuidedEAWorkspace />
    </EAProvider>
  );
}
