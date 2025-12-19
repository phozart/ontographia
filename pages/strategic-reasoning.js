/**
 * Strategic Reasoning Suite Page
 *
 * Main entry point for the Strategic Reasoning Suite.
 * Provides a thinking space for complex decisions, strategic reasoning,
 * and sensemaking across multiple interconnected reasoning spaces.
 *
 * @page
 * @module pages/strategic-reasoning
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../components/AuthContext';
import { useProjects } from '../components/ProjectContext';
import { SRSProvider } from '../components/srs/SRSContext';
import SRSWorkspace from '../components/srs/SRSWorkspace';
import PsychologyIcon from '@mui/icons-material/Psychology';

export default function StrategicReasoningPage() {
  const router = useRouter();
  const { user, hydrated } = useAuth();
  const { activeProject, loading: projectsLoading } = useProjects();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (hydrated && !user) {
      router.push('/login');
    }
  }, [hydrated, user, router]);

  // Show loading state
  if (!hydrated || projectsLoading) {
    return (
      <div className="studio-loading">
        <div className="loading-spinner" />
        <p>Loading Strategic Reasoning Suite...</p>

        <style jsx>{`
          .studio-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            min-height: 400px;
            color: var(--text-muted, #6b7280);
          }

          .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid var(--border, #e5e7eb);
            border-top-color: var(--accent, #8b5cf6);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .studio-loading p {
            margin-top: 12px;
          }
        `}</style>
      </div>
    );
  }

  // Show project selection prompt if no active project
  if (!activeProject) {
    return (
      <div className="no-project">
        <div className="no-project-card">
          <PsychologyIcon style={{ fontSize: 48, color: 'var(--accent, #8b5cf6)', marginBottom: 16 }} />
          <h2>Strategic Reasoning Suite</h2>
          <p>Please select a project to access the Strategic Reasoning Suite.</p>
          <button onClick={() => router.push('/home')}>
            Go to Dashboard
          </button>
        </div>

        <style jsx>{`
          .no-project {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            min-height: 400px;
          }

          .no-project-card {
            text-align: center;
            padding: 40px;
            background: var(--panel, #ffffff);
            border: 1px solid var(--border, #e5e7eb);
            border-radius: 12px;
            max-width: 400px;
          }

          .no-project-card h2 {
            margin: 0 0 8px 0;
            font-size: 1.25rem;
            color: var(--text, #111827);
          }

          .no-project-card p {
            margin: 0 0 24px 0;
            color: var(--text-muted, #6b7280);
          }

          .no-project-card button {
            padding: 10px 20px;
            background: var(--accent, #8b5cf6);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
          }

          .no-project-card button:hover {
            background: var(--accent-dark, #7c3aed);
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Strategic Reasoning Suite | Ontographia</title>
      </Head>
      <SRSProvider>
        <div className="srs-studio-page">
          <SRSWorkspace />
        </div>
        <style jsx>{`
          .srs-studio-page {
            display: flex;
            flex-direction: column;
            height: 100vh;
            background: var(--bg);
          }
        `}</style>
      </SRSProvider>
    </>
  );
}
