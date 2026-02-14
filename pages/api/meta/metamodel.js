// pages/api/meta/metamodel.js
// Knowledge graph metamodel API — returns studio-to-graph type mappings

import { getGlobalMetamodel, getStudioNodeTypes, getStudioRelationships, getMetamodelStats, UNIVERSAL_RELATIONSHIP_TYPES } from '../../../lib/kg-metamodel';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { studio } = req.query;

  // If studio specified, return just that studio's types
  if (studio) {
    return res.status(200).json({
      studio,
      nodeTypes: getStudioNodeTypes(studio),
      relationshipTypes: getStudioRelationships(studio),
      universalRelationships: UNIVERSAL_RELATIONSHIP_TYPES,
    });
  }

  // Otherwise return full global metamodel
  const metamodel = getGlobalMetamodel();
  const stats = getMetamodelStats();

  return res.status(200).json({
    ...metamodel,
    stats,
  });
}
