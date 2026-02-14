// pages/blueprint/index.js
// Blueprint Studio - redirects to proper space URL with domain context

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useDomains } from '../../components/DomainContext';
import { buildSpaceUrl } from '../../lib/urlUtils';

export default function BlueprintStudioRedirect() {
  const router = useRouter();
  const { view } = router.query;
  const { activeDomainObj, accessibleDomains } = useDomains();

  useEffect(() => {
    if (!router.isReady) return;

    // Get domain display ID
    const domain = activeDomainObj || accessibleDomains?.[0];
    const domainDisplayId = domain?.displayId || domain?.display_id;

    // Build the proper space URL
    const targetView = view || 'overview';
    const url = domainDisplayId
      ? buildSpaceUrl('blueprint', targetView, domainDisplayId)
      : '/app/spaces/blueprint/overview';

    router.replace(url);
  }, [router.isReady, activeDomainObj, accessibleDomains, view, router]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      color: 'var(--text-muted)',
    }}>
      Redirecting to Blueprint Studio...
    </div>
  );
}
