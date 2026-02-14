/**
 * Products Page
 *
 * URL: /enterprise/products/
 */

import { useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { EnterpriseProvider, useEnterprise, EnterpriseWorkspace } from '@/components/spaces/enterprise';

function ProductsPageContent() {
  const { setActiveModule } = useEnterprise();

  useEffect(() => {
    setActiveModule('products');
  }, [setActiveModule]);

  return <EnterpriseWorkspace />;
}

export default function ProductsPage() {
  return (
    <>
      <Head>
        <title>Products | Enterprise Studio</title>
        <meta name="description" content="Product portfolio in operation" />
      </Head>
      <Layout title="Products" activePath="/enterprise/products">
        <EnterpriseProvider>
          <ProductsPageContent />
        </EnterpriseProvider>
      </Layout>
    </>
  );
}
