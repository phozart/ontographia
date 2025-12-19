// components/StudioLayout.js
// Minimal layout wrapper for studio/workspace pages
// Provides left nav + full-screen content area without main Layout constraints

import { useState, useEffect } from 'react';
import Head from 'next/head';
import LeftNav from './LeftNav';

export default function StudioLayout({
  children,
  title = 'Ontographia',
  theme,
  onThemeChange,
}) {
  const [currentTheme, setCurrentTheme] = useState(theme || 'light');
  const [isMobile, setIsMobile] = useState(false);

  // Sync theme from localStorage if not provided
  useEffect(() => {
    if (!theme) {
      const stored = window.localStorage.getItem('kg-theme');
      if (stored === 'light' || stored === 'dark') {
        setCurrentTheme(stored);
      }
    }
  }, [theme]);

  // Check if we're on mobile
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleThemeChange = (next) => {
    setCurrentTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem('kg-theme', next);
    onThemeChange?.(next);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/constellation-icon.svg" />
      </Head>
      <div className={`studio-layout studio-layout--${currentTheme}`}>
        {!isMobile && (
          <LeftNav theme={currentTheme} onThemeChange={handleThemeChange} />
        )}
        <main className="studio-layout__content">
          {children}
        </main>
      </div>

      <style jsx>{`
        .studio-layout {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: var(--bg);
        }

        .studio-layout__content {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-width: 0;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}

// Helper to create getLayout function for studio pages
export function getStudioLayout(title) {
  return function StudioPageLayout(page) {
    return (
      <StudioLayout title={title}>
        {page}
      </StudioLayout>
    );
  };
}
