/**
 * Governance Page
 *
 * URL: /enterprise/governance/
 */

import { useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { EnterpriseProvider, useEnterprise, EnterpriseWorkspace } from '@/components/spaces/enterprise';

function GovernancePageContent() {
  const { setActiveModule } = useEnterprise();

  useEffect(() => {
    setActiveModule('governance');
  }, [setActiveModule]);

  return <EnterpriseWorkspace />;
}

export default function GovernancePage() {
  return (
    <>
      <Head>
        <title>Governance | Enterprise Studio</title>
        <meta name="description" content="Policies, principles, and architectural decisions" />
      </Head>
      <Layout title="Governance" activePath="/enterprise/governance">
        <EnterpriseProvider>
          <GovernancePageContent />
        </EnterpriseProvider>
      </Layout>
    </>
  );
}
