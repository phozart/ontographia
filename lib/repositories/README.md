# Repository Layer

Data access layer implementing the Repository Pattern for database operations.

## Architecture

```
lib/repositories/
├── BaseRepository.js       # Abstract base class with common CRUD
├── ProjectRepository.js    # Projects and project members
├── DiagramRepository.js    # Diagrams and diagram elements
├── DocumentRepository.js   # Documents and versions
├── ArtefactRepository.js   # Business artefacts
├── DomainRepository.js     # Multi-tenant domains
├── UserRepository.js       # Users and authentication
├── PageRepository.js       # Page permissions
├── EARepository.js         # Enterprise Architecture elements
├── CMRepository.js         # Change Management artefacts
├── WorkspaceArtefactRepository.js  # Cross-workspace artefacts
├── MMSRepository.js        # Mental Model Studio
├── ALSRepository.js        # Adaptive Learning Studio
├── NPRepository.js         # Negotiation & Persuasion
├── PhilosophyRepository.js # Philosophy Studio
└── index.js                # Central exports
```

## Usage

```javascript
import { projectRepository, diagramRepository } from '../lib/repositories';

// Find with filters
const projects = await projectRepository.findByDomain(domainId, { status: 'Active' });

// Create
const project = await projectRepository.create({
  name: 'My Project',
  domain_id: domainId,
  created_by: userId,
});

// Update
await projectRepository.update(projectId, { status: 'Closed' });

// Delete
await projectRepository.delete(projectId);
```

## BaseRepository Methods

All repositories inherit these methods from `BaseRepository`:

| Method | Description |
|--------|-------------|
| `findById(id)` | Find record by primary key |
| `findAll(conditions, options)` | Find all matching records |
| `findOne(conditions)` | Find first matching record |
| `create(data)` | Insert new record |
| `update(id, data)` | Update record by ID |
| `delete(id)` | Delete record by ID |
| `count(conditions)` | Count matching records |
| `exists(conditions)` | Check if record exists |
| `rawQuery(sql, params)` | Execute custom SQL |
| `transaction(fn)` | Execute within transaction |

## Domain Repositories

### MMSRepository (Mental Model Studio)
- Situations, elements, relationships, reflections
- `findSituations()`, `findElements()`, `findRelationships()`
- Element types: beliefs, assumptions, facts, mental models

### ALSRepository (Adaptive Learning Studio)
- Learning situations, sessions, reflections
- `findSessions()`, `createSession()`, `updateSession()`
- Tracks understanding signals and friction points

### NPRepository (Negotiation & Persuasion)
- Negotiation situations, elements, journal, conversation turns
- `findSituationWithDetails()` returns full situation data
- Element categories: interests, positions, BATNAs

### PhilosophyRepository (Philosophy Studio)
- Philosophical inquiries, elements, relationships, reflections
- `findInquiryByIdWithStats()` includes counts
- Element types: concepts, arguments, positions

## Testing

```bash
npm test -- --testPathPattern=repositories
```

Tests verify:
- Module exports (classes and singletons)
- Inheritance from BaseRepository
- Method signatures
- Singleton behavior
