// pages/api/blueprint/initiatives/[id]/advance.js
// Stage transition API for Blueprint Initiatives
// Task BP-012

import { blueprintRepository } from '../../../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../../../lib/projectAccess';
import { BPS_GATE_DECISIONS, canAdvanceStage, getNextStage, isTerminalStage, calculatePLRDate } from '../../../../../lib/blueprint-types';
import { errorResponse } from '../../../../../lib/api/errorResponse';
import { emitEvent, EVENT_TYPES } from '../../../../../lib/services/innovationEvents';
import { updateGraphNodeProperties } from '../../../../../lib/services/blueprintGraphSync';
import { blueprintToAnalysis, getExistingHandoff } from '../../../../../lib/services/handoffService';
import { createNotification, checkAndNotifySLA, NOTIFICATION_TYPES } from '../../../../../lib/services/notificationService';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Initiative ID is required' });
  }

  try {
    // Get current initiative
    const initiative = await blueprintRepository.findById(id);
    if (!initiative) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    // Check domain edit access
    if (initiative.domain_id) {
      const { hasAccess, error } = await checkDomainAccess(req, initiative.domain_id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error: error || 'Edit access denied' });
      }
    }

    // Check if initiative is in terminal stage
    if (isTerminalStage(initiative.stage)) {
      return res.status(400).json({
        error: `Cannot advance from terminal stage: ${initiative.stage}`,
      });
    }

    const { decision, notes, conditions, forceAdvance } = req.body;

    // Validate decision
    if (!decision || !Object.keys(BPS_GATE_DECISIONS).includes(decision)) {
      return res.status(400).json({
        error: `Invalid decision. Valid decisions: ${Object.keys(BPS_GATE_DECISIONS).join(', ')}`,
      });
    }

    // Check if initiative can advance (unless forceAdvance is true)
    if ((decision === 'approved' || decision === 'conditional_go') && !forceAdvance) {
      if (!canAdvanceStage(initiative)) {
        return res.status(400).json({
          error: 'Initiative does not meet criteria to advance. Set forceAdvance=true to override.',
          currentStage: initiative.stage,
          nextStage: getNextStage(initiative.stage, initiative.track),
          canAdvance: false,
        });
      }
    }

    // Check for triggered kill criteria
    if ((decision === 'approved' || decision === 'conditional_go') && initiative.triggered_kill_criteria?.length > 0 && !forceAdvance) {
      return res.status(400).json({
        error: 'Initiative has triggered kill criteria. Set forceAdvance=true to override.',
        killCriteria: initiative.triggered_kill_criteria,
      });
    }

    // Handle Hold — don't change stage, just record the decision
    if (decision === 'hold') {
      const holdUpdated = await blueprintRepository.recordHoldDecision(id, {
        decisionBy: user,
        notes,
      });

      if (!holdUpdated) {
        return res.status(500).json({ error: 'Failed to record hold decision' });
      }

      return res.status(200).json({
        initiative: holdUpdated,
        previousStage: initiative.stage,
        newStage: holdUpdated.stage,
        decision: 'hold',
        message: `Initiative placed on hold at stage ${initiative.stage}`,
      });
    }

    // Handle Recycle — move back to a specified stage
    if (decision === 'recycle') {
      const { targetStage } = req.body;
      if (!targetStage) {
        return res.status(400).json({ error: 'targetStage is required for recycle decisions' });
      }

      const recycleUpdated = await blueprintRepository.recycleToStage(id, {
        targetStage,
        decisionBy: user,
        notes,
      });

      if (!recycleUpdated) {
        return res.status(500).json({ error: 'Failed to recycle initiative' });
      }

      return res.status(200).json({
        initiative: recycleUpdated,
        previousStage: initiative.stage,
        newStage: recycleUpdated.stage,
        decision: 'recycle',
        message: `Initiative recycled from ${initiative.stage} to ${recycleUpdated.stage}`,
      });
    }

    // Handle Conditional Go — advance but record conditions that must be met
    if (decision === 'conditional_go') {
      if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
        return res.status(400).json({ error: 'conditions array is required for conditional_go decisions' });
      }
    }

    // Perform stage transition
    const updated = await blueprintRepository.advanceStage(id, {
      decision,
      decisionBy: user,
      notes,
      conditions,
    });

    if (!updated) {
      return res.status(500).json({ error: 'Failed to advance stage' });
    }

    // Emit appropriate event based on outcome
    const isApproved = updated.stage === 'approved';
    const isDeclined = updated.stage === 'declined';

    const eventType = isApproved
      ? EVENT_TYPES.INITIATIVE_APPROVED
      : isDeclined
        ? EVENT_TYPES.INITIATIVE_DECLINED
        : EVENT_TYPES.STAGE_ADVANCED;

    emitEvent({
      domainId: initiative.domain_id,
      eventType,
      entityId: id,
      entityType: 'initiative',
      payload: {
        initiative_id: initiative.initiative_id,
        name: initiative.name,
        from_stage: initiative.stage,
        to_stage: updated.stage,
        decision,
        notes: notes || null,
        conditions: conditions || null,
        force_advance: !!forceAdvance,
      },
      previousState: {
        stage: initiative.stage,
        governance_data: initiative.governance_data,
      },
      actor: user,
    }).catch(err => console.error('[Events] Failed to emit stage event:', err.message));

    // Update graph node with new stage
    updateGraphNodeProperties(id, { stage: updated.stage })
      .catch(err => console.error('[GraphSync] Failed to update graph node:', err.message));

    // --- Notification side effects (fire-and-forget) ---

    // Notify initiative owner of stage change
    const ownerId = initiative.owner_id || initiative.submitter_id;
    if (ownerId) {
      createNotification({
        userId: ownerId,
        type: isApproved
          ? NOTIFICATION_TYPES.INITIATIVE_APPROVED
          : isDeclined
            ? NOTIFICATION_TYPES.INITIATIVE_DECLINED
            : NOTIFICATION_TYPES.GATE_DECISION_MADE,
        title: isApproved
          ? `Initiative approved: ${initiative.name}`
          : isDeclined
            ? `Initiative declined: ${initiative.name}`
            : `Stage advanced: ${initiative.name}`,
        message: `${initiative.initiative_id} moved from ${initiative.stage} to ${updated.stage} (decision: ${decision})`,
        link: `/app/spaces/blueprint/discovery?initiative=${id}`,
        metadata: {
          initiativeId: id,
          initiativeDisplayId: initiative.initiative_id,
          fromStage: initiative.stage,
          toStage: updated.stage,
          decision,
        },
      }).catch(err => console.error('[Notifications] Failed to notify owner:', err.message));

      // Check SLA status on the updated initiative and notify if at risk or breached
      checkAndNotifySLA(updated, ownerId)
        .catch(err => console.error('[Notifications] SLA check failed:', err.message));
    }

    // When reaching approval stage, notify all reviewers (admins)
    if (updated.stage === 'approval') {
      import('../../../../../lib/pg').then(({ query: dbQuery }) => {
        return dbQuery("SELECT id FROM users WHERE role = 'admin'");
      }).then(result => {
        const reviewers = result.rows || [];
        reviewers.forEach(reviewer => {
          if (reviewer.id !== user) {
            createNotification({
              userId: reviewer.id,
              type: NOTIFICATION_TYPES.GATE_REVIEW_REQUESTED,
              title: `Gate review requested: ${initiative.name}`,
              message: `${initiative.initiative_id} is ready for approval review.`,
              link: `/app/spaces/blueprint/discovery?initiative=${id}`,
              metadata: {
                initiativeId: id,
                initiativeDisplayId: initiative.initiative_id,
                stage: updated.stage,
              },
            }).catch(err => console.error('[Notifications] Failed to notify reviewer:', err.message));
          }
        });
      }).catch(err => console.error('[Notifications] Failed to fetch reviewers:', err.message));
    }

    // Set PLR scheduled date on approval (12 months out)
    if (updated.stage === 'approved') {
      const plrDate = calculatePLRDate(new Date().toISOString(), 12);
      blueprintRepository.update(id, { plrScheduledDate: plrDate })
        .catch(err => console.error('[PLR] Failed to set PLR date:', err.message));
    }

    // Auto-handoff to Analysis on approval (fire-and-forget)
    if (updated.stage === 'approved') {
      getExistingHandoff(id).then(existing => {
        if (!existing) {
          return blueprintToAnalysis(updated, user);
        }
      }).catch(err => console.error('[Handoff] Failed Blueprint→Analysis handoff:', err.message));
    }

    return res.status(200).json({
      initiative: updated,
      previousStage: initiative.stage,
      newStage: updated.stage,
      decision,
      message: `Initiative advanced from ${initiative.stage} to ${updated.stage}`,
    });
  } catch (err) {
    return errorResponse(res, 500, 'Failed to advance stage', err);
  }
}
