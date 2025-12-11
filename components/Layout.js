import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import TopBar from './TopBar';
import LeftNav from './LeftNav';

import AnimatedLogoBackground from './AnimatedLogoBackground';
import { LogoSpinner } from './Logo';
import { useDomains } from './DomainContext';
import { useAuth } from './AuthContext';

export default function Layout({ theme, onThemeChange, children }) {

  const [routeLoading, setRouteLoading] = useState(false);
  const [showMobileNotice, setShowMobileNotice] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const isStudio = router.pathname.startsWith('/studio') || router.pathname.startsWith('/graphnavigator') || router.pathname.startsWith('/graph-editor') || router.pathname.startsWith('/diagram-workspace');
  const routeTimer = useRef(null);
  const routeStart = useRef(0);
  const year = new Date().getFullYear();
  const { activeDomain, activeDomainObj } = useDomains();

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
      <div className={`app app--${theme}`}>
        <TopBar theme={theme} onThemeChange={onThemeChange} />
        <div className="app-body">
          {user && !isMobile && <LeftNav />}
          <main className={`app-main${isStudio ? ' app-main--studio' : ''}${user && !isMobile ? ' has-left-nav' : ''}`}>
            <div className="bg-logo-wrap" aria-hidden>
              <AnimatedLogoBackground />
            </div>
            <div className="app-main__content">
              <div style={{ width: '100%' }}>{children}</div>
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
        <div
          className="global-footer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>
            © {year} Ontographia ·{' '}
            <button
              type="button"
              className="link"
              style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
              onClick={() => setShowPrivacy(true)}
            >
              Privacy
            </button>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            Domain:{' '}
            <strong style={{ color: 'var(--text)' }}>
              {activeDomainObj?.name || activeDomain || 'None'}
            </strong>
          </span>
        </div>
        {showPrivacy && (
          <div className="modal-backdrop" style={{ zIndex: 2100 }} onClick={() => setShowPrivacy(false)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
              <h3 style={{ marginTop: 0 }}>Privacy statement</h3>
              <p style={{ lineHeight: 1.6 }}>
                Ontographia uses a minimal privacy footprint. We store your session token and role in local storage on
                this device only. No personal data is kept beyond what you enter to sign in. All graph edits and
                metadata remain within your environment; nothing is sent to third-party analytics. For support or audit,
                an administrator may review server logs that contain timestamped access events but not your content.
              </p>
              <p style={{ lineHeight: 1.6 }}>
                By continuing, you confirm you are authorised to access the workspace data and will handle it according
                to your organisationâ€™s security and privacy policies.
              </p>
              <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
                <button className="btn" type="button" onClick={() => setShowPrivacy(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
