/**
 * Project RAID Page
 *
 * Shows RAID log - Risks, Assumptions, Issues, Dependencies, Decisions.
 */

import Head from 'next/head';
import { useRouter } from 'next/router';
import { ProjectWorkspace } from '@/components/spaces/projects';

export default function ProjectRAIDPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>RAID Log | Ontographia</title>
        <meta name="description" content="Project risks, assumptions, issues, dependencies, and decisions" />
      </Head>
      <ProjectWorkspace initialView="raid" projectId={id} />
    </>
  );
}
