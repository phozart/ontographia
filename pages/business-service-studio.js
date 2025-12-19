/**
 * Business Service Management Studio Page
 *
 * Main entry point for the Business Service Management Studio.
 * Provides service catalog, service levels, consumers, and dependencies management.
 *
 * @module pages/business-service-studio
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../components/AuthContext';
import { useProjects } from '../components/ProjectContext';
import { BsmProvider } from '../components/bsm/BsmContext';
import BsmWorkspace from '../components/bsm/BsmWorkspace';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';

/**
 * BusinessServiceStudioPage Component
 */
export default function BusinessServiceStudioPage() {
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
        <p>Loading Service Management Studio...</p>

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
            border-top-color: var(--accent, #3b82f6);
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
          <MiscellaneousServicesIcon style={{ fontSize: 48, color: 'var(--accent, #3b82f6)', marginBottom: 16 }} />
          <h2>Service Management Studio</h2>
          <p>Please select a project to access the Service Management Studio.</p>
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
            background: var(--accent, #3b82f6);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
          }

          .no-project-card button:hover {
            background: var(--accent-dark, #2563eb);
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Service Management Studio | Ontographia</title>
      </Head>
      <BsmProvider>
        <BsmWorkspace />
      </BsmProvider>
    </>
  );
}
