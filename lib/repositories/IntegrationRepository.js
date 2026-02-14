/**
 * Integration Repository (P0)
 *
 * Data access layer for cross-space traceability, decision gates,
 * handoffs, and program initiatives.
 */

import BaseRepository from './BaseRepository';

class IntegrationRepository extends BaseRepository {
  constructor() {
    super('cross_space_references', 'id');
  }

  // ==================== RELATIONSHIP TYPE REGISTRY ====================

  async getRelationshipTypes(filters = {}) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.fromSpace) {
      conditions.push(`(from_space = $${paramIndex} OR from_space = '*')`);
      params.push(filters.fromSpace);
      paramIndex++;
    }

    if (filters.toSpace) {
      conditions.push(`(to_space = $${paramIndex} OR to_space = '*')`);
      params.push(filters.toSpace);
      paramIndex++;
    }

    if (filters.semanticGroup) {
      conditions.push(`semantic_group = $${paramIndex}`);
      params.push(filters.semanticGroup);
      paramIndex++;
    }

    if (filters.requiresApproval !== undefined) {
      conditions.push(`requires_approval = $${paramIndex}`);
      params.push(filters.requiresApproval);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await this.rawQuery(`
      SELECT * FROM relationship_type_registry
      ${whereClause}
      ORDER BY semantic_group, name
    `, params);

    return rows;
  }

  async getRelationshipTypeById(typeId) {
    const { rows } = await this.rawQuery(
      `SELECT * FROM relationship_type_registry WHERE id = $1`,
      [typeId]
    );
    return rows[0];
  }

  // ==================== CROSS-SPACE REFERENCES ====================

  async createCrossSpaceReference(data) {
    const {
      domainId,
      fromArtefactId,
      toArtefactId,
      relationshipTypeId,
      relationshipType,
      fromSpace,
      toSpace,
      rationale,
      evidence,
      createdBy
    } = data;

    // Check if relationship type requires approval
    const relType = await this.getRelationshipTypeById(relationshipTypeId);
    const status = relType?.requires_approval ? 'pending' : 'approved';

    const { rows } = await this.rawQuery(`
      INSERT INTO cross_space_references (
        domain_id, from_artefact_id, to_artefact_id, relationship_type_id,
        relationship_type, from_space, to_space, status, rationale, evidence, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      domainId, fromArtefactId, toArtefactId, relationshipTypeId,
      relationshipType, fromSpace, toSpace, status,
      rationale, JSON.stringify(evidence || []), createdBy
    ]);

    return rows[0];
  }

  async getCrossSpaceReferences(filters = {}) {
    const conditions = ['1=1'];
    const params = [];
    let paramIndex = 1;

    if (filters.domainId) {
      conditions.push(`csr.domain_id = $${paramIndex}`);
      params.push(filters.domainId);
      paramIndex++;
    }

    if (filters.artefactId) {
      conditions.push(`(csr.from_artefact_id = $${paramIndex} OR csr.to_artefact_id = $${paramIndex})`);
      params.push(filters.artefactId);
      paramIndex++;
    }

    if (filters.status) {
      conditions.push(`csr.status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.fromSpace) {
      conditions.push(`csr.from_space = $${paramIndex}`);
      params.push(filters.fromSpace);
      paramIndex++;
    }

    if (filters.toSpace) {
      conditions.push(`csr.to_space = $${paramIndex}`);
      params.push(filters.toSpace);
      paramIndex++;
    }

    const { rows } = await this.rawQuery(`
      SELECT
        csr.*,
        fa.name as from_artefact_name,
        fa.artefact_type as from_artefact_type,
        fa.status as from_artefact_status,
        ta.name as to_artefact_name,
        ta.artefact_type as to_artefact_type,
        ta.status as to_artefact_status,
        rtr.name as relationship_type_name,
        rtr.semantic_group
      FROM cross_space_references csr
      LEFT JOIN artefacts fa ON fa.id = csr.from_artefact_id
      LEFT JOIN artefacts ta ON ta.id = csr.to_artefact_id
      LEFT JOIN relationship_type_registry rtr ON rtr.id = csr.relationship_type_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY csr.created_at DESC
    `, params);

    return rows;
  }

  async approveCrossSpaceReference(id, approvedBy, rationale = null) {
    const { rows } = await this.rawQuery(`
      UPDATE cross_space_references
      SET status = 'approved', approved_by = $2, approved_at = now(), rationale = COALESCE($3, rationale)
      WHERE id = $1
      RETURNING *
    `, [id, approvedBy, rationale]);
    return rows[0];
  }

  async rejectCrossSpaceReference(id, rejectedBy, rationale) {
    const { rows } = await this.rawQuery(`
      UPDATE cross_space_references
      SET status = 'rejected', approved_by = $2, approved_at = now(), rationale = $3
      WHERE id = $1
      RETURNING *
    `, [id, rejectedBy, rationale]);
    return rows[0];
  }

  // ==================== DECISION GATES ====================

  async createDecisionGate(data) {
    const {
      domainId, name, description, gateType, fromStage, toStage,
      fromSpace, toSpace, criteria, requiredApprovers, minApprovers,
      timeoutDays, autoApproveOnTimeout, sequenceOrder, createdBy
    } = data;

    const { rows } = await this.rawQuery(`
      INSERT INTO decision_gates (
        domain_id, name, description, gate_type, from_stage, to_stage,
        from_space, to_space, criteria, required_approvers, min_approvers,
        timeout_days, auto_approve_on_timeout, sequence_order, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      domainId, name, description, gateType, fromStage, toStage,
      fromSpace, toSpace, JSON.stringify(criteria || []),
      JSON.stringify(requiredApprovers || []), minApprovers || 1,
      timeoutDays, autoApproveOnTimeout || false, sequenceOrder || 0, createdBy
    ]);

    return rows[0];
  }

  async getDecisionGates(domainId, filters = {}) {
    const conditions = ['domain_id = $1', 'is_active = true'];
    const params = [domainId];
    let paramIndex = 2;

    if (filters.gateType) {
      conditions.push(`gate_type = $${paramIndex}`);
      params.push(filters.gateType);
      paramIndex++;
    }

    if (filters.fromSpace) {
      conditions.push(`(from_space = $${paramIndex} OR from_space IS NULL)`);
      params.push(filters.fromSpace);
      paramIndex++;
    }

    if (filters.toSpace) {
      conditions.push(`(to_space = $${paramIndex} OR to_space IS NULL)`);
      params.push(filters.toSpace);
      paramIndex++;
    }

    const { rows } = await this.rawQuery(`
      SELECT * FROM decision_gates
      WHERE ${conditions.join(' AND ')}
      ORDER BY sequence_order, created_at
    `, params);

    return rows;
  }

  async getApplicableGate(domainId, fromStage, toStage, fromSpace = null, toSpace = null) {
    const { rows } = await this.rawQuery(`
      SELECT * FROM decision_gates
      WHERE domain_id = $1
        AND from_stage = $2
        AND to_stage = $3
        AND (from_space = $4 OR from_space IS NULL)
        AND (to_space = $5 OR to_space IS NULL)
        AND is_active = true
      ORDER BY
        CASE WHEN from_space IS NOT NULL AND to_space IS NOT NULL THEN 1
             WHEN from_space IS NOT NULL OR to_space IS NOT NULL THEN 2
             ELSE 3 END,
        sequence_order
      LIMIT 1
    `, [domainId, fromStage, toStage, fromSpace, toSpace]);

    return rows[0];
  }

  // ==================== GATE OUTCOMES ====================

  async createGateOutcome(data) {
    const {
      gateId, domainId, artefactId, relationshipId, outcome,
      decidedBy, rationale, conditions, evidence, checklistResults
    } = data;

    const { rows } = await this.rawQuery(`
      INSERT INTO gate_outcomes (
        gate_id, domain_id, artefact_id, relationship_id, outcome,
        decided_by, rationale, conditions, evidence, checklist_results
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      gateId, domainId, artefactId, relationshipId, outcome,
      decidedBy, rationale, JSON.stringify(conditions || []),
      JSON.stringify(evidence || []), JSON.stringify(checklistResults || {})
    ]);

    return rows[0];
  }

  async getGateOutcomes(filters = {}) {
    const conditions = ['1=1'];
    const params = [];
    let paramIndex = 1;

    if (filters.domainId) {
      conditions.push(`go.domain_id = $${paramIndex}`);
      params.push(filters.domainId);
      paramIndex++;
    }

    if (filters.artefactId) {
      conditions.push(`go.artefact_id = $${paramIndex}`);
      params.push(filters.artefactId);
      paramIndex++;
    }

    if (filters.gateId) {
      conditions.push(`go.gate_id = $${paramIndex}`);
      params.push(filters.gateId);
      paramIndex++;
    }

    if (filters.outcome) {
      conditions.push(`go.outcome = $${paramIndex}`);
      params.push(filters.outcome);
      paramIndex++;
    }

    const { rows } = await this.rawQuery(`
      SELECT
        go.*,
        dg.name as gate_name,
        dg.gate_type,
        a.name as artefact_name,
        a.artefact_type
      FROM gate_outcomes go
      LEFT JOIN decision_gates dg ON dg.id = go.gate_id
      LEFT JOIN artefacts a ON a.id = go.artefact_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY go.decision_date DESC
    `, params);

    return rows;
  }

  // ==================== HANDOFF RECORDS ====================

  async createHandoffRecord(data) {
    const {
      domainId, projectId, fromSpace, toSpace, fromArtefactId, toArtefactId,
      handoffType, summary, context, deliverables, acceptanceCriteria, handoverBy
    } = data;

    const { rows } = await this.rawQuery(`
      INSERT INTO handoff_records (
        domain_id, project_id, from_space, to_space, from_artefact_id, to_artefact_id,
        handoff_type, summary, context, deliverables, acceptance_criteria, handover_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      domainId, projectId, fromSpace, toSpace, fromArtefactId, toArtefactId,
      handoffType, summary, JSON.stringify(context || {}),
      JSON.stringify(deliverables || []), JSON.stringify(acceptanceCriteria || []),
      handoverBy
    ]);

    return rows[0];
  }

  async getHandoffRecords(filters = {}) {
    const conditions = ['1=1'];
    const params = [];
    let paramIndex = 1;

    if (filters.domainId) {
      conditions.push(`hr.domain_id = $${paramIndex}`);
      params.push(filters.domainId);
      paramIndex++;
    }

    if (filters.projectId) {
      conditions.push(`hr.project_id = $${paramIndex}`);
      params.push(filters.projectId);
      paramIndex++;
    }

    if (filters.status) {
      conditions.push(`hr.status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.fromSpace) {
      conditions.push(`hr.from_space = $${paramIndex}`);
      params.push(filters.fromSpace);
      paramIndex++;
    }

    if (filters.toSpace) {
      conditions.push(`hr.to_space = $${paramIndex}`);
      params.push(filters.toSpace);
      paramIndex++;
    }

    const { rows } = await this.rawQuery(`
      SELECT
        hr.*,
        fa.name as from_artefact_name,
        ta.name as to_artefact_name,
        p.name as project_name
      FROM handoff_records hr
      LEFT JOIN artefacts fa ON fa.id = hr.from_artefact_id
      LEFT JOIN artefacts ta ON ta.id = hr.to_artefact_id
      LEFT JOIN projects p ON p.id = hr.project_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY hr.created_at DESC
    `, params);

    return rows;
  }

  async acceptHandoff(id, acceptedBy) {
    const { rows } = await this.rawQuery(`
      UPDATE handoff_records
      SET status = 'completed', accepted_by = $2, accepted_at = now()
      WHERE id = $1
      RETURNING *
    `, [id, acceptedBy]);
    return rows[0];
  }

  async rejectHandoff(id, rejectedBy, reason) {
    const { rows } = await this.rawQuery(`
      UPDATE handoff_records
      SET status = 'rejected', accepted_by = $2, accepted_at = now(),
          context = context || jsonb_build_object('rejection_reason', $3)
      WHERE id = $1
      RETURNING *
    `, [id, rejectedBy, reason]);
    return rows[0];
  }

  // ==================== PROGRAM INITIATIVES ====================

  async createInitiative(data) {
    const {
      domainId, name, description, status, priority, startDate, targetDate,
      ownerId, spacesInvolved, objectives, successMetrics, currentStage, createdBy
    } = data;

    const { rows } = await this.rawQuery(`
      INSERT INTO program_initiatives (
        domain_id, name, description, status, priority, start_date, target_date,
        owner_id, spaces_involved, objectives, success_metrics, current_stage, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      domainId, name, description, status || 'planning', priority || 'medium',
      startDate, targetDate, ownerId, spacesInvolved || [],
      JSON.stringify(objectives || []), JSON.stringify(successMetrics || []),
      currentStage, createdBy
    ]);

    return rows[0];
  }

  async getInitiatives(domainId, filters = {}) {
    const conditions = ['pi.domain_id = $1'];
    const params = [domainId];
    let paramIndex = 2;

    if (filters.status) {
      conditions.push(`pi.status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.priority) {
      conditions.push(`pi.priority = $${paramIndex}`);
      params.push(filters.priority);
      paramIndex++;
    }

    if (filters.space) {
      conditions.push(`$${paramIndex} = ANY(pi.spaces_involved)`);
      params.push(filters.space);
      paramIndex++;
    }

    const { rows } = await this.rawQuery(`
      SELECT
        pi.*,
        COUNT(DISTINCT ia.artefact_id) as artefact_count,
        COUNT(DISTINCT CASE WHEN a.status = 'Approved' THEN a.id END) as approved_count
      FROM program_initiatives pi
      LEFT JOIN initiative_artefacts ia ON ia.initiative_id = pi.id
      LEFT JOIN artefacts a ON a.id = ia.artefact_id
      WHERE ${conditions.join(' AND ')}
      GROUP BY pi.id
      ORDER BY
        CASE pi.priority
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        pi.target_date NULLS LAST
    `, params);

    return rows;
  }

  async getInitiativeWithArtefacts(initiativeId) {
    const { rows: [initiative] } = await this.rawQuery(`
      SELECT * FROM program_initiatives WHERE id = $1
    `, [initiativeId]);

    if (!initiative) return null;

    const { rows: artefacts } = await this.rawQuery(`
      SELECT
        ia.role,
        ia.added_at,
        a.*
      FROM initiative_artefacts ia
      JOIN artefacts a ON a.id = ia.artefact_id
      WHERE ia.initiative_id = $1
      ORDER BY
        CASE ia.role
          WHEN 'primary' THEN 1
          WHEN 'deliverable' THEN 2
          WHEN 'supporting' THEN 3
          WHEN 'dependency' THEN 4
        END,
        a.name
    `, [initiativeId]);

    return { ...initiative, artefacts };
  }

  async linkArtefactToInitiative(initiativeId, artefactId, role) {
    const { rows } = await this.rawQuery(`
      INSERT INTO initiative_artefacts (initiative_id, artefact_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (initiative_id, artefact_id) DO UPDATE SET role = $3
      RETURNING *
    `, [initiativeId, artefactId, role]);
    return rows[0];
  }

  async unlinkArtefactFromInitiative(initiativeId, artefactId) {
    await this.rawQuery(`
      DELETE FROM initiative_artefacts
      WHERE initiative_id = $1 AND artefact_id = $2
    `, [initiativeId, artefactId]);
  }

  // ==================== PROGRAM DASHBOARD STATS ====================

  async getProgramDashboardStats(domainId) {
    const { rows: [stats] } = await this.rawQuery(`
      SELECT
        (SELECT COUNT(*) FROM program_initiatives WHERE domain_id = $1 AND status = 'active') as active_initiatives,
        (SELECT COUNT(*) FROM program_initiatives WHERE domain_id = $1 AND status = 'planning') as planning_initiatives,
        (SELECT COUNT(*) FROM cross_space_references WHERE domain_id = $1 AND status = 'pending') as pending_approvals,
        (SELECT COUNT(*) FROM handoff_records WHERE domain_id = $1 AND status = 'pending') as pending_handoffs,
        (SELECT COUNT(*) FROM gate_outcomes WHERE domain_id = $1 AND decision_date > now() - interval '7 days') as recent_decisions
    `, [domainId]);

    const { rows: bySpace } = await this.rawQuery(`
      SELECT
        unnest(spaces_involved) as space,
        COUNT(*) as count
      FROM program_initiatives
      WHERE domain_id = $1 AND status IN ('active', 'planning')
      GROUP BY 1
      ORDER BY count DESC
    `, [domainId]);

    const { rows: recentActivity } = await this.rawQuery(`
      SELECT * FROM (
        SELECT 'gate_decision' as activity_type, id, decision_date as activity_date, outcome as detail
        FROM gate_outcomes WHERE domain_id = $1
        UNION ALL
        SELECT 'handoff' as activity_type, id, created_at as activity_date, handoff_type as detail
        FROM handoff_records WHERE domain_id = $1
        UNION ALL
        SELECT 'cross_ref' as activity_type, id, created_at as activity_date, relationship_type as detail
        FROM cross_space_references WHERE domain_id = $1
      ) combined
      ORDER BY activity_date DESC
      LIMIT 20
    `, [domainId]);

    return {
      ...stats,
      bySpace,
      recentActivity
    };
  }
}

export default new IntegrationRepository();
