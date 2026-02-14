/**
 * Project Planning Page
 *
 * Shows planning tools - WBS, schedule, milestones, resources, budget.
 */

import Head from 'next/head';
import { useRouter } from 'next/router';
import { ProjectWorkspace } from '@/components/spaces/projects';

export default function ProjectPlanPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>Project Planning | Ontographia</title>
        <meta name="description" content="Project planning and scheduling" />
      </Head>
      <ProjectWorkspace initialView="wbs" projectId={id} />
    </>
  );
}
