// pages/app/workspaces/project-design.js
// Project Design Workspace - Page entry point
// Note: CSS is imported in _app.js

import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../../components/AuthContext';
import { PDSProvider } from '../../../components/pds/PDSContext';
import PDSWorkspace from '../../../components/pds/PDSWorkspace';

import AccountTreeIcon from '@mui/icons-material/AccountTree';

export default function ProjectDesignPage() {
  const { user } = useAuth();

  // Login prompt (no Layout wrapper to avoid double nav)
  if (!user) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Head>
          <title>Project Design | Knowledge Graph</title>
        </Head>
        <div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 420 }}>
          <AccountTreeIcon style={{ fontSize: 48, color: 'var(--accent)', marginBottom: 12 }} />
          <h2>Project Design Workspace</h2>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to access the project design workspace.</p>
          <Link href="/login" className="btn btn-primary">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <PDSProvider>
      <Head>
        <title>Project Design | Knowledge Graph</title>
        <meta
          name="description"
          content="Reasoning-led environment for project thinking and delivery guidance"
        />
      </Head>
      <div className="pds-studio-page">
        <PDSWorkspace />
      </div>

      <style jsx>{`
        .pds-studio-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--bg);
        }
      `}</style>
    </PDSProvider>
  );
}
