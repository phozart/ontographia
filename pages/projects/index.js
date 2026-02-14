/**
 * Projects Index Page
 *
 * Main entry point for Project Studio - shows portfolio view.
 */

import Head from 'next/head';
import { ProjectWorkspace } from '@/components/spaces/projects';

export default function ProjectsPage() {
  return (
    <>
      <Head>
        <title>Projects | Ontographia</title>
        <meta name="description" content="Project portfolio management" />
      </Head>
      <ProjectWorkspace initialView="portfolio" />
    </>
  );
}
