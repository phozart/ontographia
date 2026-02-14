# Changelog

All notable changes to Ontographia.

## [2.0.0] - Unreleased

### Added
- 18 business spaces with professional frameworks
- EA as Integration Hub pattern
- AI Coaching system
- Research prompt generation
- Achievement system
- Cross-space traceability
- PostgreSQL graph storage
- Unified design system
- **Knowledge Engineer documentation system** (2026-01-24)
  - Automatic change detection (`npm run docs:detect`)
  - Claude Code hooks for file tracking
  - Git post-commit hook for documentation reminders
  - Background watcher mode (`npm run docs:watch`)
  - Repository layer reference documentation
- **API Contracts documentation update** (2026-01-24)
  - Complete inventory of 200+ API endpoints
  - Three authentication methods documented (JWT, Headers, Cookie)
  - All 16+ spaces with endpoint tables
  - Admin, User, Graph, Health endpoints documented
  - GraphQL schema overview added
- **Domain Model documentation update** (2026-01-24)
  - Rewritten from TypeScript interfaces to actual PostgreSQL DDL
  - 60+ tables documented with actual schema
  - Multi-tenant architecture patterns
  - Event sourcing with domain_events table
- **Documentation cleanup** (2026-01-24)
  - Removed `docs/_old/` directory (18 legacy files from Dec 2024)
  - Removed outdated `archaeology/DATA-MODEL.md` (referenced Neo4j)
  - Removed `architecture/PLATFORM_DOCUMENTATION.md` (superseded)
  - Removed stale `v2-project/PROJECT-STATUS.md` (Sprint 0 status)
  - Updated DOCUMENTATION-INDEX.md with accurate structure
  - Reduced from 69 to 51 documentation files

### Changed
- Database: Neo4j to PostgreSQL + JSONB
- Frontend: Next.js 14 to 16, React 18 to 19
- Styling: Unified to CSS Modules
- **Component reorganization** (2026-01-24)
  - All space components moved to `components/spaces/`
  - Deprecated BSM, GOV, RISK spaces (merged into CAP/PDS)
  - Repository layer consolidated in `lib/repositories/`

### Removed
- Neo4j dependency
- Legacy styling approaches

## [0.1.0] - Previous

- Initial V1 release
