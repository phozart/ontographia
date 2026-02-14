/**
 * Technology Radar Page
 *
 * URL: /enterprise/technology/
 */

import { useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { EnterpriseProvider, useEnterprise, EnterpriseWorkspace } from '@/components/spaces/enterprise';

function TechnologyPageContent() {
  const { setActiveModule } = useEnterprise();

  useEffect(() => {
    setActiveModule('technology');
  }, [setActiveModule]);

  return <EnterpriseWorkspace />;
}

export default function TechnologyPage() {
  return (
    <>
      <Head>
        <title>Technology Radar | Enterprise Studio</title>
        <meta name="description" content="Technology standards and recommendations" />
      </Head>
      <Layout title="Technology" activePath="/enterprise/technology">
        <EnterpriseProvider>
          <TechnologyPageContent />
        </EnterpriseProvider>
      </Layout>
    </>
  );
}
