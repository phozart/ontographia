// pages/api/ea/value-streams/index.js
// API endpoints for Value Stream CRUD operations

import { eaRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { domain } = req.query;

  // GET - List all value streams
  if (req.method === 'GET') {
    try {
      // Fetch value stream elements from EA elements table
      const elements = await eaRepository.findAllElements({ domain });

      // Filter to only value stream elements
      const valueStreams = elements.filter(el =>
        el.element_type === 'ValueStream' ||
        el.element_type === 'valueStream' ||
        el.element_type === 'value_stream'
      );

      // Enrich with computed metrics
      const enrichedStreams = valueStreams.map(vs => {
        const stages = vs.properties?.stages || [];
        const metrics = calculateMetrics(stages);

        return {
          ...vs,
          stageCount: stages.length,
          metrics,
        };
      });

      return res.status(200).json(enrichedStreams);
    } catch (err) {
      console.error('Error fetching value streams:', err);
      return res.status(500).json({ error: 'Failed to fetch value streams' });
    }
  }

  // POST - Create a new value stream
  if (req.method === 'POST') {
    const {
      name,
      description,
      stages = [],
      owner,
      status = 'current',
      domainName,
      userId
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    try {
      // Calculate initial metrics
      const metrics = calculateMetrics(stages);

      const element = await eaRepository.createElement({
        elementType: 'ValueStream',
        layer: 'Strategy',
        name,
        description: description || '',
        properties: {
          stages,
          metrics,
          owner: owner || null,
          status,
          createdAt: new Date().toISOString(),
        },
        domainName,
        userId,
      });

      return res.status(201).json({
        ...element,
        stageCount: stages.length,
        metrics,
      });
    } catch (err) {
      console.error('Error creating value stream:', err);
      return res.status(500).json({ error: 'Failed to create value stream' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * Calculate value stream metrics from stages
 * @param {Array} stages - Array of stage objects
 * @returns {Object} Calculated metrics
 */
function calculateMetrics(stages) {
  if (!stages || stages.length === 0) {
    return {
      leadTime: 0,
      processTime: 0,
      waitTime: 0,
      efficiency: 0,
      stageCount: 0,
    };
  }

  let totalDuration = 0;
  let totalWaitTime = 0;

  stages.forEach(stage => {
    const duration = parseFloat(stage.duration) || 0;
    const waitTime = parseFloat(stage.waitTime) || 0;
    totalDuration += duration;
    totalWaitTime += waitTime;
  });

  const leadTime = totalDuration + totalWaitTime;
  const efficiency = leadTime > 0 ? ((totalDuration / leadTime) * 100) : 0;

  return {
    leadTime,
    processTime: totalDuration,
    waitTime: totalWaitTime,
    efficiency: Math.round(efficiency * 10) / 10,
    stageCount: stages.length,
  };
}
