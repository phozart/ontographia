/**
 * Decision Gates API
 * GET: List decision gates for a domain
 * POST: Create a new decision gate
 */

import IntegrationRepository from '../../../lib/repositories/IntegrationRepository';
import { errorResponse } from '../../../lib/api/errorResponse';

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === 'GET') {
      const { domainId, gateType, fromSpace, toSpace } = req.query;

      if (!domainId) {
        return res.status(400).json({ error: 'domainId is required' });
      }

      const gates = await IntegrationRepository.getDecisionGates(domainId, {
        gateType,
        fromSpace,
        toSpace
      });

      // Group by gate type
      const byType = gates.reduce((acc, gate) => {
        if (!acc[gate.gate_type]) acc[gate.gate_type] = [];
        acc[gate.gate_type].push(gate);
        return acc;
      }, {});

      res.status(200).json({
        gates,
        byType,
        total: gates.length
      });

    } else if (method === 'POST') {
      const {
        domainId,
        name,
        description,
        gateType,
        fromStage,
        toStage,
        fromSpace,
        toSpace,
        criteria,
        requiredApprovers,
        minApprovers,
        timeoutDays,
        autoApproveOnTimeout,
        sequenceOrder
      } = req.body;

      // Validate required fields
      if (!domainId || !name || !gateType || !fromStage || !toStage) {
        return res.status(400).json({
          error: 'Missing required fields: domainId, name, gateType, fromStage, toStage'
        });
      }

      const createdBy = req.headers['x-user-id'] || 'system';

      const gate = await IntegrationRepository.createDecisionGate({
        domainId,
        name,
        description,
        gateType,
        fromStage,
        toStage,
        fromSpace,
        toSpace,
        criteria,
        requiredApprovers,
        minApprovers,
        timeoutDays,
        autoApproveOnTimeout,
        sequenceOrder,
        createdBy
      });

      res.status(201).json(gate);

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    return errorResponse(res, 500, 'Decision gates operation failed', error);
  }
}
