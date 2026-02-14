// pages/app/spaces/[space]/index.js
// Space landing page - redirects to default view

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSpace } from '../../../../lib/spaceRegistry';
import { buildSpaceUrl } from '../../../../lib/urlUtils';
import { useDomains } from '../../../../components/DomainContext';

export default function SpaceLanding() {
  const router = useRouter();
  const { space } = router.query;
  const { activeDomainObj } = useDomains();

  useEffect(() => {
    if (!space) return;

    const spaceConfig = getSpace(space);
    if (!spaceConfig) {
      // Invalid space, redirect to spaces overview
      router.replace('/app/spaces');
      return;
    }

    // Handle spaces with custom URLs
    if (spaceConfig.customUrl) {
      router.replace(spaceConfig.customUrl);
      return;
    }

    // Redirect to default view, with domain if available and required
    const domainId = spaceConfig.requiresDomain && activeDomainObj?.displayId
      ? activeDomainObj.displayId
      : null;

    const targetUrl = buildSpaceUrl(space, spaceConfig.defaultView, domainId);
    router.replace(targetUrl);
  }, [space, activeDomainObj, router]);

  // Show loading state while redirecting
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      color: 'var(--text-muted)',
    }}>
      Loading space...
    </div>
  );
}
