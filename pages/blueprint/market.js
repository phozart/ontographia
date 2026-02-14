// pages/blueprint/market.js
// Blueprint Studio market intelligence page

import Head from 'next/head';
import { BlueprintProvider, BlueprintWorkspace } from '../../components/spaces/blueprint';
import Layout from '../../components/Layout';

export default function MarketPage() {
  return (
    <>
      <Head>
        <title>Market Intelligence | Blueprint Studio</title>
        <meta name="description" content="Research tools for opportunity validation" />
      </Head>
      <Layout>
        <BlueprintProvider>
          <BlueprintWorkspace initialView="market" />
        </BlueprintProvider>
      </Layout>
    </>
  );
}
