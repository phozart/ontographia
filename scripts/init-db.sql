-- =============================================================================
-- Ontographia V2 - Database Initialization Script
-- Per ADR-003: PostgreSQL + JSONB for graph storage
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- Core Tables
-- =============================================================================

-- Domains (Organizations/Tenants)
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects within Domains
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(domain_id, name)
);

CREATE INDEX idx_projects_domain ON projects(domain_id);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'viewer',
    experience_level VARCHAR(50) DEFAULT 'novice',
    xp_points INTEGER DEFAULT 0,
    login_count INTEGER DEFAULT 0,
    last_login_at TIMESTAMPTZ,
    personal_domain_id UUID,
    oauth_provider VARCHAR(50),
    oauth_provider_id VARCHAR(255),
    settings JSONB DEFAULT '{"coachingEnabled": true, "coachingLevel": "detailed", "theme": "system"}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- User-Domain membership
CREATE TABLE IF NOT EXISTS user_domains (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, domain_id)
);

-- =============================================================================
-- Graph Tables (Nodes and Relationships)
-- =============================================================================

-- Nodes (Artefacts from all spaces)
CREATE TABLE IF NOT EXISTS nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    space VARCHAR(50) NOT NULL,  -- 'ba', 'ea', 'srs', 'pds', 'cap', etc.
    type VARCHAR(100) NOT NULL,  -- 'business_requirement', 'capability', etc.
    properties JSONB NOT NULL DEFAULT '{}',
    search_text TSVECTOR,  -- Full-text search vector
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nodes_project ON nodes(project_id);
CREATE INDEX idx_nodes_space ON nodes(space);
CREATE INDEX idx_nodes_type ON nodes(type);
CREATE INDEX idx_nodes_project_space ON nodes(project_id, space);
CREATE INDEX idx_nodes_properties ON nodes USING GIN (properties);
CREATE INDEX idx_nodes_search ON nodes USING GIN (search_text);

-- Relationships (Links between nodes)
CREATE TABLE IF NOT EXISTS relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,  -- 'TRACES_TO', 'REALIZES', 'DERIVES_FROM', etc.
    properties JSONB DEFAULT '{}',
    is_cross_space BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_id, target_id, type)
);

CREATE INDEX idx_relationships_source ON relationships(source_id);
CREATE INDEX idx_relationships_target ON relationships(target_id);
CREATE INDEX idx_relationships_type ON relationships(type);
CREATE INDEX idx_relationships_cross_space ON relationships(is_cross_space) WHERE is_cross_space = TRUE;

-- =============================================================================
-- SRS Session Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS srs_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    node_id UUID UNIQUE REFERENCES nodes(id) ON DELETE CASCADE,  -- Link to node graph
    title VARCHAR(255) NOT NULL,
    situation TEXT,
    status VARCHAR(50) DEFAULT 'active',  -- active, paused, concluded, archived
    decision_readiness INTEGER DEFAULT 0,  -- 0-100
    started_at TIMESTAMPTZ DEFAULT NOW(),
    concluded_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_srs_sessions_project ON srs_sessions(project_id);
CREATE INDEX idx_srs_sessions_status ON srs_sessions(status);

-- =============================================================================
-- Learning & Coaching Tables
-- =============================================================================

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    xp_reward INTEGER DEFAULT 0,
    icon VARCHAR(50),
    criteria JSONB DEFAULT '{}'
);

-- User achievements (unlocked)
CREATE TABLE IF NOT EXISTS user_achievements (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

-- Coaching messages dismissed
CREATE TABLE IF NOT EXISTS coaching_dismissals (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    dismiss_key VARCHAR(255) NOT NULL,
    dismissed_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, dismiss_key)
);

-- Research prompts generated
CREATE TABLE IF NOT EXISTS research_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    artefact_id UUID REFERENCES nodes(id) ON DELETE SET NULL,
    space VARCHAR(50) NOT NULL,
    trigger VARCHAR(100) NOT NULL,
    template_id VARCHAR(100),
    rendered_prompt TEXT NOT NULL,
    researched_at TIMESTAMPTZ,
    researched_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prompts_project ON research_prompts(project_id);
CREATE INDEX idx_prompts_artefact ON research_prompts(artefact_id);

-- =============================================================================
-- Event Store (for Event Sourcing support)
-- =============================================================================

CREATE TABLE IF NOT EXISTS domain_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id UUID NOT NULL,
    version INTEGER NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    correlation_id UUID,
    causation_id UUID,
    metadata JSONB DEFAULT '{}',
    payload JSONB NOT NULL,
    UNIQUE(aggregate_id, version)
);

CREATE INDEX idx_events_aggregate ON domain_events(aggregate_id);
CREATE INDEX idx_events_type ON domain_events(event_type);
CREATE INDEX idx_events_timestamp ON domain_events(timestamp);
CREATE INDEX idx_events_correlation ON domain_events(correlation_id);

-- =============================================================================
-- Functions
-- =============================================================================

-- Update search_text on node insert/update
CREATE OR REPLACE FUNCTION update_node_search_text()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_text := to_tsvector('english',
        COALESCE(NEW.properties->>'title', '') || ' ' ||
        COALESCE(NEW.properties->>'name', '') || ' ' ||
        COALESCE(NEW.properties->>'description', '') || ' ' ||
        COALESCE(NEW.properties->>'content', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_node_search ON nodes;
CREATE TRIGGER trigger_update_node_search
    BEFORE INSERT OR UPDATE ON nodes
    FOR EACH ROW
    EXECUTE FUNCTION update_node_search_text();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS trigger_update_domains_updated ON domains;
CREATE TRIGGER trigger_update_domains_updated
    BEFORE UPDATE ON domains
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_projects_updated ON projects;
CREATE TRIGGER trigger_update_projects_updated
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_users_updated ON users;
CREATE TRIGGER trigger_update_users_updated
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_nodes_updated ON nodes;
CREATE TRIGGER trigger_update_nodes_updated
    BEFORE UPDATE ON nodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- Initial Data (Achievements)
-- =============================================================================

INSERT INTO achievements (code, name, description, category, xp_reward, icon) VALUES
    ('first-artefact', 'First Steps', 'Created your first artefact', 'general', 10, 'star'),
    ('first-trace', 'Connected Thinking', 'Created your first relationship', 'general', 15, 'link'),
    ('cross-space-link', 'Bridge Builder', 'Linked artefacts across different spaces', 'integration', 25, 'bridge'),
    ('ba-first-req', 'Requirements Pioneer', 'Created your first requirement in BA space', 'ba', 10, 'document'),
    ('ba-traced-req', 'Traceability Pro', 'Traced a requirement to implementation', 'ba', 20, 'trace'),
    ('ea-first-element', 'Architecture Initiate', 'Created your first EA element', 'ea', 10, 'building'),
    ('ea-import', 'Integration Master', 'Imported an artefact from another space into EA', 'ea', 25, 'import'),
    ('srs-first-session', 'Strategic Thinker', 'Started your first reasoning session', 'srs', 10, 'brain'),
    ('srs-concluded', 'Decision Maker', 'Concluded a reasoning session', 'srs', 20, 'check'),
    ('pds-project-started', 'Project Initiator', 'Started a project design', 'pds', 10, 'rocket'),
    ('pds-risk-identified', 'Risk Aware', 'Identified your first project risk', 'pds', 15, 'warning'),
    ('cap-capability-created', 'Capability Mapper', 'Created your first capability', 'cap', 10, 'map'),
    ('coaching-engaged', 'Eager Learner', 'Engaged with coaching 10 times', 'learning', 30, 'graduation'),
    ('research-completed', 'Curious Mind', 'Completed 5 research prompts', 'learning', 25, 'search')
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- Comments for documentation
-- =============================================================================

COMMENT ON TABLE nodes IS 'Core graph table storing all artefacts from all spaces';
COMMENT ON TABLE relationships IS 'Graph edges connecting nodes, supports cross-space links';
COMMENT ON TABLE domain_events IS 'Event store for Event Sourcing pattern';
COMMENT ON COLUMN nodes.space IS 'Space identifier: ba, ea, srs, pds, cap, portfolio, etc.';
COMMENT ON COLUMN nodes.properties IS 'Space-specific properties stored as JSONB';
COMMENT ON COLUMN nodes.search_text IS 'Automatically populated tsvector for full-text search';

-- =============================================================================
-- Row-Level Security (RLS) Policies
-- SEC-001: Multi-tenant data isolation
-- =============================================================================

-- Enable RLS on all tenant-scoped tables
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE srs_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_prompts ENABLE ROW LEVEL SECURITY;

-- Create app role for application connections
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ontographia_app') THEN
        CREATE ROLE ontographia_app;
    END IF;
END
$$;

-- Users can only see domains they belong to
CREATE POLICY domain_isolation ON domains
    FOR ALL
    TO ontographia_app
    USING (
        id IN (
            SELECT domain_id FROM user_domains
            WHERE user_id = current_setting('app.current_user_id', true)::uuid
        )
    );

-- Projects visible only within user's domains
CREATE POLICY project_isolation ON projects
    FOR ALL
    TO ontographia_app
    USING (
        domain_id IN (
            SELECT domain_id FROM user_domains
            WHERE user_id = current_setting('app.current_user_id', true)::uuid
        )
    );

-- Nodes visible only within user's projects
CREATE POLICY node_isolation ON nodes
    FOR ALL
    TO ontographia_app
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN user_domains ud ON p.domain_id = ud.domain_id
            WHERE ud.user_id = current_setting('app.current_user_id', true)::uuid
        )
    );

-- Relationships visible if both source and target nodes are visible
CREATE POLICY relationship_isolation ON relationships
    FOR ALL
    TO ontographia_app
    USING (
        source_id IN (
            SELECT n.id FROM nodes n
            JOIN projects p ON n.project_id = p.id
            JOIN user_domains ud ON p.domain_id = ud.domain_id
            WHERE ud.user_id = current_setting('app.current_user_id', true)::uuid
        )
    );

-- SRS sessions visible within user's projects
CREATE POLICY srs_session_isolation ON srs_sessions
    FOR ALL
    TO ontographia_app
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN user_domains ud ON p.domain_id = ud.domain_id
            WHERE ud.user_id = current_setting('app.current_user_id', true)::uuid
        )
    );

-- Research prompts visible within user's projects
CREATE POLICY research_prompt_isolation ON research_prompts
    FOR ALL
    TO ontographia_app
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN user_domains ud ON p.domain_id = ud.domain_id
            WHERE ud.user_id = current_setting('app.current_user_id', true)::uuid
        )
    );

-- Grant permissions to app role
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ontographia_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ontographia_app;

-- =============================================================================
-- V1 Compatibility Tables (Required for existing codebase)
-- These tables ensure compatibility with V1 code that expects TEXT user IDs
-- =============================================================================

-- Add missing columns to users table for V1 compatibility
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'viewer';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS personal_domain_id UUID REFERENCES domains(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider_id VARCHAR(255);

-- Create unique index for OAuth provider lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_oauth_provider
    ON users(oauth_provider, oauth_provider_id)
    WHERE oauth_provider IS NOT NULL AND oauth_provider_id IS NOT NULL;

-- Add missing columns to domains table
ALTER TABLE domains ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE domains ADD COLUMN IF NOT EXISTS owner TEXT;
ALTER TABLE domains ADD COLUMN IF NOT EXISTS display_id TEXT UNIQUE;

-- Create sequence for domain display IDs if not exists
CREATE SEQUENCE IF NOT EXISTS domain_display_id_seq START 1;

-- Function to generate domain display ID
CREATE OR REPLACE FUNCTION generate_domain_display_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.display_id IS NULL THEN
        NEW.display_id := 'DOM-' || LPAD(nextval('domain_display_id_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate display_id on insert
DROP TRIGGER IF EXISTS trigger_domain_display_id ON domains;
CREATE TRIGGER trigger_domain_display_id
    BEFORE INSERT ON domains
    FOR EACH ROW
    EXECUTE FUNCTION generate_domain_display_id();

-- Backfill existing domains without display_id
UPDATE domains d
SET display_id = sub.new_display_id
FROM (
    SELECT id, 'DOM-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 4, '0') AS new_display_id
    FROM domains
    WHERE display_id IS NULL
) sub
WHERE d.id = sub.id AND d.display_id IS NULL;

-- Reset sequence to be after highest existing display_id
SELECT setval('domain_display_id_seq',
    COALESCE((SELECT MAX(SUBSTRING(display_id FROM 5)::INTEGER) FROM domains WHERE display_id LIKE 'DOM-%'), 0)
);

-- Domain Members table (V1 uses TEXT for user_id)
CREATE TABLE IF NOT EXISTS domain_members (
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',
    PRIMARY KEY (domain_id, user_id)
);

-- =============================================================================
-- Page Registry & Permissions (RBAC)
-- =============================================================================

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

CREATE INDEX IF NOT EXISTS idx_page_registry_category ON page_registry(category);

CREATE TABLE IF NOT EXISTS user_page_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    page_path TEXT NOT NULL REFERENCES page_registry(path) ON DELETE CASCADE,
    can_access BOOLEAN DEFAULT true,
    granted_by TEXT,
    granted_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, page_path)
);

CREATE INDEX IF NOT EXISTS idx_user_page_permissions_user ON user_page_permissions(user_id);

-- =============================================================================
-- Menu Configuration Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE TABLE IF NOT EXISTS menu_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    is_system BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_config_default (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version INTEGER DEFAULT 1,
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_config_user (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    config JSONB NOT NULL,
    based_on_version INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_menu_items_section ON menu_items(default_section);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_config_default_active ON menu_config_default(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_config_user_user ON menu_config_user(user_id);

-- =============================================================================
-- Diagrams Table (for System Dynamics, EA, BPMN, UML, etc.)
-- =============================================================================

CREATE TABLE IF NOT EXISTS diagrams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    user_id TEXT,
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

CREATE INDEX IF NOT EXISTS idx_diagrams_user_id ON diagrams(user_id);
CREATE INDEX IF NOT EXISTS idx_diagrams_domain_id ON diagrams(domain_id);
CREATE INDEX IF NOT EXISTS idx_diagrams_project_id ON diagrams(project_id);
CREATE INDEX IF NOT EXISTS idx_diagrams_type ON diagrams(type);

-- =============================================================================
-- Artefacts & Relationships (BA, EA, Portfolio workspaces)
-- =============================================================================

CREATE TABLE IF NOT EXISTS artefacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    artefact_type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'InReview', 'Approved', 'Deprecated', 'Superseded')),
    architecture_state TEXT DEFAULT 'N/A' CHECK (architecture_state IN ('Baseline', 'Transition', 'Target', 'N/A')),
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    owner_id TEXT,
    version INTEGER DEFAULT 1,
    tags JSONB DEFAULT '[]'::jsonb,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    ticket_status TEXT CHECK (ticket_status IN ('Backlog', 'Ready', 'InProgress', 'InReview', 'Done', 'Blocked')),
    linked_graph_nodes JSONB DEFAULT '[]'::jsonb,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artefacts_project_id ON artefacts(project_id);
CREATE INDEX IF NOT EXISTS idx_artefacts_domain ON artefacts(domain_id);
CREATE INDEX IF NOT EXISTS idx_artefacts_type ON artefacts(artefact_type);
CREATE INDEX IF NOT EXISTS idx_artefacts_status ON artefacts(status);

CREATE TABLE IF NOT EXISTS artefact_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    from_artefact_id UUID REFERENCES artefacts(id) ON DELETE CASCADE,
    to_artefact_id UUID REFERENCES artefacts(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_relationships_project ON artefact_relationships(project_id);
CREATE INDEX IF NOT EXISTS idx_artefact_relationships_domain ON artefact_relationships(domain_id);
CREATE INDEX IF NOT EXISTS idx_relationships_from ON artefact_relationships(from_artefact_id);
CREATE INDEX IF NOT EXISTS idx_relationships_to ON artefact_relationships(to_artefact_id);

-- =============================================================================
-- Documents & Templates
-- =============================================================================

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    artefact_id UUID REFERENCES artefacts(id) ON DELETE SET NULL,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content JSONB DEFAULT '[]'::jsonb,
    template_id TEXT,
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'InReview', 'Published', 'Archived')),
    version INTEGER DEFAULT 1,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    document_type TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '[]'::jsonb,
    artefact_types JSONB DEFAULT '[]'::jsonb,
    is_system BOOLEAN DEFAULT false,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_artefact ON documents(artefact_id);

-- =============================================================================
-- Project Members
-- =============================================================================

CREATE TABLE IF NOT EXISTS project_members (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Business Analyst', 'Product Owner', 'Stakeholder', 'Viewer')),
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    added_by TEXT,
    PRIMARY KEY (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);

-- =============================================================================
-- EA (Enterprise Architecture) Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS ea_elements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    project_id UUID,
    element_type TEXT NOT NULL,
    layer TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    properties JSONB DEFAULT '{}'::jsonb,
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,
    parent_id UUID REFERENCES ea_elements(id) ON DELETE SET NULL,
    maturity TEXT,
    strategic_importance TEXT,
    lifecycle_status TEXT,
    time_quadrant TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ea_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    source_id UUID REFERENCES ea_elements(id) ON DELETE CASCADE,
    target_id UUID REFERENCES ea_elements(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    label TEXT,
    properties JSONB DEFAULT '{}'::jsonb,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ea_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ea_baselines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES ea_projects(id) ON DELETE CASCADE,
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    baseline_type TEXT NOT NULL CHECK (baseline_type IN ('current', 'target', 'transition')),
    baseline_date DATE DEFAULT CURRENT_DATE,
    snapshot JSONB NOT NULL DEFAULT '{"elements":[],"relationships":[]}'::jsonb,
    version INTEGER DEFAULT 1,
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ea_standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ea_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    deciders JSONB DEFAULT '[]'::jsonb,
    date_superseded DATE,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ea_decision_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_id UUID NOT NULL REFERENCES ea_decisions(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
    previous_state JSONB,
    new_state JSONB,
    changes JSONB,
    changed_by TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- EA Indexes
CREATE INDEX IF NOT EXISTS idx_ea_elements_domain ON ea_elements(domain_id);
CREATE INDEX IF NOT EXISTS idx_ea_elements_type ON ea_elements(element_type);
CREATE INDEX IF NOT EXISTS idx_ea_elements_layer ON ea_elements(layer);
CREATE INDEX IF NOT EXISTS idx_ea_elements_parent ON ea_elements(parent_id);
CREATE INDEX IF NOT EXISTS idx_ea_elements_project ON ea_elements(project_id);
CREATE INDEX IF NOT EXISTS idx_ea_relationships_domain ON ea_relationships(domain_id);
CREATE INDEX IF NOT EXISTS idx_ea_relationships_source ON ea_relationships(source_id);
CREATE INDEX IF NOT EXISTS idx_ea_relationships_target ON ea_relationships(target_id);
CREATE INDEX IF NOT EXISTS idx_ea_projects_domain ON ea_projects(domain_id);
CREATE INDEX IF NOT EXISTS idx_ea_projects_status ON ea_projects(status);
CREATE INDEX IF NOT EXISTS idx_ea_baselines_project ON ea_baselines(project_id);
CREATE INDEX IF NOT EXISTS idx_ea_baselines_domain ON ea_baselines(domain_id);
CREATE INDEX IF NOT EXISTS idx_ea_standards_domain ON ea_standards(domain_id);
CREATE INDEX IF NOT EXISTS idx_ea_standards_category ON ea_standards(category);
CREATE INDEX IF NOT EXISTS idx_ea_decisions_project ON ea_decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_ea_decisions_domain ON ea_decisions(domain_id);
CREATE INDEX IF NOT EXISTS idx_ea_decisions_status ON ea_decisions(status);
CREATE INDEX IF NOT EXISTS idx_ea_decision_history_decision ON ea_decision_history(decision_id);

-- =============================================================================
-- EA (Enterprise Architecture) - ArchiMate Extended Tables
-- Models, Views, Building Blocks, Principles, Roadmaps
-- =============================================================================

-- Architecture Models (containers for elements, relationships, views)
CREATE TABLE IF NOT EXISTS ea_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    purpose TEXT,
    scope TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'deprecated')),
    version TEXT DEFAULT '1.0.0',
    previous_version_id UUID REFERENCES ea_models(id) ON DELETE SET NULL,
    owner_id TEXT,
    approver_id TEXT,
    approved_at TIMESTAMPTZ,
    review_date DATE,
    -- Traceability
    linked_initiatives JSONB DEFAULT '[]'::jsonb,
    linked_projects JSONB DEFAULT '[]'::jsonb,
    linked_requirements JSONB DEFAULT '[]'::jsonb,
    -- Organization
    folders JSONB DEFAULT '[]'::jsonb,
    -- Import/Export metadata
    source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'imported')),
    source_format TEXT CHECK (source_format IN ('archimate_exchange', 'open_exchange')),
    source_file TEXT,
    -- Metadata
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Architecture Views (diagram layouts within models)
CREATE TABLE IF NOT EXISTS ea_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES ea_models(id) ON DELETE CASCADE,
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    viewpoint TEXT NOT NULL CHECK (viewpoint IN (
        -- Basic viewpoints
        'organization', 'business_process_cooperation', 'product',
        'application_cooperation', 'application_usage', 'implementation_deployment',
        'technology', 'technology_usage', 'information_structure',
        'service_realization', 'physical', 'layered',
        -- Motivation viewpoints
        'stakeholder', 'goal_realization', 'requirements_realization', 'motivation',
        -- Strategy viewpoints
        'strategy', 'capability_map', 'outcome_realization', 'resource_map',
        -- Implementation viewpoints
        'project', 'migration', 'implementation_migration'
    )),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'deprecated')),
    -- Content (element and relationship placements)
    elements JSONB DEFAULT '[]'::jsonb,
    relationships JSONB DEFAULT '[]'::jsonb,
    groups JSONB DEFAULT '[]'::jsonb,
    notes JSONB DEFAULT '[]'::jsonb,
    -- Canvas settings
    canvas_width INTEGER DEFAULT 2000,
    canvas_height INTEGER DEFAULT 1500,
    grid_size INTEGER DEFAULT 20,
    snap_to_grid BOOLEAN DEFAULT true,
    zoom FLOAT DEFAULT 1.0,
    -- Ownership
    owner_id TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Architecture Building Blocks (ABB - specifications)
CREATE TABLE IF NOT EXISTS ea_building_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    block_type TEXT NOT NULL CHECK (block_type IN ('abb', 'sbb')),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    -- Classification
    domain_category TEXT NOT NULL CHECK (domain_category IN ('business', 'data', 'application', 'technology')),
    category TEXT,
    -- Specification (for ABB)
    purpose TEXT,
    key_features JSONB DEFAULT '[]'::jsonb,
    interfaces JSONB DEFAULT '[]'::jsonb,
    conforms_to JSONB DEFAULT '[]'::jsonb,
    when_to_use TEXT,
    when_not_to_use TEXT,
    considerations JSONB DEFAULT '[]'::jsonb,
    -- Implementation (for SBB)
    realizes_abb_id UUID REFERENCES ea_building_blocks(id) ON DELETE SET NULL,
    implementation_type TEXT CHECK (implementation_type IN ('product', 'service', 'custom')),
    vendor TEXT,
    product_name TEXT,
    product_version TEXT,
    technology_stack JSONB DEFAULT '[]'::jsonb,
    deployment_model TEXT CHECK (deployment_model IN ('cloud', 'on_premise', 'hybrid', 'saas')),
    sbb_interfaces JSONB DEFAULT '[]'::jsonb,
    used_in_applications JSONB DEFAULT '[]'::jsonb,
    licensing_model TEXT,
    estimated_cost JSONB DEFAULT '{}'::jsonb,
    -- Related
    related_blocks JSONB DEFAULT '[]'::jsonb,
    -- Governance
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'deprecated')),
    owner_id TEXT,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Architecture Principles
CREATE TABLE IF NOT EXISTS ea_principles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    -- Classification
    category TEXT NOT NULL CHECK (category IN ('business', 'data', 'application', 'technology', 'security')),
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    -- Content (TOGAF format)
    statement TEXT NOT NULL,
    rationale TEXT NOT NULL,
    implications JSONB DEFAULT '[]'::jsonb,
    -- Governance
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'deprecated')),
    effective_date DATE,
    review_date DATE,
    owner_id TEXT,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    -- Traceability
    supports_goals JSONB DEFAULT '[]'::jsonb,
    constrains_elements JSONB DEFAULT '[]'::jsonb,
    -- Exceptions
    exceptions JSONB DEFAULT '[]'::jsonb,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Architecture Roadmaps
CREATE TABLE IF NOT EXISTS ea_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    model_id UUID REFERENCES ea_models(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    -- Timeframe
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    -- States
    baseline JSONB NOT NULL DEFAULT '{}'::jsonb,
    target JSONB NOT NULL DEFAULT '{}'::jsonb,
    transition_states JSONB DEFAULT '[]'::jsonb,
    -- Gaps and work packages
    gaps JSONB DEFAULT '[]'::jsonb,
    work_packages JSONB DEFAULT '[]'::jsonb,
    -- Visualization options
    display_options JSONB DEFAULT '{"timeline_unit": "quarter", "show_dependencies": true, "group_by": "domain"}'::jsonb,
    -- Governance
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'completed')),
    owner_id TEXT,
    -- Links
    linked_initiatives JSONB DEFAULT '[]'::jsonb,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- EA Extended Indexes
CREATE INDEX IF NOT EXISTS idx_ea_models_domain ON ea_models(domain_id);
CREATE INDEX IF NOT EXISTS idx_ea_models_status ON ea_models(status);
CREATE INDEX IF NOT EXISTS idx_ea_views_model ON ea_views(model_id);
CREATE INDEX IF NOT EXISTS idx_ea_views_domain ON ea_views(domain_id);
CREATE INDEX IF NOT EXISTS idx_ea_views_viewpoint ON ea_views(viewpoint);
CREATE INDEX IF NOT EXISTS idx_ea_building_blocks_domain ON ea_building_blocks(domain_id);
CREATE INDEX IF NOT EXISTS idx_ea_building_blocks_type ON ea_building_blocks(block_type);
CREATE INDEX IF NOT EXISTS idx_ea_building_blocks_category ON ea_building_blocks(domain_category);
CREATE INDEX IF NOT EXISTS idx_ea_building_blocks_realizes ON ea_building_blocks(realizes_abb_id);
CREATE INDEX IF NOT EXISTS idx_ea_principles_domain ON ea_principles(domain_id);
CREATE INDEX IF NOT EXISTS idx_ea_principles_category ON ea_principles(category);
CREATE INDEX IF NOT EXISTS idx_ea_principles_status ON ea_principles(status);
CREATE INDEX IF NOT EXISTS idx_ea_roadmaps_domain ON ea_roadmaps(domain_id);
CREATE INDEX IF NOT EXISTS idx_ea_roadmaps_model ON ea_roadmaps(model_id);
CREATE INDEX IF NOT EXISTS idx_ea_roadmaps_status ON ea_roadmaps(status);

-- =============================================================================
-- N&P (Negotiation & Persuasion) Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS np_situations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    user_id TEXT,
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

CREATE TABLE IF NOT EXISTS np_elements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS np_element_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE TABLE IF NOT EXISTS np_journal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    situation_id UUID REFERENCES np_situations(id) ON DELETE CASCADE,
    user_id TEXT,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('before', 'during', 'after', 'reflection', 'insight', 'lesson')),
    title TEXT,
    content TEXT NOT NULL,
    mood TEXT CHECK (mood IN ('confident', 'anxious', 'uncertain', 'optimistic', 'frustrated', 'neutral')),
    tags JSONB DEFAULT '[]'::jsonb,
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS np_conversation_turns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- N&P Indexes
CREATE INDEX IF NOT EXISTS idx_np_situations_domain ON np_situations(domain_id);
CREATE INDEX IF NOT EXISTS idx_np_situations_user ON np_situations(user_id);
CREATE INDEX IF NOT EXISTS idx_np_situations_status ON np_situations(status);
CREATE INDEX IF NOT EXISTS idx_np_situations_type ON np_situations(situation_type);
CREATE INDEX IF NOT EXISTS idx_np_elements_situation ON np_elements(situation_id);
CREATE INDEX IF NOT EXISTS idx_np_elements_type ON np_elements(element_type);
CREATE INDEX IF NOT EXISTS idx_np_elements_category ON np_elements(category);
CREATE INDEX IF NOT EXISTS idx_np_elements_party ON np_elements(party);
CREATE INDEX IF NOT EXISTS idx_np_journal_situation ON np_journal(situation_id);
CREATE INDEX IF NOT EXISTS idx_np_journal_type ON np_journal(entry_type);
CREATE INDEX IF NOT EXISTS idx_np_relationships_situation ON np_element_relationships(situation_id);
CREATE INDEX IF NOT EXISTS idx_np_relationships_from ON np_element_relationships(from_element_id);
CREATE INDEX IF NOT EXISTS idx_np_relationships_to ON np_element_relationships(to_element_id);
CREATE INDEX IF NOT EXISTS idx_np_turns_situation ON np_conversation_turns(situation_id);

-- =============================================================================
-- MMS (Mental Models & Sensemaking) Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS mms_situations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    user_id TEXT,
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

CREATE TABLE IF NOT EXISTS mms_elements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    situation_id UUID REFERENCES mms_situations(id) ON DELETE CASCADE,
    element_type TEXT NOT NULL,
    content TEXT NOT NULL,
    properties JSONB DEFAULT '{}'::jsonb,
    confidence TEXT CHECK (confidence IN ('known', 'likely', 'assumption', 'guess')),
    source TEXT CHECK (source IN ('self', 'other', 'implicit', 'observed')),
    position_x FLOAT,
    position_y FLOAT,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mms_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE TABLE IF NOT EXISTS mms_reflections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    situation_id UUID REFERENCES mms_situations(id) ON DELETE CASCADE,
    user_id TEXT,
    content TEXT NOT NULL,
    insight_type TEXT CHECK (insight_type IN ('realization', 'question', 'shift', 'decision')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MMS Indexes
CREATE INDEX IF NOT EXISTS idx_mms_situations_domain ON mms_situations(domain_id);
CREATE INDEX IF NOT EXISTS idx_mms_situations_user ON mms_situations(user_id);
CREATE INDEX IF NOT EXISTS idx_mms_situations_status ON mms_situations(status);
CREATE INDEX IF NOT EXISTS idx_mms_elements_situation ON mms_elements(situation_id);
CREATE INDEX IF NOT EXISTS idx_mms_elements_type ON mms_elements(element_type);
CREATE INDEX IF NOT EXISTS idx_mms_relationships_situation ON mms_relationships(situation_id);
CREATE INDEX IF NOT EXISTS idx_mms_relationships_from ON mms_relationships(from_element_id);
CREATE INDEX IF NOT EXISTS idx_mms_relationships_to ON mms_relationships(to_element_id);
CREATE INDEX IF NOT EXISTS idx_mms_reflections_situation ON mms_reflections(situation_id);

-- =============================================================================
-- ALS (Academic Learning Studio) Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS als_situations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    user_id TEXT,
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

CREATE TABLE IF NOT EXISTS als_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    situation_id UUID REFERENCES als_situations(id) ON DELETE CASCADE,
    user_id TEXT,
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

CREATE TABLE IF NOT EXISTS als_reflections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES als_sessions(id) ON DELETE CASCADE,
    situation_id UUID REFERENCES als_situations(id) ON DELETE CASCADE,
    user_id TEXT,
    what_clicked TEXT,
    what_confused TEXT,
    mode_appropriate BOOLEAN,
    next_adjustment TEXT,
    insight_type TEXT CHECK (insight_type IN ('breakthrough', 'confusion', 'strategy_shift', 'connection', 'question')),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ALS Indexes
CREATE INDEX IF NOT EXISTS idx_als_situations_domain ON als_situations(domain_id);
CREATE INDEX IF NOT EXISTS idx_als_situations_user ON als_situations(user_id);
CREATE INDEX IF NOT EXISTS idx_als_situations_status ON als_situations(status);
CREATE INDEX IF NOT EXISTS idx_als_sessions_situation ON als_sessions(situation_id);
CREATE INDEX IF NOT EXISTS idx_als_sessions_user ON als_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_als_sessions_mode ON als_sessions(learning_mode);
CREATE INDEX IF NOT EXISTS idx_als_reflections_session ON als_reflections(session_id);
CREATE INDEX IF NOT EXISTS idx_als_reflections_situation ON als_reflections(situation_id);

-- =============================================================================
-- Portfolio Voting Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS portfolio_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artefact_id UUID REFERENCES artefacts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    vote TEXT NOT NULL CHECK (vote IN ('approve', 'reject', 'abstain')),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(artefact_id, user_id)
);

CREATE TABLE IF NOT EXISTS portfolio_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artefact_id UUID REFERENCES artefacts(id) ON DELETE CASCADE,
    user_id TEXT,
    parent_id UUID REFERENCES portfolio_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_votes_artefact ON portfolio_votes(artefact_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_votes_user ON portfolio_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_comments_artefact ON portfolio_comments(artefact_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_comments_user ON portfolio_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_comments_parent ON portfolio_comments(parent_id);

-- =============================================================================
-- Refresh Tokens Table (Authentication)
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_id TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, token_id)
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON user_refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON user_refresh_tokens(expires_at);

-- =============================================================================
-- Blueprint Studio Tables
-- =============================================================================

-- Blueprint Initiatives (BPS-xxx)
CREATE TABLE IF NOT EXISTS blueprint_initiatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

    -- Identity
    initiative_id TEXT NOT NULL, -- BPS-001, BPS-002, etc.
    name TEXT NOT NULL,
    description TEXT,

    -- Stage (funnel position)
    stage TEXT NOT NULL DEFAULT 'idea' CHECK (stage IN ('idea', 'explore', 'assess', 'case', 'approval', 'approved', 'declined')),
    horizon TEXT CHECK (horizon IN ('h1', 'h2', 'h3')),
    track TEXT DEFAULT 'full' CHECK (track IN ('full', 'xpress', 'lite')),

    -- Ownership
    submitter_id TEXT,
    owner_id TEXT,
    sponsor_id TEXT,

    -- Stage-specific data (JSONB for flexibility)
    idea_data JSONB DEFAULT '{}'::jsonb,        -- problem, opportunity, customer_segment, source
    explore_data JSONB DEFAULT '{}'::jsonb,     -- market_sizing, competitors, pestle, validation
    assess_data JSONB DEFAULT '{}'::jsonb,      -- scoring (strategic_fit, market_potential, etc.), overall_score
    case_data JSONB DEFAULT '{}'::jsonb,        -- financials (npv, irr, payback), investment_request, roadmap

    -- Governance
    governance_data JSONB DEFAULT '{}'::jsonb,  -- stage_history, gate_decisions, sla_status, kill_criteria_triggered

    -- Approval (for case stage)
    approval_data JSONB DEFAULT '{}'::jsonb,    -- sponsor, approvers, decision, conditions, decision_date

    -- Post-Launch Review
    plr_scheduled_date TIMESTAMPTZ,             -- set 12 months after approval

    -- Tags and metadata
    tags JSONB DEFAULT '[]'::jsonb,
    custom_fields JSONB DEFAULT '{}'::jsonb,

    -- Audit
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blueprint Initiative indexes
CREATE INDEX IF NOT EXISTS idx_blueprint_init_domain ON blueprint_initiatives(domain_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_init_project ON blueprint_initiatives(project_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_init_stage ON blueprint_initiatives(stage);
CREATE INDEX IF NOT EXISTS idx_blueprint_init_horizon ON blueprint_initiatives(horizon);
CREATE INDEX IF NOT EXISTS idx_blueprint_init_owner ON blueprint_initiatives(owner_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_init_id ON blueprint_initiatives(initiative_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_init_created ON blueprint_initiatives(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blueprint_init_track ON blueprint_initiatives(track);

-- Blueprint Initiative sequence (for generating BPS-xxx IDs)
CREATE SEQUENCE IF NOT EXISTS blueprint_initiative_seq START 1;

-- =============================================================================
-- Blueprint Product Ideas Table (breakdown items under initiatives)
-- =============================================================================

CREATE SEQUENCE IF NOT EXISTS blueprint_product_idea_seq START 1;

CREATE TABLE IF NOT EXISTS blueprint_product_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiative_id UUID NOT NULL REFERENCES blueprint_initiatives(id) ON DELETE CASCADE,
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    product_idea_id TEXT NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    stage TEXT NOT NULL DEFAULT 'idea' CHECK (stage IN ('idea', 'explore', 'assess', 'case', 'approved', 'declined')),
    horizon TEXT CHECK (horizon IN ('h1', 'h2', 'h3')),
    idea_type TEXT,
    technology_posture TEXT,
    risk_profile TEXT,
    owner_id TEXT,
    selection_status TEXT DEFAULT 'candidate' CHECK (selection_status IN ('candidate', 'shortlisted', 'selected', 'parked', 'rejected')),
    idea_data JSONB DEFAULT '{}'::jsonb,
    explore_data JSONB DEFAULT '{}'::jsonb,
    assess_data JSONB DEFAULT '{}'::jsonb,
    case_data JSONB DEFAULT '{}'::jsonb,
    canvas_data JSONB DEFAULT '{}'::jsonb,
    governance_data JSONB DEFAULT '{}'::jsonb,
    ai_comparison JSONB DEFAULT '{}'::jsonb,
    validation_priority INTEGER DEFAULT 1,
    market_fit_hypothesis TEXT,
    estimated_investment NUMERIC,
    estimated_annual_cost NUMERIC,
    payback_months INTEGER,
    cost_savings_ratio NUMERIC,
    tags JSONB DEFAULT '[]'::jsonb,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blueprint_pi_initiative ON blueprint_product_ideas(initiative_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_pi_domain ON blueprint_product_ideas(domain_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_pi_stage ON blueprint_product_ideas(stage);
CREATE INDEX IF NOT EXISTS idx_blueprint_pi_id ON blueprint_product_ideas(product_idea_id);

-- =============================================================================
-- Innovation Events Table (Event Sourcing for Blueprint Studio)
-- =============================================================================
-- Append-only event log for all initiative state changes.
-- Provides audit trail, point-in-time reconstruction, and cross-studio event propagation.

CREATE TABLE IF NOT EXISTS innovation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,

    -- Event identity
    event_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL DEFAULT 'initiative',

    -- Event data
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    previous_state JSONB,

    -- Actor
    actor TEXT,

    -- Metadata
    correlation_id UUID,
    source TEXT DEFAULT 'api',

    -- Timestamp (immutable)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_innovation_events_domain ON innovation_events(domain_id);
CREATE INDEX IF NOT EXISTS idx_innovation_events_entity ON innovation_events(entity_id);
CREATE INDEX IF NOT EXISTS idx_innovation_events_type ON innovation_events(event_type);
CREATE INDEX IF NOT EXISTS idx_innovation_events_created ON innovation_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_innovation_events_correlation ON innovation_events(correlation_id);
CREATE INDEX IF NOT EXISTS idx_innovation_events_entity_type ON innovation_events(entity_id, event_type);

-- =============================================================================
-- GTM (Go-to-Market) Plans Table
-- =============================================================================
-- Task GT-001: GTM Plan data model

CREATE TABLE IF NOT EXISTS gtm_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,

    -- Identity
    plan_id TEXT NOT NULL, -- GTM-0001, GTM-0002, etc.
    name TEXT NOT NULL,
    description TEXT,

    -- Status and type
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'planning', 'ready', 'active', 'complete')),
    launch_type TEXT DEFAULT 'phased' CHECK (launch_type IN ('big_bang', 'phased', 'soft', 'beta')),

    -- Ownership
    owner_id TEXT,
    launch_date DATE,

    -- Target and links
    target_market TEXT,
    linked_product_id UUID,  -- Link to enterprise product
    linked_service_id UUID,  -- Link to enterprise service

    -- Strategy (JSONB)
    strategy JSONB DEFAULT '{}'::jsonb,  -- value_proposition, positioning, competitive_differentiation

    -- Messaging (JSONB)
    messaging JSONB DEFAULT '{}'::jsonb, -- pillars[], key_messages, proof_points, objection_handlers

    -- Launch (JSONB)
    launch JSONB DEFAULT '{}'::jsonb,    -- launch_date, milestones[], readiness_criteria[]

    -- Pricing (JSONB)
    pricing JSONB DEFAULT '{}'::jsonb,   -- model, tiers[], discounts, bundles

    -- Metadata
    custom_fields JSONB DEFAULT '{}'::jsonb,

    -- Audit
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GTM Plans indexes
CREATE INDEX IF NOT EXISTS idx_gtm_plans_domain ON gtm_plans(domain_id);
CREATE INDEX IF NOT EXISTS idx_gtm_plans_status ON gtm_plans(status);
CREATE INDEX IF NOT EXISTS idx_gtm_plans_owner ON gtm_plans(owner_id);
CREATE INDEX IF NOT EXISTS idx_gtm_plans_plan_id ON gtm_plans(plan_id);
CREATE INDEX IF NOT EXISTS idx_gtm_plans_launch ON gtm_plans(launch_date);
CREATE INDEX IF NOT EXISTS idx_gtm_plans_created ON gtm_plans(created_at DESC);

-- GTM Plan sequence (for generating GTM-xxxx IDs)
CREATE SEQUENCE IF NOT EXISTS gtm_plan_seq START 1;

-- =============================================================================
-- Seed Data: Menu Sections & Items
-- =============================================================================

INSERT INTO menu_sections (key, label, is_system, sort_order) VALUES
    ('navigation', 'Navigation', true, 0),
    ('knowledge', 'Knowledge', true, 1),
    ('workspace', 'Workspaces', true, 2),
    ('reasoning', 'Reasoning', true, 3)
ON CONFLICT (key) DO NOTHING;

INSERT INTO menu_items (key, label, href, icon, default_section, roles, sort_order) VALUES
    -- Navigation section
    ('product', 'Product', '/navigation/home', 'AppsIcon', 'navigation', '{admin,editor,viewer}', 0),
    ('login', 'Login', '/login', 'LockIcon', 'navigation', '{}', 1),
    -- Knowledge section
    ('knowledge-studio', 'Knowledge Studio', '/app/spaces/ks/navigator', 'HubIcon', 'knowledge', '{admin,editor,viewer}', 0),
    -- Workspace section
    ('project-design', 'Project Design', '/app/spaces/pds/overview', 'AccountTreeIcon', 'workspace', '{admin,editor,viewer}', 0),
    ('product-design', 'Product Design', '/app/spaces/pdw/discovery', 'LightbulbIcon', 'workspace', '{admin,editor,viewer}', 2),
    ('requirements-studio', 'Requirements Studio', '/app/spaces/ba/repository', 'AssignmentIcon', 'workspace', '{admin,editor,viewer}', 6),
    ('enterprise-architecture', 'Enterprise Architecture', '/app/spaces/ea/elements', 'ArchitectureIcon', 'workspace', '{admin,editor,viewer}', 7),
    ('diagram-studio', 'Diagram Studio', '/app/spaces/diagram/canvas', 'GridViewIcon', 'workspace', '{admin,editor,viewer}', 8),
    -- Reasoning section
    ('system-dynamics', 'System Dynamics', '/app/spaces/sd/canvas', 'LoopIcon', 'reasoning', '{admin,editor,viewer}', 0),
    ('work-design', 'Work Design', '/app/spaces/dwd/landscape', 'BuildIcon', 'reasoning', '{admin,editor,viewer}', 1),
    ('negotiation', 'N&P Studio', '/app/spaces/np/situation', 'HandshakeIcon', 'reasoning', '{admin,editor,viewer}', 2),
    ('sensemaking', 'Sensemaking', '/app/spaces/mms/canvas', 'PsychologyIcon', 'reasoning', '{admin,editor,viewer}', 3),
    ('learning', 'Learning Studio', '/app/spaces/als/sessions', 'SchoolIcon', 'reasoning', '{admin,editor,viewer}', 4),
    ('philosophy', 'Philosophy', '/app/spaces/philosophy/canvas', 'AutoStoriesIcon', 'reasoning', '{admin,editor,viewer}', 5),
    ('strategic-reasoning', 'Strategic Reasoning', '/app/spaces/srs/session', 'AutoGraphIcon', 'reasoning', '{admin,editor,viewer}', 6)
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- Seed Data: Default Admin User
-- =============================================================================

INSERT INTO users (id, email, name, username, role, settings)
VALUES (
    uuid_generate_v4(),
    'admin@ontographia.local',
    'Administrator',
    'admin',
    'admin',
    '{"coachingEnabled": true, "coachingLevel": "detailed", "theme": "system"}'
)
ON CONFLICT (email) DO NOTHING;
