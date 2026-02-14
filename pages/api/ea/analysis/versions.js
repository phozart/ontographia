// pages/api/ea/analysis/versions.js
// EA Model Versioning API
// Task EN-093

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';
import { compareModelVersions, suggestNewVersion } from '../../../../lib/ea-business-logic';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List model versions for a domain
  if (req.method === 'GET') {
    const { domainId } = req.query;

    if (!domainId) {
      return res.status(400).json({ error: 'domainId is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      // Get model versions from ea_model_versions table or metadata
      const versionsResult = await query(
        `SELECT DISTINCT
           custom_fields->>'model_version' as version,
           MIN(created_at) as first_seen,
           MAX(updated_at) as last_updated,
           COUNT(*) as element_count
         FROM ea_elements
         WHERE domain_id = $1
           AND custom_fields->>'model_version' IS NOT NULL
         GROUP BY custom_fields->>'model_version'
         ORDER BY MAX(updated_at) DESC`,
        [domainId]
      );

      // Get current version info
      const currentResult = await query(
        `SELECT
           COUNT(*) as total_elements,
           COUNT(DISTINCT element_type) as unique_types,
           MAX(updated_at) as last_update
         FROM ea_elements
         WHERE domain_id = $1`,
        [domainId]
      );

      const current = currentResult.rows[0];

      // Get relationship count
      const relResult = await query(
        `SELECT COUNT(*) as total_relationships FROM ea_relationships WHERE domain_id = $1`,
        [domainId]
      );

      return res.status(200).json({
        domainId,
        currentModel: {
          totalElements: parseInt(current.total_elements) || 0,
          uniqueTypes: parseInt(current.unique_types) || 0,
          totalRelationships: parseInt(relResult.rows[0]?.total_relationships) || 0,
          lastUpdate: current.last_update,
        },
        versions: versionsResult.rows.map(v => ({
          version: v.version,
          firstSeen: v.first_seen,
          lastUpdated: v.last_updated,
          elementCount: parseInt(v.element_count) || 0,
        })),
        suggestedNextVersion: suggestNewVersion(versionsResult.rows[0]?.version || '0.0.0', 'minor'),
      });
    } catch (err) {
      console.error('Error fetching model versions:', err);
      return res.status(500).json({ error: 'Failed to fetch model versions' });
    }
  }

  // POST - Compare two model versions or create snapshot
  if (req.method === 'POST') {
    const { domainId, action, version1, version2, newVersion, description } = req.body;

    if (!domainId) {
      return res.status(400).json({ error: 'domainId is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domainId, action === 'snapshot' ? 'edit' : 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      if (action === 'compare') {
        // Compare two versions
        if (!version1 || !version2) {
          return res.status(400).json({ error: 'version1 and version2 are required for comparison' });
        }

        // Get elements for each version
        const [v1Result, v2Result] = await Promise.all([
          query(
            `SELECT * FROM ea_elements
             WHERE domain_id = $1 AND custom_fields->>'model_version' = $2`,
            [domainId, version1]
          ),
          query(
            `SELECT * FROM ea_elements
             WHERE domain_id = $1 AND custom_fields->>'model_version' = $2`,
            [domainId, version2]
          ),
        ]);

        const comparison = compareModelVersions(v1Result.rows, v2Result.rows);

        return res.status(200).json({
          domainId,
          version1,
          version2,
          comparison,
          summary: {
            added: comparison.added.length,
            removed: comparison.removed.length,
            modified: comparison.modified.length,
            unchanged: comparison.unchanged.length,
          },
        });
      }

      if (action === 'snapshot') {
        // Create a new version snapshot
        if (!newVersion) {
          return res.status(400).json({ error: 'newVersion is required for snapshot' });
        }

        // Update all current elements with the new version
        const updateResult = await query(
          `UPDATE ea_elements
           SET custom_fields = custom_fields || $1,
               updated_at = now()
           WHERE domain_id = $2
             AND (custom_fields->>'model_version' IS NULL
                  OR custom_fields->>'model_version' = '')
           RETURNING id`,
          [JSON.stringify({ model_version: newVersion, version_date: new Date().toISOString() }), domainId]
        );

        // Create version metadata record
        await query(
          `INSERT INTO artefacts (
             domain_id, artefact_type, name, description, status,
             custom_fields, created_by, created_at, updated_at
           ) VALUES ($1, 'ea_model_version', $2, $3, 'Active', $4, $5, now(), now())
           ON CONFLICT DO NOTHING`,
          [
            domainId,
            `Model Version ${newVersion}`,
            description || `Architecture model snapshot version ${newVersion}`,
            JSON.stringify({
              version: newVersion,
              snapshot_date: new Date().toISOString(),
              element_count: updateResult.rowCount,
              created_by: user,
            }),
            user,
          ]
        );

        return res.status(201).json({
          domainId,
          version: newVersion,
          elementsTagged: updateResult.rowCount,
          snapshotDate: new Date().toISOString(),
          message: `Created model snapshot version ${newVersion}`,
        });
      }

      return res.status(400).json({ error: 'Invalid action. Use "compare" or "snapshot"' });
    } catch (err) {
      console.error('Error processing version action:', err);
      return res.status(500).json({ error: 'Failed to process version action' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
