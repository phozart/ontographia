-- =============================================================================
-- Removed Spaces Cleanup Script
-- CM, DW, Portfolio, CAP (Organisation Studio), and EA (merged into Enterprise)
-- =============================================================================

-- Start transaction for safety
BEGIN;

-- =============================================================================
-- Step 1: Delete CM Relationships
-- =============================================================================

DELETE FROM artefact_relationships
WHERE relationship_type IN (
    'cm_context_has_stakeholder',
    'cm_stakeholder_has_assessment',
    'cm_context_has_risk',
    'cm_context_has_signal',
    'cm_stakeholder_has_impact',
    'cm_risk_affects_stakeholder'
);

-- Also delete any relationships involving CM artefacts
DELETE FROM artefact_relationships
WHERE from_artefact_id IN (SELECT id FROM artefacts WHERE artefact_type LIKE 'cm_%')
   OR to_artefact_id IN (SELECT id FROM artefacts WHERE artefact_type LIKE 'cm_%');

-- =============================================================================
-- Step 2: Delete CM Artefacts
-- =============================================================================

DELETE FROM artefacts
WHERE artefact_type IN (
    'cm_context',
    'cm_stakeholder_group',
    'cm_pct_assessment',
    'cm_impact_assessment',
    'cm_risk',
    'cm_adoption_signal'
);

-- =============================================================================
-- Step 3: Delete Portfolio Data (if tables exist)
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'portfolio_votes') THEN
        DELETE FROM portfolio_votes;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'portfolio_comments') THEN
        DELETE FROM portfolio_comments;
    END IF;
END $$;

DELETE FROM artefacts
WHERE artefact_type LIKE 'portfolio_%';

DELETE FROM artefact_relationships
WHERE from_artefact_id IN (SELECT id FROM artefacts WHERE artefact_type LIKE 'portfolio_%')
   OR to_artefact_id IN (SELECT id FROM artefacts WHERE artefact_type LIKE 'portfolio_%');

-- =============================================================================
-- Step 4: Delete CAP/Organisation Studio Data
-- =============================================================================

-- Delete CAP relationships
DELETE FROM artefact_relationships
WHERE relationship_type LIKE 'cap_%'
   OR relationship_type LIKE 'bsm_%'
   OR relationship_type LIKE 'gov_%'
   OR relationship_type LIKE 'risk_%';

-- Delete CAP artefacts
DELETE FROM artefacts
WHERE artefact_type LIKE 'cap_%'
   OR artefact_type LIKE 'bsm_%'
   OR artefact_type LIKE 'gov_%'
   OR artefact_type LIKE 'risk_%'
   OR artefact_type LIKE 'capability%'
   OR artefact_type LIKE 'service%'
   OR artefact_type LIKE 'governance%';

-- =============================================================================
-- Step 5: Remove Menu Items
-- =============================================================================

DELETE FROM menu_items
WHERE key IN (
    'change-studio',
    'development-workflow',
    'portfolio-studio',
    'organisation-studio',
    'capability-studio',
    'governance-studio',
    'risk-studio',
    'business-service-studio',
    'enterprise-architecture',
    'ea-studio'
);

-- =============================================================================
-- Step 6: Clean up user page permissions
-- =============================================================================

DELETE FROM user_page_permissions
WHERE page_path LIKE '%/cm/%'
   OR page_path LIKE '%/change%'
   OR page_path LIKE '%/dw/%'
   OR page_path LIKE '%/portfolio/%'
   OR page_path LIKE '%/cap/%'
   OR page_path LIKE '%/organisation%'
   OR page_path LIKE '%/spaces/ea/%';

-- =============================================================================
-- Step 7: Remove from page registry if exists
-- =============================================================================

DELETE FROM page_registry
WHERE path LIKE '%/cm/%'
   OR path LIKE '%/change-management%'
   OR path LIKE '%/dw/%'
   OR path LIKE '%/development-workflow%'
   OR path LIKE '%/portfolio/%'
   OR path LIKE '%/portfolio-studio%'
   OR path LIKE '%/cap/%'
   OR path LIKE '%/organisation%'
   OR path LIKE '%/capability%'
   OR path LIKE '%/governance%'
   OR path LIKE '%/spaces/ea/%'
   OR path LIKE '%/ea-studio%'
   OR path LIKE '%/ea-workspace%';

-- =============================================================================
-- Commit the transaction
-- =============================================================================

COMMIT;

-- Output summary
DO $$
BEGIN
    RAISE NOTICE 'Removed Spaces cleanup completed successfully';
    RAISE NOTICE 'Removed: CM (Change Management)';
    RAISE NOTICE 'Removed: DW (Development Workflow)';
    RAISE NOTICE 'Removed: Portfolio Studio';
    RAISE NOTICE 'Removed: CAP (Organisation Studio)';
    RAISE NOTICE 'Removed: EA (Enterprise Architecture - merged into Enterprise Studio)';
    RAISE NOTICE 'All menu entries and page permissions cleaned up';
    RAISE NOTICE 'Note: EA data (elements, relationships, ADRs) preserved for Enterprise Studio';
END $$;
