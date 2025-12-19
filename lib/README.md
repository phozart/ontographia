# Library (`lib/`)

Backend infrastructure for database access, utilities, and shared services.

## Structure

```
lib/
├── db/
│   └── postgres.js         # Database connection and query helpers
├── repositories/           # Data access layer (Repository Pattern)
│   ├── BaseRepository.js   # Abstract base class
│   ├── *Repository.js      # Domain-specific repositories
│   └── index.js            # Central exports
├── exportUtils.js          # Export/import utilities
└── projectAccess.js        # Project access control helpers
```

## Database Layer (`lib/db/`)

### postgres.js

Connection pooling and query execution for PostgreSQL.

```javascript
import { query, getClient, withTransaction } from '../lib/db/postgres';

// Simple query
const result = await query('SELECT * FROM users WHERE id = $1', [userId]);

// Transaction
await withTransaction(async (client) => {
  await client.query('INSERT INTO ...', [...]);
  await client.query('UPDATE ...', [...]);
});
```

**Key exports:**
- `query(text, params)` - Execute parameterized query
- `getClient()` - Get pooled client (must release)
- `withTransaction(fn)` - Execute function in transaction
- `pool` - Direct pool access (use sparingly)

## Repository Layer (`lib/repositories/`)

See [repositories/README.md](./repositories/README.md) for detailed documentation.

**Quick usage:**
```javascript
import {
  projectRepository,
  diagramRepository,
  mmsRepository,
} from '../lib/repositories';

const projects = await projectRepository.findByDomain(domainId);
const diagrams = await diagramRepository.findByProject(projectId);
const situations = await mmsRepository.findSituations({ userId });
```

## Utilities

### exportUtils.js

Diagram and data export functionality.

```javascript
import { exportToPNG, exportToSVG, exportToJSON } from '../lib/exportUtils';
```

### projectAccess.js

Project access control and permission checking.

```javascript
import { checkProjectAccess, getProjectRole } from '../lib/projectAccess';

const hasAccess = await checkProjectAccess(projectId, userId);
const role = await getProjectRole(projectId, userId);
```

## Environment Variables

Required in `.env.local`:

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
# or individual:
PGHOST=localhost
PGPORT=5432
PGDATABASE=ontographia
PGUSER=postgres
PGPASSWORD=secret
```

## Best Practices

1. **Use repositories** - Don't write raw SQL in routes/components
2. **Use transactions** - For multi-table operations
3. **Parameterize queries** - Never concatenate user input into SQL
4. **Release clients** - Always release clients from `getClient()`
5. **Handle errors** - Wrap database calls in try/catch
