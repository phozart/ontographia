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
          type TEXT NOT NULL CHECK (type IN ('cld', 'stock-flow', 'system-dynamics', 'ea', 'bpmn', 'uml', 'requirements')),
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
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

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

      // seed admin/admin
      const adminHash = bcrypt.hashSync('admin', 10);
      await client.query(
        `
        INSERT INTO users (id, username, password_hash, role)
        VALUES ('admin', 'admin', $1, 'admin')
        ON CONFLICT (id) DO NOTHING;
      `,
        [adminHash]
      );

      // seed core domain
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

      // dedupe domains by name (keep oldest)
      await client.query(`
        DELETE FROM domains d
        USING domains d2
        WHERE d.name = d2.name AND d.created_at > d2.created_at;
      `);
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
