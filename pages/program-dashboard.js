/**
 * Program Dashboard Page (P0)
 *
 * Cross-space initiative management view showing all work
 * across studios with filtering, metrics, and governance.
 */

import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useDomains } from '../components/DomainContext';
import { IntegrationProvider } from '../components/integration/IntegrationContext';
import ProgramDashboard from '../components/integration/ProgramDashboard';

export default function ProgramDashboardPage() {
  const { activeDomain } = useDomains();

  return (
    <Layout>
      <Head>
        <title>Program Dashboard | Ontographia</title>
      </Head>

      {activeDomain ? (
        <IntegrationProvider domainId={activeDomain}>
          <ProgramDashboard />
        </IntegrationProvider>
      ) : (
        <div className="program-dashboard">
          <div className="empty-state">
            Please select a domain to view the program dashboard.
          </div>
        </div>
      )}
    </Layout>
  );
}
