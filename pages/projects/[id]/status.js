/**
 * Project Status Page
 *
 * Shows status reporting and progress tracking.
 */

import Head from 'next/head';
import { useRouter } from 'next/router';
import { ProjectWorkspace } from '@/components/spaces/projects';

export default function ProjectStatusPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>Project Status | Ontographia</title>
        <meta name="description" content="Project status reporting and tracking" />
      </Head>
      <ProjectWorkspace initialView="status" projectId={id} />
    </>
  );
}
