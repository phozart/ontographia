// pages/blueprint/pipeline.js
// Blueprint Studio pipeline view page

import Head from 'next/head';
import { BlueprintProvider, BlueprintWorkspace } from '../../components/spaces/blueprint';
import Layout from '../../components/Layout';

export default function PipelinePage() {
  return (
    <>
      <Head>
        <title>Pipeline | Blueprint Studio</title>
        <meta name="description" content="Track initiatives through the innovation funnel" />
      </Head>
      <Layout>
        <BlueprintProvider>
          <BlueprintWorkspace initialView="pipeline" />
        </BlueprintProvider>
      </Layout>
    </>
  );
}
