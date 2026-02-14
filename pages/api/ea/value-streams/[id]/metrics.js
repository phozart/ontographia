// pages/api/ea/value-streams/[id]/metrics.js
// API endpoint for calculating value stream metrics

import { eaRepository } from '../../../../../lib/repositories';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Value stream ID is required' });
  }

  // GET - Calculate and return metrics
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
      const metrics = calculateDetailedMetrics(stages);

      return res.status(200).json({
        valueStreamId: id,
        valueStreamName: element.name,
        ...metrics,
      });
    } catch (err) {
      console.error('Error calculating metrics:', err);
      return res.status(500).json({ error: 'Failed to calculate metrics' });
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
 * Calculate detailed value stream metrics from stages
 * @param {Array} stages - Array of stage objects
 * @returns {Object} Detailed metrics
 */
function calculateDetailedMetrics(stages) {
  if (!stages || stages.length === 0) {
    return {
      summary: {
        leadTime: 0,
        processTime: 0,
        waitTime: 0,
        efficiency: 0,
        stageCount: 0,
      },
      stageMetrics: [],
      bottlenecks: [],
      issues: [],
      recommendations: [],
    };
  }

  let totalDuration = 0;
  let totalWaitTime = 0;
  const stageMetrics = [];
  const bottlenecks = [];
  const allIssues = [];

  // Process each stage
  stages.forEach((stage, index) => {
    const duration = parseFloat(stage.duration) || 0;
    const waitTime = parseFloat(stage.waitTime) || 0;
    const stageLeadTime = duration + waitTime;
    const stageEfficiency = stageLeadTime > 0 ? ((duration / stageLeadTime) * 100) : 0;

    totalDuration += duration;
    totalWaitTime += waitTime;

    const stageMetric = {
      stageIndex: index,
      stageName: stage.name,
      duration,
      waitTime,
      leadTime: stageLeadTime,
      efficiency: Math.round(stageEfficiency * 10) / 10,
      capabilityCount: (stage.capabilities || []).length,
      applicationCount: (stage.applications || []).length,
      issueCount: (stage.issues || []).length,
    };

    stageMetrics.push(stageMetric);

    // Identify bottlenecks (stages with >50% wait time or low efficiency)
    if (stageEfficiency < 50 && stageLeadTime > 0) {
      bottlenecks.push({
        stageIndex: index,
        stageName: stage.name,
        efficiency: stageMetric.efficiency,
        waitTime,
        reason: waitTime > duration ? 'High wait time' : 'Low process efficiency',
      });
    }

    // Collect issues
    if (stage.issues && stage.issues.length > 0) {
      stage.issues.forEach(issue => {
        allIssues.push({
          stageIndex: index,
          stageName: stage.name,
          issue,
        });
      });
    }
  });

  const leadTime = totalDuration + totalWaitTime;
  const efficiency = leadTime > 0 ? ((totalDuration / leadTime) * 100) : 0;

  // Generate recommendations
  const recommendations = generateRecommendations(stages, stageMetrics, bottlenecks, efficiency);

  return {
    summary: {
      leadTime,
      processTime: totalDuration,
      waitTime: totalWaitTime,
      efficiency: Math.round(efficiency * 10) / 10,
      stageCount: stages.length,
    },
    stageMetrics,
    bottlenecks,
    issues: allIssues,
    recommendations,
  };
}

/**
 * Generate recommendations based on metrics analysis
 */
function generateRecommendations(stages, stageMetrics, bottlenecks, overallEfficiency) {
  const recommendations = [];

  // Low overall efficiency
  if (overallEfficiency < 30) {
    recommendations.push({
      priority: 'high',
      category: 'efficiency',
      title: 'Critical: Low Value Stream Efficiency',
      description: `Overall efficiency is ${overallEfficiency.toFixed(1)}%. Target should be at least 30-50%.`,
      action: 'Review wait times between stages and identify opportunities for parallel processing.',
    });
  } else if (overallEfficiency < 50) {
    recommendations.push({
      priority: 'medium',
      category: 'efficiency',
      title: 'Moderate: Value Stream Efficiency Below Target',
      description: `Overall efficiency is ${overallEfficiency.toFixed(1)}%. Consider improvements.`,
      action: 'Focus on reducing wait times in bottleneck stages.',
    });
  }

  // Bottleneck recommendations
  bottlenecks.forEach(bottleneck => {
    recommendations.push({
      priority: bottleneck.efficiency < 30 ? 'high' : 'medium',
      category: 'bottleneck',
      title: `Bottleneck: ${bottleneck.stageName}`,
      description: `Stage efficiency is ${bottleneck.efficiency}%. ${bottleneck.reason}.`,
      action: bottleneck.reason === 'High wait time'
        ? 'Investigate handoff processes and queue management.'
        : 'Review stage activities for optimization opportunities.',
    });
  });

  // Stages without capabilities
  const stagesWithoutCapabilities = stages.filter(s => !s.capabilities || s.capabilities.length === 0);
  if (stagesWithoutCapabilities.length > 0) {
    recommendations.push({
      priority: 'low',
      category: 'completeness',
      title: 'Missing Capability Mappings',
      description: `${stagesWithoutCapabilities.length} stage(s) have no linked capabilities.`,
      action: 'Link business capabilities to stages for better traceability.',
    });
  }

  // Stages without applications
  const stagesWithoutApps = stages.filter(s => !s.applications || s.applications.length === 0);
  if (stagesWithoutApps.length > 0) {
    recommendations.push({
      priority: 'low',
      category: 'completeness',
      title: 'Missing Application Mappings',
      description: `${stagesWithoutApps.length} stage(s) have no linked applications.`,
      action: 'Link supporting applications to stages for application portfolio analysis.',
    });
  }

  return recommendations;
}
