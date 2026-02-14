/**
 * Portfolio Page
 *
 * Aggregated portfolio dashboard - redirects to Project Studio portfolio view.
 */

import Head from 'next/head';
import { ProjectWorkspace } from '@/components/spaces/projects';

export default function PortfolioPage() {
  return (
    <>
      <Head>
        <title>Portfolio | Ontographia</title>
        <meta name="description" content="Project portfolio dashboard" />
      </Head>
      <ProjectWorkspace initialView="portfolio" />
    </>
  );
}
