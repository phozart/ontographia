/**
 * Enterprise Landscape (Applications) Page
 *
 * URL: /enterprise/landscape/
 */

import { useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { EnterpriseProvider, useEnterprise, EnterpriseWorkspace } from '@/components/spaces/enterprise';

function LandscapePageContent() {
  const { setActiveModule } = useEnterprise();

  useEffect(() => {
    setActiveModule('landscape');
  }, [setActiveModule]);

  return <EnterpriseWorkspace />;
}

export default function LandscapePage() {
  return (
    <>
      <Head>
        <title>Application Landscape | Enterprise Studio</title>
        <meta name="description" content="Application portfolio and technology landscape" />
      </Head>
      <Layout title="Landscape" activePath="/enterprise/landscape">
        <EnterpriseProvider>
          <LandscapePageContent />
        </EnterpriseProvider>
      </Layout>
    </>
  );
}
