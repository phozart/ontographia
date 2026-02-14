// pages/api/ea/value-streams/[id].js
// API endpoint for single Value Stream CRUD operations

import { eaRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Value stream ID is required' });
  }

  // GET - Get single value stream with full details
  if (req.method === 'GET') {
    try {
      const element = await eaRepository.findElementById(id);

      if (!element) {
        return res.status(404).json({ error: 'Value stream not found' });
      }

      // Verify it's a value stream
      if (!isValueStreamType(element.element_type)) {
        return res.status(404).json({ error: 'Element is not a value stream' });
      }

      const stages = element.properties?.stages || [];
      const metrics = calculateMetrics(stages);

      return res.status(200).json({
        ...element,
        stageCount: stages.length,
        metrics,
      });
    } catch (err) {
      console.error('Error fetching value stream:', err);
      return res.status(500).json({ error: 'Failed to fetch value stream' });
    }
  }

  // PUT - Update value stream
  if (req.method === 'PUT') {
    const {
      name,
      description,
      stages,
      owner,
      status,
    } = req.body;

    try {
      const existing = await eaRepository.findElementById(id);

      if (!existing) {
        return res.status(404).json({ error: 'Value stream not found' });
      }

      if (!isValueStreamType(existing.element_type)) {
        return res.status(404).json({ error: 'Element is not a value stream' });
      }

      // Build updated properties
      const existingProps = existing.properties || {};
      const updatedStages = stages !== undefined ? stages : existingProps.stages;
      const metrics = calculateMetrics(updatedStages || []);

      const updatedProps = {
        ...existingProps,
        stages: updatedStages,
        metrics,
        owner: owner !== undefined ? owner : existingProps.owner,
        status: status !== undefined ? status : existingProps.status,
        updatedAt: new Date().toISOString(),
      };

      const updated = await eaRepository.updateElement(id, {
        name: name || existing.name,
        description: description !== undefined ? description : existing.description,
        properties: updatedProps,
      });

      return res.status(200).json({
        ...updated,
        stageCount: (updatedStages || []).length,
        metrics,
      });
    } catch (err) {
      console.error('Error updating value stream:', err);
      return res.status(500).json({ error: 'Failed to update value stream' });
    }
  }

  // DELETE - Delete value stream
  if (req.method === 'DELETE') {
    try {
      const existing = await eaRepository.findElementById(id);

      if (!existing) {
        return res.status(404).json({ error: 'Value stream not found' });
      }

      if (!isValueStreamType(existing.element_type)) {
        return res.status(404).json({ error: 'Element is not a value stream' });
      }

      const deleted = await eaRepository.deleteElement(id);

      if (deleted) {
        return res.status(200).json({ success: true, id });
      } else {
        return res.status(500).json({ error: 'Failed to delete value stream' });
      }
    } catch (err) {
      console.error('Error deleting value stream:', err);
      return res.status(500).json({ error: 'Failed to delete value stream' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * Check if element type is a value stream
 */
function isValueStreamType(type) {
  return type === 'ValueStream' ||
         type === 'valueStream' ||
         type === 'value_stream';
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
