// pages/app/spaces/[space]/[view]/[[...params]].js
// Generic handler for unknown spaces - redirects custom URL spaces

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSpace } from '../../../../../lib/spaceRegistry';

export default function GenericSpaceView() {
  const router = useRouter();
  const { space, view, params = [] } = router.query;

  useEffect(() => {
    if (!router.isReady || !space) return;

    const spaceConfig = getSpace(space);

    if (!spaceConfig) {
      // Invalid space, redirect to spaces overview
      router.replace('/app/spaces');
      return;
    }

    // Handle spaces with custom URLs
    if (spaceConfig.customUrl) {
      let targetUrl = spaceConfig.customUrl;
      // Append view if provided
      if (view) {
        targetUrl += `/${view}`;
      }
      // Append any additional params
      if (params.length > 0) {
        targetUrl += `/${params.join('/')}`;
      }
      router.replace(targetUrl);
      return;
    }

    // For regular spaces without dedicated pages, redirect to spaces overview
    // (This shouldn't happen if all spaces have their own page files)
    router.replace('/app/spaces');
  }, [router.isReady, space, view, params, router]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      color: 'var(--text-muted)',
    }}>
      Redirecting...
    </div>
  );
}
