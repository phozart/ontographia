/**
 * Project Detail Page
 *
 * Shows overview dashboard for a specific project.
 */

import Head from 'next/head';
import { useRouter } from 'next/router';
import { ProjectWorkspace } from '@/components/spaces/projects';

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>Project Overview | Ontographia</title>
        <meta name="description" content="Project overview and management" />
      </Head>
      <ProjectWorkspace initialView="overview" projectId={id} />
    </>
  );
}
