# Pages

Next.js Pages Router structure for Ontographia.

## Structure

```
pages/
├── _app.js                 # App wrapper with providers
├── _document.js            # HTML document customization
├── index.js                # Landing/redirect page
├── login.js                # Authentication page
├── home.js                 # Dashboard
├── help.js                 # Help center
│
├── [domainId]/             # Domain-scoped routes
│   └── app/                # Application routes
│       ├── workspaces/     # Workspace studios
│       ├── knowledge/      # Knowledge management
│       └── reasoning/      # Reasoning tools
│
├── graphnavigator.js       # Knowledge graph explorer
├── diagram-workspace.js    # General diagramming
├── flow-designer.js        # Flow diagram editor
│
├── ea-studio.js            # Enterprise Architecture studio
├── ea-workspace.js         # EA workspace view
├── requirements-studio.js  # Requirements management
├── product-design-workspace.js  # Product design
├── system-dynamics.js      # System dynamics modeling
│
└── api/                    # API routes
    ├── auth/               # Authentication endpoints
    ├── admin/              # Admin endpoints
    ├── domains.js          # Domain management
    ├── projects/           # Project CRUD
    ├── diagrams/           # Diagram CRUD
    ├── artefacts/          # Artefact CRUD
    ├── documents/          # Document CRUD
    ├── ea/                 # Enterprise Architecture
    ├── mms/                # Mental Model Studio
    ├── als/                # Adaptive Learning Studio
    ├── np/                 # Negotiation & Persuasion
    └── philosophy/         # Philosophy Studio
```

## Routing Patterns

### Domain-Scoped Routes

Routes under `[domainId]` are scoped to a specific domain:

```
/abc123/app/workspaces/diagram  →  Diagram workspace in domain abc123
/abc123/app/knowledge/studio    →  Knowledge studio in domain abc123
```

### Legacy Routes

For backwards compatibility, root-level routes redirect or work independently:

```
/graphnavigator   →  Uses active domain from context
/ea-studio        →  Uses active domain from context
```

## API Conventions

### Headers

All API routes expect:
- `x-user` - Username for authentication
- `x-role` - User role (admin, editor, viewer)

### Response Format

Success:
```json
{
  "id": "uuid",
  "name": "...",
  ...
}
```

Error:
```json
{
  "error": "Error message"
}
```

### HTTP Methods

| Method | Purpose | Response |
|--------|---------|----------|
| GET | List/fetch | 200 + data |
| POST | Create | 201 + created |
| PUT | Full update | 200 + updated |
| PATCH | Partial update | 200 + updated |
| DELETE | Remove | 204 (no content) |

## Page Structure

Standard page pattern:

```javascript
import Layout from '../components/Layout';
import { useAuth } from '../components/AuthContext';
import { useDomains } from '../components/DomainContext';

export default function MyPage() {
  const { user, role } = useAuth();
  const { activeDomain } = useDomains();

  return (
    <Layout title="My Page">
      <div className="page-container">
        {/* Page content */}
      </div>
    </Layout>
  );
}
```

## API Route Structure

Standard API route pattern:

```javascript
import { someRepository } from '../../lib/repositories';

export default async function handler(req, res) {
  const userId = req.headers['x-user'];
  const userRole = req.headers['x-role'];

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const data = await someRepository.findAll();
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const item = await someRepository.create(req.body);
    return res.status(201).json(item);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```
