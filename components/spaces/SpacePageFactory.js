// components/spaces/SpacePageFactory.js
// Factory for per-space pages to avoid bundling every workspace into one route.

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import LoginIcon from '@mui/icons-material/Login';
import DomainIcon from '@mui/icons-material/Domain';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAuth } from '../AuthContext';
import { useDomains } from '../DomainContext';
import { getSpace, isValidView } from '../../lib/spaceRegistry';
import { parseSpaceParams, buildSpaceUrl } from '../../lib/urlUtils';

export function createSpacePage({ spaceCode, WorkspaceComponent, ProviderComponent = null }) {
  return function SpacePage() {
    const router = useRouter();
    const { view, params = [] } = router.query;
    const { user } = useAuth();
    const { activeDomain, activeDomainObj, accessibleDomains = [], setActiveDomain } = useDomains();
    const [loading, setLoading] = useState(true);

    const spaceConfig = useMemo(() => getSpace(spaceCode), []);
    const parsedParams = useMemo(() => {
      if (!view) return null;
      return parseSpaceParams({ space: spaceCode, view, params });
    }, [view, params]);

    useEffect(() => {
      if (router.isReady) {
        setLoading(false);
      }
    }, [router.isReady]);

    // Sync domain from URL to context
    useEffect(() => {
      if (!parsedParams?.domainId || accessibleDomains.length === 0) return;
      const domain = accessibleDomains.find(d =>
        d.displayId === parsedParams.domainId || d.display_id === parsedParams.domainId
      );
      if (domain && domain.id !== activeDomain) {
        setActiveDomain(domain.id);
      }
    }, [parsedParams?.domainId, accessibleDomains, activeDomain, setActiveDomain]);

    // Ensure domain is always in URL when available (knowledge-first: URL should always show context)
    useEffect(() => {
      if (!router.isReady || loading) return;
      if (!spaceConfig?.requiresDomain) return;

      // If domain is already in URL, nothing to do
      if (parsedParams?.domainId) return;

      // If we have an active domain, redirect to include it in the URL
      if (activeDomainObj) {
        const domainDisplayId = activeDomainObj.displayId || activeDomainObj.display_id;
        if (domainDisplayId) {
          const currentView = Array.isArray(view) ? view[0] : view || spaceConfig.defaultView;
          const newUrl = buildSpaceUrl(spaceCode, currentView, domainDisplayId);
          router.replace(newUrl, undefined, { shallow: true });
        }
      }
    }, [router.isReady, loading, spaceConfig, parsedParams?.domainId, activeDomainObj, view]);

    if (loading || !router.isReady) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          color: 'var(--text-muted)',
        }}>
          Loading...
        </div>
      );
    }

    if (!user) {
      return (
        <div className="page-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh'
        }}>
          <div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 400 }}>
            <ErrorOutlineIcon style={{ fontSize: 48, color: 'var(--accent)', marginBottom: 16 }} />
            <h2>{spaceConfig?.name || 'Application Space'}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              Please sign in to access this space.
            </p>
            <Link href="/login" className="btn btn-primary" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}>
              <LoginIcon fontSize="small" /> Sign In
            </Link>
          </div>
        </div>
      );
    }

    if (!spaceConfig) {
      return (
        <div className="page-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh'
        }}>
          <div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 400 }}>
            <ErrorOutlineIcon style={{ fontSize: 48, color: 'var(--error)', marginBottom: 16 }} />
            <h2>Space Not Found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              The space "{spaceCode}" does not exist.
            </p>
            <Link href="/app/spaces" className="btn btn-primary">
              Browse Spaces
            </Link>
          </div>
        </div>
      );
    }

    const currentView = Array.isArray(view) ? view[0] : view || spaceConfig.defaultView;
    if (!isValidView(spaceCode, currentView)) {
      return (
        <div className="page-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh'
        }}>
          <div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 400 }}>
            <ErrorOutlineIcon style={{ fontSize: 48, color: 'var(--error)', marginBottom: 16 }} />
            <h2>View Not Found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              The view "{currentView}" is not available in {spaceConfig.name}.
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '13px' }}>
              Available views: {spaceConfig.views.join(', ')}
            </p>
            <Link href={buildSpaceUrl(spaceCode)} className="btn btn-primary">
              Go to {spaceConfig.name}
            </Link>
          </div>
        </div>
      );
    }

    if (spaceConfig.requiresDomain && !activeDomain && !parsedParams?.domainId) {
      return (
        <div className="page-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh'
        }}>
          <div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 400 }}>
            <DomainIcon style={{ fontSize: 48, color: 'var(--accent)', marginBottom: 16 }} />
            <h2>Select a Domain</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              {spaceConfig.name} requires a domain context. Please select or create a domain to begin.
            </p>
            {accessibleDomains.length === 0 ? (
              <Link href="/domains" className="btn btn-primary">
                Create Your First Domain
              </Link>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                Use the domain selector in the left navigation to choose a domain.
              </p>
            )}
          </div>
        </div>
      );
    }

    const content = (
      <WorkspaceComponent
        view={currentView}
        domainId={parsedParams?.domainId}
        projectId={parsedParams?.projectId}
        sessionId={parsedParams?.sessionId}
        initiativeId={parsedParams?.initiativeId}
      />
    );

    if (ProviderComponent) {
      return <ProviderComponent>{content}</ProviderComponent>;
    }

    return content;
  };
}
