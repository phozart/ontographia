import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import LeftNav from './LeftNav';
import AnimatedLogoBackground from './AnimatedLogoBackground';
import { LogoSpinner } from './Logo';
import { useAuth } from './AuthContext';

export default function Layout({ theme, onThemeChange, children }) {

  const [routeLoading, setRouteLoading] = useState(false);
  const [showMobileNotice, setShowMobileNotice] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  // Check if current page is a full-width studio page
  const studioPatterns = [
    '/studio', '/graphnavigator', '/graph-editor', '/diagram-workspace',
    '/system-dynamics', '/requirements-studio', '/knowledge-studio',
    '/product-design-workspace', '/dynamic-work-design', '/ea-studio',
    '/negotiation-studio', '/enterprise-architecture', '/ea-workspace',
    '/help', '/diagram-studio-standalone', '/organisation-studio',
    '/business-service-studio', '/performance-studio', '/governance-studio',
    '/risk-studio', '/portfolio-studio', '/strategic-reasoning',
    '/admin/style-guide', '/admin/menu-config',
    // Domain-scoped routes
    '/app/workspaces/', '/app/reasoning/', '/app/knowledge/'
  ];
  const isStudio = studioPatterns.some(p => router.pathname.includes(p));
  const routeTimer = useRef(null);

  // Check for embed mode (works for both SSR and client-side)
  useEffect(() => {
    // Check URL params on client side
    const params = new URLSearchParams(window.location.search);
    setIsEmbedded(params.get('embed') === 'true');
  }, [router.query]);
  const routeStart = useRef(0);

  // Check if we're on mobile
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    function handleMove(e) {
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      document.documentElement.style.setProperty('--bg-float-x', `${x}px`);
      document.documentElement.style.setProperty('--bg-float-y', `${y}px`);
    }
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  useEffect(() => {
    const MIN_SHOW_MS = 500;
    const handleStart = () => {
      routeStart.current = performance.now();
      setRouteLoading(true);
    };
    const handleEnd = () => {
      const elapsed = performance.now() - routeStart.current;
      const remaining = Math.max(0, MIN_SHOW_MS - elapsed);
      if (routeTimer.current) clearTimeout(routeTimer.current);
      routeTimer.current = setTimeout(() => setRouteLoading(false), remaining);
    };
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleEnd);
    router.events.on('routeChangeError', handleEnd);
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleEnd);
      router.events.off('routeChangeError', handleEnd);
      if (routeTimer.current) clearTimeout(routeTimer.current);
    };
  }, [router.events]);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile) {
        const dismissed = window.localStorage.getItem('mobile-notice-dismissed');
        if (!dismissed) setShowMobileNotice(true);
      } else {
        setShowMobileNotice(false);
      }
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      <Head>
        <title>Ontographia | Knowledge Graph Studio</title>
        <meta
          name="description"
          content="Ontographia Knowledge Graph Studio lets you explore semantic models, navigate relationships, and understand domain structures."
        />
        <link rel="icon" href="/constellation-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#000000" />
      </Head>
      <div className={`app app--${theme}${isEmbedded ? ' app--embedded' : ''}`}>
        <div className="app-body">
          {!isMobile && !isEmbedded && <LeftNav theme={theme} onThemeChange={onThemeChange} />}
          <main className={`app-main${isStudio ? ' app-main--studio' : ''}${!isMobile && !isEmbedded ? ' has-left-nav' : ''}${isEmbedded ? ' app-main--embedded' : ''}`}>
            {!isEmbedded && (
              <div className="bg-logo-wrap" aria-hidden>
                <AnimatedLogoBackground />
              </div>
            )}
            <div className="app-main__content">
              <div style={{ width: '100%', height: '100%' }}>{children}</div>
            </div>
          </main>
        </div>
        {routeLoading && (
          <div className="route-loader" aria-live="polite" role="status">
            <LogoSpinner label="Loading..." theme={theme} />
          </div>
        )}
        {showMobileNotice && (
          <div className="modal-backdrop" style={{ zIndex: 2000 }} onClick={() => setShowMobileNotice(false)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
              <h3 style={{ marginTop: 0 }}>Not optimised for mobile</h3>
              <p style={{ lineHeight: 1.5 }}>
                Ontographia is best experienced on a tablet or desktop. Graph editing and admin actions are hidden on small screens.
              </p>
              <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
                <button
                  className="btn"
                  type="button"
                  onClick={() => {
                    window.localStorage.setItem('mobile-notice-dismissed', '1');
                    setShowMobileNotice(false);
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
