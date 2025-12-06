import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import TopBar from './TopBar';
import Sidebar from './SideBar';
import AnimatedLogoBackground from './AnimatedLogoBackground';
import { LogoSpinner } from './Logo';

export default function Layout({ theme, onThemeChange, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const router = useRouter();
  const isStudio = router.pathname.startsWith('/studio') || router.pathname.startsWith('/graphnavigator');
  const routeTimer = useRef(null);
  const routeStart = useRef(0);

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

  return (
    <>
      <Head>
        <title>Ontographia | Knowledge Graph Studio</title>
        <meta
          name="description"
          content="Ontographia Knowledge Graph Studio lets you explore semantic models, navigate relationships, and understand domain structures."
        />
        <link rel="icon" href="/constellation-icon.svg" />
      </Head>
      <div className={`app app--${theme}`}>
        <TopBar theme={theme} onThemeChange={onThemeChange} />
        <div className="app-body">
          <main className={`app-main${isStudio ? ' app-main--studio' : ''}`}>
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
            <LogoSpinner label="Loading..." />
          </div>
        )}
        <div className="global-footer">
          © Ontographia · Privacy: local storage stores your session and role only; no personal private data is kept.
        </div>
      </div>
    </>
  );
}
