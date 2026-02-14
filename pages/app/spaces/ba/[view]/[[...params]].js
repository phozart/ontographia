// pages/app/spaces/ba/[view]/[[...params]].js
// BA is now merged into Analysis Studio — redirect preserving view and params
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { buildSpaceUrl } from '@/lib/urlUtils';

// Map BA views to Analysis views
const VIEW_MAP = {
  repository: 'repository',
  kanban: 'kanban',
  documents: 'documents',
  trace: 'trace',
  'story-map': 'story-map',
};

export default function BARedirect() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const { view, params = [] } = router.query;
    const mappedView = VIEW_MAP[view] || 'repository';

    // Build the Analysis URL preserving domain/project params
    const analysisUrl = buildSpaceUrl('analysis', mappedView, ...params);
    router.replace(analysisUrl);
  }, [router, router.isReady]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      color: 'var(--text-muted)',
    }}>
      Redirecting to Analysis Studio...
    </div>
  );
}
