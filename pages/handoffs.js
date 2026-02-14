/**
 * Handoffs Page (P0)
 *
 * Space transition management.
 */

import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useDomains } from '../components/DomainContext';
import { IntegrationProvider } from '../components/integration/IntegrationContext';
import HandoffManager from '../components/integration/HandoffManager';

export default function HandoffsPage() {
  const { activeDomain } = useDomains();

  return (
    <Layout>
      <Head>
        <title>Handoffs | Ontographia</title>
      </Head>

      {activeDomain ? (
        <IntegrationProvider domainId={activeDomain}>
          <HandoffManager />
        </IntegrationProvider>
      ) : (
        <div className="handoff-manager">
          <div className="empty-state">
            Please select a domain to manage handoffs.
          </div>
        </div>
      )}
    </Layout>
  );
}
