// lib/repositories/DWRepository.js
// Repository for Development Workflow (DW) space artefacts

import { BaseRepository } from './BaseRepository';
import { query } from '../pg';

/**
 * DW Artefact Types
 * All artefact_type values use 'DW_' prefix
 */
export const DW_ARTEFACT_TYPES = {
  SKILL: 'DW_Skill',
  GATE: 'DW_Gate',
  ARTIFACT: 'DW_Artifact',
  DECISION: 'DW_Decision',
  FEEDBACK: 'DW_Feedback',
  PHASE: 'DW_Phase',
  PROJECT_STATE: 'DW_ProjectState',
};

/**
 * Skill Categories
 */
export const SKILL_CATEGORIES = {
  STRATEGY: 'Strategy',
  DESIGN: 'Design',
  REQUIREMENTS: 'Requirements',
  ARCHITECTURE: 'Architecture',
  DOCUMENTATION: 'Documentation',
  DEVELOPMENT: 'Development',
  QUALITY: 'Quality',
  OPERATIONS: 'Operations',
  COMPLIANCE: 'Compliance',
  INNOVATION: 'Innovation',
  SERVICE: 'Service',
  ORCHESTRATION: 'Orchestration',
  SPECIALIZED: 'Specialized',
};

/**
 * Gate Statuses
 */
export const GATE_STATUS = {
  PENDING: 'pending',
  PASSED: 'passed',
  FAILED: 'failed',
  BLOCKED: 'blocked',
};

/**
 * Decision Types
 */
export const DECISION_TYPES = {
  GATE_EVALUATION: 'gate_evaluation',
  FEEDBACK_ROUTING: 'feedback_routing',
  SKILL_SELECTION: 'skill_selection',
  PHASE_TRANSITION: 'phase_transition',
};

/**
 * Feedback Status
 */
export const FEEDBACK_STATUS = {
  OPEN: 'open',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

/**
 * Repository for Development Workflow artefacts
 */
export class DWRepository extends BaseRepository {
  constructor() {
    super('artefacts', 'id');
    this.prefix = 'DW';
  }

  // ============================================================
  // SKILL OPERATIONS
  // ============================================================

  /**
   * Find all skills for a project
   */
  async findSkills(projectId, filters = {}) {
    const { category, search, limit, offset } = filters;

    let sql = `
      SELECT a.*,
        u.username as owner_username,
        cb.username as created_by_username
      FROM artefacts a
      LEFT JOIN users u ON u.username = a.owner_id
      LEFT JOIN users cb ON cb.username = a.created_by
      WHERE a.project_id = $1 AND a.artefact_type = $2
    `;
    const params = [projectId, DW_ARTEFACT_TYPES.SKILL];
    let paramIdx = 3;

    if (category) {
      sql += ` AND a.custom_fields->>'category' = $${paramIdx}`;
      params.push(category);
      paramIdx++;
    }

    if (search) {
      sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    sql += ` ORDER BY a.custom_fields->>'category', a.name`;

    if (limit) {
      sql += ` LIMIT $${paramIdx}`;
      params.push(parseInt(limit, 10));
      paramIdx++;
    }
    if (offset) {
      sql += ` OFFSET $${paramIdx}`;
      params.push(parseInt(offset, 10));
    }

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find skill by code
   */
  async findSkillByCode(projectId, skillCode) {
    const result = await query(
      `SELECT a.*,
        u.username as owner_username
      FROM artefacts a
      LEFT JOIN users u ON u.username = a.owner_id
      WHERE a.project_id = $1
        AND a.artefact_type = $2
        AND a.custom_fields->>'skillCode' = $3`,
      [projectId, DW_ARTEFACT_TYPES.SKILL, skillCode]
    );
    return result.rows[0] || null;
  }

  /**
   * Create a skill artefact
   */
  async createSkill(data, userId) {
    const {
      projectId,
      skillCode,
      name,
      description,
      category,
      methodology,
      references,
      linkedSkills,
      inputs,
      outputs,
    } = data;

    const customFields = {
      skillCode,
      category,
      methodology: methodology || '',
      references: references || [],
      linkedSkills: linkedSkills || [],
      inputs: inputs || [],
      outputs: outputs || [],
      invocations: [],
    };

    const result = await query(
      `INSERT INTO artefacts (
        project_id, artefact_type, name, description, status,
        architecture_state, priority, owner_id, tags, custom_fields,
        created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, 'Approved', 'N/A', 'Medium', $5, $6, $7, $5, now(), now())
      RETURNING *`,
      [
        projectId,
        DW_ARTEFACT_TYPES.SKILL,
        name,
        description || '',
        userId,
        JSON.stringify([category]),
        JSON.stringify(customFields),
      ]
    );

    return result.rows[0];
  }

  // ============================================================
  // GATE OPERATIONS
  // ============================================================

  /**
   * Find all gates for a project
   */
  async findGates(projectId, filters = {}) {
    const { status, phase } = filters;

    let sql = `
      SELECT a.*
      FROM artefacts a
      WHERE a.project_id = $1 AND a.artefact_type = $2
    `;
    const params = [projectId, DW_ARTEFACT_TYPES.GATE];
    let paramIdx = 3;

    if (status) {
      sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    if (phase) {
      sql += ` AND a.custom_fields->>'phase' = $${paramIdx}`;
      params.push(phase);
      paramIdx++;
    }

    sql += ` ORDER BY (a.custom_fields->>'gateNumber')::int`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Create a gate artefact
   */
  async createGate(data, userId) {
    const {
      projectId,
      gateNumber,
      gateName,
      phase,
      status,
      criteria,
      blockers,
      skill,
    } = data;

    const customFields = {
      gateNumber,
      gateName,
      phase,
      status: status || GATE_STATUS.PENDING,
      criteria: criteria || [],
      blockers: blockers || [],
      skill: skill || null,
      passedAt: status === GATE_STATUS.PASSED ? new Date().toISOString() : null,
    };

    const result = await query(
      `INSERT INTO artefacts (
        project_id, artefact_type, name, description, status,
        architecture_state, priority, owner_id, tags, custom_fields,
        created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, 'Draft', 'N/A', 'High', $5, $6, $7, $5, now(), now())
      RETURNING *`,
      [
        projectId,
        DW_ARTEFACT_TYPES.GATE,
        `Gate ${gateNumber}: ${gateName}`,
        `${phase} phase gate`,
        userId,
        JSON.stringify([phase]),
        JSON.stringify(customFields),
      ]
    );

    return result.rows[0];
  }

  /**
   * Update gate status
   */
  async updateGateStatus(gateId, status, criteria, userId) {
    const current = await query(
      'SELECT * FROM artefacts WHERE id = $1 AND artefact_type = $2',
      [gateId, DW_ARTEFACT_TYPES.GATE]
    );

    if (current.rows.length === 0) return null;

    const customFields = current.rows[0].custom_fields || {};
    customFields.status = status;
    customFields.criteria = criteria || customFields.criteria;
    if (status === GATE_STATUS.PASSED) {
      customFields.passedAt = new Date().toISOString();
    }

    const result = await query(
      `UPDATE artefacts SET
        custom_fields = $2,
        updated_at = now()
      WHERE id = $1
      RETURNING *`,
      [gateId, JSON.stringify(customFields)]
    );

    return result.rows[0];
  }

  // ============================================================
  // AI DECISION OPERATIONS
  // ============================================================

  /**
   * Find all decisions for a project
   */
  async findDecisions(projectId, filters = {}) {
    const { type, limit, offset } = filters;

    let sql = `
      SELECT a.*
      FROM artefacts a
      WHERE a.project_id = $1 AND a.artefact_type = $2
    `;
    const params = [projectId, DW_ARTEFACT_TYPES.DECISION];
    let paramIdx = 3;

    if (type) {
      sql += ` AND a.custom_fields->>'decisionType' = $${paramIdx}`;
      params.push(type);
      paramIdx++;
    }

    sql += ` ORDER BY a.created_at DESC`;

    if (limit) {
      sql += ` LIMIT $${paramIdx}`;
      params.push(parseInt(limit, 10));
      paramIdx++;
    }
    if (offset) {
      sql += ` OFFSET $${paramIdx}`;
      params.push(parseInt(offset, 10));
    }

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Create a decision artefact
   */
  async createDecision(data, userId) {
    const {
      projectId,
      decisionType,
      context,
      inputs,
      reasoning,
      conclusion,
      action,
    } = data;

    const customFields = {
      decisionType,
      context,
      inputs: inputs || [],
      reasoning,
      conclusion,
      action,
      timestamp: new Date().toISOString(),
    };

    const result = await query(
      `INSERT INTO artefacts (
        project_id, artefact_type, name, description, status,
        architecture_state, priority, owner_id, tags, custom_fields,
        created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, 'Approved', 'N/A', 'Medium', $5, $6, $7, $5, now(), now())
      RETURNING *`,
      [
        projectId,
        DW_ARTEFACT_TYPES.DECISION,
        `${decisionType}: ${conclusion.substring(0, 50)}...`,
        context,
        userId,
        JSON.stringify([decisionType]),
        JSON.stringify(customFields),
      ]
    );

    return result.rows[0];
  }

  // ============================================================
  // FEEDBACK LOOP OPERATIONS
  // ============================================================

  /**
   * Find feedback loops for a project
   */
  async findFeedbackLoops(projectId, filters = {}) {
    const { status, fromSkill, toSkill } = filters;

    let sql = `
      SELECT a.*
      FROM artefacts a
      WHERE a.project_id = $1 AND a.artefact_type = $2
    `;
    const params = [projectId, DW_ARTEFACT_TYPES.FEEDBACK];
    let paramIdx = 3;

    if (status) {
      sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    if (fromSkill) {
      sql += ` AND a.custom_fields->>'fromSkill' = $${paramIdx}`;
      params.push(fromSkill);
      paramIdx++;
    }

    if (toSkill) {
      sql += ` AND a.custom_fields->>'toSkill' = $${paramIdx}`;
      params.push(toSkill);
      paramIdx++;
    }

    sql += ` ORDER BY a.created_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Create a feedback loop artefact
   */
  async createFeedback(data, userId) {
    const {
      projectId,
      feedbackId,
      fromSkill,
      toSkill,
      priority,
      issue,
      suggestedChange,
    } = data;

    const customFields = {
      feedbackId,
      fromSkill,
      toSkill,
      priority,
      issue,
      suggestedChange,
      status: FEEDBACK_STATUS.OPEN,
      resolution: null,
    };

    const result = await query(
      `INSERT INTO artefacts (
        project_id, artefact_type, name, description, status,
        architecture_state, priority, owner_id, tags, custom_fields,
        created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, 'Draft', 'N/A', $5, $6, $7, $8, $6, now(), now())
      RETURNING *`,
      [
        projectId,
        DW_ARTEFACT_TYPES.FEEDBACK,
        `${feedbackId}: ${fromSkill} → ${toSkill}`,
        issue,
        priority,
        userId,
        JSON.stringify([fromSkill, toSkill]),
        JSON.stringify(customFields),
      ]
    );

    return result.rows[0];
  }

  // ============================================================
  // WORKFLOW ARTIFACT OPERATIONS
  // ============================================================

  /**
   * Find workflow artifacts (documents generated by skills)
   */
  async findWorkflowArtifacts(projectId, filters = {}) {
    const { artifactType, generatedBy, phase, search } = filters;

    let sql = `
      SELECT a.*
      FROM artefacts a
      WHERE a.project_id = $1 AND a.artefact_type = $2
    `;
    const params = [projectId, DW_ARTEFACT_TYPES.ARTIFACT];
    let paramIdx = 3;

    if (artifactType) {
      sql += ` AND a.custom_fields->>'artifactType' = $${paramIdx}`;
      params.push(artifactType);
      paramIdx++;
    }

    if (generatedBy) {
      sql += ` AND a.custom_fields->>'generatedBy' = $${paramIdx}`;
      params.push(generatedBy);
      paramIdx++;
    }

    if (phase) {
      sql += ` AND a.custom_fields->>'phase' = $${paramIdx}`;
      params.push(phase);
      paramIdx++;
    }

    if (search) {
      sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    sql += ` ORDER BY a.created_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Create a workflow artifact
   */
  async createWorkflowArtifact(data, userId) {
    const {
      projectId,
      artifactType,
      filePath,
      generatedBy,
      phase,
      content,
      linkedRequirements,
    } = data;

    const customFields = {
      artifactType,
      filePath,
      generatedBy,
      phase,
      content: content || '',
      version: 1,
      linkedRequirements: linkedRequirements || [],
    };

    const result = await query(
      `INSERT INTO artefacts (
        project_id, artefact_type, name, description, status,
        architecture_state, priority, owner_id, tags, custom_fields,
        created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, 'Approved', 'N/A', 'Medium', $5, $6, $7, $5, now(), now())
      RETURNING *`,
      [
        projectId,
        DW_ARTEFACT_TYPES.ARTIFACT,
        artifactType,
        `Generated by ${generatedBy}`,
        userId,
        JSON.stringify([phase, generatedBy]),
        JSON.stringify(customFields),
      ]
    );

    return result.rows[0];
  }

  // ============================================================
  // PROJECT STATE & STATISTICS
  // ============================================================

  /**
   * Get project overview statistics
   */
  async getProjectStats(projectId) {
    const countsByType = await query(
      `SELECT artefact_type, COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1 AND artefact_type LIKE 'DW_%'
       GROUP BY artefact_type`,
      [projectId]
    );

    const gateStats = await query(
      `SELECT
        custom_fields->>'status' as status,
        COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1 AND artefact_type = $2
       GROUP BY custom_fields->>'status'`,
      [projectId, DW_ARTEFACT_TYPES.GATE]
    );

    const skillsByCategory = await query(
      `SELECT
        custom_fields->>'category' as category,
        COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1 AND artefact_type = $2
       GROUP BY custom_fields->>'category'
       ORDER BY count DESC`,
      [projectId, DW_ARTEFACT_TYPES.SKILL]
    );

    const openFeedback = await query(
      `SELECT COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1
         AND artefact_type = $2
         AND custom_fields->>'status' = 'open'`,
      [projectId, DW_ARTEFACT_TYPES.FEEDBACK]
    );

    return {
      typeCounts: countsByType.rows.reduce((acc, r) => {
        acc[r.artefact_type] = parseInt(r.count, 10);
        return acc;
      }, {}),
      gateStats: gateStats.rows.reduce((acc, r) => {
        acc[r.status] = parseInt(r.count, 10);
        return acc;
      }, {}),
      skillsByCategory: skillsByCategory.rows.map(r => ({
        category: r.category,
        count: parseInt(r.count, 10),
      })),
      openFeedbackCount: parseInt(openFeedback.rows[0]?.count || 0, 10),
    };
  }

  /**
   * Get requirements traceability data
   */
  async getTraceabilityData(projectId) {
    // Get all artifacts that have linkedRequirements
    const artifacts = await query(
      `SELECT
        a.id,
        a.name,
        a.artefact_type,
        a.custom_fields
       FROM artefacts a
       WHERE a.project_id = $1
         AND a.artefact_type = $2
         AND a.custom_fields->>'linkedRequirements' IS NOT NULL`,
      [projectId, DW_ARTEFACT_TYPES.ARTIFACT]
    );

    // Build traceability matrix
    const traceability = {};
    artifacts.rows.forEach(artifact => {
      const reqs = artifact.custom_fields?.linkedRequirements || [];
      reqs.forEach(reqId => {
        if (!traceability[reqId]) {
          traceability[reqId] = {
            requirementId: reqId,
            artifacts: [],
          };
        }
        traceability[reqId].artifacts.push({
          id: artifact.id,
          name: artifact.name,
          type: artifact.custom_fields?.artifactType,
        });
      });
    });

    return Object.values(traceability);
  }

  // ============================================================
  // IMPORT/SEED OPERATIONS
  // ============================================================

  /**
   * Bulk import project data from development-workflow-plugin export
   */
  async importProjectData(projectId, exportData, userId) {
    const results = {
      skills: 0,
      gates: 0,
      artifacts: 0,
      decisions: 0,
      feedbackLoops: 0,
      errors: [],
    };

    try {
      // Import skills
      if (exportData.skills && Array.isArray(exportData.skills)) {
        for (const skill of exportData.skills) {
          try {
            await this.createSkill({
              projectId,
              skillCode: skill.code,
              name: skill.name,
              description: skill.description,
              category: skill.category,
              methodology: skill.methodology,
              references: skill.references,
              linkedSkills: skill.linkedSkills,
              inputs: skill.inputs,
              outputs: skill.outputs,
            }, userId);
            results.skills++;
          } catch (err) {
            results.errors.push(`Skill ${skill.code}: ${err.message}`);
          }
        }
      }

      // Import gates
      if (exportData.gates && Array.isArray(exportData.gates)) {
        for (const gate of exportData.gates) {
          try {
            await this.createGate({
              projectId,
              gateNumber: gate.gateNumber,
              gateName: gate.gateName,
              phase: gate.phase,
              status: gate.status,
              criteria: gate.criteria,
              blockers: gate.blockers,
              skill: gate.skill,
            }, userId);
            results.gates++;
          } catch (err) {
            results.errors.push(`Gate ${gate.gateNumber}: ${err.message}`);
          }
        }
      }

      // Import artifacts
      if (exportData.artifacts && Array.isArray(exportData.artifacts)) {
        for (const artifact of exportData.artifacts) {
          try {
            await this.createWorkflowArtifact({
              projectId,
              artifactType: artifact.artifactType,
              filePath: artifact.filePath,
              generatedBy: artifact.generatedBy,
              phase: artifact.phase,
              content: artifact.content,
              linkedRequirements: artifact.linkedRequirements,
            }, userId);
            results.artifacts++;
          } catch (err) {
            results.errors.push(`Artifact ${artifact.artifactType}: ${err.message}`);
          }
        }
      }

      // Import decisions
      if (exportData.decisions && Array.isArray(exportData.decisions)) {
        for (const decision of exportData.decisions) {
          try {
            await this.createDecision({
              projectId,
              decisionType: decision.decisionType,
              context: decision.context,
              inputs: decision.inputs,
              reasoning: decision.reasoning,
              conclusion: decision.conclusion,
              action: decision.action,
            }, userId);
            results.decisions++;
          } catch (err) {
            results.errors.push(`Decision: ${err.message}`);
          }
        }
      }

      // Import feedback loops
      if (exportData.feedbackLoops && Array.isArray(exportData.feedbackLoops)) {
        for (const feedback of exportData.feedbackLoops) {
          try {
            await this.createFeedback({
              projectId,
              feedbackId: feedback.feedbackId,
              fromSkill: feedback.fromSkill,
              toSkill: feedback.toSkill,
              priority: feedback.priority,
              issue: feedback.issue,
              suggestedChange: feedback.suggestedChange,
            }, userId);
            results.feedbackLoops++;
          } catch (err) {
            results.errors.push(`Feedback ${feedback.feedbackId}: ${err.message}`);
          }
        }
      }

    } catch (err) {
      results.errors.push(`Import failed: ${err.message}`);
    }

    return results;
  }

  /**
   * Clear all DW artefacts for a project (for re-import)
   */
  async clearProjectData(projectId) {
    // Delete relationships first
    await query(
      `DELETE FROM artefact_relationships
       WHERE from_artefact_id IN (
         SELECT id FROM artefacts WHERE project_id = $1 AND artefact_type LIKE 'DW_%'
       ) OR to_artefact_id IN (
         SELECT id FROM artefacts WHERE project_id = $1 AND artefact_type LIKE 'DW_%'
       )`,
      [projectId]
    );

    // Delete artefacts
    const result = await query(
      `DELETE FROM artefacts WHERE project_id = $1 AND artefact_type LIKE 'DW_%' RETURNING id`,
      [projectId]
    );

    return { deletedCount: result.rows.length };
  }
}

// Export singleton instance
export const dwRepository = new DWRepository();

export default dwRepository;
