# Components

React components organized by domain and function.

## Structure

```
components/
├── AuthContext.js          # Authentication provider and hooks
├── DomainContext.js        # Multi-tenant domain management
├── Layout.js               # Main application layout wrapper
├── TopBar.js               # Navigation header
├── LeftNav.js              # Sidebar navigation
├── GraphView.js            # Knowledge graph visualization
├── ThemeToggle.js          # Light/dark mode toggle
│
├── ArtefactContext.js      # Artefact management context
├── NotificationContext.js  # Toast notifications
├── PresenceContext.js      # Real-time user presence
├── ProjectContext.js       # Project state management
├── RequirementContext.js   # Requirements management
│
├── ba/                     # Business Analysis components
├── ea/                     # Enterprise Architecture components
├── sd/                     # System Dynamics components
├── pdw/                    # Product Design Workspace components
└── landing/                # Landing page components
```

## Core Context Providers

### AuthContext

User authentication, roles, and page permissions.

```javascript
import { useAuth, AuthProvider } from '../components/AuthContext';

// In _app.js
<AuthProvider>{children}</AuthProvider>

// In components
const { user, role, login, logout, canAccessPage } = useAuth();
```

### DomainContext

Multi-tenant domain selection and management.

```javascript
import { useDomains, DomainProvider } from '../components/DomainContext';

const {
  activeDomain,
  accessibleDomains,
  personalDomain,
  isPersonalDomain,
  setActiveDomain,
  addDomain,
} = useDomains();
```

### ProjectContext

Project selection within a domain.

```javascript
import { useProject, ProjectProvider } from '../components/ProjectContext';

const {
  activeProject,
  setActiveProject,
  projects,
} = useProject();
```

## Layout Components

### Layout

Main application wrapper with sidebar and header.

```javascript
import Layout from '../components/Layout';

export default function MyPage() {
  return (
    <Layout title="My Page">
      {/* Page content */}
    </Layout>
  );
}
```

### TopBar

Application header with domain selector, user menu, and navigation.

### LeftNav

Collapsible sidebar with domain-aware navigation links.

## Domain Components

### `/ba` - Business Analysis
- Project configuration
- Artefact management
- Scope definition

### `/ea` - Enterprise Architecture
- ArchiMate element palette
- Layer views (Business, Application, Technology)
- Element relationships

### `/sd` - System Dynamics
- Stock and flow diagrams
- Feedback loop analysis
- Simulation controls

### `/pdw` - Product Design Workspace
- Journey mapping
- Persona management
- Design artifacts

## Patterns

### Context Provider Pattern

All contexts follow this pattern:

```javascript
// Create context with default values
const MyContext = createContext({ ... });

// Provider component
export function MyProvider({ children }) {
  const [state, setState] = useState(...);
  const value = useMemo(() => ({ state, ... }), [state]);
  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}

// Consumer hook
export function useMyContext() {
  return useContext(MyContext);
}
```

### Layout Integration

Pages should use the Layout component:

```javascript
import Layout from '../components/Layout';

export default function FeaturePage() {
  return (
    <Layout title="Feature">
      <div className="feature-container">
        {/* ... */}
      </div>
    </Layout>
  );
}
```

## Styling

Components use CSS classes from:
- `styles.css` - Legacy monolith (being migrated)
- `styles/*.css` - Modular CSS files

See [styles/README.md](../styles/README.md) for design system reference.
