/**
 * Value Dashboard Page
 *
 * URL: /enterprise/value/
 */

import { useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { EnterpriseProvider, useEnterprise, EnterpriseWorkspace } from '@/components/spaces/enterprise';

function ValuePageContent() {
  const { setActiveModule } = useEnterprise();

  useEffect(() => {
    setActiveModule('value');
  }, [setActiveModule]);

  return <EnterpriseWorkspace />;
}

export default function ValuePage() {
  return (
    <>
      <Head>
        <title>Value Dashboard | Enterprise Studio</title>
        <meta name="description" content="Benefits and KPI tracking" />
      </Head>
      <Layout title="Value" activePath="/enterprise/value">
        <EnterpriseProvider>
          <ValuePageContent />
        </EnterpriseProvider>
      </Layout>
    </>
  );
}
