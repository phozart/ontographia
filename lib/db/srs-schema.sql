-- =============================================================================
-- STRATEGIC REASONING SUITE - DATABASE SCHEMA
-- =============================================================================
-- A thinking space for exploring complex business problems before solutions
-- are defined. Supports 6 reasoning spaces with cross-cutting connections.
-- =============================================================================

-- =============================================================================
-- REASONING SESSIONS
-- Top-level container for a reasoning exploration
-- =============================================================================

CREATE TABLE IF NOT EXISTS srs_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

    -- Basic info
    title VARCHAR(500) NOT NULL,
    description TEXT,
    initial_prompt TEXT,  -- "What's on your mind?" response

    -- Intent classification (routes to starting space)
    intent VARCHAR(50) CHECK (intent IN ('understand', 'decide', 'explain')),

    -- Status
    status VARCHAR(50) DEFAULT 'active'
        CHECK (status IN ('active', 'paused', 'completed', 'archived')),

    -- Collaboration
    owner_id UUID REFERENCES users(id),
    visibility VARCHAR(50) DEFAULT 'private'
        CHECK (visibility IN ('private', 'team', 'organisation')),

    -- Workshop mode
    is_workshop BOOLEAN DEFAULT false,
    workshop_facilitator_id UUID REFERENCES users(id),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_srs_sessions_project ON srs_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_srs_sessions_owner ON srs_sessions(owner_id);
CREATE INDEX IF NOT EXISTS idx_srs_sessions_status ON srs_sessions(status);


-- =============================================================================
-- SESSION PARTICIPANTS
-- Who has access to a reasoning session
-- =============================================================================

CREATE TABLE IF NOT EXISTS srs_session_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES srs_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    role VARCHAR(50) DEFAULT 'contributor'
        CHECK (role IN ('viewer', 'contributor', 'facilitator', 'owner')),

    -- Participation tracking
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE,

    -- Preferences for this session
    preferences JSONB DEFAULT '{}',

    UNIQUE(session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_srs_participants_session ON srs_session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_srs_participants_user ON srs_session_participants(user_id);


-- =============================================================================
-- REASONING SPACES
-- Each space within a session (Questions, Framing, etc.)
-- =============================================================================

CREATE TABLE IF NOT EXISTS srs_spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES srs_sessions(id) ON DELETE CASCADE,

    -- Space type
    space_type VARCHAR(50) NOT NULL CHECK (space_type IN (
        'questions',
        'framing',
        'parallel_states',
        'systems',
        'perspectives',
        'decision_readiness'
    )),

    -- Viewport state (where user is looking)
    viewport JSONB DEFAULT '{"x": 0, "y": 0, "zoom": 1}',

    -- Space-specific configuration
    config JSONB DEFAULT '{}',

    -- Exploration metrics
    time_spent_seconds INTEGER DEFAULT 0,
    element_count INTEGER DEFAULT 0,

    -- Status indicators
    minimum_viable_reached BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(session_id, space_type)
);

CREATE INDEX IF NOT EXISTS idx_srs_spaces_session ON srs_spaces(session_id);


-- =============================================================================
-- QUESTIONS (Question Design Space)
-- =============================================================================

CREATE TABLE IF NOT EXISTS srs_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID REFERENCES srs_spaces(id) ON DELETE CASCADE,
    session_id UUID REFERENCES srs_sessions(id) ON DELETE CASCADE,

    -- Question content
    text TEXT NOT NULL,

    -- Classification
    question_type VARCHAR(50) CHECK (question_type IN (
        'diagnostic',    -- What's happening?
        'systemic',      -- How does this connect?
        'temporal',      -- When/how long?
        'ethical',       -- Should we?
        'counterfactual',-- What if?
        'disconfirming', -- What would prove us wrong?
        'conditional'    -- If X, then?
    )),

    -- Maturity
    maturity VARCHAR(50) DEFAULT 'raw' CHECK (maturity IN (
        'raw',           -- Just captured
        'refined',       -- Clarified
        'blocking',      -- Must answer to proceed
        'foundational'   -- Unlocks other questions
    )),

    -- Special flags
    is_shadow_question BOOLEAN DEFAULT false,  -- "What are we avoiding?"
    is_ghost BOOLEAN DEFAULT false,            -- System-suggested

    -- Canvas position
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,

    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_srs_questions_space ON srs_questions(space_id);
CREATE INDEX IF NOT EXISTS idx_srs_questions_session ON srs_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_srs_questions_maturity ON srs_questions(maturity);


-- =============================================================================
-- PROBLEM FRAMES (Problem Framing Space)
-- =============================================================================

CREATE TABLE IF NOT EXISTS srs_frames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID REFERENCES srs_spaces(id) ON DELETE CASCADE,
    session_id UUID REFERENCES srs_sessions(id) ON DELETE CASCADE,

    -- Frame identity
    name VARCHAR(500) NOT NULL,
    description TEXT,

    -- Ownership and politics
    defined_by VARCHAR(500),      -- Role/team that created this framing
    benefits_whom TEXT,           -- Who gains if this frame wins

    -- Visual properties
    color VARCHAR(50) DEFAULT '#6366f1',
    opacity FLOAT DEFAULT 1.0,    -- Certainty indicator

    -- Canvas position and size
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,
    width FLOAT DEFAULT 400,
    height FLOAT DEFAULT 300,

    -- Selection state
    is_primary BOOLEAN DEFAULT false,  -- Currently selected frame

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_srs_frames_space ON srs_frames(space_id);
CREATE INDEX IF NOT EXISTS idx_srs_frames_session ON srs_frames(session_id);


-- Frame elements (what's inside/outside a frame)
CREATE TABLE IF NOT EXISTS srs_frame_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    frame_id UUID REFERENCES srs_frames(id) ON DELETE CASCADE,

    -- Element content
    name VARCHAR(500) NOT NULL,
    description TEXT,

    -- Boundary status
    boundary_status VARCHAR(50) DEFAULT 'inside' CHECK (boundary_status IN (
        'inside',        -- Clearly in scope
        'outside',       -- Explicitly excluded
        'boundary'       -- Uncertain, on the edge
    )),

    -- Position within frame
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_srs_frame_elements_frame ON srs_frame_elements(frame_id);


-- =============================================================================
-- PARALLEL STATES (Quantum Reasoning Space)
-- =============================================================================

CREATE TABLE IF NOT EXISTS srs_parallel_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID REFERENCES srs_spaces(id) ON DELETE CASCADE,
    session_id UUID REFERENCES srs_sessions(id) ON DELETE CASCADE,

    -- State content
    name VARCHAR(500) NOT NULL,
    description TEXT,

    -- Confidence (not probability - plausibility)
    confidence FLOAT DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),

    -- Visual properties
    color VARCHAR(50) DEFAULT '#ec4899',

    -- Canvas position (distance = conceptual similarity)
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,

    -- Observer effect notes
    observer_effect_notes TEXT,  -- How measurement would change this state

    -- Collapse tracking
    collapsed_by_decision UUID REFERENCES srs_decisions(id),
    collapse_reason TEXT,

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_srs_parallel_states_space ON srs_parallel_states(space_id);
CREATE INDEX IF NOT EXISTS idx_srs_parallel_states_session ON srs_parallel_states(session_id);


-- =============================================================================
-- SYSTEM NODES (Systems & Causal Reasoning Space)
-- =============================================================================

CREATE TABLE IF NOT EXISTS srs_system_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID REFERENCES srs_spaces(id) ON DELETE CASCADE,
    session_id UUID REFERENCES srs_sessions(id) ON DELETE CASCADE,

    -- Node content
    name VARCHAR(500) NOT NULL,
    description TEXT,

    -- Node type
    node_type VARCHAR(50) DEFAULT 'variable' CHECK (node_type IN (
        'variable',      -- Something that can increase/decrease
        'stock',         -- Accumulation
        'flow',          -- Rate of change
        'external'       -- Outside the system boundary
    )),

    -- Canvas position
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,

    -- Visual properties
    color VARCHAR(50) DEFAULT '#14b8a6',

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_srs_system_nodes_space ON srs_system_nodes(space_id);
CREATE INDEX IF NOT EXISTS idx_srs_system_nodes_session ON srs_system_nodes(session_id);


-- Causal links between nodes
CREATE TABLE IF NOT EXISTS srs_causal_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID REFERENCES srs_spaces(id) ON DELETE CASCADE,

    from_node_id UUID REFERENCES srs_system_nodes(id) ON DELETE CASCADE,
    to_node_id UUID REFERENCES srs_system_nodes(id) ON DELETE CASCADE,

    -- Link properties
    polarity VARCHAR(10) CHECK (polarity IN ('+', '-')),  -- Same/opposite direction

    -- Time delay
    has_delay BOOLEAN DEFAULT false,
    delay_description VARCHAR(500),
    delay_magnitude VARCHAR(50) CHECK (delay_magnitude IN (
        'immediate', 'days', 'weeks', 'months', 'quarters', 'years'
    )),

    -- Link strength
    strength VARCHAR(50) DEFAULT 'medium' CHECK (strength IN (
        'weak', 'medium', 'strong'
    )),

    -- Notes
    description TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_srs_causal_links_space ON srs_causal_links(space_id);
CREATE INDEX IF NOT EXISTS idx_srs_causal_links_from ON srs_causal_links(from_node_id);
CREATE INDEX IF NOT EXISTS idx_srs_causal_links_to ON srs_causal_links(to_node_id);


-- Feedback loops (auto-detected or manually marked)
CREATE TABLE IF NOT EXISTS srs_feedback_loops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID REFERENCES srs_spaces(id) ON DELETE CASCADE,

    -- Loop type
    loop_type VARCHAR(50) CHECK (loop_type IN ('reinforcing', 'balancing')),

    -- Loop name and description
    name VARCHAR(500),
    description TEXT,

    -- Nodes in this loop (ordered)
    node_ids UUID[] NOT NULL,

    -- Auto-detected or manual
    is_auto_detected BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_srs_feedback_loops_space ON srs_feedback_loops(space_id);


-- =============================================================================
-- PERSPECTIVES (Perspective & Role Space)
-- =============================================================================

CREATE TABLE IF NOT EXISTS srs_perspectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID REFERENCES srs_spaces(id) ON DELETE CASCADE,
    session_id UUID REFERENCES srs_sessions(id) ON DELETE CASCADE,

    -- Perspective identity
    name VARCHAR(500) NOT NULL,        -- e.g., "CFO", "Customer", "Competitor"
    perspective_type VARCHAR(50) CHECK (perspective_type IN (
        'executive',     -- C-suite roles
        'functional',    -- Department heads
        'external',      -- Outside stakeholders
        'temporal',      -- Future self
        'ethical',       -- Ethical lens
        'custom'
    )),

    -- Perspective content
    problem_as_seen TEXT,              -- How this perspective sees the problem
    what_they_see TEXT,                -- What's visible from here
    what_they_miss TEXT,               -- Blind spots
    incentives TEXT,                   -- What motivates this perspective
    risks_amplified TEXT,              -- What risks they overweight

    -- Conflicts with other perspectives
    conflicts_with UUID[],             -- Array of perspective IDs

    -- Time spent in this perspective
    time_spent_seconds INTEGER DEFAULT 0,

    -- Visual properties
    color VARCHAR(50) DEFAULT '#f59e0b',
    icon VARCHAR(100),

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_srs_perspectives_space ON srs_perspectives(space_id);
CREATE INDEX IF NOT EXISTS idx_srs_perspectives_session ON srs_perspectives(session_id);


-- =============================================================================
-- DECISION READINESS (Decision Readiness Space)
-- =============================================================================

CREATE TABLE IF NOT EXISTS srs_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID REFERENCES srs_spaces(id) ON DELETE CASCADE,
    session_id UUID REFERENCES srs_sessions(id) ON DELETE CASCADE,

    -- Decision statement
    statement TEXT NOT NULL,

    -- Four quadrants (JSONB arrays for flexibility)
    what_we_know JSONB DEFAULT '[]',       -- Array of {text, confidence, source}
    what_we_assume JSONB DEFAULT '[]',     -- Array of {text, tested, risk}
    what_we_dont_know JSONB DEFAULT '[]',  -- Array of {text, importance, fillable}
    what_we_ignore JSONB DEFAULT '[]',     -- Array of {text, reason}

    -- Reversibility assessment
    reversibility VARCHAR(50) CHECK (reversibility IN (
        'fully_reversible',
        'partially_reversible',
        'irreversible'
    )),
    reversibility_notes TEXT,
    reversal_cost TEXT,
    reversal_time TEXT,

    -- Cost analysis
    cost_of_delay TEXT,
    cost_of_delay_quantified VARCHAR(500),
    cost_of_error TEXT,
    cost_of_error_quantified VARCHAR(500),

    -- Readiness score (calculated)
    readiness_score FLOAT,               -- 0-100
    readiness_breakdown JSONB,           -- Component scores

    -- Decision outcome
    decision_made BOOLEAN DEFAULT false,
    decision_outcome VARCHAR(50) CHECK (decision_outcome IN (
        'proceed', 'pivot', 'pause', 'stop', 'defer'
    )),
    decision_rationale TEXT,
    decision_date TIMESTAMP WITH TIME ZONE,

    -- Review trigger
    review_trigger_date DATE,
    review_trigger_event TEXT,

    -- Recorded trade-offs
    trade_offs JSONB DEFAULT '[]',       -- Array of {accepted, rejected, reason}

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_srs_decisions_space ON srs_decisions(space_id);
CREATE INDEX IF NOT EXISTS idx_srs_decisions_session ON srs_decisions(session_id);


-- =============================================================================
-- CROSS-CUTTING: ELEMENT CONNECTIONS
-- Links between elements across and within spaces
-- =============================================================================

CREATE TABLE IF NOT EXISTS srs_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES srs_sessions(id) ON DELETE CASCADE,

    -- Source element (polymorphic)
    from_element_type VARCHAR(50) NOT NULL,  -- 'question', 'frame', 'state', etc.
    from_element_id UUID NOT NULL,

    -- Target element (polymorphic)
    to_element_type VARCHAR(50) NOT NULL,
    to_element_id UUID NOT NULL,

    -- Connection type
    connection_type VARCHAR(100) NOT NULL,  -- 'depends_on', 'informs', 'conflicts_with', etc.

    -- Strength and direction
    strength FLOAT DEFAULT 0.5,
    is_bidirectional BOOLEAN DEFAULT false,

    -- Annotation
    description TEXT,

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_srs_connections_session ON srs_connections(session_id);
CREATE INDEX IF NOT EXISTS idx_srs_connections_from ON srs_connections(from_element_type, from_element_id);
CREATE INDEX IF NOT EXISTS idx_srs_connections_to ON srs_connections(to_element_type, to_element_id);


-- =============================================================================
-- CROSS-CUTTING: COMMENTS & DISCUSSIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS srs_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES srs_sessions(id) ON DELETE CASCADE,

    -- What this comment is on (polymorphic)
    element_type VARCHAR(50) NOT NULL,
    element_id UUID NOT NULL,

    -- Thread structure
    parent_comment_id UUID REFERENCES srs_comments(id) ON DELETE CASCADE,
    thread_root_id UUID,  -- For easy thread queries

    -- Content
    content TEXT NOT NULL,

    -- Author and timing
    author_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_srs_comments_element ON srs_comments(element_type, element_id);
CREATE INDEX IF NOT EXISTS idx_srs_comments_thread ON srs_comments(thread_root_id);
CREATE INDEX IF NOT EXISTS idx_srs_comments_session ON srs_comments(session_id);


-- =============================================================================
-- CROSS-CUTTING: ASSUMPTIONS
-- Highlighted across all spaces
-- =============================================================================

CREATE TABLE IF NOT EXISTS srs_assumptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES srs_sessions(id) ON DELETE CASCADE,

    -- Assumption content
    text TEXT NOT NULL,

    -- Source - where this assumption was captured
    source_space VARCHAR(50),
    source_element_type VARCHAR(50),
    source_element_id UUID,

    -- Status
    status VARCHAR(50) DEFAULT 'untested' CHECK (status IN (
        'untested',
        'testing',
        'validated',
        'invalidated',
        'accepted_risk'
    )),

    -- Impact assessment
    impact_if_wrong VARCHAR(50) CHECK (impact_if_wrong IN (
        'low', 'medium', 'high', 'critical'
    )),

    -- Testing
    test_approach TEXT,
    test_result TEXT,
    tested_at TIMESTAMP WITH TIME ZONE,

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_srs_assumptions_session ON srs_assumptions(session_id);
CREATE INDEX IF NOT EXISTS idx_srs_assumptions_status ON srs_assumptions(status);


-- =============================================================================
-- HISTORY: SESSION SNAPSHOTS (Reasoning Trail)
-- =============================================================================

CREATE TABLE IF NOT EXISTS srs_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES srs_sessions(id) ON DELETE CASCADE,

    -- Snapshot metadata
    name VARCHAR(500),
    description TEXT,

    -- What triggered this snapshot
    trigger_type VARCHAR(50) CHECK (trigger_type IN (
        'manual',        -- User explicitly saved
        'auto_periodic', -- Auto-save every N minutes
        'space_change',  -- User moved to different space
        'milestone',     -- Key moment (first question, frame chosen, etc.)
        'collaboration'  -- Handoff to another user
    )),

    -- Full state capture (JSONB for flexibility)
    state JSONB NOT NULL,

    -- Creator
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_srs_snapshots_session ON srs_snapshots(session_id);
CREATE INDEX IF NOT EXISTS idx_srs_snapshots_created ON srs_snapshots(created_at);


-- =============================================================================
-- COACHING: COACHING INTERACTIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS srs_coaching_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES srs_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),

    -- What triggered the coaching
    trigger_pattern VARCHAR(100) NOT NULL,  -- e.g., 'skipped_questions', 'single_perspective'

    -- The coaching message
    message TEXT NOT NULL,
    suggestion TEXT,

    -- User response
    user_response VARCHAR(50) CHECK (user_response IN (
        'accepted',      -- User followed suggestion
        'dismissed',     -- User dismissed
        'muted',         -- User permanently muted this trigger
        'pending'        -- Not yet responded
    )) DEFAULT 'pending',

    -- Context
    current_space VARCHAR(50),
    context JSONB,       -- Additional context about trigger conditions

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_srs_coaching_session ON srs_coaching_events(session_id);
CREATE INDEX IF NOT EXISTS idx_srs_coaching_user ON srs_coaching_events(user_id);


-- =============================================================================
-- EXPORT: EXPORTS & HANDOFFS
-- =============================================================================

CREATE TABLE IF NOT EXISTS srs_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES srs_sessions(id) ON DELETE CASCADE,
    snapshot_id UUID REFERENCES srs_snapshots(id),

    -- Export type
    export_type VARCHAR(50) CHECK (export_type IN (
        'document',      -- Full reasoning document
        'summary',       -- Executive summary
        'questions',     -- Question hierarchy only
        'causal_map',    -- Systems diagram
        'decision_record', -- Governance record
        'handoff'        -- For collaboration handoff
    )),

    -- Format
    format VARCHAR(50) CHECK (format IN ('html', 'markdown', 'pdf', 'json')),

    -- Content (stored or URL)
    content TEXT,
    file_url VARCHAR(1000),

    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_srs_exports_session ON srs_exports(session_id);


-- =============================================================================
-- INTEGRATION: EXTERNAL LINKS (To other studios)
-- =============================================================================

CREATE TABLE IF NOT EXISTS srs_external_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES srs_sessions(id) ON DELETE CASCADE,

    -- Source in SRS
    source_element_type VARCHAR(50),
    source_element_id UUID,

    -- Target in external system
    target_studio VARCHAR(50) CHECK (target_studio IN (
        'ba', 'ea', 'dwd', 'pdw', 'governance', 'portfolio'
    )),
    target_artefact_type VARCHAR(100),
    target_artefact_id UUID,

    -- Link type
    link_type VARCHAR(100),  -- 'informs', 'resulted_in', 'triggered_by', etc.

    -- Metadata
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_srs_external_links_session ON srs_external_links(session_id);
CREATE INDEX IF NOT EXISTS idx_srs_external_links_target ON srs_external_links(target_studio, target_artefact_id);
