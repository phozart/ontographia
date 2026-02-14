import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'ontographia',
  user: process.env.PGUSER || 'ontographia',
  password: process.env.PGPASSWORD || 'ontographia',
  ssl:
    process.env.PGSSLMODE && process.env.PGSSLMODE !== 'disable'
      ? { rejectUnauthorized: process.env.PGSSLMODE === 'require' }
      : false,
  max: 10,
});

let initPromise = null;

async function initSchema() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const client = await pool.connect();
    try {
      // Check if the database was already initialized by init-db.sql (V2 schema)
      // V2 schema uses UUID for users.id, V1 schema uses TEXT
      const schemaCheck = await client.query(`
        SELECT data_type FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'id'
      `);

      // If users table exists with UUID type, skip legacy initialization
      // This means the database was set up by init-db.sql (V2)
      // But still run essential migrations to ensure all columns exist
      if (schemaCheck.rows.length > 0 && schemaCheck.rows[0].data_type === 'uuid') {
        console.log('[pg.js] V2 schema detected, running essential migrations only');

        // Ensure artefacts table has all required columns
        await client.query(`
          DO $$
          BEGIN
            -- Add domain_id if missing
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artefacts' AND column_name = 'domain_id') THEN
              ALTER TABLE artefacts ADD COLUMN domain_id UUID REFERENCES domains(id) ON DELETE CASCADE;
              CREATE INDEX IF NOT EXISTS idx_artefacts_domain ON artefacts(domain_id);
            END IF;
            -- Add owner_id if missing
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artefacts' AND column_name = 'owner_id') THEN
              ALTER TABLE artefacts ADD COLUMN owner_id TEXT;
            END IF;
            -- Add created_by if missing
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artefacts' AND column_name = 'created_by') THEN
              ALTER TABLE artefacts ADD COLUMN created_by TEXT;
            END IF;
            -- Add linked_graph_nodes if missing
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artefacts' AND column_name = 'linked_graph_nodes') THEN
              ALTER TABLE artefacts ADD COLUMN linked_graph_nodes JSONB DEFAULT '[]'::jsonb;
            END IF;
          END $$;
        `);

        // Ensure artefact_relationships has domain_id
        await client.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artefact_relationships' AND column_name = 'domain_id') THEN
              ALTER TABLE artefact_relationships ADD COLUMN domain_id UUID REFERENCES domains(id) ON DELETE CASCADE;
              CREATE INDEX IF NOT EXISTS idx_artefact_relationships_domain ON artefact_relationships(domain_id);
            END IF;
          END $$;
        `);

        console.log('[pg.js] V2 essential migrations complete');
        return;
      }

      await client.query('BEGIN');
      await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('admin','editor','viewer')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          last_login_at TIMESTAMPTZ,
          login_count INTEGER DEFAULT 0
        );
      `);

      // Seed admin user early (before other tables that reference users)
      const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'admin';
      if (adminPassword === 'admin' && process.env.NODE_ENV === 'production') {
        console.warn('[pg.js] WARNING: Using default admin password in production. Set ADMIN_SEED_PASSWORD env var.');
      }
      const adminHash = bcrypt.hashSync(adminPassword, 10);
      await client.query(
        `INSERT INTO users (id, username, password_hash, role)
         VALUES ('admin', 'admin', $1, 'admin')
         ON CONFLICT (id) DO NOTHING;`,
        [adminHash]
      );

      await client.query(`
        CREATE TABLE IF NOT EXISTS domains (
          id UUID PRIMARY KEY,
          name TEXT NOT NULL,
          notes TEXT,
          owner TEXT NOT NULL REFERENCES users(id),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(name)
        );
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS domain_members (
          domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('owner','admin','editor','viewer')),
          PRIMARY KEY (domain_id, user_id)
        );
      `);

      // Diagrams table for System Dynamics, EA, BPMN, UML, etc.
      await client.query(`
        CREATE TABLE IF NOT EXISTS diagrams (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
          user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          elements JSONB DEFAULT '[]'::jsonb,
          connections JSONB DEFAULT '[]'::jsonb,
          settings JSONB DEFAULT '{}'::jsonb,
          thumbnail TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // Update type constraint to include all diagram types (migration for existing tables)
      await client.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'diagrams_type_check'
          ) THEN
            ALTER TABLE diagrams DROP CONSTRAINT diagrams_type_check;
          END IF;
        EXCEPTION WHEN undefined_object THEN
          NULL;
        END $$;
      `);

      // Create index for faster queries
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_diagrams_user_id ON diagrams(user_id);
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_diagrams_domain_id ON diagrams(domain_id);
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_diagrams_type ON diagrams(type);
      `);

      // ============ PROJECTS TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
          project_number SERIAL,
          name TEXT NOT NULL,
          description TEXT,
          business_context TEXT,
          start_date DATE,
          end_date DATE,
          status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'On Hold', 'Closed')),
          in_scope JSONB DEFAULT '[]'::jsonb,
          out_of_scope JSONB DEFAULT '[]'::jsonb,
          objectives JSONB DEFAULT '[]'::jsonb,
          success_criteria JSONB DEFAULT '[]'::jsonb,
          settings JSONB DEFAULT '{}'::jsonb,
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // Add project_number column if not exists (for existing tables)
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'project_number') THEN
            -- Create a sequence for project numbers
            CREATE SEQUENCE IF NOT EXISTS project_number_seq START 1;
            ALTER TABLE projects ADD COLUMN project_number INTEGER DEFAULT nextval('project_number_seq');
          END IF;
        END $$;
      `);

      // Assign numbers to existing projects that don't have one
      await client.query(`
        CREATE SEQUENCE IF NOT EXISTS project_number_seq START 1;
        UPDATE projects
        SET project_number = nextval('project_number_seq')
        WHERE project_number IS NULL;
      `);

      // ============ PROJECT MEMBERS TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS project_members (
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('Business Analyst', 'Product Owner', 'Stakeholder', 'Viewer')),
          added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          added_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          PRIMARY KEY (project_id, user_id)
        );
      `);

      // ============ ARTEFACTS TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS artefacts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          artefact_type TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'InReview', 'Approved', 'Deprecated', 'Superseded')),
          architecture_state TEXT DEFAULT 'N/A' CHECK (architecture_state IN ('Baseline', 'Transition', 'Target', 'N/A')),
          priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
          owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          version INTEGER DEFAULT 1,
          tags JSONB DEFAULT '[]'::jsonb,
          custom_fields JSONB DEFAULT '{}'::jsonb,
          ticket_status TEXT CHECK (ticket_status IN ('Backlog', 'Ready', 'InProgress', 'InReview', 'Done', 'Blocked')),
          pipeline_stage TEXT,
          pipeline_order INTEGER,
          display_id TEXT,
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // Add pipeline columns if table already exists (migration)
      await client.query(`ALTER TABLE artefacts ADD COLUMN IF NOT EXISTS pipeline_stage TEXT`);
      await client.query(`ALTER TABLE artefacts ADD COLUMN IF NOT EXISTS pipeline_order INTEGER`);
      await client.query(`ALTER TABLE artefacts ADD COLUMN IF NOT EXISTS display_id TEXT`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_artefacts_pipeline ON artefacts(pipeline_stage, pipeline_order)`);
      await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_artefacts_display_id ON artefacts(display_id) WHERE display_id IS NOT NULL`);

      // ============ WORK BREAKDOWN SEQUENCES ============
      await client.query(`CREATE SEQUENCE IF NOT EXISTS seq_requirement START 1`);
      await client.query(`CREATE SEQUENCE IF NOT EXISTS seq_epic START 1`);
      await client.query(`CREATE SEQUENCE IF NOT EXISTS seq_feature START 1`);
      await client.query(`CREATE SEQUENCE IF NOT EXISTS seq_story START 1`);
      await client.query(`CREATE SEQUENCE IF NOT EXISTS seq_test_case START 1`);
      await client.query(`CREATE SEQUENCE IF NOT EXISTS seq_test_suite START 1`);
      await client.query(`CREATE SEQUENCE IF NOT EXISTS seq_test_run START 1`);

      // ============ ARTEFACT RELATIONSHIPS TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS artefact_relationships (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          from_artefact_id UUID REFERENCES artefacts(id) ON DELETE CASCADE,
          to_artefact_id UUID REFERENCES artefacts(id) ON DELETE CASCADE,
          relationship_type TEXT NOT NULL,
          metadata JSONB DEFAULT '{}'::jsonb,
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ DOCUMENTS TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          artefact_id UUID REFERENCES artefacts(id) ON DELETE SET NULL,
          document_type TEXT NOT NULL,
          title TEXT NOT NULL,
          content JSONB DEFAULT '[]'::jsonb,
          template_id TEXT,
          status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'InReview', 'Published', 'Archived')),
          version INTEGER DEFAULT 1,
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ DOCUMENT TEMPLATES TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS document_templates (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          document_type TEXT NOT NULL,
          content JSONB NOT NULL DEFAULT '[]'::jsonb,
          artefact_types JSONB DEFAULT '[]'::jsonb,
          is_system BOOLEAN DEFAULT false,
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ INDEXES ============
      await client.query(`CREATE INDEX IF NOT EXISTS idx_projects_domain_id ON projects(domain_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_artefacts_project_id ON artefacts(project_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_artefacts_type ON artefacts(artefact_type);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_artefacts_status ON artefacts(status);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_relationships_project ON artefact_relationships(project_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_relationships_from ON artefact_relationships(from_artefact_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_relationships_to ON artefact_relationships(to_artefact_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_documents_artefact ON documents(artefact_id);`);

      // ============ MIGRATE: Add domain_id to artefacts for domain-level scoping ============
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artefacts' AND column_name = 'domain_id') THEN
            ALTER TABLE artefacts ADD COLUMN domain_id UUID REFERENCES domains(id) ON DELETE CASCADE;
            CREATE INDEX IF NOT EXISTS idx_artefacts_domain ON artefacts(domain_id);
          END IF;
        END $$;
      `);

      // Backfill domain_id from projects table for existing artefacts
      await client.query(`
        UPDATE artefacts a
        SET domain_id = p.domain_id
        FROM projects p
        WHERE a.project_id = p.id AND a.domain_id IS NULL;
      `);

      // ============ MIGRATE: Add owner_id to artefacts if missing ============
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artefacts' AND column_name = 'owner_id') THEN
            ALTER TABLE artefacts ADD COLUMN owner_id TEXT REFERENCES users(id) ON DELETE SET NULL;
            CREATE INDEX IF NOT EXISTS idx_artefacts_owner ON artefacts(owner_id);
          END IF;
        END $$;
      `);

      // ============ MIGRATE: Add created_by to artefacts if missing ============
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artefacts' AND column_name = 'created_by') THEN
            ALTER TABLE artefacts ADD COLUMN created_by TEXT REFERENCES users(id) ON DELETE SET NULL;
            CREATE INDEX IF NOT EXISTS idx_artefacts_created_by ON artefacts(created_by);
          END IF;
        END $$;
      `);

      // ============ MIGRATE: Add domain_id to artefact_relationships ============
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artefact_relationships' AND column_name = 'domain_id') THEN
            ALTER TABLE artefact_relationships ADD COLUMN domain_id UUID REFERENCES domains(id) ON DELETE CASCADE;
            CREATE INDEX IF NOT EXISTS idx_artefact_relationships_domain ON artefact_relationships(domain_id);
          END IF;
        END $$;
      `);

      // Backfill domain_id for relationships from artefacts
      await client.query(`
        UPDATE artefact_relationships r
        SET domain_id = a.domain_id
        FROM artefacts a
        WHERE r.from_artefact_id = a.id AND r.domain_id IS NULL;
      `);

      // Add project_id to diagrams table if not exists
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagrams' AND column_name = 'project_id') THEN
            ALTER TABLE diagrams ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
            CREATE INDEX IF NOT EXISTS idx_diagrams_project_id ON diagrams(project_id);
          END IF;
        END $$;
      `);

      // Update diagrams type CHECK constraint to include new BA diagram types
      await client.query(`
        DO $$
        BEGIN
          -- Drop old constraint if it exists
          ALTER TABLE diagrams DROP CONSTRAINT IF EXISTS diagrams_type_check;
          -- Add new constraint with all valid types
          ALTER TABLE diagrams ADD CONSTRAINT diagrams_type_check
            CHECK (type IN ('cld', 'stock-flow', 'system-dynamics', 'ea', 'bpmn', 'uml', 'requirements', 'context', 'usecase', 'storymap', 'process-comparison'));
        EXCEPTION
          WHEN others THEN NULL;
        END $$;
      `);

      // Add linked_graph_nodes to artefacts table for EA integration
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artefacts' AND column_name = 'linked_graph_nodes') THEN
            ALTER TABLE artefacts ADD COLUMN linked_graph_nodes JSONB DEFAULT '[]'::jsonb;
          END IF;
        END $$;
      `);

      // ============ EA ELEMENTS TABLE (PostgreSQL-only, separate from Neo4j graph) ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS ea_elements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
          element_type TEXT NOT NULL,
          layer TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          properties JSONB DEFAULT '{}'::jsonb,
          position_x FLOAT DEFAULT 0,
          position_y FLOAT DEFAULT 0,
          parent_id UUID REFERENCES ea_elements(id) ON DELETE SET NULL,
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ EA RELATIONSHIPS TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS ea_relationships (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
          source_id UUID REFERENCES ea_elements(id) ON DELETE CASCADE,
          target_id UUID REFERENCES ea_elements(id) ON DELETE CASCADE,
          relationship_type TEXT NOT NULL,
          label TEXT,
          properties JSONB DEFAULT '{}'::jsonb,
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ EA INDEXES ============
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_elements_domain ON ea_elements(domain_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_elements_type ON ea_elements(element_type);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_elements_layer ON ea_elements(layer);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_elements_parent ON ea_elements(parent_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_relationships_domain ON ea_relationships(domain_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_relationships_source ON ea_relationships(source_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_relationships_target ON ea_relationships(target_id);`);

      // ============ EA PROJECTS TABLE (TOGAF ADM) ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS ea_projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          current_phase TEXT DEFAULT 'preliminary' CHECK (current_phase IN ('preliminary', 'phaseA', 'phaseB', 'phaseC', 'phaseD', 'phaseE', 'phaseF', 'phaseG', 'phaseH')),
          scope TEXT,
          vision TEXT,
          baseline_date DATE,
          target_date DATE,
          stakeholders JSONB DEFAULT '[]'::jsonb,
          principles JSONB DEFAULT '[]'::jsonb,
          constraints JSONB DEFAULT '[]'::jsonb,
          settings JSONB DEFAULT '{}'::jsonb,
          status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'On Hold', 'Completed', 'Archived')),
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ EA BASELINES TABLE (Architecture Snapshots) ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS ea_baselines (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID REFERENCES ea_projects(id) ON DELETE CASCADE,
          domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          baseline_type TEXT NOT NULL CHECK (baseline_type IN ('current', 'target', 'transition')),
          baseline_date DATE DEFAULT CURRENT_DATE,
          snapshot JSONB NOT NULL DEFAULT '{"elements":[],"relationships":[]}'::jsonb,
          version INTEGER DEFAULT 1,
          notes TEXT,
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ EA STANDARDS REGISTER TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS ea_standards (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
          category TEXT NOT NULL CHECK (category IN ('technology', 'data', 'security', 'application', 'infrastructure', 'integration', 'other')),
          name TEXT NOT NULL,
          description TEXT,
          version TEXT,
          vendor TEXT,
          status TEXT DEFAULT 'Active' CHECK (status IN ('Proposed', 'Active', 'Deprecated', 'Retired')),
          compliance_level TEXT DEFAULT 'recommended' CHECK (compliance_level IN ('mandatory', 'recommended', 'optional', 'prohibited')),
          lifecycle_end DATE,
          documentation_url TEXT,
          tags JSONB DEFAULT '[]'::jsonb,
          properties JSONB DEFAULT '{}'::jsonb,
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ EA DECISIONS TABLE (ADRs) ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS ea_decisions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID REFERENCES ea_projects(id) ON DELETE CASCADE,
          domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
          adr_number SERIAL,
          title TEXT NOT NULL,
          context TEXT,
          decision TEXT,
          rationale TEXT,
          alternatives JSONB DEFAULT '[]'::jsonb,
          consequences JSONB DEFAULT '[]'::jsonb,
          status TEXT DEFAULT 'Proposed' CHECK (status IN ('Proposed', 'Accepted', 'Deprecated', 'Superseded')),
          superseded_by UUID REFERENCES ea_decisions(id) ON DELETE SET NULL,
          related_standards JSONB DEFAULT '[]'::jsonb,
          related_elements JSONB DEFAULT '[]'::jsonb,
          decision_date DATE,
          review_date DATE,
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ EA ELEMENT EXTENSIONS ============
      // Add project_id, maturity, and other new columns to ea_elements
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ea_elements' AND column_name = 'project_id') THEN
            ALTER TABLE ea_elements ADD COLUMN project_id UUID REFERENCES ea_projects(id) ON DELETE SET NULL;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ea_elements' AND column_name = 'maturity') THEN
            ALTER TABLE ea_elements ADD COLUMN maturity TEXT;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ea_elements' AND column_name = 'strategic_importance') THEN
            ALTER TABLE ea_elements ADD COLUMN strategic_importance TEXT;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ea_elements' AND column_name = 'lifecycle_status') THEN
            ALTER TABLE ea_elements ADD COLUMN lifecycle_status TEXT;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ea_elements' AND column_name = 'time_quadrant') THEN
            ALTER TABLE ea_elements ADD COLUMN time_quadrant TEXT;
          END IF;
        END $$;
      `);

      // ============ EA PROJECT INDEXES ============
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_projects_domain ON ea_projects(domain_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_projects_status ON ea_projects(status);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_baselines_project ON ea_baselines(project_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_baselines_domain ON ea_baselines(domain_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_standards_domain ON ea_standards(domain_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_standards_category ON ea_standards(category);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_decisions_project ON ea_decisions(project_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_decisions_domain ON ea_decisions(domain_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_decisions_status ON ea_decisions(status);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_elements_project ON ea_elements(project_id);`);

      // ============ EA DECISIONS EXTENSIONS (ADR fields) ============
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ea_decisions' AND column_name = 'deciders') THEN
            ALTER TABLE ea_decisions ADD COLUMN deciders JSONB DEFAULT '[]'::jsonb;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ea_decisions' AND column_name = 'date_superseded') THEN
            ALTER TABLE ea_decisions ADD COLUMN date_superseded DATE;
          END IF;
        END $$;
      `);

      // ============ EA DECISION HISTORY TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS ea_decision_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          decision_id UUID NOT NULL REFERENCES ea_decisions(id) ON DELETE CASCADE,
          action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
          previous_state JSONB,
          new_state JSONB,
          changes JSONB,
          changed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_decision_history_decision ON ea_decision_history(decision_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_decision_history_changed_at ON ea_decision_history(changed_at);`);

      // ============ PAGE REGISTRY TABLE (for RBAC) ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS page_registry (
          path TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          section TEXT,
          description TEXT,
          default_roles TEXT[] DEFAULT '{}',
          is_active BOOLEAN DEFAULT true,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ USER PAGE PERMISSIONS TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_page_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          page_path TEXT NOT NULL REFERENCES page_registry(path) ON DELETE CASCADE,
          can_access BOOLEAN DEFAULT true,
          granted_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          granted_at TIMESTAMPTZ DEFAULT now(),
          UNIQUE(user_id, page_path)
        );
      `);

      // ============ EXTEND USERS TABLE FOR PERSONAL DOMAIN ============
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'personal_domain_id') THEN
            ALTER TABLE users ADD COLUMN personal_domain_id UUID REFERENCES domains(id) ON DELETE SET NULL;
          END IF;
        END $$;
      `);

      // ============ RBAC INDEXES ============
      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_page_permissions_user ON user_page_permissions(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_page_registry_category ON page_registry(category);`);

      // ============ AUTHENTICATION SCHEMA EXTENSIONS ============
      // Add email column to users table
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email') THEN
            ALTER TABLE users ADD COLUMN email TEXT UNIQUE;
          END IF;
        END $$;
      `);

      // Add OAuth columns to users table
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'oauth_provider') THEN
            ALTER TABLE users ADD COLUMN oauth_provider TEXT;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'oauth_provider_id') THEN
            ALTER TABLE users ADD COLUMN oauth_provider_id TEXT;
          END IF;
        END $$;
      `);

      // Add settings column to users table
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'settings') THEN
            ALTER TABLE users ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
          END IF;
        END $$;
      `);

      // Create unique index for OAuth provider lookup
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_users_oauth_provider
        ON users(oauth_provider, oauth_provider_id)
        WHERE oauth_provider IS NOT NULL AND oauth_provider_id IS NOT NULL;
      `);

      // Create index for email lookup
      await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);

      // ============ REFRESH TOKENS TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_refresh_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_id TEXT NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(user_id, token_id)
        );
      `);

      // Indexes for refresh token lookup and cleanup
      await client.query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON user_refresh_tokens(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON user_refresh_tokens(expires_at);`);

      // ============ END AUTHENTICATION SCHEMA ============

      // ============ N&P SITUATIONS TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS np_situations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          name TEXT NOT NULL,
          description TEXT,
          situation_type TEXT DEFAULT 'unknown' CHECK (situation_type IN ('negotiation', 'persuasion', 'conflict', 'collaboration', 'unknown')),
          other_party TEXT,
          context TEXT,
          stakes TEXT CHECK (stakes IN ('low', 'medium', 'high', 'critical')),
          relationship_importance TEXT CHECK (relationship_importance IN ('one-time', 'ongoing', 'strategic')),
          time_pressure TEXT CHECK (time_pressure IN ('none', 'moderate', 'urgent', 'critical')),
          status TEXT DEFAULT 'preparing' CHECK (status IN ('preparing', 'active', 'resolved', 'abandoned', 'paused')),
          outcome TEXT CHECK (outcome IN ('win-win', 'win-lose', 'lose-win', 'lose-lose', 'no-deal', 'ongoing')),
          outcome_notes TEXT,
          properties JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ N&P ELEMENTS TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS np_elements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          situation_id UUID REFERENCES np_situations(id) ON DELETE CASCADE,
          element_type TEXT NOT NULL,
          category TEXT NOT NULL CHECK (category IN ('context', 'perspective', 'assessment', 'preparation')),
          party TEXT NOT NULL DEFAULT 'mine' CHECK (party IN ('mine', 'theirs', 'shared', 'neutral')),
          content TEXT NOT NULL,
          confidence TEXT DEFAULT 'assumption' CHECK (confidence IN ('known', 'likely', 'assumption', 'guess', 'unknown')),
          evidence TEXT,
          source TEXT,
          importance TEXT DEFAULT 'medium' CHECK (importance IN ('low', 'medium', 'high', 'critical')),
          is_validated BOOLEAN DEFAULT false,
          validated_at TIMESTAMPTZ,
          properties JSONB DEFAULT '{}'::jsonb,
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ N&P ELEMENT RELATIONSHIPS TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS np_element_relationships (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          situation_id UUID REFERENCES np_situations(id) ON DELETE CASCADE,
          from_element_id UUID REFERENCES np_elements(id) ON DELETE CASCADE,
          to_element_id UUID REFERENCES np_elements(id) ON DELETE CASCADE,
          relationship_type TEXT NOT NULL CHECK (relationship_type IN (
            'supports', 'conflicts', 'depends_on', 'addresses', 'trades_for',
            'undermines', 'validates', 'questions', 'relates_to'
          )),
          strength TEXT DEFAULT 'moderate' CHECK (strength IN ('weak', 'moderate', 'strong')),
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ N&P JOURNAL TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS np_journal (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          situation_id UUID REFERENCES np_situations(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          entry_type TEXT NOT NULL CHECK (entry_type IN ('before', 'during', 'after', 'reflection', 'insight', 'lesson')),
          title TEXT,
          content TEXT NOT NULL,
          mood TEXT CHECK (mood IN ('confident', 'anxious', 'uncertain', 'optimistic', 'frustrated', 'neutral')),
          tags JSONB DEFAULT '[]'::jsonb,
          is_private BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ N&P CONVERSATION TURNS TABLE (for post-hoc analysis) ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS np_conversation_turns (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          situation_id UUID REFERENCES np_situations(id) ON DELETE CASCADE,
          turn_number INTEGER NOT NULL,
          speaker TEXT NOT NULL CHECK (speaker IN ('me', 'them', 'other')),
          content TEXT NOT NULL,
          tactic_used TEXT,
          emotional_tone TEXT,
          effectiveness TEXT CHECK (effectiveness IN ('effective', 'neutral', 'ineffective', 'backfired')),
          notes TEXT,
          timestamp_actual TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ N&P INDEXES ============
      await client.query(`CREATE INDEX IF NOT EXISTS idx_np_situations_domain ON np_situations(domain_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_np_situations_user ON np_situations(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_np_situations_status ON np_situations(status);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_np_situations_type ON np_situations(situation_type);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_np_elements_situation ON np_elements(situation_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_np_elements_type ON np_elements(element_type);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_np_elements_category ON np_elements(category);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_np_elements_party ON np_elements(party);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_np_journal_situation ON np_journal(situation_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_np_journal_type ON np_journal(entry_type);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_np_relationships_situation ON np_element_relationships(situation_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_np_relationships_from ON np_element_relationships(from_element_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_np_relationships_to ON np_element_relationships(to_element_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_np_turns_situation ON np_conversation_turns(situation_id);`);

      // ============ PORTFOLIO VOTING TABLES ============
      // Portfolio Votes - Track committee votes on initiatives
      await client.query(`
        CREATE TABLE IF NOT EXISTS portfolio_votes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          artefact_id UUID REFERENCES artefacts(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          vote TEXT NOT NULL CHECK (vote IN ('approve', 'reject', 'abstain')),
          comment TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(artefact_id, user_id)
        );
      `);

      // Portfolio Comments - Discussion threads on initiatives
      await client.query(`
        CREATE TABLE IF NOT EXISTS portfolio_comments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          artefact_id UUID REFERENCES artefacts(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          parent_id UUID REFERENCES portfolio_comments(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ PORTFOLIO VOTING INDEXES ============
      await client.query(`CREATE INDEX IF NOT EXISTS idx_portfolio_votes_artefact ON portfolio_votes(artefact_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_portfolio_votes_user ON portfolio_votes(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_portfolio_comments_artefact ON portfolio_comments(artefact_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_portfolio_comments_user ON portfolio_comments(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_portfolio_comments_parent ON portfolio_comments(parent_id);`);

      // ============ MMS SITUATIONS TABLE (Mental Models & Sensemaking) ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS mms_situations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          title TEXT NOT NULL,
          description TEXT,
          scope TEXT,
          tags JSONB DEFAULT '[]'::jsonb,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'parked', 'archived')),
          active_lens TEXT DEFAULT 'mental-models',
          properties JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ MMS ELEMENTS TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS mms_elements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          situation_id UUID REFERENCES mms_situations(id) ON DELETE CASCADE,
          element_type TEXT NOT NULL,
          content TEXT NOT NULL,
          properties JSONB DEFAULT '{}'::jsonb,
          confidence TEXT CHECK (confidence IN ('known', 'likely', 'assumption', 'guess')),
          source TEXT CHECK (source IN ('self', 'other', 'implicit', 'observed')),
          position_x FLOAT,
          position_y FLOAT,
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ MMS RELATIONSHIPS TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS mms_relationships (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          situation_id UUID REFERENCES mms_situations(id) ON DELETE CASCADE,
          from_element_id UUID REFERENCES mms_elements(id) ON DELETE CASCADE,
          to_element_id UUID REFERENCES mms_elements(id) ON DELETE CASCADE,
          relationship_type TEXT NOT NULL CHECK (relationship_type IN (
            'explains', 'challenges', 'implies', 'has_boundary',
            'supports', 'refutes', 'relates_to', 'derives_from'
          )),
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ MMS REFLECTIONS TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS mms_reflections (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          situation_id UUID REFERENCES mms_situations(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          content TEXT NOT NULL,
          insight_type TEXT CHECK (insight_type IN ('realization', 'question', 'shift', 'decision')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // ============ MMS INDEXES ============
      await client.query(`CREATE INDEX IF NOT EXISTS idx_mms_situations_domain ON mms_situations(domain_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_mms_situations_user ON mms_situations(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_mms_situations_status ON mms_situations(status);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_mms_elements_situation ON mms_elements(situation_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_mms_elements_type ON mms_elements(element_type);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_mms_relationships_situation ON mms_relationships(situation_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_mms_relationships_from ON mms_relationships(from_element_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_mms_relationships_to ON mms_relationships(to_element_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_mms_reflections_situation ON mms_reflections(situation_id);`);

      // ============ ACADEMIC LEARNING STUDIO (ALS) TABLES ============
      // Learning Situations - bounded learning contexts
      await client.query(`
        CREATE TABLE IF NOT EXISTS als_situations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          title TEXT NOT NULL,
          description TEXT,
          subject TEXT,
          learning_objective TEXT,
          constraints JSONB DEFAULT '{}',
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
          properties JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );
      `);

      // Learning Sessions - concrete, time-boxed acts of learning
      await client.query(`
        CREATE TABLE IF NOT EXISTS als_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          situation_id UUID REFERENCES als_situations(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          learning_mode TEXT NOT NULL CHECK (learning_mode IN ('exploration', 'conceptual', 'analytical', 'critical', 'memorisation', 'synthesis', 'application')),
          focus_question TEXT,
          material_used TEXT,
          started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          ended_at TIMESTAMPTZ,
          duration_minutes INTEGER,
          understanding_signal TEXT CHECK (understanding_signal IN ('clear', 'partial', 'confused', 'memorised', 'applicable')),
          friction_notes TEXT,
          properties JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `);

      // Learning Reflections - short reflections captured after learning sessions
      await client.query(`
        CREATE TABLE IF NOT EXISTS als_reflections (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id UUID REFERENCES als_sessions(id) ON DELETE CASCADE,
          situation_id UUID REFERENCES als_situations(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          what_clicked TEXT,
          what_confused TEXT,
          mode_appropriate BOOLEAN,
          next_adjustment TEXT,
          insight_type TEXT CHECK (insight_type IN ('breakthrough', 'confusion', 'strategy_shift', 'connection', 'question')),
          content TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `);

      // ============ ALS INDEXES ============
      await client.query(`CREATE INDEX IF NOT EXISTS idx_als_situations_domain ON als_situations(domain_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_als_situations_user ON als_situations(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_als_situations_status ON als_situations(status);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_als_sessions_situation ON als_sessions(situation_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_als_sessions_user ON als_sessions(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_als_sessions_mode ON als_sessions(learning_mode);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_als_reflections_session ON als_reflections(session_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_als_reflections_situation ON als_reflections(situation_id);`);

      // ============ SRS (STRATEGIC REASONING SUITE) TABLES ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_sessions (
          id SERIAL PRIMARY KEY,
          domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
          owner_id VARCHAR(255) NOT NULL,
          title VARCHAR(500) NOT NULL,
          intent VARCHAR(50) DEFAULT 'understand',
          mode VARCHAR(50) DEFAULT 'solo',
          context TEXT,
          current_space VARCHAR(50) DEFAULT 'questions',
          status VARCHAR(50) DEFAULT 'active',
          duration_minutes INTEGER DEFAULT 0,
          conclusion TEXT,
          closed_at TIMESTAMP,
          custom_fields JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // Migration: Rename project_id to domain_id if it exists
      await client.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'srs_sessions' AND column_name = 'project_id') THEN
            ALTER TABLE srs_sessions RENAME COLUMN project_id TO domain_id;
          END IF;
        END $$;
      `);

      // Migration: Add missing columns to srs_sessions if they don't exist
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'srs_sessions' AND column_name = 'conclusion') THEN
            ALTER TABLE srs_sessions ADD COLUMN conclusion TEXT;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'srs_sessions' AND column_name = 'closed_at') THEN
            ALTER TABLE srs_sessions ADD COLUMN closed_at TIMESTAMP;
          END IF;
        END $$;
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_sessions_domain ON srs_sessions(domain_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_sessions_owner ON srs_sessions(owner_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_sessions_status ON srs_sessions(status);`);

      // Migration: Add display_id and visibility columns for session sharing
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'srs_sessions' AND column_name = 'display_id') THEN
            ALTER TABLE srs_sessions ADD COLUMN display_id TEXT;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'srs_sessions' AND column_name = 'visibility') THEN
            ALTER TABLE srs_sessions ADD COLUMN visibility VARCHAR(50) DEFAULT 'private';
          END IF;
        END $$;
      `);

      // Drop old domain-scoped index if exists, create globally unique index
      await client.query(`DROP INDEX IF EXISTS idx_srs_sessions_domain_display_id;`);
      await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_srs_sessions_display_id ON srs_sessions(display_id);`);

      // Create trigger function for auto-generating globally unique display_id (SRS-0001 format)
      await client.query(`
        CREATE OR REPLACE FUNCTION generate_srs_session_display_id()
        RETURNS TRIGGER AS $$
        DECLARE
          next_num INTEGER;
        BEGIN
          IF NEW.display_id IS NULL THEN
            -- Generate globally unique ID (not per domain)
            SELECT COALESCE(MAX(
              CASE WHEN display_id ~ '^SRS-[0-9]{4}$'
                   THEN SUBSTRING(display_id FROM 5)::int
                   ELSE 0 END
            ), 0) + 1
            INTO next_num
            FROM srs_sessions;

            NEW.display_id := 'SRS-' || LPAD(next_num::text, 4, '0');
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Create trigger (drop first to allow updates)
      await client.query(`DROP TRIGGER IF EXISTS srs_session_display_id_trigger ON srs_sessions;`);
      await client.query(`
        CREATE TRIGGER srs_session_display_id_trigger
          BEFORE INSERT ON srs_sessions
          FOR EACH ROW EXECUTE FUNCTION generate_srs_session_display_id();
      `);

      // Backfill existing sessions with globally unique display_id
      await client.query(`
        WITH numbered AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
          FROM srs_sessions
          WHERE display_id IS NULL
        )
        UPDATE srs_sessions s
        SET display_id = 'SRS-' || LPAD(n.rn::text, 4, '0')
        FROM numbered n
        WHERE s.id = n.id;
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_spaces (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
          space_id VARCHAR(50) NOT NULL,
          canvas_state JSONB DEFAULT '{"position": {"x": 0, "y": 0}, "zoom": 1}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(session_id, space_id)
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_spaces_session ON srs_spaces(session_id);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_questions (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          question_type VARCHAR(50) DEFAULT 'open',
          maturity VARCHAR(50) DEFAULT 'raw',
          assumptions JSONB DEFAULT '[]',
          x REAL DEFAULT 100,
          y REAL DEFAULT 100,
          custom_fields JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_questions_session ON srs_questions(session_id);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_frames (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          elements JSONB DEFAULT '[]',
          challenged_elements JSONB DEFAULT '[]',
          frame_source VARCHAR(100),
          confidence VARCHAR(50) DEFAULT 'untested',
          x REAL DEFAULT 100,
          y REAL DEFAULT 100,
          custom_fields JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_frames_session ON srs_frames(session_id);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_frame_elements (
          id SERIAL PRIMARY KEY,
          frame_id INTEGER NOT NULL REFERENCES srs_frames(id) ON DELETE CASCADE,
          element_type VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          challenged BOOLEAN DEFAULT FALSE,
          challenge_reason TEXT,
          position_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_frame_elements_frame ON srs_frame_elements(frame_id);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_parallel_states (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          state_type VARCHAR(50) DEFAULT 'expected',
          probability VARCHAR(50) DEFAULT 'medium',
          confidence REAL DEFAULT 0.5,
          evidence JSONB DEFAULT '[]',
          implications JSONB DEFAULT '[]',
          is_collapsed BOOLEAN DEFAULT FALSE,
          is_ruled_out BOOLEAN DEFAULT FALSE,
          collapse_reason TEXT,
          position_order INTEGER DEFAULT 0,
          x REAL DEFAULT 100,
          y REAL DEFAULT 100,
          custom_fields JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_parallel_states_session ON srs_parallel_states(session_id);`);

      // Migration: Add position_order to srs_parallel_states if missing
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'srs_parallel_states' AND column_name = 'position_order') THEN
            ALTER TABLE srs_parallel_states ADD COLUMN position_order INTEGER DEFAULT 0;
          END IF;
        END $$;
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_system_nodes (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          node_type VARCHAR(50) DEFAULT 'variable',
          description TEXT,
          x REAL DEFAULT 100,
          y REAL DEFAULT 100,
          custom_fields JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_system_nodes_session ON srs_system_nodes(session_id);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_causal_links (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
          from_node_id INTEGER REFERENCES srs_system_nodes(id) ON DELETE CASCADE,
          to_node_id INTEGER REFERENCES srs_system_nodes(id) ON DELETE CASCADE,
          polarity VARCHAR(20) DEFAULT 'positive',
          delay VARCHAR(50),
          description TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_causal_links_session ON srs_causal_links(session_id);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_feedback_loops (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          loop_type VARCHAR(50) DEFAULT 'reinforcing',
          description TEXT,
          node_ids JSONB DEFAULT '[]',
          link_ids JSONB DEFAULT '[]',
          x REAL DEFAULT 100,
          y REAL DEFAULT 100,
          custom_fields JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_feedback_loops_session ON srs_feedback_loops(session_id);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_perspectives (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
          stakeholder VARCHAR(255) NOT NULL,
          viewpoint TEXT,
          interests JSONB DEFAULT '[]',
          concerns JSONB DEFAULT '[]',
          influence VARCHAR(50) DEFAULT 'medium',
          alignment VARCHAR(50) DEFAULT 'neutral',
          x REAL DEFAULT 100,
          y REAL DEFAULT 100,
          custom_fields JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_perspectives_session ON srs_perspectives(session_id);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_decisions (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          options JSONB DEFAULT '[]',
          chosen_option INTEGER,
          rationale TEXT,
          readiness_score REAL DEFAULT 0,
          status VARCHAR(50) DEFAULT 'pending',
          reversibility VARCHAR(50) DEFAULT 'reversible_with_cost',
          stakes VARCHAR(50) DEFAULT 'medium',
          deadline TIMESTAMP,
          outcome VARCHAR(50),
          outcome_rationale TEXT,
          success_criteria JSONB DEFAULT '[]',
          knows JSONB DEFAULT '[]',
          unknowns JSONB DEFAULT '[]',
          x REAL DEFAULT 100,
          y REAL DEFAULT 100,
          custom_fields JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_decisions_session ON srs_decisions(session_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_decisions_status ON srs_decisions(status);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_snapshots (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
          name VARCHAR(255),
          description TEXT,
          snapshot_data JSONB NOT NULL,
          created_by VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_snapshots_session ON srs_snapshots(session_id);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_connections (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
          from_space VARCHAR(50) NOT NULL,
          from_element_id INTEGER NOT NULL,
          to_space VARCHAR(50) NOT NULL,
          to_element_id INTEGER NOT NULL,
          connection_type VARCHAR(100) DEFAULT 'related',
          label VARCHAR(255),
          description TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_connections_session ON srs_connections(session_id);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_comments (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
          space VARCHAR(50) NOT NULL,
          element_id INTEGER NOT NULL,
          author_id VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_comments_session ON srs_comments(session_id);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_assumptions (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          source_space VARCHAR(50),
          source_element_id INTEGER,
          status VARCHAR(50) DEFAULT 'untested',
          evidence TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_assumptions_session ON srs_assumptions(session_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_assumptions_status ON srs_assumptions(status);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_session_participants (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
          user_id VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'participant',
          joined_at TIMESTAMP DEFAULT NOW(),
          left_at TIMESTAMP,
          UNIQUE(session_id, user_id)
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_session_participants_session ON srs_session_participants(session_id);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_coaching_events (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
          trigger_id VARCHAR(100) NOT NULL,
          space VARCHAR(50),
          element_id INTEGER,
          severity VARCHAR(20) DEFAULT 'info',
          message TEXT,
          dismissed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_coaching_events_session ON srs_coaching_events(session_id);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_exports (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
          format VARCHAR(50) NOT NULL,
          filename VARCHAR(255),
          export_data JSONB,
          created_by VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_srs_exports_session ON srs_exports(session_id);`);

      // ============ KNOWLEDGE GRAPH TABLES ============
      // Node Types - schema for graph node categories
      await client.query(`
        CREATE TABLE IF NOT EXISTS graph_node_types (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          label TEXT,
          description TEXT,
          layer TEXT,
          color TEXT DEFAULT '#6b7280',
          icon TEXT,
          shape TEXT DEFAULT 'ellipse',
          domain TEXT DEFAULT 'core',
          properties JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_graph_node_types_domain ON graph_node_types(domain)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_graph_node_types_layer ON graph_node_types(layer)`);

      // Graph Nodes - domain entities in the knowledge graph
      await client.query(`
        CREATE TABLE IF NOT EXISTS graph_nodes (
          id TEXT PRIMARY KEY,
          type_id TEXT REFERENCES graph_node_types(id) ON DELETE SET NULL,
          name TEXT NOT NULL,
          description TEXT,
          layer TEXT,
          tags TEXT[] DEFAULT '{}',
          attributes JSONB DEFAULT '{}',
          color TEXT,
          icon TEXT,
          weight REAL,
          shape TEXT,
          domain TEXT,
          x REAL,
          y REAL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_graph_nodes_type ON graph_nodes(type_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_graph_nodes_domain ON graph_nodes(domain)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_graph_nodes_layer ON graph_nodes(layer)`);

      // Relationship Types - schema for graph edge categories
      await client.query(`
        CREATE TABLE IF NOT EXISTS graph_relationship_types (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          label TEXT,
          description TEXT,
          color TEXT DEFAULT '#6b7280',
          domain TEXT DEFAULT 'core',
          properties JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_graph_rel_types_domain ON graph_relationship_types(domain)`);

      // Graph Relationships - edges between nodes
      await client.query(`
        CREATE TABLE IF NOT EXISTS graph_relationships (
          id TEXT PRIMARY KEY,
          type_id TEXT REFERENCES graph_relationship_types(id),
          source_id TEXT NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
          target_id TEXT NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
          name TEXT,
          description TEXT,
          weight REAL,
          domain TEXT,
          properties JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_graph_rels_type ON graph_relationships(type_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_graph_rels_source ON graph_relationships(source_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_graph_rels_target ON graph_relationships(target_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_graph_rels_domain ON graph_relationships(domain)`);

      // Graph Layers - layer definitions for knowledge graph
      await client.query(`
        CREATE TABLE IF NOT EXISTS graph_layers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      // Seed default graph layers
      const defaultGraphLayers = [
        { id: 'physical', name: 'Physical', order: 1 },
        { id: 'information', name: 'Information', order: 2 },
        { id: 'systems', name: 'Systems', order: 3 },
        { id: 'rules', name: 'Rules', order: 4 },
        { id: 'governance', name: 'Governance', order: 5 },
      ];
      for (const layer of defaultGraphLayers) {
        await client.query(`
          INSERT INTO graph_layers (id, name, sort_order)
          VALUES ($1, $2, $3)
          ON CONFLICT (id) DO NOTHING
        `, [layer.id, layer.name, layer.order]);
      }

      // ============ OUTBOX EVENTS TABLE ============
      // Schema owned by lib/services/outboxService.js (lazy init with UUID PKs).
      // Do NOT define schema here — outboxService.ensureTableExists() is canonical.

      // ============ LIFECYCLE TRACKING TABLE ============
      await client.query(`
        CREATE TABLE IF NOT EXISTS lifecycle_tracking (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          artefact_id UUID NOT NULL,
          domain_id UUID,
          initiative_tier TEXT DEFAULT 'moderate',
          current_phase TEXT DEFAULT 'strategic_intake',
          phase_history JSONB DEFAULT '[]'::jsonb,
          handoff_notes JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_lifecycle_artefact ON lifecycle_tracking(artefact_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_lifecycle_phase ON lifecycle_tracking(current_phase)`);

      // ============ MENU CONFIGURATION TABLES ============
      // Menu Items - Master list of available navigation items (admin managed)
      await client.query(`
        CREATE TABLE IF NOT EXISTS menu_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key TEXT UNIQUE NOT NULL,
          label TEXT NOT NULL,
          href TEXT NOT NULL,
          icon TEXT NOT NULL,
          default_section TEXT,
          roles TEXT[] DEFAULT '{admin,editor,viewer}',
          is_active BOOLEAN DEFAULT true,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );
      `);

      // Menu Sections - Section definitions
      await client.query(`
        CREATE TABLE IF NOT EXISTS menu_sections (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key TEXT UNIQUE NOT NULL,
          label TEXT NOT NULL,
          is_system BOOLEAN DEFAULT false,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `);

      // Default Menu Configuration - Admin-managed default structure
      await client.query(`
        CREATE TABLE IF NOT EXISTS menu_config_default (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          version INTEGER DEFAULT 1,
          config JSONB NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );
      `);

      // User Menu Configurations - Personal overrides per user
      await client.query(`
        CREATE TABLE IF NOT EXISTS menu_config_user (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          config JSONB NOT NULL,
          based_on_version INTEGER,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now(),
          UNIQUE(user_id)
        );
      `);

      // ============ MENU CONFIG INDEXES ============
      await client.query(`CREATE INDEX IF NOT EXISTS idx_menu_items_section ON menu_items(default_section);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_menu_config_default_active ON menu_config_default(is_active);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_menu_config_user_user ON menu_config_user(user_id);`);

      // ============ SEED MENU SECTIONS ============
      await client.query(`
        INSERT INTO menu_sections (key, label, is_system, sort_order) VALUES
          ('navigation', 'Navigation', true, 0),
          ('knowledge', 'Knowledge', true, 1),
          ('workspace', 'Workspaces', true, 2),
          ('reasoning', 'Reasoning', true, 3)
        ON CONFLICT (key) DO NOTHING;
      `);

      // ============ SEED MENU ITEMS ============
      await client.query(`
        INSERT INTO menu_items (key, label, href, icon, default_section, roles, sort_order) VALUES
          -- Navigation section
          ('product', 'Product', '/navigation/home', 'AppsIcon', 'navigation', '{admin,editor,viewer}', 0),
          ('login', 'Login', '/login', 'LockIcon', 'navigation', '{}', 1),
          -- Knowledge section
          ('knowledge-studio', 'Knowledge Studio', '/knowledge-studio', 'HubIcon', 'knowledge', '{admin,editor,viewer}', 0),
          -- Workspace section (using new /app/spaces/ URLs)
          ('organisation-studio', 'Organisation Studio', '/app/spaces/cap/map', 'BusinessIcon', 'workspace', '{admin,editor,viewer}', 0),
          ('product-design', 'Product Design', '/app/spaces/pdw/discovery', 'LightbulbIcon', 'workspace', '{admin,editor,viewer}', 1),
          ('requirements-studio', 'Requirements Studio', '/app/spaces/analysis/repository', 'AssignmentIcon', 'workspace', '{admin,editor,viewer}', 6),
          ('enterprise-architecture', 'Enterprise Architecture', '/app/spaces/ea/elements', 'ArchitectureIcon', 'workspace', '{admin,editor,viewer}', 7),
          ('diagram-studio', 'Diagram Studio', '/app/spaces/diagram/canvas', 'GridViewIcon', 'workspace', '{admin,editor,viewer}', 8),
          ('change-studio', 'Change Studio', '/app/spaces/cm/impacts', 'ChangeCircleIcon', 'workspace', '{admin,editor,viewer}', 9),
          -- Reasoning section (using new /app/spaces/ URLs)
          ('system-dynamics', 'System Dynamics', '/app/spaces/sd/canvas', 'LoopIcon', 'reasoning', '{admin,editor,viewer}', 0),
          ('work-design', 'Work Design', '/app/spaces/dwd/landscape', 'BuildIcon', 'reasoning', '{admin,editor,viewer}', 1),
          ('learning', 'Learning Studio', '/app/spaces/als/sessions', 'SchoolIcon', 'reasoning', '{admin,editor,viewer}', 2)
        ON CONFLICT (key) DO NOTHING;
      `);

      // ============ ADD NEW MENU ITEMS (migrations) ============
      // Portfolio Studio - added after initial seed (updated to new /app/spaces/ URL)
      await client.query(`
        INSERT INTO menu_items (key, label, href, icon, default_section, roles, sort_order)
        VALUES ('portfolio-studio', 'Portfolio Studio', '/app/spaces/portfolio/matrix', 'BusinessCenterIcon', 'workspace', '{admin,editor,viewer}', 10)
        ON CONFLICT (key) DO NOTHING;
      `);

      // Project Design Studio - added for PDS workspace (updated to new /app/spaces/ URL)
      await client.query(`
        INSERT INTO menu_items (key, label, href, icon, default_section, roles, sort_order)
        VALUES ('project-design', 'Project Design', '/app/spaces/pds/overview', 'AccountTreeIcon', 'workspace', '{admin,editor,viewer}', 0)
        ON CONFLICT (key) DO UPDATE SET
          href = EXCLUDED.href,
          icon = EXCLUDED.icon,
          sort_order = 0;
      `);

      // ============ MIGRATE: Rename capability-studio to organisation-studio ============
      // Only run if capability-studio exists and organisation-studio doesn't
      await client.query(`
        UPDATE menu_items
        SET key = 'organisation-studio',
            label = 'Organisation Studio',
            href = '/app/spaces/cap/map',
            icon = 'BusinessIcon'
        WHERE key = 'capability-studio'
          AND NOT EXISTS (SELECT 1 FROM menu_items WHERE key = 'organisation-studio');
      `);

      // Also update existing organisation-studio href if it's pointing to old paths
      await client.query(`
        UPDATE menu_items
        SET href = '/app/spaces/cap/map'
        WHERE key = 'organisation-studio' AND (href = '/organisation-studio' OR href = '/app/workspaces/organisation');
      `);

      // Update any user menu configs that reference capability-studio
      await client.query(`
        UPDATE menu_config_user
        SET config = REPLACE(config::text, 'capability-studio', 'organisation-studio')::jsonb
        WHERE config::text LIKE '%capability-studio%';
      `);

      // Update default menu config that references capability-studio
      await client.query(`
        UPDATE menu_config_default
        SET config = REPLACE(
          REPLACE(config::text, '"capability-studio"', '"organisation-studio"'),
          '"Capability Studio"', '"Organisation Studio"'
        )::jsonb
        WHERE config::text LIKE '%capability-studio%' OR config::text LIKE '%Capability Studio%';
      `);

      // ============ MIGRATE: Update all menu items to new /app/spaces/ URLs ============
      // Workspace section URLs
      await client.query(`
        UPDATE menu_items SET href = '/app/spaces/cap/map' WHERE key = 'organisation-studio';
        UPDATE menu_items SET href = '/app/spaces/perf/dashboard' WHERE key = 'performance-studio';
        UPDATE menu_items SET href = '/app/spaces/pdw/discovery' WHERE key = 'product-design';
        UPDATE menu_items SET href = '/app/spaces/analysis/repository' WHERE key = 'requirements-studio';
        UPDATE menu_items SET href = '/app/spaces/ea/elements' WHERE key = 'enterprise-architecture';
        UPDATE menu_items SET href = '/app/spaces/diagram/canvas' WHERE key = 'diagram-studio';
        UPDATE menu_items SET href = '/app/spaces/cm/impacts' WHERE key = 'change-studio';
        UPDATE menu_items SET href = '/app/spaces/portfolio/matrix' WHERE key = 'portfolio-studio';
        UPDATE menu_items SET href = '/app/spaces/pds/overview' WHERE key = 'project-design';
      `);

      // Reasoning section URLs
      await client.query(`
        UPDATE menu_items SET href = '/app/spaces/sd/canvas' WHERE key = 'system-dynamics';
        UPDATE menu_items SET href = '/app/spaces/dwd/landscape' WHERE key = 'work-design';
        UPDATE menu_items SET href = '/app/spaces/als/sessions' WHERE key = 'learning';
      `);

      // Remove Mind Lab (merged into other thinking tools)
      await client.query(`
        DELETE FROM menu_items WHERE key = 'mind-lab';
      `);

      // Remove deprecated reasoning menu items (migrated to Mind Lab)
      await client.query(`
        DELETE FROM menu_items WHERE key IN ('negotiation', 'sensemaking', 'philosophy', 'strategic-reasoning');
      `);

      // ============ MIGRATE: Remove deprecated menu items ============
      await client.query(`
        DELETE FROM menu_items WHERE key = 'projects-overview';
        DELETE FROM menu_items WHERE key = 'business-service-studio';
        DELETE FROM menu_items WHERE key = 'governance-studio';
        DELETE FROM menu_items WHERE key = 'risk-studio';
        DELETE FROM menu_items WHERE key = 'performance-studio';
        DELETE FROM page_registry WHERE path = '/navigation/projects-overview';
      `);

      // ============ MIGRATE: Fix Knowledge Studio URL ============
      await client.query(`
        UPDATE menu_items SET href = '/knowledge-studio' WHERE key = 'knowledge-studio';
      `);

      // Update menu configs to remove deprecated items
      await client.query(`
        UPDATE menu_config_default
        SET config = (
          SELECT jsonb_set(
            config,
            '{sections}',
            (
              SELECT jsonb_agg(
                jsonb_set(
                  section,
                  '{items}',
                  (SELECT COALESCE(jsonb_agg(item), '[]'::jsonb)
                   FROM jsonb_array_elements(section->'items') item
                   WHERE item->>'key' NOT IN ('projects-overview', 'business-service-studio', 'governance-studio', 'risk-studio', 'performance-studio'))
                )
              )
              FROM jsonb_array_elements(config->'sections') section
            )
          )
        )
        WHERE config::text LIKE '%projects-overview%'
           OR config::text LIKE '%business-service-studio%'
           OR config::text LIKE '%governance-studio%'
           OR config::text LIKE '%risk-studio%'
           OR config::text LIKE '%performance-studio%';
      `);

      // ============ SEED DEFAULT MENU CONFIG ============
      await client.query(`
        INSERT INTO menu_config_default (version, config, is_active, created_by)
        SELECT 1, $1::jsonb, true, 'admin'
        WHERE NOT EXISTS (SELECT 1 FROM menu_config_default WHERE is_active = true);
      `, [JSON.stringify({
        version: 1,
        sections: [
          {
            key: 'navigation',
            label: 'Navigation',
            expanded: true,
            items: [
              { key: 'product', label: 'Product' }
            ]
          },
          {
            key: 'knowledge',
            label: 'Knowledge',
            expanded: true,
            items: [
              { key: 'knowledge-studio', label: 'Knowledge Studio' }
            ]
          },
          {
            key: 'workspace',
            label: 'Workspaces',
            expanded: true,
            items: [
              { key: 'organisation-studio', label: 'Organisation Studio' },
              { key: 'product-design', label: 'Product Design' },
              { key: 'requirements-studio', label: 'Requirements Studio' },
              { key: 'enterprise-architecture', label: 'Enterprise Architecture' },
              { key: 'diagram-studio', label: 'Diagram Studio' },
              { key: 'change-studio', label: 'Change Studio' }
            ]
          },
          {
            key: 'reasoning',
            label: 'Reasoning',
            expanded: true,
            items: [
              { key: 'system-dynamics', label: 'System Dynamics' },
              { key: 'work-design', label: 'Work Design' },
              { key: 'learning', label: 'Learning Studio' }
            ]
          }
        ]
      })]);

      // ============ SEED PAGE REGISTRY ============
      await client.query(`
        INSERT INTO page_registry (path, name, category, section, description, default_roles, sort_order) VALUES
          ('/', 'Landing', 'Public', NULL, 'Public landing page', '{}', 0),
          ('/login', 'Login', 'Public', NULL, 'Login page', '{}', 1),
          ('/navigation/home', 'Home', 'Navigation', 'navigation', 'Dashboard home', '{admin,editor,viewer}', 10),
          ('/knowledge-studio', 'Knowledge Studio', 'Knowledge', 'knowledge', 'Knowledge graph explorer', '{admin,editor,viewer}', 20),
          ('/graphnavigator', 'Graph Navigator', 'Knowledge', 'knowledge', 'Visual graph exploration', '{admin,editor,viewer}', 21),
          ('/graph-editor', 'Graph Editor', 'Knowledge', 'knowledge', 'Create and edit nodes', '{admin,editor,viewer}', 22),
          ('/graph/nodes', 'Node Browser', 'Knowledge', 'knowledge', 'Browse and manage nodes', '{admin,editor,viewer}', 21),
          ('/graph/node-types', 'Node Types', 'Knowledge', 'knowledge', 'Define node types', '{admin,editor,viewer}', 22),
          ('/graph/relationships', 'Relationships', 'Knowledge', 'knowledge', 'Manage relationships', '{admin,editor,viewer}', 23),
          ('/app/workspaces/enterprise-architecture', 'EA Studio', 'Workspaces', 'workspaces', 'Enterprise Architecture workspace', '{admin,editor,viewer}', 30),
          ('/app/workspaces/product-design', 'Product Design', 'Workspaces', 'workspaces', 'Product Design workspace', '{admin,editor,viewer}', 31),
          ('/app/workspaces/diagram', 'Diagram Workspace', 'Workspaces', 'workspaces', 'Diagramming tool', '{admin,editor,viewer}', 32),
          ('/app/workspaces/requirements', 'Requirements Studio', 'Workspaces', 'workspaces', 'Requirements management', '{admin,editor,viewer}', 33),
          ('/app/workspaces/change-management', 'Change Studio', 'Workspaces', 'workspaces', 'Change Management workspace', '{admin,editor,viewer}', 34),
          ('/app/reasoning/system-dynamics', 'System Dynamics', 'Reasoning', 'reasoning', 'System dynamics modeling', '{admin,editor,viewer}', 40),
          ('/app/reasoning/dynamic-work-design', 'Dynamic Work Design', 'Reasoning', 'reasoning', 'Work design analysis', '{admin,editor,viewer}', 41),
          ('/app/reasoning/negotiation', 'N&P Studio', 'Reasoning', 'reasoning', 'Negotiation & Persuasion sensemaking', '{admin,editor,viewer}', 42),
          ('/app/reasoning/sensemaking', 'Sensemaking Studio', 'Reasoning', 'reasoning', 'Mental models and sensemaking', '{admin,editor,viewer}', 43),
          ('/app/reasoning/learning', 'Learning Studio', 'Reasoning', 'reasoning', 'Academic learning and meta-cognition', '{admin,editor,viewer}', 44),
          ('/philosophy-studio', 'Philosophy Studio', 'Reasoning', 'reasoning', 'Philosophical and critical thinking workspace', '{admin,editor,viewer}', 45),
          ('/strategic-reasoning', 'Strategic Reasoning', 'Reasoning', 'reasoning', 'Strategic reasoning and decision sensemaking workspace', '{admin,editor,viewer}', 46),
          ('/sitemap', 'Sitemap', 'Help', 'help', 'Site navigation map', '{admin,editor,viewer}', 90),
          ('/admin/users', 'User Management', 'Admin', 'admin', 'Manage users and permissions', '{admin}', 100)
        ON CONFLICT (path) DO NOTHING;
      `);

      // ============ ADD NEW PAGES TO REGISTRY (migrations) ============
      // Portfolio Studio - added after initial seed
      await client.query(`
        INSERT INTO page_registry (path, name, category, section, description, default_roles, sort_order)
        VALUES ('/app/workspaces/portfolio', 'Portfolio Studio', 'Workspaces', 'workspaces', 'Investment portfolio and initiative management', '{admin,editor,viewer}', 35)
        ON CONFLICT (path) DO NOTHING;
      `);

      // ============ SEED DEFAULT DOCUMENT TEMPLATES ============
      await client.query(`
        INSERT INTO document_templates (id, name, description, document_type, content, artefact_types, is_system)
        VALUES
          ('stakeholder-requirements', 'Stakeholder Requirements Document', 'Template for capturing stakeholder needs and requirements', 'stakeholder-requirements',
           '[{"type":"heading1","content":"Stakeholder Requirements Document"},{"type":"heading2","content":"1. Document Information"},{"type":"table","columns":["Field","Value"],"rows":[["Project",""],["Version","1.0"],["Status","Draft"],["Author",""],["Date",""]]},{"type":"heading2","content":"2. Introduction"},{"type":"paragraph","content":"This document captures the requirements from stakeholders for the project."},{"type":"heading2","content":"3. Stakeholders"},{"type":"artefactTable","filters":{"artefactType":"StakeholderRequirement"}},{"type":"heading2","content":"4. Requirements Summary"},{"type":"paragraph","content":""},{"type":"heading2","content":"5. Traceability"},{"type":"embeddedDiagram","diagramType":"trace"}]'::jsonb,
           '["StakeholderRequirement"]'::jsonb, true),

          ('user-stories', 'User Story Specification', 'Template for documenting user stories with acceptance criteria', 'user-stories',
           '[{"type":"heading1","content":"User Story Specification"},{"type":"heading2","content":"Epic Overview"},{"type":"embeddedArtefact","artefactType":"Epic"},{"type":"heading2","content":"User Stories"},{"type":"artefactTable","filters":{"artefactType":"UserStory"}},{"type":"heading2","content":"Acceptance Criteria"},{"type":"table","columns":["Story","Given","When","Then","Status"],"rows":[]},{"type":"heading2","content":"Dependencies"},{"type":"paragraph","content":""}]'::jsonb,
           '["UserStory","Epic"]'::jsonb, true),

          ('brd', 'Business Requirements Document', 'Comprehensive BRD template following BABOK standards', 'brd',
           '[{"type":"heading1","content":"Business Requirements Document"},{"type":"heading2","content":"Executive Summary"},{"type":"paragraph","content":""},{"type":"heading2","content":"Business Need"},{"type":"embeddedArtefact","artefactType":"BusinessNeed"},{"type":"heading2","content":"Business Requirements"},{"type":"artefactTable","filters":{"artefactType":"BusinessRequirement"}},{"type":"heading2","content":"Solution Requirements"},{"type":"heading3","content":"Functional Requirements"},{"type":"artefactTable","filters":{"artefactType":"SolutionRequirement","category":"functional"}},{"type":"heading3","content":"Non-Functional Requirements"},{"type":"artefactTable","filters":{"artefactType":"SolutionRequirement","category":"non-functional"}},{"type":"heading2","content":"Assumptions and Constraints"},{"type":"artefactTable","filters":{"artefactType":"Assumption"}},{"type":"artefactTable","filters":{"artefactType":"Constraint"}}]'::jsonb,
           '["BusinessNeed","BusinessRequirement","SolutionRequirement","Assumption","Constraint"]'::jsonb, true),

          ('capability-map', 'Capability to Requirements Map', 'Shows capabilities and their driving requirements with traceability', 'capability-map',
           '[{"type":"heading1","content":"Capability to Requirements Mapping"},{"type":"heading2","content":"Overview"},{"type":"embeddedDiagram","diagramType":"strategy-map"},{"type":"heading2","content":"Capabilities"},{"type":"artefactTable","filters":{"artefactType":"Capability"}},{"type":"heading2","content":"Traceability Matrix"},{"type":"table","columns":["Capability","Requirements","Features","Coverage"],"rows":[]}]'::jsonb,
           '["Capability","BusinessRequirement","Feature"]'::jsonb, true),

          ('solution-design', 'Solution Design Document', 'Technical solution design with architecture and specifications', 'solution-design',
           '[{"type":"heading1","content":"Solution Design Document"},{"type":"heading2","content":"1. Overview"},{"type":"paragraph","content":""},{"type":"heading2","content":"2. Architecture"},{"type":"embeddedDiagram","diagramType":"architecture"},{"type":"heading2","content":"3. Components"},{"type":"artefactTable","filters":{"artefactType":"Application"}},{"type":"heading2","content":"4. Data Model"},{"type":"artefactTable","filters":{"artefactType":"BusinessObject"}},{"type":"heading2","content":"5. Non-Functional Requirements"},{"type":"artefactTable","filters":{"artefactType":"SolutionRequirement","category":"non-functional"}},{"type":"heading2","content":"6. Technical Constraints"},{"type":"artefactTable","filters":{"artefactType":"Constraint"}}]'::jsonb,
           '["Application","BusinessObject","SolutionRequirement","Constraint"]'::jsonb, true)
        ON CONFLICT (id) DO NOTHING;
      `);

      // ============ MIGRATE: Add display_id for business-readable URLs ============
      // Add display_id column to domains (DOM-0001 format)
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'domains' AND column_name = 'display_id') THEN
            ALTER TABLE domains ADD COLUMN display_id TEXT UNIQUE;
            CREATE INDEX IF NOT EXISTS idx_domains_display_id ON domains(display_id);
          END IF;
        END $$;
      `);

      // Add display_id column to projects (PRJ-0001 format)
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'display_id') THEN
            ALTER TABLE projects ADD COLUMN display_id TEXT UNIQUE;
            CREATE INDEX IF NOT EXISTS idx_projects_display_id ON projects(display_id);
          END IF;
        END $$;
      `);

      // Create sequences for display IDs
      await client.query(`CREATE SEQUENCE IF NOT EXISTS domain_display_seq START 1;`);
      await client.query(`CREATE SEQUENCE IF NOT EXISTS project_display_seq START 1;`);

      // Create trigger function for domain display_id
      await client.query(`
        CREATE OR REPLACE FUNCTION generate_domain_display_id()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NEW.display_id IS NULL THEN
            NEW.display_id := 'DOM-' || LPAD(nextval('domain_display_seq')::text, 4, '0');
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Create trigger function for project display_id
      await client.query(`
        CREATE OR REPLACE FUNCTION generate_project_display_id()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NEW.display_id IS NULL THEN
            NEW.display_id := 'PRJ-' || LPAD(nextval('project_display_seq')::text, 4, '0');
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Create triggers (drop first to avoid duplicate)
      await client.query(`
        DROP TRIGGER IF EXISTS domain_display_id_trigger ON domains;
        CREATE TRIGGER domain_display_id_trigger
          BEFORE INSERT ON domains
          FOR EACH ROW EXECUTE FUNCTION generate_domain_display_id();
      `);

      await client.query(`
        DROP TRIGGER IF EXISTS project_display_id_trigger ON projects;
        CREATE TRIGGER project_display_id_trigger
          BEFORE INSERT ON projects
          FOR EACH ROW EXECUTE FUNCTION generate_project_display_id();
      `);

      // Backfill existing domains with display_id
      await client.query(`
        WITH numbered AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
          FROM domains
          WHERE display_id IS NULL
        )
        UPDATE domains d
        SET display_id = 'DOM-' || LPAD(n.rn::text, 4, '0')
        FROM numbered n
        WHERE d.id = n.id;
      `);

      // Backfill existing projects with display_id
      await client.query(`
        WITH numbered AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
          FROM projects
          WHERE display_id IS NULL
        )
        UPDATE projects p
        SET display_id = 'PRJ-' || LPAD(n.rn::text, 4, '0')
        FROM numbered n
        WHERE p.id = n.id;
      `);

      // Reset sequences to continue from max
      await client.query(`
        SELECT setval('domain_display_seq',
          COALESCE((SELECT MAX(SUBSTRING(display_id FROM 5)::int) FROM domains WHERE display_id IS NOT NULL), 0) + 1,
          false
        );
      `);

      await client.query(`
        SELECT setval('project_display_seq',
          COALESCE((SELECT MAX(SUBSTRING(display_id FROM 5)::int) FROM projects WHERE display_id IS NOT NULL), 0) + 1,
          false
        );
      `);

      // ============ DIAGRAM STUDIO TABLES ============

      // Workspaces for diagram organization
      await client.query(`
        CREATE TABLE IF NOT EXISTS diagram_workspaces (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          settings JSONB DEFAULT '{}'::jsonb,
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      await client.query(`CREATE INDEX IF NOT EXISTS idx_diagram_workspaces_domain ON diagram_workspaces(domain_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_diagram_workspaces_created_by ON diagram_workspaces(created_by);`);

      // Workspace membership
      await client.query(`
        CREATE TABLE IF NOT EXISTS diagram_workspace_members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          workspace_id UUID NOT NULL REFERENCES diagram_workspaces(id) ON DELETE CASCADE,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'guest')),
          invited_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          invited_at TIMESTAMPTZ DEFAULT now(),
          accepted_at TIMESTAMPTZ,
          UNIQUE(workspace_id, user_id)
        );
      `);

      await client.query(`CREATE INDEX IF NOT EXISTS idx_diagram_workspace_members_user ON diagram_workspace_members(user_id);`);

      // Boards (collaborative diagrams)
      await client.query(`
        CREATE TABLE IF NOT EXISTS boards (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          workspace_id UUID REFERENCES diagram_workspaces(id) ON DELETE SET NULL,
          domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          thumbnail TEXT,
          settings JSONB DEFAULT '{
            "gridEnabled": true,
            "gridSize": 20,
            "snapToGrid": true,
            "snapThreshold": 8,
            "backgroundColor": "#ffffff",
            "defaultPack": "process-flow"
          }'::jsonb,
          is_template BOOLEAN DEFAULT false,
          template_category VARCHAR(100),
          created_by TEXT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      await client.query(`CREATE INDEX IF NOT EXISTS idx_boards_workspace ON boards(workspace_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_boards_domain ON boards(domain_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_boards_created_by ON boards(created_by);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_boards_is_template ON boards(is_template);`);

      // Board membership and access control
      await client.query(`
        CREATE TABLE IF NOT EXISTS board_members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'editor', 'commenter', 'viewer')),
          invited_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          invited_at TIMESTAMPTZ DEFAULT now(),
          UNIQUE(board_id, user_id)
        );
      `);

      await client.query(`CREATE INDEX IF NOT EXISTS idx_board_members_user ON board_members(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_board_members_board ON board_members(board_id);`);

      // CRDT snapshots for fast board loading
      await client.query(`
        CREATE TABLE IF NOT EXISTS board_snapshots (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
          sequence BIGINT NOT NULL,
          snapshot BYTEA NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `);

      await client.query(`CREATE INDEX IF NOT EXISTS idx_board_snapshots_board_seq ON board_snapshots(board_id, sequence DESC);`);

      // CRDT incremental updates
      await client.query(`
        CREATE TABLE IF NOT EXISTS board_updates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
          sequence BIGINT NOT NULL,
          update_data BYTEA NOT NULL,
          user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `);

      await client.query(`CREATE INDEX IF NOT EXISTS idx_board_updates_board_seq ON board_updates(board_id, sequence);`);

      // Board comments
      await client.query(`
        CREATE TABLE IF NOT EXISTS board_comments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
          parent_id UUID REFERENCES board_comments(id) ON DELETE CASCADE,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          anchor_type VARCHAR(20) CHECK (anchor_type IN ('element', 'position')),
          anchor_element_id VARCHAR(50),
          anchor_position JSONB,
          resolved BOOLEAN DEFAULT false,
          resolved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          resolved_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      await client.query(`CREATE INDEX IF NOT EXISTS idx_board_comments_board ON board_comments(board_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_board_comments_parent ON board_comments(parent_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_board_comments_resolved ON board_comments(resolved);`);

      // Board share links
      await client.query(`
        CREATE TABLE IF NOT EXISTS board_share_links (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
          token VARCHAR(64) UNIQUE NOT NULL,
          role VARCHAR(20) NOT NULL CHECK (role IN ('editor', 'commenter', 'viewer')),
          expires_at TIMESTAMPTZ,
          max_uses INTEGER,
          use_count INTEGER DEFAULT 0,
          created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      await client.query(`CREATE INDEX IF NOT EXISTS idx_board_share_links_token ON board_share_links(token);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_board_share_links_board ON board_share_links(board_id);`);

      // Board version history
      await client.query(`
        CREATE TABLE IF NOT EXISTS board_versions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
          version_number INTEGER NOT NULL,
          name VARCHAR(255),
          description TEXT,
          snapshot BYTEA NOT NULL,
          thumbnail TEXT,
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      await client.query(`CREATE INDEX IF NOT EXISTS idx_board_versions_board ON board_versions(board_id, version_number DESC);`);

      // ============ END DIAGRAM STUDIO TABLES ============

      // ============ RBAC (Role-Based Access Control) TABLES ============

      // User roles - stores role assignments for users at different scopes
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('super_admin', 'domain_admin', 'project_admin', 'editor', 'viewer')),
          scope TEXT NOT NULL CHECK (scope IN ('system', 'domain', 'project')),
          domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          assigned_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(user_id, scope, COALESCE(domain_id::text, ''), COALESCE(project_id::text, ''))
        );
      `);

      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_roles_scope ON user_roles(scope);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_roles_domain ON user_roles(domain_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_roles_project ON user_roles(project_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);`);

      // Space access - granular space-level access control
      await client.query(`
        CREATE TABLE IF NOT EXISTS space_access (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          space_code TEXT NOT NULL,
          access_level TEXT NOT NULL CHECK (access_level IN ('none', 'view', 'edit', 'admin')),
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
          granted_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(user_id, space_code, COALESCE(project_id::text, ''))
        );
      `);

      await client.query(`CREATE INDEX IF NOT EXISTS idx_space_access_user ON space_access(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_space_access_space ON space_access(space_code);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_space_access_project ON space_access(project_id);`);

      // Role audit log - track role changes for compliance
      await client.query(`
        CREATE TABLE IF NOT EXISTS role_audit_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          action TEXT NOT NULL CHECK (action IN ('assign', 'remove', 'change')),
          user_id TEXT NOT NULL,
          target_user_id TEXT NOT NULL,
          old_role TEXT,
          new_role TEXT,
          scope TEXT NOT NULL,
          context_id TEXT,
          ip_address TEXT,
          user_agent TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      await client.query(`CREATE INDEX IF NOT EXISTS idx_role_audit_log_user ON role_audit_log(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_role_audit_log_target ON role_audit_log(target_user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_role_audit_log_created ON role_audit_log(created_at DESC);`);

      // ============ END RBAC TABLES ============

      // ============ EA CROSS-REFERENCES TABLE (Aggregation Hub) ============
      // Stores cross-references from source spaces (CAP, BA, PORTFOLIO, PDS, PERF) into EA
      await client.query(`
        CREATE TABLE IF NOT EXISTS ea_cross_references (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
          source_space_code TEXT NOT NULL CHECK (source_space_code IN ('CAP', 'BA', 'PORTFOLIO', 'PDS', 'PERF')),
          source_artefact_id UUID NOT NULL REFERENCES artefacts(id) ON DELETE CASCADE,
          source_artefact_type TEXT NOT NULL,
          source_artefact_name TEXT NOT NULL,
          ea_layer TEXT CHECK (ea_layer IN ('Strategy', 'Motivation', 'Business', 'Application', 'Technology', 'Implementation', 'Other')),
          ea_element_type TEXT,
          ea_element_id UUID REFERENCES ea_elements(id) ON DELETE SET NULL,
          sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('synced', 'stale', 'deleted')),
          last_synced_at TIMESTAMPTZ DEFAULT now(),
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(domain_id, source_artefact_id)
        );
      `);

      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_cross_refs_domain ON ea_cross_references(domain_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_cross_refs_source_space ON ea_cross_references(source_space_code);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_cross_refs_source_artefact ON ea_cross_references(source_artefact_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_cross_refs_ea_element ON ea_cross_references(ea_element_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_cross_refs_ea_layer ON ea_cross_references(ea_layer);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ea_cross_refs_sync_status ON ea_cross_references(sync_status);`);

      // ============ END EA CROSS-REFERENCES TABLE ============

      // seed core domain (admin user already seeded earlier)
      await client.query(
        `
        INSERT INTO domains (id, name, notes, owner)
        VALUES (gen_random_uuid(), 'core', 'Default workspace', 'admin')
        ON CONFLICT DO NOTHING;
      `
      );
      await client.query(
        `
        INSERT INTO domain_members (domain_id, user_id, role)
        SELECT d.id, 'admin', 'owner' FROM domains d WHERE d.name = 'core'
        ON CONFLICT DO NOTHING;
      `
      );
      await client.query('COMMIT');

      // NOTE: Removed dangerous dedupe query that was deleting domains and cascading to projects
      // If domain deduplication is needed, it should be done manually with proper backup

      await client.query(
        `
        INSERT INTO domain_members (domain_id, user_id, role)
        SELECT d.id, 'admin', 'owner' FROM domains d WHERE d.name = 'core'
        ON CONFLICT DO NOTHING;
      `
      );
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Failed to init schema', err);
      throw err;
    } finally {
      client.release();
    }
  })();
  return initPromise;
}

export async function query(text, params) {
  await initSchema();
  return pool.query(text, params);
}

export async function getClient() {
  await initSchema();
  return pool.connect();
}

/**
 * Execute a function within a database transaction
 * @param {function(client): Promise<any>} fn - Function to execute with client
 * @returns {Promise<any>} Result of the function
 */
export async function withTransaction(fn) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
