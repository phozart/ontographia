// pages/app/trace-explorer.js
// Trace Explorer - Cross-Space Traceability Visualization
// THE "aha moment" feature that proves cross-space value in 30 seconds

import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useAuth } from '../../components/AuthContext';
import Link from 'next/link';
import LoginIcon from '@mui/icons-material/Login';

// Dynamic import to avoid SSR issues with React Flow
const TraceExplorer = dynamic(
  () => import('../../components/trace/TraceExplorer'),
  { ssr: false }
);

export default function TraceExplorerPage() {
  const { user } = useAuth();

  // Not authenticated
  if (!user) {
    return (
      <>
        <Head>
          <title>Trace Explorer | Ontographia</title>
        </Head>
        <div className="page-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh'
        }}>
          <div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 400 }}>
            <h2>Trace Explorer</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              Please sign in to explore artefact traces across spaces.
            </p>
            <Link href="/login" className="btn btn-primary" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}>
              <LoginIcon fontSize="small" /> Sign In
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Trace Explorer | Ontographia</title>
        <meta
          name="description"
          content="Explore cross-space traceability - see how artefacts connect across all spaces"
        />
      </Head>
      <div style={{ height: 'calc(100vh - var(--topbar-height, 72px) - var(--footer-height, 30px))' }}>
        <TraceExplorer />
      </div>
    </>
  );
}
