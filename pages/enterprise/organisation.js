/**
 * Organisation Structure Page
 *
 * URL: /enterprise/organisation/
 */

import { useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { EnterpriseProvider, useEnterprise, EnterpriseWorkspace } from '@/components/spaces/enterprise';

function OrganisationPageContent() {
  const { setActiveModule } = useEnterprise();

  useEffect(() => {
    setActiveModule('organisation');
  }, [setActiveModule]);

  return <EnterpriseWorkspace />;
}

export default function OrganisationPage() {
  return (
    <>
      <Head>
        <title>Organisation | Enterprise Studio</title>
        <meta name="description" content="Organisation structure, roles, and responsibilities" />
      </Head>
      <Layout title="Organisation" activePath="/enterprise/organisation">
        <EnterpriseProvider>
          <OrganisationPageContent />
        </EnterpriseProvider>
      </Layout>
    </>
  );
}
