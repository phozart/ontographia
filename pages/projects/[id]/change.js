/**
 * Project Change Management Page
 *
 * Shows change management - impact, stakeholders, communications, training, readiness.
 */

import Head from 'next/head';
import { useRouter } from 'next/router';
import { ProjectWorkspace } from '@/components/spaces/projects';

export default function ProjectChangePage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>Change Management | Ontographia</title>
        <meta name="description" content="Project change management and stakeholder engagement" />
      </Head>
      <ProjectWorkspace initialView="change" projectId={id} />
    </>
  );
}
