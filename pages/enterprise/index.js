/**
 * Enterprise Studio - Main Page
 *
 * Domain-level view of the organisation's capabilities, services,
 * technology, and value realization.
 *
 * URL: /enterprise/
 */

import Head from 'next/head';
import Layout from '@/components/Layout';
import { EnterpriseProvider, EnterpriseWorkspace } from '@/components/spaces/enterprise';

export default function EnterprisePage() {
  return (
    <>
      <Head>
        <title>Enterprise Studio | Ontographia</title>
        <meta name="description" content="Enterprise architecture and capability management" />
      </Head>
      <Layout title="Enterprise Studio" activePath="/enterprise">
        <EnterpriseProvider>
          <EnterpriseWorkspace />
        </EnterpriseProvider>
      </Layout>
    </>
  );
}
