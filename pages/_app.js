import { useState, useEffect, useMemo } from 'react';
import '../styles.css';
import Layout from '../components/Layout';
import { FilterProvider } from '../components/FilterContext';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useRouteGuard } from '../components/AuthContext';


function MyApp({ Component, pageProps }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const stored = window.localStorage.getItem('kg-theme');
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
      document.documentElement.dataset.theme = stored;
    }
  }, []);

  function handleThemeChange(next) {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem('kg-theme', next);
  }

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme === 'dark' ? 'dark' : 'light',
          primary: { main: theme === 'dark' ? '#e5e7eb' : '#1f2937' },
          secondary: { main: theme === 'dark' ? '#9ca3af' : '#4b5563' },
          background: {
            default: theme === 'dark' ? '#1f2430' : '#eef2f7',
            paper: theme === 'dark' ? '#262d3a' : '#ffffff',
          },
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily: "'Inter','Segoe UI', system-ui, -apple-system, sans-serif",
        },
      }),
    [theme]
  );

  function Guard({ children }) {
    const { enforceRoute } = useRouteGuard();
    useEffect(() => {
      enforceRoute();
    });
    return children;
  }

  return (
    <AuthProvider>
      <FilterProvider>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          <ServiceWorkerRegister />
          <Guard>
            <Layout theme={theme} onThemeChange={handleThemeChange}>
              <Component {...pageProps} />
            </Layout>
          </Guard>
        </ThemeProvider>
      </FilterProvider>
    </AuthProvider>
  );
}

export default MyApp;

function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') return;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(err => console.warn('SW registration failed', err));
    }
  }, []);
  return null;
}
