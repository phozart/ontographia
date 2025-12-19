import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import '../styles/index.css'; // Modular CSS (new)
import '../styles.css';       // Legacy styles (to be migrated gradually)
import '../styles/pdw-workspace.css'; // Product Design workspace styles
import '../styles/dwd-workspace.css'; // Dynamic Work Design workspace styles
import '../styles/projects-overview.css'; // Projects Overview dashboard styles
import '../styles/ea-workspace.css'; // Enterprise Architecture workspace styles
import '../styles/np-workspace.css'; // Negotiation & Persuasion workspace styles
import '../styles/mms-workspace.css'; // Mental Models & Sensemaking workspace styles
import '../styles/als-workspace.css'; // Academic Learning Studio styles
import '../styles/requirement-card.css'; // Requirement card two-column layout
import '../styles/cm-workspace.css'; // Change Management workspace styles
import '../styles/process-flow-builder.css'; // Reusable process flow builder
import '../styles/diagram-studio.css'; // DiagramStudio unified diagramming
import '../styles/philosophy-workspace.css'; // Philosophy & Critical Thinking Studio
import '../styles/portfolio-workspace.css'; // Portfolio Studio styles
import '../styles/srs-workspace.css'; // Strategic Reasoning Suite styles
import '../styles/pds-workspace.css'; // Project Design Workspace styles
import '../styles/pds-tools.css'; // Project Design tools styles
import Layout from '../components/Layout';
import { FilterProvider } from '../components/FilterContext';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useRouteGuard } from '../components/AuthContext';
import { DomainProvider } from '../components/DomainContext';
import { ProjectProvider } from '../components/ProjectContext';
import { RequirementProvider } from '../components/RequirementContext';
import { ArtefactProvider } from '../components/ArtefactContext';
import { BAProvider } from '../components/ba/BAContext';
import { UndoRedoProvider } from '../components/UndoRedoContext';
import { KeyboardShortcutsProvider } from '../components/KeyboardShortcuts';
import { NotificationProvider } from '../components/NotificationContext';
import { PresenceProvider } from '../components/PresenceContext';
import { MenuConfigProvider } from '../components/MenuConfigContext';


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

  // Use getLayout pattern - allows pages to opt-out of Layout wrapper
  // Studio pages can define: MyPage.getLayout = (page) => page
  const getLayout = Component.getLayout || ((page) => (
    <Layout theme={theme} onThemeChange={handleThemeChange}>
      {page}
    </Layout>
  ));

  return (
    <AuthProvider>
      <MenuConfigProvider>
        <DomainProvider>
          <ProjectProvider>
            <RequirementProvider>
            <ArtefactProvider>
              <BAProvider>
              <NotificationProvider>
                <PresenceProvider>
                  <FilterProvider>
                  <UndoRedoProvider>
                    <KeyboardShortcutsProvider>
                    <ThemeProvider theme={muiTheme}>
                      <CssBaseline />
                      <ServiceWorkerRegister />
                      {getLayout(<Component {...pageProps} />)}
                    </ThemeProvider>
                  </KeyboardShortcutsProvider>
                  </UndoRedoProvider>
                </FilterProvider>
                </PresenceProvider>
              </NotificationProvider>
              </BAProvider>
            </ArtefactProvider>
            </RequirementProvider>
          </ProjectProvider>
        </DomainProvider>
      </MenuConfigProvider>
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
