/**
 * Decision Gates Page (P0)
 *
 * Gate configuration and status management.
 */

import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useDomains } from '../components/DomainContext';
import { IntegrationProvider } from '../components/integration/IntegrationContext';
import DecisionGateManager from '../components/integration/DecisionGateManager';

export default function DecisionGatesPage() {
  const { activeDomain } = useDomains();

  return (
    <Layout>
      <Head>
        <title>Decision Gates | Ontographia</title>
      </Head>

      {activeDomain ? (
        <IntegrationProvider domainId={activeDomain}>
          <DecisionGateManager />
        </IntegrationProvider>
      ) : (
        <div className="gate-manager">
          <div className="empty-state">
            Please select a domain to manage decision gates.
          </div>
        </div>
      )}
    </Layout>
  );
}
