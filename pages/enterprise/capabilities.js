/**
 * Enterprise Capabilities Page
 *
 * URL: /enterprise/capabilities/
 */

import { useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { EnterpriseProvider, useEnterprise, EnterpriseWorkspace } from '@/components/spaces/enterprise';

function CapabilitiesPageContent() {
  const { setActiveModule } = useEnterprise();

  useEffect(() => {
    setActiveModule('capabilities');
  }, [setActiveModule]);

  return <EnterpriseWorkspace />;
}

export default function CapabilitiesPage() {
  return (
    <>
      <Head>
        <title>Capabilities | Enterprise Studio</title>
        <meta name="description" content="Business capability management" />
      </Head>
      <Layout title="Capabilities" activePath="/enterprise/capabilities">
        <EnterpriseProvider>
          <CapabilitiesPageContent />
        </EnterpriseProvider>
      </Layout>
    </>
  );
}
