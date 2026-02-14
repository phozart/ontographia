// pages/blueprint/ideas.js
// Blueprint Studio ideas board page

import Head from 'next/head';
import { BlueprintProvider, BlueprintWorkspace } from '../../components/spaces/blueprint';
import Layout from '../../components/Layout';

export default function IdeasPage() {
  return (
    <>
      <Head>
        <title>Ideas Board | Blueprint Studio</title>
        <meta name="description" content="Capture and triage new ideas" />
      </Head>
      <Layout>
        <BlueprintProvider>
          <BlueprintWorkspace initialView="ideas" />
        </BlueprintProvider>
      </Layout>
    </>
  );
}
