// pages/project-design.js
// Redirect to canonical location in app/workspaces

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ProjectDesignRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/app/workspaces/project-design');
  }, [router]);

  return null;
}
