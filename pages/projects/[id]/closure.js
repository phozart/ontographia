/**
 * Project Closure Page
 *
 * Shows closure activities - lessons learned, handover, benefits.
 */

import Head from 'next/head';
import { useRouter } from 'next/router';
import { ProjectWorkspace } from '@/components/spaces/projects';

export default function ProjectClosurePage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>Project Closure | Ontographia</title>
        <meta name="description" content="Project closure, lessons learned, and handover" />
      </Head>
      <ProjectWorkspace initialView="lessons" projectId={id} />
    </>
  );
}
