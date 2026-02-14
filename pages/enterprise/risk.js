/**
 * Enterprise Risk Page
 *
 * URL: /enterprise/risk/
 */

import { useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { EnterpriseProvider, useEnterprise, EnterpriseWorkspace } from '@/components/spaces/enterprise';

function RiskPageContent() {
  const { setActiveModule } = useEnterprise();

  useEffect(() => {
    setActiveModule('risk');
  }, [setActiveModule]);

  return <EnterpriseWorkspace />;
}

export default function RiskPage() {
  return (
    <>
      <Head>
        <title>Enterprise Risk | Enterprise Studio</title>
        <meta name="description" content="Enterprise risk register and management" />
      </Head>
      <Layout title="Risk" activePath="/enterprise/risk">
        <EnterpriseProvider>
          <RiskPageContent />
        </EnterpriseProvider>
      </Layout>
    </>
  );
}
