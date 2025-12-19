/**
 * Organisation Studio Page
 *
 * Comprehensive organisation management workspace combining:
 * - Capability modeling, assessment, and roadmap planning
 * - Business Service Management (catalog, SLAs, consumers)
 * - Performance & Outcomes (OKRs, KPIs, metrics)
 * - Governance & Decision Design (decisions, forums, policies, accountability)
 * - Risk & Resilience (risk register, controls, scenarios)
 *
 * @module pages/app/workspaces/organisation
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../../components/AuthContext';
import { useDomains } from '../../../components/DomainContext';
import { CapProvider } from '../../../components/cap/CapContext';
import { BsmProvider } from '../../../components/bsm/BsmContext';
import { PerfProvider } from '../../../components/perf/PerfContext';
import { RiskProvider } from '../../../components/risk/RiskContext';
import { GovProvider } from '../../../components/gov/GovContext';
import CapWorkspace from '../../../components/cap/CapWorkspace';
import BusinessIcon from '@mui/icons-material/Business';

/**
 * OrganisationStudioPage Component
 */
export default function OrganisationStudioPage() {
  const router = useRouter();
  const { user, hydrated } = useAuth();
  const { activeDomain, loading: domainsLoading } = useDomains();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (hydrated && !user) {
      router.push('/login');
    }
  }, [hydrated, user, router]);

  // Show loading state
  if (!hydrated || domainsLoading) {
    return (
      <div className="studio-loading">
        <div className="loading-spinner" />
        <p>Loading Organisation Studio...</p>

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
            border-top-color: var(--accent, #6366f1);
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

  // Show domain selection prompt if no active domain
  if (!activeDomain) {
    return (
      <div className="no-domain">
        <div className="no-domain-card">
          <BusinessIcon style={{ fontSize: 48, color: 'var(--accent, #6366f1)', marginBottom: 16 }} />
          <h2>Organisation Studio</h2>
          <p>Please select a domain to access the Organisation Studio.</p>
          <button onClick={() => router.push('/home')}>
            Go to Dashboard
          </button>
        </div>

        <style jsx>{`
          .no-domain {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            min-height: 400px;
          }

          .no-domain-card {
            text-align: center;
            padding: 40px;
            background: var(--panel, #ffffff);
            border: 1px solid var(--border, #e5e7eb);
            border-radius: 12px;
            max-width: 400px;
          }

          .no-domain-card h2 {
            margin: 0 0 8px 0;
            font-size: 1.25rem;
            color: var(--text, #111827);
          }

          .no-domain-card p {
            margin: 0 0 24px 0;
            color: var(--text-muted, #6b7280);
          }

          .no-domain-card button {
            padding: 10px 20px;
            background: var(--accent, #6366f1);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
          }

          .no-domain-card button:hover {
            background: var(--accent-dark, #4f46e5);
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Organisation Studio | Ontographia</title>
      </Head>
      <CapProvider>
        <BsmProvider>
          <PerfProvider>
            <GovProvider>
              <RiskProvider>
                <CapWorkspace />
              </RiskProvider>
            </GovProvider>
          </PerfProvider>
        </BsmProvider>
      </CapProvider>
    </>
  );
}
