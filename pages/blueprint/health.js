// pages/blueprint/health.js
// Blueprint Studio funnel health page

import Head from 'next/head';
import { BlueprintProvider, BlueprintWorkspace } from '../../components/spaces/blueprint';
import Layout from '../../components/Layout';

export default function HealthPage() {
  return (
    <>
      <Head>
        <title>Funnel Health | Blueprint Studio</title>
        <meta name="description" content="Monitor pipeline performance and conversion metrics" />
      </Head>
      <Layout>
        <BlueprintProvider>
          <BlueprintWorkspace initialView="health" />
        </BlueprintProvider>
      </Layout>
    </>
  );
}
