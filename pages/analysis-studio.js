// pages/analysis-studio.js
// Analysis Studio - Consolidates BA, Architecture, and UX/UI Design

import Head from 'next/head';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';

// Dynamic import to avoid SSR issues with context
const AnalysisWorkspace = dynamic(
  () => import('../components/spaces/analysis/AnalysisWorkspace'),
  { ssr: false }
);

export default function AnalysisStudioPage() {
  return (
    <Layout>
      <Head>
        <title>Analysis Studio | Ontographia</title>
        <meta
          name="description"
          content="Analysis Studio - Requirements, Architecture, and UX/UI Design"
        />
      </Head>

      <AnalysisWorkspace />
    </Layout>
  );
}
