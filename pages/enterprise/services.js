/**
 * Enterprise Services Page
 *
 * URL: /enterprise/services/
 */

import { useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { EnterpriseProvider, useEnterprise, EnterpriseWorkspace } from '@/components/spaces/enterprise';

function ServicesPageContent() {
  const { setActiveModule } = useEnterprise();

  useEffect(() => {
    setActiveModule('services');
  }, [setActiveModule]);

  return <EnterpriseWorkspace />;
}

export default function ServicesPage() {
  return (
    <>
      <Head>
        <title>Services | Enterprise Studio</title>
        <meta name="description" content="Service catalog management" />
      </Head>
      <Layout title="Services" activePath="/enterprise/services">
        <EnterpriseProvider>
          <ServicesPageContent />
        </EnterpriseProvider>
      </Layout>
    </>
  );
}
